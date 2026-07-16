import { test, expect } from "../../playwright-fixture";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

// Seed a demo user into localStorage so /messages is reachable without auth UI.
async function loginAsDemo(page: any) {
  await page.goto("/welcome");
  await page.evaluate(() => {
    // Demo: pick first mock user (seedData primes localStorage on first load).
    const usersRaw = localStorage.getItem("eden_users");
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const first = Array.isArray(users) ? users[0] : null;
      if (first) localStorage.setItem("eden_current_user", JSON.stringify(first));
    }
  });
}

for (const vp of VIEWPORTS) {
  test.describe(`Chat (${vp.name})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("messages page renders", async ({ page }) => {
      await loginAsDemo(page);
      await page.goto("/messages");
      // Either the empty state or a conversation list should be visible
      const marker = page.locator("main, [role='main'], body").first();
      await expect(marker).toBeVisible();
      // Look for the header "Messages" or the empty-state icon.
      const heading = page.getByText(/messages/i).first();
      await expect(heading).toBeVisible({ timeout: 5_000 });
    });
  });
}
