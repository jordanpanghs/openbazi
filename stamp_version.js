const fs = require('fs');
const path = require('path');

const version = Date.now().toString(36);
const versionJsonPath = path.join(__dirname, 'version.json');
const indexHtmlPath = path.join(__dirname, 'index.html');

fs.writeFileSync(versionJsonPath, JSON.stringify({ version }, null, 2) + '\n', 'utf8');

let html = fs.readFileSync(indexHtmlPath, 'utf8');
html = html.replace(/window\.OPENBAZI_VERSION\s*=\s*'[^']*'/g, `window.OPENBAZI_VERSION = '${version}'`);
html = html.replace(/href="src\/app\.css(\?v=[^"]*)?"/g, `href="src/app.css?v=${version}"`);
html = html.replace(/src="src\/astrologyEngine\.bundle\.js(\?v=[^"]*)?"/g, `src="src/astrologyEngine.bundle.js?v=${version}"`);
html = html.replace(/src="src\/app\.js(\?v=[^"]*)?"/g, `src="src/app.js?v=${version}"`);

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log(`Stamped build version: ${version}`);
