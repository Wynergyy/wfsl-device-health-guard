import fs from "fs";
import crypto from "crypto";
import path from "path";

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function ensureExists(p, code) {
  if (!fs.existsSync(p)) {
    console.error(code);
    process.exit(1);
  }
}

const repoRoot = process.cwd();
const evidenceDir = path.resolve(repoRoot, "evidence");
const manifestPath = path.resolve(repoRoot, "proofgate.manifest.json");

ensureExists(evidenceDir, "EVIDENCE_DIR_MISSING");
ensureExists(manifestPath, "MANIFEST_MISSING");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

const artefactNames = Array.isArray(manifest.artefacts) ? manifest.artefacts : [];
if (artefactNames.length === 0) {
  console.error("ARTEFACTS_EMPTY");
  process.exit(2);
}

const artefacts = [];
for (const name of artefactNames) {
  const artefactPath = path.resolve(evidenceDir, name);
  ensureExists(artefactPath, "ARTEFACT_MISSING");

  const bytes = fs.statSync(artefactPath).size;
  const hash = sha256File(artefactPath);

  artefacts.push({
    name,
    path: `evidence/${name}`,
    sha256: hash,
    bytes
  });
}

const bundle = {
  tool: manifest.name || "wfsl-unknown",
  version: manifest.version || "0.0.0",
  createdAt: new Date().toISOString(),
  manifest,
  artefacts
};

const bundlePath = path.resolve(evidenceDir, "wfsl.proofgate.bundle.json");
fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), "utf-8");

const bundleHash = sha256File(bundlePath);
const bundleHashPath = path.resolve(evidenceDir, "wfsl.proofgate.bundle.sha256");
fs.writeFileSync(bundleHashPath, `${bundleHash}\n`, "utf-8");

console.log("PROOFGATE_BUNDLE_EMITTED");
