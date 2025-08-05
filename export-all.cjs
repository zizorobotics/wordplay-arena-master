const fs = require('fs');
const path = require('path');

// Set to current working directory (entire project)
const folderToExport = process.cwd();

// Output array
const output = [];

// Recursively read all files
function readFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory() && file !== 'node_modules') {
      readFiles(fullPath);
    } else if (/\.(tsx?|js|ts|json|html|css)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      output.push(`=== File: ${path.relative(folderToExport, fullPath)} ===\n${content}`);
    }
  }
}

// Execute scan
readFiles(folderToExport);

// Write to target path
const outputPath = 'C:\\Users\\Ziad\\Downloads\\code_dump.txt';
fs.writeFileSync(outputPath, output.join('\n\n'));
console.log(`✅ Code exported to: ${outputPath}`);
