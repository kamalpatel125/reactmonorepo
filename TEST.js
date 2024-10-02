content = content.replace(/import\s+(.*?)(['"])(@components\/|@utils\/)(.*?)['"]/g, (match, p1, p2, p3, p4) => {
  const basePath = p3 === '@components/' ? 'src/components' : 'src/utils';
  const absoluteImportPath = path.resolve(__dirname, basePath, p4);
  const relativePath = path.relative(path.dirname(filePath), absoluteImportPath);

  return `import ${p1}${p2}${relativePath.startsWith('.') ? relativePath : './' + relativePath}${p2}`;
});

const fs = require('fs');
const path = require('path');

// Function to convert absolute imports to relative imports in a file
function convertAbsoluteToRelative(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // This regex matches absolute imports using the alias '@/' (adjust this for your alias)
  content = content.replace(/import\s+(.*?)(['"])(@\/)(.*?)['"]/g, (match, p1, p2, p3, p4) => {
    const absoluteImportPath = path.resolve(__dirname, 'src', p4);
    const relativePath = path.relative(path.dirname(filePath), absoluteImportPath);

    // Convert to a relative path, ensuring it's correct
    return `import ${p1}${p2}${relativePath.startsWith('.') ? relativePath : './' + relativePath}${p2}`;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
}

// Example: process all .d.ts files in the 'dist' folder
const distFolder = path.resolve(__dirname, 'dist');

function processFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // Recursively process directories
      processFiles(filePath);
    } else if (filePath.endsWith('.d.ts')) {
      // Convert absolute to relative in .d.ts files
      convertAbsoluteToRelative(filePath);
    }
  });
}

processFiles(distFolder);

console.log('Converted absolute imports to relative imports in .d.ts files.');
