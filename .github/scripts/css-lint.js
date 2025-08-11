#!/usr/bin/env node

import fs from 'fs';
import glob from 'glob';

let hasError = false;
let messages = [];

const cssFiles = glob.sync('**/*.css', { ignore: 'node_modules/**' });

function log(msg) {
  messages.push(msg);
  console.log(msg);
}

// Basic list of valid CSS properties (can be extended)
const validProperties = [
  'color', 'background', 'background-color', 'font-size', 'font-family', 'margin', 'padding',
  'border', 'border-radius', 'width', 'height', 'display', 'position', 'top', 'left', 'right',
  'bottom', 'z-index', 'overflow', 'opacity', 'box-shadow', 'text-align', 'line-height', 'cursor'
];

for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  const lines = css.split('\n');

  let selector = '';
  let selectorStart = false;
  let selectorContent = '';
  let selectorsSeen = new Set();

  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i].trim();

    // Empty selector
    if (line.endsWith('{')) {
      selector = line.slice(0, -1).trim();
      selectorStart = true;
      selectorContent = '';
      if (selector === '') {
        hasError = true;
        log(`❌ [${file}] Line ${i+1}: Empty selector detected.`);
      }
      // Duplicate selector
      if (selectorsSeen.has(selector)) {
        hasError = true;
        log(`❌ [${file}] Line ${i+1}: Duplicate selector "${selector}" detected.`);
      }
      selectorsSeen.add(selector);
      continue;
    }

    // End of selector block
    if (line === '}') {
      selectorStart = false;
      if (selectorContent.trim() === '') {
        hasError = true;
        log(`❌ [${file}] Selector "${selector}" at line ${i+1} is empty.`);
      }
      selector = '';
      continue;
    }

    // Inside selector block
    if (selectorStart && line.length > 0) {
      selectorContent += line;
      // Missing semicolon
      if (!line.endsWith(';')) {
        hasError = true;
        log(`❌ [${file}] Line ${i+1}: Missing semicolon.`);
      }
      // Invalid property name
      const propMatch = line.match(/^([a-zA-Z-]+)\s*:/);
      if (propMatch) {
        const prop = propMatch[1];
        if (!validProperties.includes(prop)) {
          hasError = true;
          log(`⚠️ [${file}] Line ${i+1}: Possibly invalid property "${prop}".`);
        }
      }
    }

    // Missing curly braces
    if (line.length > 0 && line.includes(':') && !selectorStart) {
      hasError = true;
      log(`❌ [${file}] Line ${i+1}: CSS property outside selector block (missing curly braces?).`);
    }
  }
}

if (hasError) {
  log('\n❗ CSS lint check failed. Please fix the above issues before merging.\n');
  process.exit(1);
} else {
  log('\n✅ All CSS formatting and basic checks passed.\n');
  process.exit(0);
}