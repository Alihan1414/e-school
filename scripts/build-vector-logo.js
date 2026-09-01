const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Pixel-Perfect Vector Master of the E-School Emblem & Wordmark
const svgMaster = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Deep Navy Palette -->
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E2A47"/>
      <stop offset="100%" stop-color="#08182B"/>
    </linearGradient>

    <!-- Vibrant Royal Electric Blue -->
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0066B3"/>
      <stop offset="100%" stop-color="#0099E6"/>
    </linearGradient>

    <!-- Bright Cyan Accent -->
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0080FF"/>
      <stop offset="100%" stop-color="#00C8FF"/>
    </linearGradient>
  </defs>

  <g transform="translate(0, -10)">
    <!-- 1. GRADUATION CAP (MORTARBOARD) -->
    <!-- Diamond Cap Top -->
    <polygon points="256,52 396,104 256,154 116,104" fill="url(#navyGrad)"/>
    <!-- Skull Cap Base -->
    <path d="M174,124 C174,124 208,172 256,172 C304,172 338,124 338,124 C338,124 316,192 256,192 C196,192 174,124 174,124 Z" fill="url(#navyGrad)"/>
    <!-- Tassel String & Bell -->
    <path d="M256,104 C296,108 344,128 346,168 L346,186" fill="none" stroke="url(#navyGrad)" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="346" cy="188" r="4.5" fill="url(#navyGrad)"/>
    <polygon points="342,188 350,188 352,224 340,224" fill="url(#navyGrad)"/>

    <!-- 2. CIRCULAR ORBIT SWIRL (LEFT & RIGHT ARCS) -->
    <!-- Left Navy Arc -->
    <path d="M142,284 C132,222 170,166 232,152" fill="none" stroke="url(#navyGrad)" stroke-width="26" stroke-linecap="round"/>
    
    <!-- Right Blue Arc -->
    <path d="M362,160 C398,206 404,268 376,328" fill="none" stroke="url(#blueGrad)" stroke-width="24" stroke-linecap="round"/>

    <!-- Digital Tech Pixels on Right Swirl -->
    <rect x="352" y="210" width="18" height="18" rx="3.5" fill="url(#navyGrad)"/>
    <rect x="378" y="234" width="20" height="20" rx="4" fill="url(#blueGrad)"/>
    <rect x="342" y="252" width="14" height="14" rx="3" fill="url(#cyanGrad)"/>
    <rect x="368" y="274" width="22" height="22" rx="4.5" fill="url(#blueGrad)"/>

    <!-- 3. CENTRAL STYLIZED 'e' -->
    <!-- Outer 'e' Body -->
    <path d="M256,186 C194,186 150,230 150,296 C150,364 196,402 262,402 C306,402 342,382 362,350 L322,328 C310,346 290,358 262,358 C226,358 202,334 198,296 L372,296 C374,290 376,282 376,272 C376,222 330,186 256,186 Z M198,260 C206,232 226,220 256,220 C286,220 306,232 314,260 L198,260 Z" fill="url(#navyGrad)"/>

    <!-- 4. OPEN BOOK WINGS (BASE) -->
    <!-- Left Wing: Top Navy Layer -->
    <path d="M254,414 C204,378 140,374 88,386 L88,416 C140,404 204,410 254,446 Z" fill="url(#navyGrad)"/>
    <!-- Left Wing: Bottom Blue Swoosh -->
    <path d="M254,432 C204,396 140,392 88,404 L96,432 C144,420 204,426 254,460 Z" fill="url(#blueGrad)"/>

    <!-- Right Wing: Top Navy Layer -->
    <path d="M258,414 C308,378 372,374 424,386 L424,416 C372,404 308,410 258,446 Z" fill="url(#navyGrad)"/>
    <!-- Right Wing: Bottom Blue Swoosh -->
    <path d="M258,432 C308,396 372,392 424,404 L416,432 C368,420 308,426 258,460 Z" fill="url(#blueGrad)"/>

    <!-- Central Spine Dot -->
    <circle cx="256" cy="442" r="3.5" fill="#0099E6"/>

    <!-- 5. E·SCHOOL CLEAN WORDMARK AT BOTTOM -->
    <g transform="translate(256, 492)" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif">
      <text x="0" y="0" font-size="34" font-weight="900" letter-spacing="3">
        <tspan fill="#0066B3">e</tspan><tspan fill="#0099E6"> · </tspan><tspan fill="#0E2A47">school</tspan>
      </text>
    </g>
  </g>
</svg>`;

async function buildVectorLogos() {
  const outDir = path.resolve(__dirname, '../icons');
  console.log('Compiling polished master vector logo assets...');

  fs.writeFileSync(path.join(outDir, 'logo.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'logo-transparent.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal.svg'), svgMaster);
  fs.writeFileSync(path.join(outDir, 'logo-horizontal-dark.svg'), svgMaster);

  const svgBuf = Buffer.from(svgMaster);

  // 512x512 High-Res PNG
  await sharp(svgBuf)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('✓ Rendered 512x512 icon-512.png');

  // 192x192 High-Res PNG
  await sharp(svgBuf)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('✓ Rendered 192x192 icon-192.png');

  // Maskable Icon with safe zone & dark background
  const iconInner370 = await sharp(svgBuf)
    .resize(370, 370)
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 8, g: 14, b: 30, alpha: 1 } }
  })
  .composite([{ input: iconInner370, gravity: 'center' }])
  .png({ quality: 100 })
  .toFile(path.join(outDir, 'icon-maskable.png'));
  console.log('✓ Rendered 512x512 icon-maskable.png');

  // Apple Touch Icon 180x180
  const iconInner135 = await sharp(svgBuf)
    .resize(135, 135)
    .png()
    .toBuffer();

  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 8, g: 14, b: 30, alpha: 1 } }
  })
  .composite([{ input: iconInner135, gravity: 'center' }])
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

  console.log('ALL POLISHED VECTOR LOGOS COMPILED WITH SUPREME QUALITY!');
}

buildVectorLogos().catch(console.error);
