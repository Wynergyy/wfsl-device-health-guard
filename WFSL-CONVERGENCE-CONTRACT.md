\# WFSL Convergence Contract v1

Version: 1.0

Scope: Repository-level convergence into the WFSL ProofGate trust chain.



\## 1. Objective

This repository MUST be able to:

1\) Emit deterministic evidence artefacts into ./evidence

2\) Seal evidence with SHA256 in canonical form

3\) Validate evidence against an explicit JSON Schema

4\) Produce a machine-verifiable ProofGate bundle for ingestion

5\) Provide a single command surface for verification



\## 2. Canonical directories

\- Source: ./src

\- Build output: ./dist

\- Schema: ./schema

\- Scripts: ./scripts

\- Evidence output: ./evidence



\## 3. Canonical artefacts (minimum set)

The repo MUST produce the following files under ./evidence:



\- wfsl.health.report.latest.json

\- wfsl.health.report.latest.sha256

\- wfsl.health.verdict.json

\- wfsl.proofgate.bundle.json

\- wfsl.proofgate.bundle.sha256



Notes:

\- Timestamped report copies MAY also be produced, but ingestion MUST always support the latest artefact set above.



\## 4. Canonical hashing rules

\- Hash algorithm: SHA256

\- Hash input: exact bytes of the JSON file on disk

\- Hash output: lowercase hex, no prefix, no whitespace, newline permitted at end of .sha256 file

\- Comparison: case-insensitive match accepted, but the repo SHOULD emit lowercase



\## 5. Schema validation

\- Evidence schema MUST exist: ./schema/wfsl.health.report.schema.json

\- Validation command MUST exit non-zero on failure

\- Success MUST print: SCHEMA\_VALIDATION\_PASS



\## 6. ProofGate verification

\- Verification MUST check:

&nbsp; - evidence file exists

&nbsp; - sha256 file exists

&nbsp; - sha256 matches computed hash

\- Success MUST print: PROOFGATE\_VERIFY\_PASS

\- Failure MUST print one of:

&nbsp; - EVIDENCE\_MISSING

&nbsp; - HASH\_MISSING

&nbsp; - HASH\_MISMATCH



\## 7. ProofGate ingestion bundle

This repo MUST be able to emit a single bundle file suitable for ingestion by WFSL ProofGate systems.



Bundle file:

\- ./evidence/wfsl.proofgate.bundle.json



Bundle MUST include:

\- manifest: contents of ./proofgate.manifest.json

\- artefacts: array of included evidence artefacts with:

&nbsp; - name

&nbsp; - path (relative to repo root)

&nbsp; - sha256

&nbsp; - bytes

\- createdAt (UTC ISO timestamp)

\- tool + version



Bundle MUST be sealed:

\- ./evidence/wfsl.proofgate.bundle.sha256



\## 8. Package scripts (required)

package.json MUST expose:

\- build

\- probe

\- schema:validate

\- proofgate:verify

\- proofgate:bundle

\- converge



Where:

\- probe emits wfsl.health.report.latest.json (and may create timestamped copies)

\- converge runs: build -> probe -> schema:validate -> proofgate:verify -> proofgate:bundle



\## 9. Determinism and drift controls

\- Do not embed local absolute paths in emitted JSON

\- Avoid nondeterministic ordering in object keys when possible

\- All timestamps MUST be UTC ISO 8601

\- Any system-derived values MUST be explicit and named



\## 10. Acceptance criteria

A repo is “converged” when this passes on a clean machine:

\- npm install

\- npm run converge

and produces the canonical artefacts and bundle with passing verification.



