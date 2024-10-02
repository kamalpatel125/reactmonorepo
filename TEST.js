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






const fs = require('fs');
const path = require('path');

/**
 * Convert absolute or alias paths in import statements to relative paths
 * @param {string} filePath - The path of the file to process
 * @param {object} aliasMap - An object mapping alias to their respective absolute paths
 */
function convertAbsoluteToRelative(filePath, aliasMap) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Regex to match all `import` statements
  content = content.replace(/import\s+.*?['"](.*?)['"];?/g, (match, importPath) => {
    let absoluteImportPath;

    // Check if the import uses one of the aliases, and resolve the absolute path
    for (const alias in aliasMap) {
      if (importPath.startsWith(alias)) {
        const resolvedAliasPath = path.resolve(aliasMap[alias], importPath.replace(alias, ''));
        absoluteImportPath = resolvedAliasPath;
        break;
      }
    }

    // If the import path is absolute (not relative), resolve it to an absolute path
    if (!absoluteImportPath && !importPath.startsWith('.') && !importPath.startsWith('/')) {
      absoluteImportPath = path.resolve(process.cwd(), importPath);
    }

    // If the path was resolved to an absolute path, convert it to a relative path
    if (absoluteImportPath) {
      const relativePath = path.relative(path.dirname(filePath), absoluteImportPath);

      // Ensure that the relative path has a `./` or `../` prefix for valid import syntax
      const normalizedRelativePath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      return match.replace(importPath, normalizedRelativePath);
    }

    // Return the original match if no conversion was done
    return match;
  });

  // Write the modified content back to the file
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Recursively process all files in a directory and convert absolute imports to relative ones
 * @param {string} dir - The directory to process
 * @param {object} aliasMap - An object mapping alias to their respective absolute paths
 */
function processFiles(dir, aliasMap) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // Recursively process directories
      processFiles(filePath, aliasMap);
    } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.d.ts')) {
      // Process TypeScript, JavaScript, and declaration files
      convertAbsoluteToRelative(filePath, aliasMap);
    }
  });
}

// Define your alias-to-path mapping (based on your tsconfig.json or other build setup)
const aliasMap = {
  '@/': path.resolve(__dirname, 'src'), // Example alias mapping for "@/utils/*"
  '@components/': path.resolve(__dirname, 'src/components'), // Add more aliases as needed
};

// Start processing files from the dist or source folder
const targetDirectory = path.resolve(__dirname, 'dist'); // or 'src' depending on where the .d.ts files are
processFiles(targetDirectory, aliasMap);

console.log('Converted absolute imports to relative imports in files.');
