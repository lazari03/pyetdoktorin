/* eslint-disable no-console */

const fs = require('fs');

function rm(abs, label) {
  try {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log('removed', label);
  } catch (err) {
    console.warn('failed to remove', { label, err: err && err.message ? err.message : err });
  }
}

const args = new Set(process.argv.slice(2));
const wantsAll = args.has('--all');
const wantsDev = args.has('--dev');
const wantsBuild = args.has('--build');

const cleanBuild = wantsAll || wantsBuild || (!wantsDev && !wantsAll && !wantsBuild);
const cleanDev = wantsAll || wantsDev;

const cwd = process.cwd();
const absNext = `${cwd}/.next`;
const absNextDev = `${cwd}/.next-dev`;
const absTurbo = `${cwd}/.turbo`;

if (cleanBuild) rm(absNext, '.next');
if (cleanDev) rm(absNextDev, '.next-dev');
rm(absTurbo, '.turbo');
