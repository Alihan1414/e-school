const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. EXACT LOGO SVG - EMBLEM (Square / App Icon)
const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Gradients matching the user logo image -->
    <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="50%" stop-color="#00A86B" />
      <stop offset="100%" stop-color="#008050" />
    </linearGradient>

    <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="100%" stop-color="#008552" />
    </linearGradient>

    <linearGradient id="leftPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C48C" />
      <stop offset="60%" stop-color="#009A60" />
      <stop offset="100%" stop-color="#006A40" />
    </linearGradient>

    <linearGradient id="rightPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00B87A" />
      <stop offset="60%" stop-color="#008A54" />
      <stop offset="100%" stop-color="#005834" />
    </linearGradient>

    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Background container for app icons (rounded container or transparent) -->
  <rect width="512" height="512" rx="105" fill="#0A1120" />

  <!-- The Exact Geometric School & Graduation Emblem -->
  <g transform="translate(0, 0)" filter="url(#subtleShadow)">
    
    <!-- Outer School Building Outline (Thick Green Stroke) -->
    <path d="M 256,52 
             L 426,160 
             L 384,188 
             L 384,360 
             L 256,460 
             L 128,360 
             L 128,188 
             L 86,160 Z"
          fill="none" 
          stroke="url(#roofGrad)" 
          stroke-width="26" 
          stroke-linejoin="round" 
          stroke-linecap="round" />

    <!-- Top: Graduation Cap / Mortarboard -->
    <!-- Cap Diamond Top -->
    <polygon points="256,128 340,168 256,208 172,168" 
             fill="url(#capGrad)" 
             stroke="#FFFFFF" 
             stroke-width="4" 
             stroke-linejoin="round" />

    <!-- Cap Lower Band / Neck -->
    <path d="M 212,192 
             C 212,228 300,228 300,192 
             L 290,182 
             C 280,212 232,212 222,182 Z" 
          fill="#007044" 
          stroke="#FFFFFF" 
          stroke-width="2" />

    <!-- Bottom: Open Book / Growth Leaves -->
    <!-- Left Leaf / Page -->
    <path d="M 242,246 
             L 164,258 
             C 152,272 152,352 164,372 
             L 242,424 Z" 
          fill="url(#leftPageGrad)" 
          stroke="#FFFFFF" 
          stroke-width="4" 
          stroke-linejoin="round" />

    <!-- Right Leaf / Page -->
    <path d="M 270,246 
             L 348,258 
             C 360,272 360,352 348,372 
             L 270,424 Z" 
          fill="url(#rightPageGrad)" 
          stroke="#FFFFFF" 
          stroke-width="4" 
          stroke-linejoin="round" />
  </g>
</svg>`;

// 2. TRANSPARENT EMBLEM SVG (For headers, modals, PDF prints)
const emblemTransparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="tRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="50%" stop-color="#00A86B" />
      <stop offset="100%" stop-color="#008050" />
    </linearGradient>

    <linearGradient id="tCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="100%" stop-color="#008552" />
    </linearGradient>

    <linearGradient id="tLeftPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C48C" />
      <stop offset="60%" stop-color="#009A60" />
      <stop offset="100%" stop-color="#006A40" />
    </linearGradient>

    <linearGradient id="tRightPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00B87A" />
      <stop offset="60%" stop-color="#008A54" />
      <stop offset="100%" stop-color="#005834" />
    </linearGradient>
  </defs>

  <g transform="translate(0, 0)">
    <!-- Outer School Building Outline -->
    <path d="M 256,52 
             L 426,160 
             L 384,188 
             L 384,360 
             L 256,460 
             L 128,360 
             L 128,188 
             L 86,160 Z"
          fill="none" 
          stroke="url(#tRoofGrad)" 
          stroke-width="26" 
          stroke-linejoin="round" 
          stroke-linecap="round" />

    <!-- Top: Graduation Cap / Mortarboard -->
    <polygon points="256,128 340,168 256,208 172,168" 
             fill="url(#tCapGrad)" 
             stroke="#FFFFFF" 
             stroke-width="4" 
             stroke-linejoin="round" />

    <!-- Cap Lower Band -->
    <path d="M 212,192 
             C 212,228 300,228 300,192 
             L 290,182 
             C 280,212 232,212 222,182 Z" 
          fill="#007044" 
          stroke="#FFFFFF" 
          stroke-width="2" />

    <!-- Bottom: Left Leaf / Page -->
    <path d="M 242,246 
             L 164,258 
             C 152,272 152,352 164,372 
             L 242,424 Z" 
          fill="url(#tLeftPageGrad)" 
          stroke="#FFFFFF" 
          stroke-width="4" 
          stroke-linejoin="round" />

    <!-- Bottom: Right Leaf / Page -->
    <path d="M 270,246 
             L 348,258 
             C 360,272 360,352 348,372 
             L 270,424 Z" 
          fill="url(#tRightPageGrad)" 
          stroke="#FFFFFF" 
          stroke-width="4" 
          stroke-linejoin="round" />
  </g>
</svg>`;

