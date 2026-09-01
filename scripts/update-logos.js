const fs = require('fs');
const path = require('path');

async function processLogos() {
  const sharp = require('sharp');
  const sourcePath = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\b358f680-273a-4f9f-ade2-5b217de0a334\\.user_uploaded\\media_1788303017276.png';
  const outDir = path.resolve(__dirname, '../icons');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source image not found at', sourcePath);
    process.exit(1);
  }

  console.log('Reading source image from:', sourcePath);

  // 1. Generate standard square 512x512 icon
  await sharp(sourcePath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png');

  // 2. Generate 192x192 icon
  await sharp(sourcePath)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png');

  // 3. Generate Apple Touch Icon 180x180
  await sharp(sourcePath)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  // 4. Generate Maskable Icon with safe margins (410x410 inside 512x512)
  const inner410 = await sharp(sourcePath)
    .resize(410, 410, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 8, g: 14, b: 30, alpha: 1 }
    }
  })
  .composite([{ input: inner410, gravity: 'center' }])
  .png()
  .toFile(path.join(outDir, 'icon-maskable.png'));
  console.log('✓ Generated icon-maskable.png');

  // 5. Generate Favicons
  await sharp(sourcePath)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));
  console.log('✓ Generated favicon-32x32.png');

  await sharp(sourcePath)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));
  console.log('✓ Generated favicon-16x16.png');

  // 6. Copy full high-res logo
  await sharp(sourcePath)
    .png()
    .toFile(path.join(outDir, 'logo.png'));
  console.log('✓ Generated logo.png');

  // 7. Generate Base64 SVG wrappers for SVG references
  const pngBase64 = fs.readFileSync(path.join(outDir, 'icon-512.png')).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${pngBase64}" width="512" height="512"/>
</svg>`;

  fs.writeFileSync(path.join(outDir, 'logo.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-transparent.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal-dark.svg'), svgContent);
  console.log('✓ Updated all SVGs with new logo!');

  console.log('ALL LOGOS UPDATED SUCCESSFULLY!');
}

processLogos().catch(err => {
  console.error('Error processing logos:', err);
  process.exit(1);
});
