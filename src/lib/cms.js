// Thin GraphQL client for the Strapi CMS + a React hook to load content.
//
// The CMS is the public production instance; its GraphQL endpoint returns data
// with no auth. We keep queries minimal (only the fields the UI renders) and
// always degrade gracefully: if the network call fails, the caller falls back
// to the static content in data/content.js so the site never renders empty.

const CMS_URL =
  import.meta.env.VITE_CMS_URL || 'https://cms.portfolio.trinhxuantam.com'

// CMS urls are sometimes stored without a scheme (e.g. "vitaminai.app"), which
// the browser treats as a relative path. Ensure an absolute external URL.
function absoluteUrl(url) {
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

async function gql(query, variables = {}) {
  const res = await fetch(`${CMS_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`CMS ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'CMS GraphQL error')
  return json.data
}

// Session cache: the first fetch hits the network; subsequent navigations to
// the same route within the tab return instantly from sessionStorage. Also
// exposes a synchronous peek so components can render cached data on mount with
// no loading gap. (Only the network round-trip is cached, not stale forever —
// it clears when the tab closes.)
export function cachedPeek(key) {
  try {
    const raw = sessionStorage.getItem(`cms:${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function cached(key, producer) {
  const hit = cachedPeek(key)
  if (hit !== null) return hit
  const data = await producer()
  try {
    sessionStorage.setItem(`cms:${key}`, JSON.stringify(data))
  } catch {
    /* storage full / disabled — fine, just skip caching */
  }
  return data
}

const PROJECTS_QUERY = /* GraphQL */ `
  query Projects($limit: Int!) {
    projects(pagination: { limit: $limit }, sort: "createdAt:desc") {
      data {
        id
        attributes {
          name
          briefDescription
          url
          createdAt
          thumbnail { data { attributes { url } } }
          technologies { name }
        }
      }
    }
  }
`

function mapProjectCard(row, i) {
  const a = row.attributes
  return {
    id: row.id,
    no: String(i + 1).padStart(2, '0'),
    name: a.name,
    body: a.briefDescription || '',
    url: absoluteUrl(a.url),
    thumbnail: a.thumbnail?.data?.attributes?.url || null,
    tags: (a.technologies || []).map((t) => t.name).slice(0, 4),
  }
}

// Card-level list, newest first. Pass a limit for the landing page's teaser.
export async function fetchProjects(limit = 50) {
  return cached(`projects:${limit}`, async () => {
    const data = await gql(PROJECTS_QUERY, { limit })
    const rows = data?.projects?.data ?? []
    return rows.map(mapProjectCard)
  })
}

const PROJECT_DETAIL_QUERY = /* GraphQL */ `
  query Project($id: ID!) {
    project(id: $id) {
      data {
        id
        attributes {
          name
          briefDescription
          description
          url
          createdAt
          thumbnail { data { attributes { url } } }
          images { data { id attributes { url } } }
          technologies { name }
          roles { name }
          responsibilities { name }
        }
      }
    }
  }
`

// Full detail for a single project (detail page).
export async function fetchProject(id) {
  return cached(`project:${id}`, async () => {
    const data = await gql(PROJECT_DETAIL_QUERY, { id })
    const row = data?.project?.data
    if (!row) return null
    const a = row.attributes
    return {
      id: row.id,
      name: a.name,
      brief: a.briefDescription || '',
      description: a.description || '',
      url: absoluteUrl(a.url),
      thumbnail: a.thumbnail?.data?.attributes?.url || null,
      images: (a.images?.data || []).map((m) => m.attributes.url),
      technologies: (a.technologies || []).map((t) => t.name),
      roles: (a.roles || []).map((r) => r.name),
      responsibilities: (a.responsibilities || []).map((r) => r.name),
    }
  })
}

const CONTACT_QUERY = /* GraphQL */ `
  query Contact {
    contact {
      data { attributes { email phone githubUrl linkedinUrl } }
    }
  }
`

export async function fetchContact() {
  return cached('contact', async () => {
    const data = await gql(CONTACT_QUERY)
    const a = data?.contact?.data?.attributes
    if (!a) return null
    return {
      email: a.email,
      phone: a.phone,
      githubUrl: a.githubUrl,
      linkedinUrl: a.linkedinUrl,
    }
  })
}

const ABOUT_QUERY = /* GraphQL */ `
  query About {
    about {
      data {
        attributes {
          cv { data { attributes { url } } }
          workExperience { title company location from to url icon { data { attributes { url } } } }
          education { title institution location from to url icon { data { attributes { url } } } }
          extra { title text }
        }
      }
    }
  }
`

export async function fetchAbout() {
  return cached('about', async () => {
    const data = await gql(ABOUT_QUERY)
    const a = data?.about?.data?.attributes
    if (!a) return null
    return mapAbout(a)
  })
}

function mapAbout(a) {
  return {
    cv: a.cv?.data?.attributes?.url || null,
    workExperience: (a.workExperience || []).map((w) => ({
      title: w.title,
      org: w.company,
      location: w.location,
      from: w.from,
      to: w.to,
      url: w.url,
      icon: w.icon?.data?.attributes?.url || null,
    })),
    education: (a.education || []).map((e) => ({
      title: e.title,
      org: e.institution,
      location: e.location,
      from: e.from,
      to: e.to,
      url: e.url,
      icon: e.icon?.data?.attributes?.url || null,
    })),
    extra: (a.extra || []).map((x) => ({ title: x.title, text: x.text })),
  }
}
