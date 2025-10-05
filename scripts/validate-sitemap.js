#!/usr/bin/env node

/**
 * Sitemap Validator for Sharayeh
 * Checks all URLs in sitemap are accessible and return 200
 * 
 * Usage: node validate-sitemap.js
 */

const https = require('https');
const { XMLParser } = require('fast-xml-parser');

const SITEMAP_URL = 'https://sharayeh.com/sitemap.xml';

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function validateSitemap() {
  console.log('🔍 Fetching sitemap...\n');
  
  try {
    // Fetch sitemap
    const { statusCode, data } = await fetchUrl(SITEMAP_URL);
    
    if (statusCode !== 200) {
      console.error(`❌ Sitemap returned status ${statusCode}`);
      process.exit(1);
    }
    
    console.log('✅ Sitemap accessible\n');
    
    // Parse XML
    const parser = new XMLParser();
    const sitemap = parser.parse(data);
    
    const urls = sitemap.urlset?.url || [];
    console.log(`📄 Found ${urls.length} URLs in sitemap\n`);
    
    // Validate each URL
    let passed = 0;
    let failed = 0;
    const errors = [];
    
    for (const urlEntry of urls) {
      const url = urlEntry.loc;
      const shortUrl = url.replace('https://sharayeh.com', '');
      
      try {
        const { statusCode } = await fetchUrl(url);
        
        if (statusCode === 200) {
          console.log(`✅ ${shortUrl}`);
          passed++;
        } else {
          console.log(`❌ ${shortUrl} (${statusCode})`);
          failed++;
          errors.push({ url: shortUrl, status: statusCode });
        }
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`❌ ${shortUrl} (ERROR: ${error.message})`);
        failed++;
        errors.push({ url: shortUrl, status: 'ERROR' });
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary');
    console.log('='.repeat(50));
    console.log(`Total URLs: ${urls.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / urls.length) * 100).toFixed(1)}%`);
    
    if (errors.length > 0) {
      console.log('\n❌ Failed URLs:');
      errors.forEach(({ url, status }) => {
        console.log(`  ${url} → ${status}`);
      });
    }
    
    console.log('\n✨ Validation complete!\n');
    
    // Exit with error if any URLs failed
    if (failed > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

validateSitemap();
