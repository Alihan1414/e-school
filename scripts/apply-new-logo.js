const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function applyNewLogo() {
  const sourcePath = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\b358f680-273a-4f9f-ade2-5b217de0a334\\.user_uploaded\\media_1788304736300.png';
  const outDir = path.resolve(__dirname, '../icons');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source image not found at', sourcePath);
    process.exit(1);
  }

  console.log('Directly applying new logo from:', sourcePath);

  // 1. Generate 512x512
  await sharp(sourcePath)
    .resize(512, 512, { fit: 'cover', kernel: 'lanczos3' })
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('✓ Rendered icon-512.png');

  // 2. Generate 192x192
  await sharp(sourcePath)
    .resize(192, 192, { fit: 'cover', kernel: 'lanczos3' })
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('✓ Rendered icon-192.png');

  // 3. Generate Maskable Icon 512x512 (with safe-zone padding)
  const inner380 = await sharp(sourcePath)
    .resize(380, 380, { fit: 'contain', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 1, g: 18, b: 46, alpha: 1 } }
  })
  .composite([{ input: inner380, gravity: 'center' }])
  .png({ quality: 100 })
  .toFile(path.join(outDir, 'icon-maskable.png'));
  console.log('✓ Rendered icon-maskable.png');

  // 4. Generate Apple Touch Icon 180x180
  await sharp(sourcePath)
    .resize(180, 180, { fit: 'cover', kernel: 'lanczos3' })
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('✓ Rendered apple-touch-icon.png');

  // 5. Generate Favicons
  await sharp(sourcePath)
    .resize(32, 32, { fit: 'cover', kernel: 'lanczos3' })
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));

  await sharp(sourcePath)
    .resize(16, 16, { fit: 'cover', kernel: 'lanczos3' })
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));
  console.log('✓ Rendered favicons');

  // 6. Master logo.png
  await sharp(sourcePath)
    .resize(512, 512, { fit: 'cover', kernel: 'lanczos3' })
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'logo.png'));
  console.log('✓ Rendered logo.png');

  // 7. Base64 embedded SVGs
  const pngBase64 = fs.readFileSync(path.join(outDir, 'icon-512.png')).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${pngBase64}" width="512" height="512"/>
</svg>`;

  fs.writeFileSync(path.join(outDir, 'logo.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-transparent.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal-dark.svg'), svgContent);
  console.log('✓ Updated all SVGs with new master logo!');

  console.log('NEW OFFICIAL LOGO DIRECTLY APPLIED TO ALL ASSETS!');
}

applyNewLogo().catch(console.error);
