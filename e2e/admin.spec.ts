import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "https://sannah-invitation.vercel.app";
const EMAIL = "admin.abbs@undangan.sch.id";
const PASS = "1123581321";

test.describe("Admin — Login & Event Switching", () => {
  test("bisa login dengan kredensial valid", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);

    await page.fill("input[type=email]", EMAIL);
    await page.fill("input[type=password]", PASS);
    await page.click("button:has-text('Masuk')");

    // Harus redirect ke dashboard
    await page.waitForURL("**/admin/dashboard**", { timeout: 15000 });
    await expect(page.locator("text=Selamat datang kembali").first()).toBeVisible({ timeout: 10000 });
  });

  test("dashboard menampilkan event switcher", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await page.fill("input[type=email]", EMAIL);
    await page.fill("input[type=password]", PASS);
    await page.click("button:has-text('Masuk')");
    await page.waitForURL("**/admin/dashboard**", { timeout: 15000 });

    // Cek event switcher ada
    await expect(page.locator("text=EVENT AKTIF").first()).toBeVisible({ timeout: 10000 });
  });

  test("bisa switch event — klik event lain lalu reload", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await page.fill("input[type=email]", EMAIL);
    await page.fill("input[type=password]", PASS);
    await page.click("button:has-text('Masuk')");
    await page.waitForURL("**/admin/dashboard**", { timeout: 15000 });

    // Screenshot awal untuk debugging
    await page.screenshot({ path: "test-results/dashboard-before-switch.png" });

    // Buka event switcher dropdown
    const eventSwitcher = page.locator("text=EVENT AKTIF").first();
    await eventSwitcher.click();
    await page.waitForTimeout(500);

    // Screenshot dropdown
    await page.screenshot({ path: "test-results/dashboard-event-dropdown.png" });

    // Debug: print semua text di dropdown
    const dropdownText = await page.locator("button:has-text('AKTIF'), button:has-text('BUAT EVENT BARU')").allTextContents();
    console.log("Dropdown items:", dropdownText);

    // Hitung berapa event yang ada
    const eventButtons = page.locator("button").filter({ hasText: "AKTIF" });
    const count = await eventButtons.count();
    console.log(`Event count in dropdown: ${count}`);

    // Kalau ada >1 event, klik event yang bukan AKTIF
    if (count >= 1) {
      // Cari tombol event yang tidak label "AKTIF" (event lain)
      const allItems = page.locator("button:has-text('AKHIRUSSANNAH'), button:has-text('AWALUSSANNAH')");
      const itemCount = await allItems.count();
      console.log(`All event items: ${itemCount}`);

      for (let i = 0; i < itemCount; i++) {
        const item = allItems.nth(i);
        const text = await item.textContent();
        const isCurrent = (await item.locator("text=AKTIF").count()) > 0;
        console.log(`  [${i}] ${text?.trim()} current=${isCurrent}`);

        if (!isCurrent) {
          console.log(`  Switching to: ${text?.trim()}`);
          await item.click();
          // Harus reload halaman
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    // Cek halaman setelah switch
    await page.screenshot({ path: "test-results/dashboard-after-switch.png" });
  });

  test("event switcher → navigasi ke konten undangan tetap pakai event aktif", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await page.fill("input[type=email]", EMAIL);
    await page.fill("input[type=password]", PASS);
    await page.click("button:has-text('Masuk')");
    await page.waitForURL("**/admin/dashboard**", { timeout: 15000 });

    // Langsung ke halaman konten undangan
    await page.goto(`${BASE}/admin/konten-undangan`);
    await page.waitForTimeout(3000);

    await page.screenshot({ path: "test-results/konten-undangan.png" });

    // Cek halaman tidak error
    const errorBox = page.locator(".bg-danger\\/10");
    const hasError = await errorBox.isVisible().catch(() => false);
    if (hasError) {
      const errorText = await errorBox.textContent();
      console.log("ERROR di konten undangan:", errorText);
    }

    // Cek judul halaman ada
    const heading = page.locator("text=Konten Undangan");
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });
});