// 3. HORIZONTAL FULL CORPORATE LOGO (Matching User Image Exactly)
const horizontalLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 180" width="100%" height="100%">
  <defs>
    <linearGradient id="hRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="50%" stop-color="#00A86B" />
      <stop offset="100%" stop-color="#008050" />
    </linearGradient>

    <linearGradient id="hCap" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="100%" stop-color="#008552" />
    </linearGradient>

    <linearGradient id="hLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C48C" />
      <stop offset="100%" stop-color="#006A40" />
    </linearGradient>

    <linearGradient id="hRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00B87A" />
      <stop offset="100%" stop-color="#005834" />
    </linearGradient>
  </defs>

  <!-- Left Emblem (Scaled & Fitted) -->
  <g transform="translate(16, 12) scale(0.31)">
    <!-- School House Frame -->
    <path d="M 256,52 L 426,160 L 384,188 L 384,360 L 256,460 L 128,360 L 128,188 L 86,160 Z"
          fill="none" stroke="url(#hRoof)" stroke-width="28" stroke-linejoin="round" stroke-linecap="round" />

    <!-- Cap Diamond -->
    <polygon points="256,128 340,168 256,208 172,168" fill="url(#hCap)" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
    
    <!-- Cap Neck -->
    <path d="M 212,192 C 212,228 300,228 300,192 L 290,182 C 280,212 232,212 222,182 Z" fill="#007044" stroke="#FFFFFF" stroke-width="3" />

    <!-- Left Book Page -->
    <path d="M 242,246 L 164,258 C 152,272 152,352 164,372 L 242,424 Z" fill="url(#hLeft)" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />

    <!-- Right Book Page -->
    <path d="M 270,246 L 348,258 C 360,272 360,352 348,372 L 270,424 Z" fill="url(#hRight)" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
  </g>

  <!-- Right Typography (Exact Font & Style from image) -->
  <g transform="translate(185, 0)">
    <!-- E-SCHOOL -->
    <text x="0" y="68" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="44" 
          font-weight="900" 
          fill="#0B1E36" 
          letter-spacing="0.5px">E-SCHOOL</text>

    <!-- DAARA -->
    <text x="0" y="118" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="44" 
          font-weight="900" 
          fill="#0B1E36" 
          letter-spacing="0.5px">DAARA</text>

    <!-- SMART SCHOOL OS -->
    <text x="2" y="152" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="21" 
          font-weight="800" 
          fill="#00A86B" 
          letter-spacing="3.2px">SMART SCHOOL OS</text>
  </g>
