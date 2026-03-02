const assert = require("node:assert/strict");

const { normalizeRole, hasRole } = require("../src/domain/rules/userRules.ts");
const { UserRole } = require("../src/domain/entities/UserRole.ts");

async function test(name, fn) {
  try {
    await fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (err) {
    process.stderr.write(`✗ ${name}\n`);
    throw err;
  }
}

async function main() {
  await test("normalizeRole accepts known roles (case-insensitive)", () => {
    assert.equal(normalizeRole("Doctor"), UserRole.Doctor);
    assert.equal(normalizeRole("PATIENT"), UserRole.Patient);
    assert.equal(normalizeRole("admin"), UserRole.Admin);
    assert.equal(normalizeRole("pharmacy"), UserRole.Pharmacy);
    assert.equal(normalizeRole("clinic"), UserRole.Clinic);
  });

  await test("normalizeRole rejects invalid/legacy roles", () => {
    assert.equal(normalizeRole(null), null);
    assert.equal(normalizeRole(undefined), null);
    assert.equal(normalizeRole(123), null);
    assert.equal(normalizeRole(""), null);
    assert.equal(normalizeRole("null"), null);
    assert.equal(normalizeRole("superadmin"), null);
  });

  await test("hasRole returns true only for allowed roles", () => {
    assert.equal(hasRole("doctor", [UserRole.Doctor]), true);
    assert.equal(hasRole("doctor", [UserRole.Patient]), false);
    assert.equal(hasRole("patient", [UserRole.Patient, UserRole.Doctor]), true);
    assert.equal(hasRole("null", [UserRole.Patient, UserRole.Doctor]), false);
  });
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exitCode = 1;
});

