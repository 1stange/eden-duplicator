import { test, expect } from "../../playwright-fixture";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Landing (${vp.name})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("renders hero and CTA", async ({ page }) => {
      await page.goto("/welcome");
      // Hero title (font-display Eden branding)
      await expect(page.locator("h1").first()).toBeVisible();
      // At least one CTA linking to /auth
      const cta = page.getByRole("link", { name: /commencer|se connecter|rejoindre|démarrer/i }).first();
      await expect(cta).toBeVisible();
    });

    test("Lottie hero shows loading, ready or fallback (never blank)", async ({ page }) => {
      await page.goto("/welcome");
      // One of loading | ready | fallback must appear within 10s
      const anyLottie = page
        .locator(
          '[data-testid="lottie-loading"], [data-testid="lottie-ready"], [data-testid="lottie-fallback"]'
        )
        .first();
      await expect(anyLottie).toBeVisible({ timeout: 10_000 });
    });
  });
}