</svg>`;

// 4. HORIZONTAL DARK-MODE CORPORATE LOGO (With crisp white/cyan text for dark themes)
const horizontalLogoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 180" width="100%" height="100%">
  <defs>
    <linearGradient id="dhRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F5A0" />
      <stop offset="50%" stop-color="#00D084" />
      <stop offset="100%" stop-color="#00A86B" />
    </linearGradient>

    <linearGradient id="dhCap" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00F5A0" />
      <stop offset="100%" stop-color="#00A86B" />
    </linearGradient>

    <linearGradient id="dhLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E699" />
      <stop offset="100%" stop-color="#008050" />
    </linearGradient>

    <linearGradient id="dhRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D084" />
      <stop offset="100%" stop-color="#006A40" />
    </linearGradient>
  </defs>

  <!-- Left Emblem -->
  <g transform="translate(16, 12) scale(0.31)">
    <!-- School House Frame -->
    <path d="M 256,52 L 426,160 L 384,188 L 384,360 L 256,460 L 128,360 L 128,188 L 86,160 Z"
          fill="none" stroke="url(#dhRoof)" stroke-width="28" stroke-linejoin="round" stroke-linecap="round" />

    <!-- Cap Diamond -->
    <polygon points="256,128 340,168 256,208 172,168" fill="url(#dhCap)" stroke="#0B1E36" stroke-width="5" stroke-linejoin="round" />
    
    <!-- Cap Neck -->
    <path d="M 212,192 C 212,228 300,228 300,192 L 290,182 C 280,212 232,212 222,182 Z" fill="#008050" stroke="#0B1E36" stroke-width="3" />

    <!-- Left Book Page -->
    <path d="M 242,246 L 164,258 C 152,272 152,352 164,372 L 242,424 Z" fill="url(#dhLeft)" stroke="#0B1E36" stroke-width="5" stroke-linejoin="round" />

    <!-- Right Book Page -->
    <path d="M 270,246 L 348,258 C 360,272 360,352 348,372 L 270,424 Z" fill="url(#dhRight)" stroke="#0B1E36" stroke-width="5" stroke-linejoin="round" />
  </g>

  <!-- Right Typography for Dark Theme -->
  <g transform="translate(185, 0)">
    <!-- E-SCHOOL -->
    <text x="0" y="68" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="44" 
          font-weight="900" 
          fill="#FFFFFF" 
          letter-spacing="0.5px">E-SCHOOL</text>

    <!-- DAARA -->
    <text x="0" y="118" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="44" 
          font-weight="900" 
          fill="#FFFFFF" 
          letter-spacing="0.5px">DAARA</text>

    <!-- SMART SCHOOL OS -->
    <text x="2" y="152" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="21" 
          font-weight="800" 
          fill="#00F5A0" 
          letter-spacing="3.2px">SMART SCHOOL OS</text>
  </g>
</svg>`;

// Write all SVGs
fs.writeFileSync(path.join(iconsDir, 'logo.svg'), emblemSvg);
fs.writeFileSync(path.join(iconsDir, 'logo-transparent.svg'), emblemTransparentSvg);
fs.writeFileSync(path.join(iconsDir, 'logo-horizontal.svg'), horizontalLogoSvg);
fs.writeFileSync(path.join(iconsDir, 'logo-horizontal-dark.svg'), horizontalLogoDarkSvg);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), emblemSvg);
console.log('Precise SVGs generated successfully!');

