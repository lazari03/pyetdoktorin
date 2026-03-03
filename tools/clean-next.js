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

rm('.next');
rm('.turbo');

