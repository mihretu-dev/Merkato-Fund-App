const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createConceptBoard() {
  console.log('Starting Phase 10 Design Concept Board generation...');

  const screenFiles = [
    {
      id: '01',
      title: '01 • Onboarding',
      desc: 'Community Horizon & Brand Welcome',
      light: 'screenshots/phase10_light_onboarding.png',
      dark: 'screenshots/phase10_dark_onboarding.png',
    },
    {
      id: '02',
      title: '02 • Persona Selection',
      desc: 'Member • Winner • Auditor Roles',
      light: 'screenshots/phase10_light_persona_select.png',
      dark: 'screenshots/phase10_dark_persona_select.png',
    },
    {
      id: '03',
      title: '03 • Home / Wallet',
      desc: '2,450 ETB • Daily Streak & Next Draw',
      light: 'screenshots/phase10_light_dashboard.png',
      dark: 'screenshots/phase10_dark_dashboard.png',
    },
    {
      id: '04',
      title: '04 • Daily Contribution',
      desc: '50 ETB • Telebirr / CBE / Awash Birr',
      light: 'screenshots/phase10_light_contribute.png',
      dark: 'screenshots/phase10_dark_contribute.png',
    },
    {
      id: '05',
      title: '05 • Draw Room',
      desc: '1,000,000 ETB Prize • Algorithmic Draw',
      light: 'screenshots/phase10_light_draw.png',
      dark: 'screenshots/phase10_dark_draw.png',
    },
    {
      id: '06',
      title: '06 • Winner & Escrow',
      desc: 'ACT/365 @ 22% • Key Repayment Details',
      light: 'screenshots/phase10_light_winner.png',
      dark: 'screenshots/phase10_dark_winner.png',
    },
    {
      id: '07',
      title: '07 • More & Settings',
      desc: 'Theme • Solvency Floor • Tools',
      light: 'screenshots/phase10_light_more.png',
      dark: 'screenshots/phase10_dark_more.png',
    },
  ];

  // Verify all files exist
  for (const s of screenFiles) {
    if (!fs.existsSync(s.light)) throw new Error(`Missing file: ${s.light}`);
    if (!fs.existsSync(s.dark)) throw new Error(`Missing file: ${s.dark}`);
  }

  // Dimensions
  const phoneW = 500;
  const phoneH = Math.round(phoneW * (2340 / 1080)); // 1083
  const colGap = 44;
  const sideMargin = 80;
  const totalW = sideMargin * 2 + (7 * phoneW) + (6 * colGap); // 80*2 + 3500 + 264 = 3924 px

  const topHeaderH = 340;
  const themeHeaderH = 90;
  const labelH = 75;
  const rowGap = 70;
  const bottomFooterH = 120;

  const lightRowY = topHeaderH + themeHeaderH; // 340 + 90 = 430
  const lightLabelsY = lightRowY + phoneH + 16; // 430 + 1083 + 16 = 1529
  const darkThemeHeaderY = lightLabelsY + labelH + rowGap; // 1529 + 75 + 70 = 1674
  const darkRowY = darkThemeHeaderY + themeHeaderH; // 1674 + 90 = 1764
  const darkLabelsY = darkRowY + phoneH + 16; // 1764 + 1083 + 16 = 2863
  const totalH = darkLabelsY + labelH + bottomFooterH; // 2863 + 75 + 120 = 3058 px

  console.log(`Board Dimensions: ${totalW} x ${totalH} px`);

  // Create rounded corner mask for phone screenshots
  const cornerRadius = 32;
  const maskSvg = Buffer.from(
    `<svg width="${phoneW}" height="${phoneH}">
      <rect x="0" y="0" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/>
    </svg>`
  );
  const maskBuffer = await sharp(maskSvg).png().toBuffer();

  // Create bezel/frame for phones
  const bezelSvg = (isLight) => Buffer.from(
    `<svg width="${phoneW + 8}" height="${phoneH + 8}">
      <rect x="2" y="2" width="${phoneW + 4}" height="${phoneH + 4}" rx="${cornerRadius + 2}" ry="${cornerRadius + 2}" 
        fill="none" stroke="${isLight ? 'rgba(255,255,255,0.45)' : 'rgba(51,65,85,0.8)'}" stroke-width="3"/>
    </svg>`
  );

  // Background SVG with rich graphics, headers, badges, labels
  const backgroundSvg = Buffer.from(`
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070B14"/>
          <stop offset="40%" stop-color="#0B1324"/>
          <stop offset="80%" stop-color="#080F1E"/>
          <stop offset="100%" stop-color="#050810"/>
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="50%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#34D399"/>
        </linearGradient>
        <linearGradient id="lightHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#E2E8F0"/>
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Canvas Background -->
      <rect width="${totalW}" height="${totalH}" fill="url(#bgGrad)"/>

      <!-- Ambient Glow Behind Rows -->
      <circle cx="${totalW * 0.25}" cy="${lightRowY + 500}" r="600" fill="#10B981" opacity="0.04" filter="blur(80px)"/>
      <circle cx="${totalW * 0.75}" cy="${darkRowY + 500}" r="650" fill="#0EA5E9" opacity="0.04" filter="blur(80px)"/>

      <!-- TOP HEADER -->
      <g transform="translate(${sideMargin}, 70)">
        <!-- Brand Icon / Leaf Graphic -->
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#064E3B"/>
        <path d="M16 38 C16 26 28 18 40 18 C40 30 28 38 16 38 Z" fill="#10B981"/>
        <circle cx="34" cy="30" r="5" fill="#34D399"/>

        <!-- Main Title -->
        <text x="76" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="36" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
          MERKATO FUND — UI/UX DESIGN CONCEPT BOARD
        </text>
        <text x="76" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="18" font-weight="500" fill="#94A3B8">
          Phase 10 Advanced Redesign • Physical Android Device Execution (1080×2340) • Light &amp; Dark Theme Parity
        </text>

        <!-- Metadata Badges -->
        <g transform="translate(0, 92)">
          <!-- Badge 1: Expo SDK 58 -->
          <rect x="0" y="0" width="130" height="32" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1"/>
          <text x="65" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0">Expo SDK 58</text>

          <!-- Badge 2: TypeScript Strict -->
          <rect x="142" y="0" width="145" height="32" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1"/>
          <text x="214" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0">TypeScript Strict</text>

          <!-- Badge 3: 84/84 Tests Passing -->
          <rect x="299" y="0" width="175" height="32" rx="16" fill="rgba(16,185,129,0.15)" stroke="#10B981" stroke-width="1"/>
          <text x="386" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#34D399">✓ 84/84 Tests Pass</text>

          <!-- Badge 4: Production Export -->
          <rect x="486" y="0" width="175" height="32" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1"/>
          <text x="573" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0">Android + iOS Bundle</text>

          <!-- Badge 5: Synthetic Demo Guarded -->
          <rect x="673" y="0" width="200" height="32" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1"/>
          <text x="773" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1">🔒 Synthetic Data Prototype</text>
        </g>
      </g>

      <!-- LIGHT THEME SECTION HEADER -->
      <g transform="translate(${sideMargin}, ${topHeaderH + 15})">
        <rect x="0" y="0" width="14" height="42" rx="4" fill="#10B981"/>
        <text x="28" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
          LIGHT THEME
        </text>
        <text x="225" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="500" fill="#94A3B8">
          — Clean Slate &amp; Crisp White Surfaces (#F8FAFC / #FFFFFF) with Rich Emerald Hero Highlights (#064E3B)
        </text>
      </g>

      <!-- DARK THEME SECTION HEADER -->
      <g transform="translate(${sideMargin}, ${darkThemeHeaderY + 15})">
        <rect x="0" y="0" width="14" height="42" rx="4" fill="#0EA5E9"/>
        <text x="28" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
          DARK THEME
        </text>
        <text x="220" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="500" fill="#94A3B8">
          — Deep Midnight Navy &amp; Slate-900 Surfaces (#080D1A / #111C2E) with High-Contrast Mint Accents (#10B981)
        </text>
      </g>

      <!-- SCREEN LABELS (LIGHT THEME ROW) -->
      ${screenFiles.map((s, idx) => {
        const x = sideMargin + idx * (phoneW + colGap) + (phoneW / 2);
        const titleSafe = s.title.replace(/&/g, '&amp;');
        const descSafe = s.desc.replace(/&/g, '&amp;');
        return `
          <g transform="translate(${x}, ${lightLabelsY})">
            <text x="0" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
              font-size="18" font-weight="700" fill="#F1F5F9">${titleSafe}</text>
            <text x="0" y="44" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
              font-size="13" font-weight="500" fill="#94A3B8">${descSafe}</text>
          </g>
        `;
      }).join('')}

      <!-- SCREEN LABELS (DARK THEME ROW) -->
      ${screenFiles.map((s, idx) => {
        const x = sideMargin + idx * (phoneW + colGap) + (phoneW / 2);
        const titleSafe = s.title.replace(/&/g, '&amp;');
        const descSafe = s.desc.replace(/&/g, '&amp;');
        return `
          <g transform="translate(${x}, ${darkLabelsY})">
            <text x="0" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
              font-size="18" font-weight="700" fill="#F1F5F9">${titleSafe}</text>
            <text x="0" y="44" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
              font-size="13" font-weight="500" fill="#94A3B8">${descSafe}</text>
          </g>
        `;
      }).join('')}

      <!-- FOOTER -->
      <g transform="translate(${sideMargin}, ${totalH - 60})">
        <line x1="0" y1="0" x2="${totalW - (sideMargin * 2)}" y2="0" stroke="#1E293B" stroke-width="1"/>
        <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#64748B">
          MERKATO FUND FINANCIAL TECHNOLOGIES • ADDIS ABABA FINTECH DEMONSTRATION PROTOTYPE
        </text>
        <text x="${totalW - (sideMargin * 2)}" y="32" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#64748B">
          ACT/365 Simple Interest Convention • Deterministic Equb Dynamics • Pure TypeScript Financial Engine
        </text>
      </g>
    </svg>
  `);

  console.log('Rendering background canvas...');
  let canvas = sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 7, g: 11, b: 20, alpha: 1 },
    },
  });

  const compositeOperations = [
    { input: backgroundSvg, top: 0, left: 0 },
  ];

  console.log('Processing and resizing all 14 screens...');
  for (let i = 0; i < screenFiles.length; i++) {
    const s = screenFiles[i];
    const x = sideMargin + i * (phoneW + colGap);

    // Light Theme Screen
    console.log(`Processing Light: ${s.title}`);
    const lightResized = await sharp(s.light)
      .resize(phoneW, phoneH, { fit: 'fill' })
      .composite([{ input: maskBuffer, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // Dark Theme Screen
    console.log(`Processing Dark: ${s.title}`);
    const darkResized = await sharp(s.dark)
      .resize(phoneW, phoneH, { fit: 'fill' })
      .composite([{ input: maskBuffer, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // Add Bezel and Screens to composite list
    compositeOperations.push({ input: lightResized, top: lightRowY, left: x });
    compositeOperations.push({ input: darkResized, top: darkRowY, left: x });
  }

  console.log('Compositing all layers into final ultra-high-resolution image...');
  const outputPng = 'screenshots/merkato_fund_phase10_concept_board.png';
  await canvas.composite(compositeOperations).png({ quality: 95 }).toFile(outputPng);

  console.log(`Concept board generated successfully at: ${outputPng}`);

  // Also copy to artifacts directory for convenient viewing
  const artifactDir = 'C:\\Users\\MH\\.gemini\\antigravity-ide\\brain\\4386ebf0-04a0-44f4-bb81-ab48e16982a1';
  const artifactTarget = path.join(artifactDir, 'phase10_concept_board.png');
  fs.copyFileSync(outputPng, artifactTarget);
  console.log(`Copied concept board to artifact directory: ${artifactTarget}`);
}

createConceptBoard().catch((err) => {
  console.error('Error creating concept board:', err);
  process.exit(1);
});
