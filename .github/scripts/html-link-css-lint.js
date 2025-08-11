#!/usr/bin/env node

import fs from 'fs';
import glob from 'glob';
import cheerio from 'cheerio';

let hasError = false;
let messages = [];

const htmlFiles = glob.sync('**/*.html', { ignore: 'node_modules/**' });

function log(msg) {
  messages.push(msg);
  console.log(msg);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);

  // 1. Check for invalid/empty links
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (!href || href.trim() === '') {
      hasError = true;
      log(`❌ [${file}] <a> tag with empty or missing href detected.`);
    }
    // Extra: Check for placeholder links
    if (href && (href === '#' || href.match(/^javascript:/i))) {
      hasError = true;
      log(`⚠️ [${file}] <a> tag with unsafe href ('${href}') detected.`);
    }
  });

  // 2. Check for incomplete tags (cheerio auto-fixes, so check for stray '<' or '>')
  const tagMismatch = (html.match(/<[^>]*$/g) || []).length > 0;
  if (tagMismatch) {
    hasError = true;
    log(`❌ [${file}] Possible incomplete HTML tag detected.`);
  }

  // 3. Check for inline CSS (style attribute in any tag)
  $('[style]').each((i, el) => {
    hasError = true;
    log(`⚠️ [${file}] Inline CSS (style attribute) found in <${el.tagName}> tag.`);
  });

  // 4. Check for internal CSS (<style> tags)
  $('style').each((i, el) => {
    hasError = true;
    log(`⚠️ [${file}] Internal CSS (<style> tag) found.`);
  });
}

// If any error/warning, fail the workflow and display summary
if (hasError) {
  log('\n❗ HTML lint check failed. Please fix the above issues before merging.\n');
  process.exit(1);
} else {
  log('\n✅ All HTML link and CSS checks passed.\n');
  process.exit(0);
}