import os,subprocess,tempfile,json
from pathlib import Path
source=Path(__file__).with_name('deploy.sh').read_text()
mock='''#!/usr/bin/env python3
import os,sys,json
from pathlib import Path
a=sys.argv[1:]; state=Path(os.environ['STATE']); mode=os.environ['MODE']
with (state/'calls').open('a') as f: f.write(' '.join(a)+'\\n')
if 'config' in a:
 print(json.dumps({'services':{'portfolio-website-ethereal':{'environment':{}}}})); sys.exit(1 if mode=='config-fail' else 0)
if 'ps' in a: print('old-container')
if a[0]=='inspect': print('sha256:old')
if a[0]=='pull' and mode=='pull-fail': sys.exit(1)
if 'up' in a:
 count=state/'count'; n=int(count.read_text()) if count.exists() else 0; count.write_text(str(n+1))
 if mode=='up-fail' and n==0: sys.exit(1)
 if mode=='rollback-fail': sys.exit(1)
'''
for mode in ['success','config-fail','pull-fail','up-fail','rollback-fail']:
 with tempfile.TemporaryDirectory() as t:
  p=Path(t); app=p/'portfolio_website_ethereal'; app.mkdir(); b=p/'bin'; b.mkdir()
  for name,content in [('docker',mock),('flock','#!/bin/sh\nexit 0\n')]:
   f=b/name;f.write_text(content);f.chmod(0o755)
  script=p/'deploy.sh';script.write_text(source.replace('/home/ubuntu/apps/',str(p)+'/'))
  env={**os.environ,'PATH':str(b)+':'+os.environ['PATH'],'STATE':t,'MODE':mode}
  r=subprocess.run(['bash',str(script),str(app),'portfolio-website-ethereal','ghcr.io/trinhxuantam/portfolio-website-ethereal@sha256:'+'a'*64],env=env,capture_output=True,text=True)
  assert (r.returncode==0)==(mode=='success'),(mode,r.stderr)
  calls=(p/'calls').read_text()
  if mode in ['config-fail','pull-fail']: assert ' up ' not in calls and not (app/'.compose.release.yml').exists()
  if mode in ['up-fail','rollback-fail']: assert 'local/portfolio-website-ethereal:rollback' in (app/'.compose.release.yml').read_text()
  if mode=='rollback-fail': assert 'ROLLBACK FAILED' in r.stderr
  if mode=='success': assert '@sha256:' in (app/'.compose.release.yml').read_text()
  print(mode+': PASS')
