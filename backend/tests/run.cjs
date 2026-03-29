const assert = require("node:assert/strict");

const { UserRole } = require("../src/domain/entities/UserRole.ts");
const {
  normalizeUserRole,
  canListAppointmentsForRole,
  canListPrescriptionsForRole,
} = require("../src/domain/rules/userRoleRules.ts");
const { createRateLimiter } = require("../src/middleware/rateLimit.ts");
const {
  slugifyBlogTitle,
  buildCreateBlogPostPayload,
  buildUpdateBlogPostPayload,
} = require("../src/services/blogService.ts");
const { isClinicBookingStatus } = require("../src/services/clinicBookingsService.ts");

async function test(name, fn) {
  try {
    await fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (err) {
    process.stderr.write(`✗ ${name}\n`);
    throw err;
  }
}

function createMockResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = String(value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

async function main() {
  await test("normalizeUserRole accepts valid roles and rejects legacy null", () => {
    assert.equal(normalizeUserRole("ADMIN"), UserRole.Admin);
    assert.equal(normalizeUserRole("doctor"), UserRole.Doctor);
    assert.equal(normalizeUserRole("patient"), UserRole.Patient);
    assert.equal(normalizeUserRole("pharmacy"), UserRole.Pharmacy);
    assert.equal(normalizeUserRole("clinic"), UserRole.Clinic);
    assert.equal(normalizeUserRole("null"), null);
    assert.equal(normalizeUserRole("superadmin"), null);
    assert.equal(normalizeUserRole(undefined), null);
  });

  await test("appointment listing roles stay explicitly scoped", () => {
    assert.equal(canListAppointmentsForRole(UserRole.Admin), true);
    assert.equal(canListAppointmentsForRole(UserRole.Doctor), true);
    assert.equal(canListAppointmentsForRole(UserRole.Patient), true);
    assert.equal(canListAppointmentsForRole(UserRole.Pharmacy), false);
    assert.equal(canListAppointmentsForRole(UserRole.Clinic), false);
  });

  await test("prescription listing roles exclude clinic access", () => {
    assert.equal(canListPrescriptionsForRole(UserRole.Admin), true);
    assert.equal(canListPrescriptionsForRole(UserRole.Doctor), true);
    assert.equal(canListPrescriptionsForRole(UserRole.Patient), true);
    assert.equal(canListPrescriptionsForRole(UserRole.Pharmacy), true);
    assert.equal(canListPrescriptionsForRole(UserRole.Clinic), false);
  });

  await test("rate limiter emits headers and blocks after the configured max", () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      max: 2,
      keyPrefix: `test-${Date.now()}`,
    });
    const req = {
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    };

    const originalNow = Date.now;
    let now = 10_000;
    Date.now = () => now;

    try {
      const res1 = createMockResponse();
      let nextCalls = 0;
      limiter(req, res1, () => {
        nextCalls += 1;
      });
      assert.equal(nextCalls, 1);
      assert.equal(res1.headers["x-ratelimit-limit"], "2");
      assert.equal(res1.headers["x-ratelimit-remaining"], "1");

      const res2 = createMockResponse();
      limiter(req, res2, () => {
        nextCalls += 1;
      });
      assert.equal(nextCalls, 2);
      assert.equal(res2.headers["x-ratelimit-remaining"], "0");

      const res3 = createMockResponse();
      limiter(req, res3, () => {
        nextCalls += 1;
      });
      assert.equal(nextCalls, 2);
      assert.equal(res3.statusCode, 429);
      assert.deepEqual(res3.body, { error: "RATE_LIMIT_EXCEEDED" });
      assert.equal(res3.headers["x-ratelimit-limit"], "2");
      assert.equal(res3.headers["x-ratelimit-remaining"], "0");

      now += 1001;

      const res4 = createMockResponse();
      limiter(req, res4, () => {
        nextCalls += 1;
      });
      assert.equal(nextCalls, 3);
      assert.equal(res4.headers["x-ratelimit-remaining"], "1");
    } finally {
      Date.now = originalNow;
    }
  });

  await test("blog payload helpers normalize slugs, keywords, and publish timestamps", () => {
    const now = "2026-03-29T10:00:00.000Z";
    assert.equal(slugifyBlogTitle(" Heart Health & Wellness "), "heart-health-wellness");

    const created = buildCreateBlogPostPayload({
      title: " Heart Health & Wellness ",
      excerpt: "A practical summary",
      content: "Long form content",
      tag: "Cardiology",
      status: "published",
      keywords: [" heart ", "", " wellness "],
    }, now);

    assert.equal(created.slug, "heart-health-wellness");
    assert.deepEqual(created.keywords, ["heart", "wellness"]);
    assert.equal(created.author, "Ekipi i Pyet Doktorin");
    assert.equal(created.createdAt, now);
    assert.equal(created.updatedAt, now);
    assert.equal(created.publishedAt, now);
  });

  await test("blog update helper preserves publishedAt after the first publish", () => {
    const existingDraft = {
      title: "Original",
      slug: "original",
      status: "draft",
    };
    const firstPublish = buildUpdateBlogPostPayload(existingDraft, { status: "published" }, "2026-03-29T12:00:00.000Z");
    assert.equal(firstPublish.status, "published");
    assert.equal(firstPublish.publishedAt, "2026-03-29T12:00:00.000Z");

    const existingPublished = {
      title: "Original",
      slug: "original",
      status: "published",
      publishedAt: "2026-03-28T08:00:00.000Z",
    };
    const updated = buildUpdateBlogPostPayload(existingPublished, { title: "Updated title" }, "2026-03-29T13:00:00.000Z");
    assert.equal(updated.title, "Updated title");
    assert.equal(updated.publishedAt, "2026-03-28T08:00:00.000Z");
  });

  await test("clinic booking status guard accepts only supported values", () => {
    assert.equal(isClinicBookingStatus("pending"), true);
    assert.equal(isClinicBookingStatus("confirmed"), true);
    assert.equal(isClinicBookingStatus("declined"), true);
    assert.equal(isClinicBookingStatus("accepted"), false);
    assert.equal(isClinicBookingStatus(""), false);
    assert.equal(isClinicBookingStatus(null), false);
  });
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exitCode = 1;
});
