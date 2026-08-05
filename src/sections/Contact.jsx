import { CONTACT } from '../data/content'
import Reveal from '../components/interactive/Reveal'
import GlassButton from '../components/ui/GlassButton'
import SocialIcon from '../components/ui/SocialIcon'
import Footer from '../components/Footer'
import { useCmsData } from '../lib/useCmsData'
import { fetchContact } from '../lib/cms'

const CONTACT_FALLBACK = {
  email: CONTACT.email,
  phone: CONTACT.phone,
  githubUrl: null,
  linkedinUrl: null,
}

export default function Contact() {
  const { data: info } = useCmsData(fetchContact, CONTACT_FALLBACK)
  const email = info.email || CONTACT.email
  const phone = info.phone || CONTACT.phone
  // Static CV URL — renders identically to the email (no async gating/lag).
  const cv = CONTACT.cvUrl

  return (
    <section
      id="contact"
      className="relative flex min-h-[100svh] flex-col justify-center px-6 py-20 sm:px-10 sm:py-28 lg:px-20"
    >
      {/* One coordinated reveal for the whole block: a single ScrollTrigger with
          a stagger, so nothing lags behind on its own late-firing trigger. */}
      <Reveal stagger={0.12} y={30} className="mx-auto w-full max-w-5xl text-center">
        <h2 className="font-serif text-[clamp(2.5rem,9vw,6.5rem)] font-medium leading-[0.95] tracking-tightest text-ink">
          {CONTACT.heading}
        </h2>

        <p className="mx-auto mt-10 max-w-2xl text-lg font-light leading-relaxed text-graphite/75">
          {CONTACT.sub}
        </p>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <GlassButton href={`mailto:${email}`} strong>
            {email}
          </GlassButton>
          <GlassButton href={cv} strong>
            Download CV
          </GlassButton>
        </div>

        <div>
          <div className="mt-16 flex flex-col items-center justify-center gap-2 text-sm text-ash sm:flex-row sm:gap-8">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="tracking-wide transition-colors duration-300 hover:text-graphite"
            >
              {phone}
            </a>
            {(info.githubUrl || info.linkedinUrl) && (
              <>
                <span className="hidden h-3 w-px bg-ash/40 sm:inline-block" />
                <span className="flex items-center gap-5">
                  {info.githubUrl && (
                    <a
                      href={info.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="text-ash transition-colors duration-300 hover:text-accent"
                    >
                      <SocialIcon name="github" />
                    </a>
                  )}
                  {info.linkedinUrl && (
                    <a
                      href={info.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="text-ash transition-colors duration-300 hover:text-accent"
                    >
                      <SocialIcon name="linkedin" />
                    </a>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </Reveal>

      <Footer className="mt-24" />
    </section>
  )
}