// PNG Generation
function createPngBuffer(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rawData = Buffer.alloc(height * (1 + width * bytesPerPixel));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

// Pixel drawer for precise emblem matching the image
function renderLogoPixel(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;

  // Squircle Background (Dark Luxury #0A1120 or Full for maskable)
  const cornerExp = 4.2;
  const squircle = Math.pow(Math.abs(nx), cornerExp) + Math.pow(Math.abs(ny), cornerExp);

  let bgR = 10;
  let bgG = 17;
  let bgB = 32;

  if (!isMaskable && squircle > 0.85) {
    if (squircle > 0.98) return [0, 0, 0, 0];
    const alpha = (0.98 - squircle) / (0.98 - 0.85);
    return [bgR, bgG, bgB, alpha * 255];
  }

  // Scale coordinates to fit emblem
  const scale = isMaskable ? 0.72 : 0.82;
  const sx = nx / scale;
  const sy = ny / scale;

  // 1. School House Outline
  // Outer line vertices: Top (0, -0.80), Eaves (+-0.68, -0.38), Inset (+-0.52, -0.27), Bottom (+-0.52, 0.42), Point (0, 0.82)
  let inOutline = false;
  const absX = Math.abs(sx);

  if (sy >= -0.82 && sy <= 0.84) {
    let roofOuterY = -0.80 + (absX / 0.68) * 0.42;
    let roofInnerY = roofOuterY + 0.11;

    // Roof slope
    if (absX <= 0.68 && sy >= roofOuterY && sy <= roofInnerY && sy <= -0.27) {
      inOutline = true;
    }

    // Walls
    if (absX >= 0.41 && absX <= 0.52 && sy >= -0.27 && sy <= 0.42) {
      inOutline = true;
    }

    // Bottom V
    let botOuterY = 0.42 + (1 - absX / 0.52) * 0.40;
    let botInnerY = botOuterY - 0.11;
    if (absX <= 0.52 && sy >= botInnerY && sy <= botOuterY && sy >= 0.40) {
      inOutline = true;
    }
  }

  if (inOutline) {
    // Vibrant Green Gradient (#00D084 to #008050)
    const t = (sy + 0.8) / 1.6;
    return [0, 208 - t * 80, 132 - t * 52, 255];
  }

  // 2. Mortarboard Cap (sy between -0.50 and -0.15)
  const capX = sx;
  const capY = sy + 0.34;
  const capDiamond = Math.abs(capX / 0.34) + Math.abs(capY / 0.16);
  if (capDiamond <= 1.0) {
    if (capDiamond >= 0.92) {
      return [255, 255, 255, 255]; // White border
    }
    // Cap Green Fill
    return [0, 180 + capY * 60, 105, 255];
  }

  // Cap Neck
  if (Math.abs(capX) <= 0.18 && capY >= 0.08 && capY <= 0.24) {
    return [0, 112, 68, 255];
  }

  // 3. Open Book / Leaves
  // Left Leaf (sx between -0.38 and -0.05, sy between -0.02 and 0.68)
  if (sx >= -0.38 && sx <= -0.05 && sy >= -0.02 && sy <= 0.68) {
    const leafX = (sx + 0.21) / 0.17;
    const leafY = (sy - 0.33) / 0.35;
    if (leafX * leafX + leafY * leafY <= 1.0) {
      // Left Page Gradient (#00C48C -> #006A40)
      const t = (sy + 0.02) / 0.70;
      return [0, 196 - t * 90, 140 - t * 76, 255];
    }
  }

  // Right Leaf (sx between 0.05 and 0.38, sy between -0.02 and 0.68)
  if (sx >= 0.05 && sx <= 0.38 && sy >= -0.02 && sy <= 0.68) {
    const leafX = (sx - 0.21) / 0.17;
    const leafY = (sy - 0.33) / 0.35;
    if (leafX * leafX + leafY * leafY <= 1.0) {
      // Right Page Gradient (#00B87A -> #005834)
      const t = (sy + 0.02) / 0.70;
      return [0, 184 - t * 96, 122 - t * 70, 255];
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate PNGs
const sizes = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon-32x32.png', size: 32, maskable: false },
  { name: 'favicon-16x16.png', size: 16, maskable: false }
];

for (const item of sizes) {
  console.log('Rendering ' + item.name + ' (' + item.size + 'x' + item.size + ')...');
  const buf = createPngBuffer(item.size, item.size, (x, y, w, h) =>
    renderLogoPixel(x, y, w, h, item.maskable)
  );
  fs.writeFileSync(path.join(iconsDir, item.name), buf);
}

console.log('All corporate logo assets successfully generated!');
