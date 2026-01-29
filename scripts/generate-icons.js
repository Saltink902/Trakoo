const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");
const sizes = [192, 512];
const color = "#e8d5d0"; // Trakoo pastel

async function generate() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.log("Skipping icon generation (sharp not installed). Run: npm install");
    return;
  }

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svg = (size, font) => `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}" rx="20%"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${font}" fill="#8b7355">T</text>
    </svg>
  `;

  for (const size of sizes) {
    const font = Math.round(size * 0.5);
    const filled = svg(size, font);
    const buf = Buffer.from(filled);
    const png = await sharp(buf).png().toBuffer();
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(out, png);
    console.log("Created", out);
  }
}

generate().catch((err) => {
  console.error("Icon generation failed:", err.message);
  process.exitCode = 1;
});
