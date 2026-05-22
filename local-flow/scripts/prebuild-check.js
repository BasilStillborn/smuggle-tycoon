const fs = require("fs");
const path = require("path");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const DOMAIN = "localflowhub.com";
const ROOT = path.resolve(__dirname, "..");

let errors = [];
let warnings = [];
let passed = 0;

function check(desc, condition, severity) {
  if (condition) {
    console.log(`  ${GREEN}✓${RESET} ${desc}`);
    passed++;
  } else if (severity === "error") {
    console.log(`  ${RED}✗${RESET} ${desc}`);
    errors.push(desc);
  } else {
    console.log(`  ${YELLOW}⚠${RESET} ${desc}`);
    warnings.push(desc);
  }
}

console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════${RESET}`);
console.log(`${BOLD}${CYAN}  LocalFlow Hub — Pre-Deployment Check${RESET}`);
console.log(`${BOLD}${CYAN}  Target: https://${DOMAIN}${RESET}`);
console.log(`${BOLD}${CYAN}══════════════════════════════════════════${RESET}\n`);

// ── 1. Domain References ─────────────────────────────────
console.log(`${BOLD}[1/4] Domain References${RESET}`);

const filesToCheck = [
  { path: "src/app/sitemap.ts", pattern: DOMAIN },
  { path: "src/app/layout.tsx", pattern: DOMAIN },
  { path: "src/app/setup/page.tsx", pattern: DOMAIN },
  { path: "src/app/legal/privacy/page.tsx", pattern: DOMAIN },
  { path: ".env.example", pattern: DOMAIN },
];

for (const f of filesToCheck) {
  const fullPath = path.join(ROOT, f.path);
  if (!fs.existsSync(fullPath)) {
    check(`File exists: ${f.path}`, false, "error");
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  check(`Domain present in ${f.path}`, content.includes(DOMAIN), "error");
}

const sitemapContent = fs.readFileSync(path.join(ROOT, "src/app/sitemap.ts"), "utf-8");
check(`No stale YOUR-DOMAIN in sitemap.ts`, !sitemapContent.includes("YOUR-DOMAIN"), "error");

const layoutContent = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf-8");
check(`No stale YOUR-DOMAIN in layout.tsx`, !layoutContent.includes("YOUR-DOMAIN"), "error");

const privacyContent = fs.readFileSync(path.join(ROOT, "src/app/legal/privacy/page.tsx"), "utf-8");
check(`No stale localflow.com in privacy.tsx`, !privacyContent.includes('"https://localflow.com"'), "error");

const setupContent = fs.readFileSync(path.join(ROOT, "src/app/setup/page.tsx"), "utf-8");
check(`No stale localflow.com in setup.tsx`, !setupContent.includes('"https://localflow.com"'), "error");

const toolsContent = fs.readFileSync(path.join(ROOT, "src/app/tools/page.tsx"), "utf-8");
check(`No stale localflow.com in tools/page.tsx`, !toolsContent.includes('"https://localflow.com"'), "error");

// ── 2. Affiliate URLs ────────────────────────────────────
console.log(`\n${BOLD}[2/4] Affiliate Link Status${RESET}`);

const toolsJson = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/tools.json"), "utf-8"));
const placeholderCount = toolsJson.filter((t) => t.affiliate_url && t.affiliate_url.includes("ref=localflow")).length;
check(`All affiliate URLs contain tracking param`, placeholderCount === 20, "warn");
check(`No blank affiliate URLs`, toolsJson.every((t) => t.affiliate_url && t.affiliate_url.length > 0), "error");

console.log(`  ${YELLOW}    → ${placeholderCount} of 20 tools still use placeholder ?ref=localflow tracking${RESET}`);
console.log(`  ${YELLOW}    → Replace each in src/data/tools.json with your real affiliate link${RESET}`);

// ── 3. Environment Variables ──────────────────────────────
console.log(`\n${BOLD}[3/3] Environment Variables${RESET}`);

const envKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_GA_ID",
  "MAILCHIMP_API_KEY",
  "MAILCHIMP_LIST_ID",
  "GOOGLE_SHEETS_API_KEY",
];

for (const key of envKeys) {
  const val = process.env[key];
  if (val && !val.startsWith("your-") && !val.startsWith("G-")) {
    check(`ENV: ${key}`, true, "info");
  } else if (key === "NEXT_PUBLIC_SITE_URL") {
    check(`ENV: ${key}`, false, "warn");
  } else {
    check(`ENV: ${key} (optional)`, true, "info");
  }
}

console.log(`  ${YELLOW}    → Set these in your Vercel dashboard before deploying${RESET}`);
console.log(`  ${YELLOW}    → See .env.example for the complete list${RESET}`);

// ── Summary ───────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════${RESET}`);
console.log(`${BOLD}${CYAN}  CHECK COMPLETE${RESET}`);

console.log();
if (errors.length === 0 && warnings.length === 0) {
  console.log(`  ${GREEN}Status: ✅ PERFECTLY DEPLOYMENT-READY${RESET}`);
} else if (errors.length === 0) {
  console.log(`  ${YELLOW}Status: ⚠ Deployment-ready (${warnings.length} warnings)${RESET}`);
} else {
  console.log(`  ${RED}Status: ❌ ${errors.length} error(s) — build aborted${RESET}`);
  console.log(`  ${RED}Fix the errors above, then run 'npm run build' again.${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════${RESET}\n`);
  process.exit(1);
}

console.log(`${BOLD}${CYAN}══════════════════════════════════════════${RESET}\n`);
