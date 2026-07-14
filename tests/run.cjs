const assert = require("node:assert/strict");

const { normalizeRole, hasRole } = require("../src/domain/rules/userRules.ts");
const { UserRole } = require("../src/domain/entities/UserRole.ts");
const {
  createDefaultAvailability,
  createAvailabilityFromPreset,
  resolveSlotsForDate,
  countWeeklyCapacity,
} = require("../src/domain/rules/availabilityRules.ts");
const { rankDoctorMatches, timeToMinutes } = require("../src/domain/rules/quickMatchRules.ts");

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

  await test("timeToMinutes parses HH:MM and rejects garbage", () => {
    assert.equal(timeToMinutes("09:30"), 570);
    assert.equal(timeToMinutes("00:00"), 0);
    assert.equal(timeToMinutes("25:00"), null);
    assert.equal(timeToMinutes("nope"), null);
  });

  await test("rankDoctorMatches picks nearest free slot and skips fully booked doctors", () => {
    const drA = { id: "a", name: "Dr A", specialization: ["cardio"] };
    const drB = { id: "b", name: "Dr B", specialization: ["cardio"] };
    const drC = { id: "c", name: "Dr C", specialization: ["cardio"] };
    const matches = rankDoctorMatches(
      [
        { doctor: drA, slots: [{ time: "09:00", booked: false, past: false }, { time: "14:00", booked: false, past: false }] },
        { doctor: drB, slots: [{ time: "10:00", booked: true, past: false }, { time: "10:30", booked: false, past: false }] },
        { doctor: drC, slots: [{ time: "10:00", booked: true, past: false }, { time: "11:00", booked: false, past: true }] },
      ],
      "10:00",
    );
    assert.equal(matches.length, 2);
    assert.equal(matches[0].doctor.id, "b"); // 10:30 is 30min away, beats Dr A's 09:00 (60min)
    assert.equal(matches[0].time, "10:30");
    assert.equal(matches[1].doctor.id, "a");
    assert.equal(matches[1].time, "09:00");
  });

  await test("rankDoctorMatches breaks distance ties by flexibility (more free slots)", () => {
    const drA = { id: "a", name: "Dr A", specialization: [] };
    const drB = { id: "b", name: "Dr B", specialization: [] };
    const matches = rankDoctorMatches(
      [
        { doctor: drA, slots: [{ time: "10:00", booked: false, past: false }] },
        { doctor: drB, slots: [{ time: "10:00", booked: false, past: false }, { time: "16:00", booked: false, past: false }] },
      ],
      "10:00",
    );
    assert.equal(matches[0].doctor.id, "b");
  });
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exitCode = 1;
});
