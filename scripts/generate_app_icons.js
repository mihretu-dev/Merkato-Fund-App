/**
 * Generate high-visibility, properly cropped launcher icons for Merkato Fund
 *
 * Requirements:
 * - Prominent, closely cropped emblem (scales, seed bags, five figures, MERKATO FUND)
 * - Compliant with Android Adaptive Icon standards (safe zone centered within 66-72%)
 * - Standard 1024x1024 icon.png for iOS / general stores
 * - Android foreground (transparent) + background (#EBD9C0 parchment or #121A24)
 * - Splash icon
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  const logoPath = path.join(__dirname, '../assets/images/merkato_logo.png');
  const assetsDir = path.join(__dirname, '../assets/images');

  console.log('Reading base logo:', logoPath);

  // The emblem content is centered around (331, 334), width ~486, height ~360
  // Crop a square of 500x500 centered around (331, 334)
  // left: 331 - 250 = 81, top: 334 - 250 = 84
  const croppedEmblemBuffer = await sharp(logoPath)
    .extract({ left: 75, top: 80, width: 510, height: 500 })
    .toBuffer();

  // 1. icon.png (1024x1024) - Primary app icon
  // Composite cropped emblem onto parchment square with rounded elegance
  console.log('Generating icon.png (1024x1024)...');
  await sharp(croppedEmblemBuffer)
    .resize(920, 902, { fit: 'contain', background: { r: 235, g: 219, b: 195, alpha: 1 } })
    .extend({
      top: 61,
      bottom: 61,
      left: 52,
      right: 52,
      background: { r: 235, g: 219, b: 195, alpha: 1 },
    })
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  // 2. android-icon-foreground.png (512x512)
  // Android adaptive safe area is the central 66% (circle of diameter ~340px)
  // We place the cropped emblem with transparent background scaled to ~370px width
  console.log('Generating android-icon-foreground.png (512x512)...');
  const emblemForAdaptive = await sharp(croppedEmblemBuffer)
    .resize(360, 353, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: emblemForAdaptive,
        top: Math.round((512 - 353) / 2),
        left: Math.round((512 - 360) / 2),
      },
    ])
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));

  // 3. android-icon-background.png (512x512)
  // Matching parchment gold tone: #EBDBC3 (rgb: 235, 219, 195)
  console.log('Generating android-icon-background.png (512x512)...');
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 235, g: 219, b: 195, alpha: 1 },
    },
  })
    .png()
    .toFile(path.join(assetsDir, 'android-icon-background.png'));

  // 4. splash-icon.png (Centered clean emblem)
  console.log('Generating splash-icon.png...');
  await sharp(croppedEmblemBuffer)
    .resize(380, 372, { fit: 'contain' })
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));

  // 5. favicon.png (48x48)
  console.log('Generating favicon.png...');
  await sharp(croppedEmblemBuffer)
    .resize(48, 48, { fit: 'contain' })
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));

  console.log('✅ All launcher icons successfully regenerated with high visibility!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
