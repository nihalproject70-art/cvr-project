const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\f0425c69-8cdd-436b-9008-a4a46d8beb23\\.system_generated\\logs\\transcript.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  const urls = new Set();
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const matches = line.match(/https:\/\/images\.unsplash\.com\/[^\s\"\'\)\}]+/gi);
    if (matches) {
      for (const url of matches) {
        // Clean URL from any escapes
        const cleanUrl = url.replace(/\\/g, '');
        urls.add(cleanUrl);
      }
    }
  }
  
  console.log('Found Unsplash URLs:');
  console.log(JSON.stringify(Array.from(urls), null, 2));
} catch (e) {
  console.error('Error:', e.message);
}
