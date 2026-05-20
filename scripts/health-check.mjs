import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const failures = [];

const requireFile = (relativePath) => {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) failures.push(`Missing ${relativePath}`);
  return filePath;
};

const readRequired = (relativePath) => {
  const filePath = requireFile(relativePath);
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
};

const indexHtml = readRequired('dist/index.html');
const robots = readRequired('dist/robots.txt');
const appEntry = readRequired('src/main.jsx');
readRequired('dist/manifest.webmanifest');

if (!/<meta\s+name="description"\s+content="[^"]{60,}"/i.test(indexHtml)) {
  failures.push('dist/index.html needs a meaningful meta description.');
}

if (!/<main\b/i.test(appEntry) && !/id="app-shell"/i.test(appEntry)) {
  failures.push('The app shell should expose a main landmark.');
}

if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) {
  failures.push('dist/robots.txt is not a valid crawl policy.');
}

const assetsDir = join(distDir, 'assets');
const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const jsAssets = assets
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({ name, size: statSync(join(assetsDir, name)).size }))
  .sort((a, b) => b.size - a.size);

const largestJs = jsAssets[0];
const totalJs = jsAssets.reduce((total, asset) => total + asset.size, 0);
const largestBudget = 900 * 1024;
const totalBudget = 1250 * 1024;

if (!jsAssets.length) failures.push('No production JavaScript assets were generated.');
if (largestJs && largestJs.size > largestBudget) {
  failures.push(`Largest JS chunk is ${(largestJs.size / 1024).toFixed(1)} KB. Budget is 900 KB.`);
}
if (totalJs > totalBudget) {
  failures.push(`Total JS is ${(totalJs / 1024).toFixed(1)} KB. Budget is 1250 KB.`);
}

console.log('Build A Booking health check');
console.log(`- JS chunks: ${jsAssets.length}`);
console.log(`- Largest JS: ${largestJs ? `${(largestJs.size / 1024).toFixed(1)} KB (${largestJs.name})` : 'n/a'}`);
console.log(`- Total JS: ${(totalJs / 1024).toFixed(1)} KB`);
console.log('- SEO/PWA files: checked');

if (failures.length) {
  console.error('\nHealth check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Health check passed.');
