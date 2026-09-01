const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processLogos() {
  const sourcePath = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\b358f680-273a-4f9f-ade2-5b217de0a334\\.user_uploaded\\media_1788303017276.png';
  const outDir = path.resolve(__dirname, '../icons');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source image not found at', sourcePath);
    process.exit(1);
  }

  console.log('Reading source image from:', sourcePath);

  // 1. Extract pure emblem without black edges or white square background
  const image = sharp(sourcePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  
  const outBuf = Buffer.alloc(w * h * 4);
  let minX = w, maxX = 0, minY = h, maxY = 0;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * channels;
      const outIdx = (y * w + x) * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const isBlackBorder = (x < 15 || y < 15 || x > w - 15 || y > h - 15) && (r < 50 && g < 50 && b < 50);
      const isWhiteBg = (r > 220 && g > 220 && b > 220);
      
      if (isBlackBorder || isWhiteBg) {
        outBuf[outIdx] = 0;
        outBuf[outIdx + 1] = 0;
        outBuf[outIdx + 2] = 0;
        outBuf[outIdx + 3] = 0; // transparent
      } else {
        outBuf[outIdx] = r;
        outBuf[outIdx + 1] = g;
        outBuf[outIdx + 2] = b;
        outBuf[outIdx + 3] = 255;
        
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = Math.max(1, maxX - minX);
  const cropH = Math.max(1, maxY - minY);
  console.log('Clean Emblem Bounding Box:', { minX, minY, cropW, cropH });

  const trimmedEmblem = await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  // 1. Generate 512x512 with safe padding on transparent background
  const emblem512 = await sharp(trimmedEmblem)
    .resize(440, 440, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([{ input: emblem512, gravity: 'center' }])
  .png()
  .toFile(path.join(outDir, 'icon-512.png'));
  console.log('✓ Generated clean icon-512.png');

  // 2. Generate 192x192
  const emblem192 = await sharp(trimmedEmblem)
    .resize(164, 164, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([{ input: emblem192, gravity: 'center' }])
  .png()
  .toFile(path.join(outDir, 'icon-192.png'));
  console.log('✓ Generated clean icon-192.png');

  // 3. Generate Apple Touch Icon 180x180 (with dark luxury slate background)
  const emblem180 = await sharp(trimmedEmblem)
    .resize(140, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 8, g: 14, b: 30, alpha: 1 } }
  })
  .composite([{ input: emblem180, gravity: 'center' }])
  .png()
  .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('✓ Generated clean apple-touch-icon.png');

  // 4. Generate Maskable Icon 512x512 with safe zone padding & dark canvas
  const emblemMaskable = await sharp(trimmedEmblem)
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 8, g: 14, b: 30, alpha: 1 } }
  })
  .composite([{ input: emblemMaskable, gravity: 'center' }])
  .png()
  .toFile(path.join(outDir, 'icon-maskable.png'));
  console.log('✓ Generated clean icon-maskable.png');

  // 5. Generate Favicons
  await sharp(trimmedEmblem)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));

  await sharp(trimmedEmblem)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));
  console.log('✓ Generated clean favicons');

  // 6. Master Logo PNG
  await sharp(trimmedEmblem)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'logo.png'));
  console.log('✓ Generated clean logo.png');

  // 7. Base64 SVG wrappers
  const pngBase64 = fs.readFileSync(path.join(outDir, 'icon-512.png')).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${pngBase64}" width="512" height="512"/>
</svg>`;

  fs.writeFileSync(path.join(outDir, 'logo.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-transparent.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal-dark.svg'), svgContent);
  console.log('✓ Updated all SVGs with clean transparent logo!');

  console.log('ALL ICONS AND LOGOS RENDERED WITH CRYSTAL-CLEAR TRANSPARENCY!');
}

processLogos().catch(err => {
  console.error('Error processing logos:', err);
  process.exit(1);
});
