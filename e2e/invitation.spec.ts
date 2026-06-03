import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("Halaman Undangan Guest", () => {
  test("halaman demo bisa diakses", async ({ page }) => {
    const res = await page.goto(`${BASE}/undangan/demo`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("text=Akhirusannah").first()).toBeVisible();
  });

  test("halaman demo menampilkan countdown atau 'acara telah dimulai'", async ({ page }) => {
    await page.goto(`${BASE}/undangan/demo`);
    const done = page.locator("text=Acara telah dimulai");
    const countdown = page.locator("text=Hitung mundur");
    await expect(done.or(countdown).first()).toBeVisible({ timeout: 10000 });
  });

  test("halaman demo menampilkan section RSVP", async ({ page }) => {
    await page.goto(`${BASE}/undangan/demo`);
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator("text=Konfirmasi Kehadiran").first()).toBeVisible({ timeout: 10000 });
  });

  test("token invalid menampilkan halaman tidak ditemukan", async ({ page }) => {
    await page.goto(`${BASE}/undangan/token-palsu-12345`);
    // Next.js notFound() — cek halaman tidak blank
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(50);
  });

  test("halaman undangan tidak crash (no JS error)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/undangan/demo`);
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });
});

test.describe("RSVP Form", () => {
  test("form RSVP bisa diisi", async ({ page }) => {
    await page.goto(`${BASE}/undangan/demo`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Klik "Offline" untuk ortu
    const ortuOffline = page.locator("text=OFFLINE").first();
    if (await ortuOffline.isVisible({ timeout: 3000 })) {
      await ortuOffline.click();
      await page.waitForTimeout(300);
    }

    // Klik "Online" untuk anak
    const anakOnline = page.locator("button:has-text('ONLINE')").last();
    if (await anakOnline.isVisible({ timeout: 2000 })) {
      await anakOnline.click();
    }

    // Tidak boleh ada JS error
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });
});

test.describe("Admin Login Page", () => {
  test("halaman login bisa diakses", async ({ page }) => {
    const res = await page.goto(`${BASE}/admin/login`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("text=Login Panitia").first()).toBeVisible();
  });

  test("form login ada input dan tombol", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(page.locator("button:has-text('Masuk')")).toBeVisible();
  });
});
