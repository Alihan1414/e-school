const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Pure Mathematical High-Definition Vector SVG for E-School Daara
const svgMaster = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Gradients -->
    <linearGradient id="gradNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F2547"/>
      <stop offset="100%" stop-color="#091428"/>
    </linearGradient>

    <linearGradient id="gradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0070BA"/>
      <stop offset="50%" stop-color="#0094DE"/>
      <stop offset="100%" stop-color="#00B4F5"/>
    </linearGradient>

    <linearGradient id="gradEmeraldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <linearGradient id="gradCap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0C2340"/>
      <stop offset="100%" stop-color="#05101E"/>
    </linearGradient>

    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Group -->
  <g transform="translate(0, 0)">
    
    <!-- 1. Graduation Mortarboard (Cap) -->
    <!-- Diamond Top -->
    <polygon points="256,58 408,114 256,168 104,114" fill="url(#gradCap)" stroke="#0094DE" stroke-width="2.5"/>
    <!-- Skull Cap Base Underneath -->
    <path d="M168,138 C168,138 206,192 256,192 C306,192 344,138 344,138 C344,138 316,214 256,214 C196,214 168,138 168,138 Z" fill="url(#gradCap)"/>
    <!-- Tassel String & Bead -->
    <path d="M256,114 C304,118 356,140 358,185 L358,206" fill="none" stroke="#0094DE" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="358" cy="208" r="4.5" fill="#00B4F5"/>
    <path d="M354,208 L352,246 C352,248 364,248 364,246 L362,208 Z" fill="#0094DE"/>

    <!-- 2. Orbit Ring Outer Arc -->
    <!-- Left Crest Swirl -->
    <path d="M128,272 C122,206 172,148 244,142" fill="none" stroke="url(#gradPrimary)" stroke-width="24" stroke-linecap="round"/>
    <!-- Right Crest Swirl -->
    <path d="M374,152 C412,198 420,266 386,334" fill="none" stroke="url(#gradPrimary)" stroke-width="24" stroke-linecap="round"/>

    <!-- Digital Tech Pixels on Right Swirl -->
    <rect x="368" y="222" width="16" height="16" rx="3" fill="#0070BA"/>
    <rect x="390" y="244" width="18" height="18" rx="3.5" fill="#0094DE"/>
    <rect x="354" y="260" width="14" height="14" rx="3" fill="#00B4F5"/>
    <rect x="376" y="286" width="20" height="20" rx="4" fill="#0070BA"/>
    <rect x="340" y="296" width="12" height="12" rx="2.5" fill="#10B981"/>

    <!-- 3. Central Modern Stylized 'e' Letterform -->
    <!-- Outer 'e' curve -->
    <path d="M256,192 C196,192 154,236 154,302 C154,368 198,406 264,406 C308,406 344,386 364,354 L324,332 C312,350 292,362 264,362 C228,362 204,336 200,300 L370,300 C372,294 374,286 374,276 C374,228 328,192 256,192 Z M202,264 C210,236 230,224 256,224 C282,224 302,236 312,264 L202,264 Z" fill="url(#gradNavy)"/>
    
    <!-- High-tech cyan inner core highlight on 'e' -->
    <path d="M256,228 C234,228 216,238 208,260 L308,260 C300,238 278,228 256,228 Z" fill="url(#gradPrimary)"/>

    <!-- 4. Open Wisdom Book Wings (Base) -->
    <!-- Left Wing (Top layer & Under layer) -->
    <path d="M256,432 C204,394 140,388 88,400 L88,432 C140,420 204,426 256,464 Z" fill="url(#gradNavy)"/>
    <path d="M256,450 C204,412 140,406 88,418 L96,448 C144,436 204,442 256,478 Z" fill="url(#gradPrimary)"/>

    <!-- Right Wing (Top layer & Under layer) -->
    <path d="M256,432 C308,394 372,388 424,400 L424,432 C372,420 308,426 256,464 Z" fill="url(#gradNavy)"/>
    <path d="M256,450 C308,412 372,406 424,418 L416,448 C368,436 308,442 256,478 Z" fill="url(#gradPrimary)"/>

    <!-- Spine Divider Accent -->
    <polygon points="253,428 259,428 257,486 255,486" fill="#10B981"/>
  </g>
</svg>`;

async function buildVectorLogos() {
  const outDir = path.resolve(__dirname, '../icons');
  console.log('Generating crisp mathematical vector assets...');

  fs.writeFileSync(path.join(outDir, 'logo.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'logo-transparent.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal-dark.svg'), svgMaster);

  // High-Quality Super-Sampled PNG Renders
  const svgBuf = Buffer.from(svgMaster);

  // 512x512 PNG
  await sharp(svgBuf)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('✓ Rendered 512x512 icon-512.png');

  // 192x192 PNG
  await sharp(svgBuf)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('✓ Rendered 192x192 icon-192.png');

  // Maskable Icon 512x512 with safe-zone margin and OLED dark background
  const iconInner360 = await sharp(svgBuf)
    .resize(380, 380)
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 8, g: 14, b: 30, alpha: 1 } }
  })
  .composite([{ input: iconInner360, gravity: 'center' }])
  .png({ quality: 100 })
  .toFile(path.join(outDir, 'icon-maskable.png'));
  console.log('✓ Rendered 512x512 icon-maskable.png');

  // Apple Touch Icon 180x180 with OLED dark background
  const iconInner130 = await sharp(svgBuf)
    .resize(140, 140)
    .png()
    .toBuffer();

  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 8, g: 14, b: 30, alpha: 1 } }
  })
  .composite([{ input: iconInner130, gravity: 'center' }])
  .png({ quality: 100 })
  .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('✓ Rendered 180x180 apple-touch-icon.png');

  // Favicons 32 & 16
  await sharp(svgBuf)
    .resize(32, 32)
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));

  await sharp(svgBuf)
    .resize(16, 16)
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));

  // Master logo.png
  await sharp(svgBuf)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'logo.png'));

  console.log('ALL VECTOR & ULTRA-HD LOGO ASSETS COMPILED SUCCESSFULLY!');
}

buildVectorLogos().catch(console.error);
