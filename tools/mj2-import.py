#!/usr/bin/env python3
"""Pim Pam 0.78 · imports the six Mira i Juga 2 activities (four scenes) into dist/mj2/.

Usage: python3 tools/mj2-import.py <checkout of github.com/utacub/miraijuga2>

It takes the index.html that Mira i Juga 2 publishes (built by its build.py), keeps every scene's code as it is, and
removes only what belongs to Mira i Juga 2 as an app: its service worker and manifest (Pim Pam has its own), the home page
parade of videos, and the preloading of the hide-and-seek forest videos. Then it appends dist/mj2/pont.js (the bridge with
Pim Pam) and copies the assets of the four scenes used: ous, estany, robots, conte, plus the shared sounds and fonts.
"""
import os, re, shutil, subprocess, sys, json, hashlib

src = sys.argv[1] if len(sys.argv) > 1 else '../miraijuga2'
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'dist', 'mj2')
html = open(os.path.join(src, 'index.html'), encoding='utf-8').read()

def sub(old, new, count=1):
    global html
    if old not in html:
        sys.exit('mj2-import: not found: ' + old[:60])
    html = html.replace(old, new, count)

# the app shell of Mira i Juga 2 that Pim Pam replaces
html = re.sub(r'<link rel="manifest"[^>]*>', '', html)
html = re.sub(r'<link rel="apple-touch-icon"[^>]*>', '', html)
html = re.sub(r'<link rel="icon"[^>]*>', '', html)
html, n = re.subn(r'<div id="parade"[^>]*>.*?</div>', '<div id="parade" aria-hidden="true"></div>', html, count=1, flags=re.S)
if n != 1: sys.exit('mj2-import: parade not found')
html = re.sub(r'src="((?:portada|inst)/[^"]+|utac\.png)"', r'data-src="\1"', html)
sub('PWA.init();', '/* Pim Pam: sense instal·lació pròpia */')
sub('loadAnimals();applyLang();', 'applyLang();')
html = html.replace('</head>', '<style>#start,#menu,#nav,#opts,#cred,#instM,#toast{display:none!important}body{background:#000}</style></head>', 1)
# only the four scenes are copied: the pictures and sounds of the other scenes are not requested
OK = r"/^(ous|estany|robots|conte|so|fonts)\//.test(p)||/^bosc\/(ding|festa|fusta)\.mp3$/.test(p)"
sub('const img=s=>{const i=new Image();i.src=U(s);return i};', 'const __mjOk=p=>' + OK + ';const img=s=>{const i=new Image();if(__mjOk(s))i.src=U(s);return i};')
sub('function loadSnd(n,p){', 'function loadSnd(n,p){if(!__mjOk(p+".mp3"))return;')
sub('<img src="${U(s.img)}" alt="">', '<img alt="">')
sub('</body>', '<script src="pont.js"></script>\n</body>')

DIRS = ['ous', 'estany', 'robots', 'conte', 'so', 'fonts']
for d in DIRS:
    shutil.rmtree(os.path.join(out, d), ignore_errors=True)
    shutil.copytree(os.path.join(src, d), os.path.join(out, d), ignore=shutil.ignore_patterns('*.json', '*.md', '*.py', '*.blend', '*.blend1') if d not in ('estany', 'ous', 'robots', 'conte') else shutil.ignore_patterns('*.md', '*.py', '*.blend', '*.blend1'))
os.makedirs(os.path.join(out, 'bosc'), exist_ok=True)
for f in ('ding', 'festa', 'fusta'):
    shutil.copy(os.path.join(src, 'bosc', f + '.mp3'), os.path.join(out, 'bosc', f + '.mp3'))
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
try:
    rev = subprocess.check_output(['git', '-C', src, 'rev-parse', '--short', 'HEAD'], text=True).strip()
except Exception:
    rev = '?'
ver = open(os.path.join(src, 'VERSION')).read().strip()
json.dump({'from': 'github.com/utacub/miraijuga2', 'version': ver, 'commit': rev, 'dirs': DIRS}, open(os.path.join(out, 'origen.json'), 'w'), indent=1)
size = sum(os.path.getsize(os.path.join(a, f)) for a, _, fs in os.walk(out) for f in fs)
print('mj2: Mira i Juga 2 %s (%s) -> dist/mj2, %.1f MB' % (ver, rev, size / 1e6))
