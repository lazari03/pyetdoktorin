/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

function rm(target) {
  const abs = path.join(process.cwd(), target);
  try {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log(`removed ${target}`);
  } catch (err) {
    console.warn(`failed to remove ${target}`, err && err.message ? err.message : err);
  }
}

const args = new Set(process.argv.slice(2));
const wantsAll = args.has('--all');
const wantsDev = args.has('--dev');
const wantsBuild = args.has('--build');

const cleanBuild = wantsAll || wantsBuild || (!wantsDev && !wantsAll && !wantsBuild);
const cleanDev = wantsAll || wantsDev;

if (cleanBuild) rm('.next');
if (cleanDev) rm('.next-dev');
rm('.turbo');
