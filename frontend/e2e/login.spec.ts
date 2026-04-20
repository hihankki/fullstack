import { test, expect } from "@playwright/test";

test("открывается страница логина", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Вход" }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
  await expect(page.locator('input[type="text"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
});