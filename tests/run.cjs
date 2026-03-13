const assert = require("node:assert/strict");

const { normalizeRole, hasRole } = require("../src/domain/rules/userRules.ts");
const { UserRole } = require("../src/domain/entities/UserRole.ts");
const {
  createDefaultAvailability,
  createAvailabilityFromPreset,
  resolveSlotsForDate,
  countWeeklyCapacity,
} = require("../src/domain/rules/availabilityRules.ts");

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

  await test("default availability creates a balanced weekday schedule", () => {
    const availability = createDefaultAvailability("doctor-1");
    assert.equal(availability.doctorId, "doctor-1");
    assert.equal(availability.presetId, "balanced");
    assert.equal(availability.weeklySchedule.length, 5);
    assert.equal(availability.slotDurationMinutes, 30);
    assert.equal(availability.bufferMinutes, 10);
  });

  await test("resolveSlotsForDate respects booked slots and daily capacity", () => {
    const availability = createAvailabilityFromPreset("doctor-1", "focused");
    const slots = resolveSlotsForDate(
      availability,
      "2026-03-13",
      ["11:00", "13:00"],
      0,
      false,
    );
    assert.ok(slots.length > 0);
    assert.equal(slots.some((slot) => slot.time === "11:00" && slot.booked), true);
    assert.equal(slots.some((slot) => slot.time === "13:00" && slot.booked), true);
    assert.ok(countWeeklyCapacity(availability) > 0);
  });
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exitCode = 1;
});
