/**
 * This script helps create a zip file of the current project for local development
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(outputDir, 'solstice-project.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Solstice project has been archived successfully!`);
  console.log(`Total size: ${archive.pointer()} bytes`);
  console.log(`Output file: ${path.join(outputDir, 'solstice-project.zip')}`);
  console.log('\nTo download this file, check the Files tab in your Replit workspace.');
});

// Good practice to catch warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Files and directories to include
const filesToInclude = [
  'App.js',
  'app.json',
  'babel.config.js',
  'package.json',
  'tsconfig.json',
  'server.js',
  'basic-server.js',
  'README.md',
  '.env.example',
  'assets',
  'server',
  'shared',
  'src',
];

// Files to exclude
const excludeFiles = [
  'node_modules',
  '.git',
  'output',
  'web-build',
  'tmp',
  'drizzle',
  '.replit',
  'replit.nix',
];

// Create a .env.example file
fs.writeFileSync(
  path.join(__dirname, '.env.example'),
  '# Required environment variables\nOPENAI_API_KEY=your_openai_api_key_here\n\n# Database configuration\nDATABASE_URL=postgresql://username:password@localhost:5432/solstice\n'
);

// Add files and directories
for (const fileToInclude of filesToInclude) {
  const fullPath = path.join(__dirname, fileToInclude);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Add directory (recursively)
        archive.directory(fullPath, fileToInclude, (data) => {
          // Filter out excluded files/directories
          const relativePath = path.relative(__dirname, data.path);
          for (const excludeFile of excludeFiles) {
            if (relativePath.includes(excludeFile)) {
              return false;
            }
          }
          return data;
        });
      } else {
        // Add file
        archive.file(fullPath, { name: fileToInclude });
      }
    }
  } catch (err) {
    console.warn(`Error adding ${fileToInclude}: ${err.message}`);
  }
}

// Finalize the archive (i.e., we're done appending files)
archive.finalize();