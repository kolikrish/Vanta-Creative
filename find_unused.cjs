const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const indexHtml = path.join(__dirname, 'index.html');

// Get all files recursively
function getFiles(dir, exts, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, exts, fileList);
    } else {
      if (!exts || exts.some(ext => fullPath.toLowerCase().endsWith(ext))) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

// All code files
const codeFiles = getFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx', '.css']);
codeFiles.push(indexHtml);

// All assets
const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.mp4'];
const publicImages = getFiles(publicDir, imageExts);
const srcImages = getFiles(srcDir, imageExts);
const allImages = [...publicImages, ...srcImages];

// All CSS
const allCss = getFiles(srcDir, ['.css']);

// Read all code content
let codeContent = '';
for (const file of codeFiles) {
  codeContent += fs.readFileSync(file, 'utf8') + '\n';
}

console.log('--- Unused Images ---');
let unusedImages = 0;
for (const img of allImages) {
  // Extract filename and relative path
  let relativePath = img.replace(publicDir, '').replace(/\\/g, '/');
  if (img.startsWith(srcDir)) {
      relativePath = img.replace(srcDir, '').replace(/\\/g, '/');
  }
  const basename = path.basename(img);
  
  // Search for the relative path or just the basename in the code
  // Some paths might be dynamically constructed, so we also check if basename exists
  if (!codeContent.includes(basename)) {
    console.log(relativePath);
    unusedImages++;
  }
}
console.log(`Total unused images: ${unusedImages} / ${allImages.length}`);

console.log('\n--- Unused CSS ---');
let unusedCss = 0;
for (const css of allCss) {
  const basename = path.basename(css);
  // Exception for index.css which might be imported in main.jsx
  if (basename === 'index.css' && codeContent.includes('index.css')) continue;

  if (!codeContent.includes(basename)) {
    console.log(css.replace(__dirname, '').replace(/\\/g, '/'));
    unusedCss++;
  }
}
console.log(`Total unused CSS files: ${unusedCss} / ${allCss.length}`);
