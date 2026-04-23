import { test, expect } from '@playwright/test';

// Scenario 1: Verify the Master Dashboard loads (Read)
test('Dashboard displays the add button and table', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  
  await expect(page.locator('h1')).toContainText('Dashboard - all companies');
  await expect(page.getByRole('button', { name: 'Add New Company' })).toBeVisible();
});

// Scenario 2: Add a new firm (Create via Modal)
test('User can add a new firm via the modal overlay', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');

  // 1. Open the modal
  await page.getByRole('button', { name: 'Add New Company' }).click();
  await expect(page.getByText('Add New Company', { exact: true })).toBeVisible();

  // 2. Fill in the required fields 
  const nameInput = page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox');
  await nameInput.first().fill('Test Playwright Corp');
  
  const emailInput = page.locator('div').filter({ hasText: /^Email$/ }).getByRole('textbox');
  await emailInput.fill('contact@playwright.com'); 
  
  // 3. Save and wait for modal to disappear
  await page.getByRole('button', { name: 'Save Company' }).click();
  await expect(page.getByText('Add New Company', { exact: true })).toBeHidden();

  // 4. Navigate to the last page of the dashboard
  const paginationButtons = page.locator('.pag-number');
  if (await paginationButtons.count() > 0) {
    await paginationButtons.last().click();
  }

  // 5. Verify the new company is visible on the last page
  await expect(page.getByText('Test Playwright Corp')).toBeVisible();
});
// Scenario 3: Delete a firm (Delete via Profile & Confirmation Modal)
test('User can delete a firm from the profile page', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(500); // Let React render

  // 1. Grab the name of the first company so we can verify it disappears later
  const tableRows = page.locator('.table-row');
  if (await tableRows.count() > 0) {
    const companyToDelete = await tableRows.first().locator('.firm-name-cell').innerText();

    // 2. Click the profile icon (LogOut icon) for the first row to navigate to the profile
    await tableRows.first().locator('.profile-icon-btn').click();

    // 3. We are now on the profile page. Click the Trash icon.
    await page.locator('.icon-btn-round').nth(1).click(); // 0 is Edit, 1 is Trash

    // 4. Wait for the confirmation modal and click the red Delete button
    await expect(page.getByText('Are you sure you want to delete')).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();

    // 5. Verify we are redirected to dashboard and the company is gone
    await expect(page).toHaveURL('http://localhost:5173/dashboard');
    await expect(page.getByText(companyToDelete, { exact: true })).toBeHidden();
  }
});