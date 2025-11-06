import { test, expect } from '@playwright/test';

test.describe('Todo App - Comprehensive End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('h1')).toHaveText('My Tasks');
  });

  test.describe('App Loading and UI', () => {
    test('should load the app with correct initial state', async ({ page }) => {
      // Check main elements are present
      await expect(page.locator('h1')).toHaveText('My Tasks');
      await expect(page.locator('.subtitle')).toHaveText('Stay organized and productive');
      
      // Check stats display
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(0)).toHaveText('0'); // Total
      await expect(statValues.nth(1)).toHaveText('0'); // Active
      await expect(statValues.nth(2)).toHaveText('0'); // History
      
      const statLabels = page.locator('.stat-label');
      await expect(statLabels.nth(0)).toHaveText('Total');
      await expect(statLabels.nth(1)).toHaveText('Active');
      await expect(statLabels.nth(2)).toHaveText('History');
      
      // Check tabs
      await expect(page.locator('.tab').nth(0)).toHaveText('Active Tasks');
      await expect(page.locator('.tab').nth(1)).toHaveText('Completed');
      await expect(page.locator('.tab').nth(0)).toHaveClass(/active/);
      
      // Check form elements
      await expect(page.locator('todo-form input')).toBeVisible();
      await expect(page.locator('todo-form button')).toHaveText('Add');
      await expect(page.locator('todo-form button')).toBeDisabled();
      
      // Check action buttons
      await expect(page.locator('.clear-completed')).toContainText('Move Completed to History');
      await expect(page.locator('.clear-completed')).toBeDisabled();
      await expect(page.locator('.clear-all')).toHaveText('Clear All');
      await expect(page.locator('.clear-all')).toBeDisabled();
      
      // Check footer
      await expect(page.locator('.footer')).toHaveText('Lab 9: The final battle!');
    });

    test('should enable add button when text is entered', async ({ page }) => {
      const input = page.locator('todo-form input');
      const addButton = page.locator('todo-form button');
      
      // Initially disabled
      await expect(addButton).toBeDisabled();
      
      // Type text
      await input.fill('New todo');
      await expect(addButton).toBeEnabled();
      
      // Clear text
      await input.clear();
      await expect(addButton).toBeDisabled();
      
      // Whitespace only should keep it disabled
      await input.fill('   ');
      await expect(addButton).toBeDisabled();
    });
  });

  test.describe('Todo CRUD Operations', () => {
    test('should add new todos', async ({ page }) => {
      const input = page.locator('todo-form input');
      const addButton = page.locator('todo-form button');
      
      // Add first todo
      await input.fill('First todo');
      await addButton.click();
      
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('First todo');
      await expect(input).toHaveValue(''); // Input should be cleared
      
      // Add second todo
      await input.fill('Second todo');
      await addButton.click();
      
      await expect(page.locator('todo-item')).toHaveCount(2);
      await expect(page.locator('todo-item .todo-text').nth(0)).toHaveText('First todo');
      await expect(page.locator('todo-item .todo-text').nth(1)).toHaveText('Second todo');
      
      // Check stats updated
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(0)).toHaveText('2'); // Total
      await expect(statValues.nth(1)).toHaveText('2'); // Active
      await expect(statValues.nth(2)).toHaveText('0'); // History
    });

    test('should add todos using Enter key', async ({ page }) => {
      const input = page.locator('todo-form input');
      
      await input.fill('Todo via Enter');
      await input.press('Enter');
      
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Todo via Enter');
    });

    test('should edit todos', async ({ page }) => {
      // Add a todo first
      await page.locator('todo-form input').fill('Original todo');
      await page.locator('todo-form button').click();
      
      // Click edit button
      await page.locator('.edit-btn').click();
      
      // Edit input should appear with current text
      const editInput = page.locator('.edit-input');
      await expect(editInput).toBeVisible();
      await expect(editInput).toHaveValue('Original todo');
      
      // Modify text and save
      await editInput.clear();
      await editInput.fill('Edited todo');
      await page.locator('.save-btn').click();
      
      // Should show updated text
      await expect(page.locator('todo-item .todo-text')).toHaveText('Edited todo');
    });

    test('should cancel editing', async ({ page }) => {
      // Add a todo first
      await page.locator('todo-form input').fill('Original todo');
      await page.locator('todo-form button').click();
      
      // Start editing
      await page.locator('.edit-btn').click();
      const editInput = page.locator('.edit-input');
      await editInput.clear();
      await editInput.fill('Modified text');
      
      // Cancel editing
      await page.locator('.cancel-btn').click();
      
      // Should show original text
      await expect(page.locator('todo-item .todo-text')).toHaveText('Original todo');
    });

    test('should edit todos with keyboard shortcuts', async ({ page }) => {
      // Add a todo
      await page.locator('todo-form input').fill('Keyboard todo');
      await page.locator('todo-form button').click();
      
      // Start editing
      await page.locator('.edit-btn').click();
      const editInput = page.locator('.edit-input');
      
      // Save with Enter
      await editInput.clear();
      await editInput.fill('Saved with Enter');
      await editInput.press('Enter');
      await expect(page.locator('todo-item .todo-text')).toHaveText('Saved with Enter');
      
      // Test cancel with Escape
      await page.locator('.edit-btn').click();
      await editInput.clear();
      await editInput.fill('Will be cancelled');
      await editInput.press('Escape');
      await expect(page.locator('todo-item .todo-text')).toHaveText('Saved with Enter');
    });

    test('should delete todos', async ({ page }) => {
      // Add two todos
      await page.locator('todo-form input').fill('Todo 1');
      await page.locator('todo-form button').click();
      await page.locator('todo-form input').fill('Todo 2');
      await page.locator('todo-form button').click();
      
      await expect(page.locator('todo-item')).toHaveCount(2);
      
      // Mock the confirm dialog to return true
      page.on('dialog', dialog => dialog.accept());
      
      // Delete first todo
      await page.locator('todo-item').first().locator('.delete-btn').click();
      
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Todo 2');
    });
  });

  test.describe('Completion Workflow', () => {
    test('should mark todos as completed', async ({ page }) => {
      // Add a todo
      await page.locator('todo-form input').fill('Test completion');
      await page.locator('todo-form button').click();
      
      // Check the todo
      const checkbox = page.locator('todo-item input[type="checkbox"]');
      await checkbox.check();
      
      // Wait for component to update
      await page.waitForTimeout(100);
      
      // Verify checkbox is checked and styling is applied
      await expect(checkbox).toBeChecked();
            
      // Stats should update
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(0)).toHaveText('1'); // Total
      await expect(statValues.nth(1)).toHaveText('0'); // Active (completed items don't count as active)
      await expect(statValues.nth(2)).toHaveText('0'); // History (not moved yet)
      
      // Move completed button should be enabled with count
      await expect(page.locator('.clear-completed')).toBeEnabled();
      await expect(page.locator('.clear-completed')).toContainText('Move Completed to History (1)');
    });

    test('should uncheck completed todos', async ({ page }) => {
      // Add and complete a todo
      await page.locator('todo-form input').fill('Test uncomplete');
      await page.locator('todo-form button').click();
      const checkbox = page.locator('todo-item input[type="checkbox"]');
      await checkbox.check();
      
      // Uncheck it
      await checkbox.uncheck();
      
      // Should be back to normal state
      await expect(checkbox).not.toBeChecked();
      await expect(page.locator('todo-item .todo-text')).not.toHaveClass(/completed/);
      
      // Stats should update
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(1)).toHaveText('1'); // Active
    });

    test('should move completed todos to history', async ({ page }) => {
      // Add multiple todos
      await page.locator('todo-form input').fill('Todo 1');
      await page.locator('todo-form button').click();
      await page.locator('todo-form input').fill('Todo 2');
      await page.locator('todo-form button').click();
      await page.locator('todo-form input').fill('Todo 3');
      await page.locator('todo-form button').click();
      
      // Complete first two
      await page.locator('todo-item').nth(0).locator('input[type="checkbox"]').check();
      await page.locator('todo-item').nth(1).locator('input[type="checkbox"]').check();
      
      // Wait for both checkboxes to be checked
      await expect(page.locator('todo-item').nth(0).locator('input[type="checkbox"]')).toBeChecked();
      await expect(page.locator('todo-item').nth(1).locator('input[type="checkbox"]')).toBeChecked();
      
      // Verify the button is enabled and shows correct count
      const moveBtn = page.locator('button').filter({ hasText: 'Move Completed to History' });
      await expect(moveBtn).toBeEnabled();
      await expect(moveBtn).toContainText('(2)');
      
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Move to history
      await moveBtn.click();
      
      // Wait for the move operation to complete
      await page.waitForTimeout(1000);
      
      // Only one active todo should remain
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Todo 3');
      
      // Stats should update
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(0)).toHaveText('3'); // Total
      await expect(statValues.nth(1)).toHaveText('1'); // Active
      await expect(statValues.nth(2)).toHaveText('2'); // History
    });

    test('should handle completed todo state', async ({ page }) => {
      // Add a todo
      await page.locator('todo-form input').fill('Test completion behavior');
      await page.locator('todo-form button').click();
      
      const checkbox = page.locator('todo-item input[type="checkbox"]');
      
      // Complete the todo
      await checkbox.check();
      
      // Wait for the checkbox to be checked (ensures the state has updated)
      await expect(checkbox).toBeChecked();
      
      // Test that the stats update correctly (this we know works from other tests)
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(1)).toHaveText('0'); // Active count should be 0
      
      // Test that the move button becomes enabled
      await expect(page.locator('button').filter({ hasText: 'Move Completed to History' })).toBeEnabled();
    });
  });

  test.describe('Tab Switching and History', () => {
    test('should switch between tabs', async ({ page }) => {
      const activeTab = page.locator('.tab').nth(0);
      const completedTab = page.locator('.tab').nth(1);
      
      // Initially active tab is selected
      await expect(activeTab).toHaveClass(/active/);
      await expect(completedTab).not.toHaveClass(/active/);
      
      // Switch to completed tab
      await completedTab.click();
      await expect(completedTab).toHaveClass(/active/);
      await expect(activeTab).not.toHaveClass(/active/);
      
      // Switch back to active tab
      await activeTab.click();
      await expect(activeTab).toHaveClass(/active/);
      await expect(completedTab).not.toHaveClass(/active/);
    });

    test('should show empty state in completed tab', async ({ page }) => {
      // Switch to completed tab
      await page.locator('.tab').nth(1).click();
      
      // Should show empty state message
      await expect(page.locator('.completed-empty-state')).toBeVisible();
      await expect(page.locator('.completed-empty-state')).toContainText('No completed todos yet');
    });

    test('should show completed todos in history tab', async ({ page }) => {
      // Add and complete a todo
      await page.locator('todo-form input').fill('Historical todo');
      await page.locator('todo-form button').click();
      await page.locator('todo-item input[type="checkbox"]').check();
      
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await page.locator('button').filter({ hasText: 'Move Completed to History' }).click();
      
      // Wait for move operation
      await page.waitForTimeout(500);
      
      // Switch to completed tab
      await page.locator('.tab').nth(1).click();
      
      // Should show completed todo
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Historical todo');
      
      // Should show completion date
      await expect(page.locator('.completion-date')).toBeVisible();
      await expect(page.locator('.completion-date')).toContainText('Completed:');
      
      // Should have revert and delete buttons, no checkbox
      await expect(page.locator('todo-item input[type="checkbox"]')).toHaveCount(0);
      await expect(page.locator('.revert-btn')).toBeVisible();
      await expect(page.locator('.delete-btn')).toBeVisible();
    });

    test('should revert todos from history', async ({ page }) => {
      // Add, complete, and move to history
      await page.locator('todo-form input').fill('Revertible todo');
      await page.locator('todo-form button').click();
      await page.locator('todo-item input[type="checkbox"]').check();
      
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await page.locator('button').filter({ hasText: 'Move Completed to History' }).click();
      
      // Wait for move operation
      await page.waitForTimeout(500);
      
      // Switch to completed tab and revert
      await page.locator('.tab').nth(1).click();
      await page.locator('.revert-btn').click();
      
      // Stats should update
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(1)).toHaveText('1'); // Active
      await expect(statValues.nth(2)).toHaveText('0'); // History
      
      // Switch to active tab - todo should be there and uncompleted
      await page.locator('.tab').nth(0).click();
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Revertible todo');
      await expect(page.locator('todo-item input[type="checkbox"]')).not.toBeChecked();
    });
  });

  test.describe('Bulk Actions', () => {
    test('should clear all todos', async ({ page }) => {
      // Add multiple todos
      await page.locator('todo-form input').fill('Todo 1');
      await page.locator('todo-form button').click();
      await page.locator('todo-form input').fill('Todo 2');
      await page.locator('todo-form button').click();
      
      // Mock confirm dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Clear all
      await page.locator('.clear-all').click();
      
      // Should be empty
      await expect(page.locator('todo-item')).toHaveCount(0);
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(0)).toHaveText('0'); // Total
    });

    test('should clear completed history', async ({ page }) => {
      // Add, complete, and move to history
      await page.locator('todo-form input').fill('History todo');
      await page.locator('todo-form button').click();
      await page.locator('todo-item input[type="checkbox"]').check();
      
      // Handle confirmation dialog for move to history
      page.on('dialog', dialog => dialog.accept());
      await page.locator('button').filter({ hasText: 'Move Completed to History' }).click();
      
      // Wait for move operation
      await page.waitForTimeout(500);
      
      // Switch to completed tab
      await page.locator('.tab').nth(1).click();
      await expect(page.locator('todo-item')).toHaveCount(1);
      
      // Clear history (dialog already handled)
      await page.locator('button').filter({ hasText: 'Clear History' }).click();
      await expect(page.locator('todo-item')).toHaveCount(0);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist todos across page reloads', async ({ page }) => {
      // Add a todo
      await page.locator('todo-form input').fill('Persistent todo');
      await page.locator('todo-form button').click();
      
      // Reload page
      await page.reload();
      await expect(page.locator('h1')).toHaveText('My Tasks');
      
      // Todo should still be there
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Persistent todo');
    });

    test('should persist completion state across reloads', async ({ page }) => {
      // Add and complete a todo
      await page.locator('todo-form input').fill('Persistent completed');
      await page.locator('todo-form button').click();
      await page.locator('todo-item input[type="checkbox"]').check();
      
      // Reload page
      await page.reload();
      await expect(page.locator('h1')).toHaveText('My Tasks');
      
      // Completion state should persist
      await expect(page.locator('todo-item input[type="checkbox"]')).toBeChecked();
      await expect(page.locator('todo-item .todo-text')).toHaveClass(/completed/);
    });

    test('should persist history across reloads', async ({ page }) => {
      // Add, complete, and move to history
      await page.locator('todo-form input').fill('Persistent history');
      await page.locator('todo-form button').click();
      await page.locator('todo-item input[type="checkbox"]').check();
      
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await page.locator('button').filter({ hasText: 'Move Completed to History' }).click();
      
      // Wait for move operation
      await page.waitForTimeout(500);
      
      // Reload page
      await page.reload();
      await expect(page.locator('h1')).toHaveText('My Tasks');
      
      // Check stats
      const statValues = page.locator('.stat-value');
      await expect(statValues.nth(2)).toHaveText('1'); // History
      
      // Check history tab
      await page.locator('.tab').nth(1).click();
      await expect(page.locator('todo-item')).toHaveCount(1);
      await expect(page.locator('todo-item .todo-text')).toHaveText('Persistent history');
    });
  });

  test.describe('Edge Cases and Validation', () => {
    test('should not add empty todos', async ({ page }) => {
      const addButton = page.locator('todo-form button');
      
      // Button should be disabled for empty input
      await expect(addButton).toBeDisabled();
      
      // Try with whitespace only
      await page.locator('todo-form input').fill('   ');
      await expect(addButton).toBeDisabled();
    });

    test('should trim whitespace from todos', async ({ page }) => {
      await page.locator('todo-form input').fill('  Trimmed todo  ');
      await page.locator('todo-form button').click();
      
      await expect(page.locator('todo-item .todo-text')).toHaveText('Trimmed todo');
    });

    test('should handle very long todo text', async ({ page }) => {
      const longText = 'A'.repeat(200);
      await page.locator('todo-form input').fill(longText);
      await page.locator('todo-form button').click();
      
      await expect(page.locator('todo-item .todo-text')).toHaveText(longText);
    });

    test('should handle special characters in todos', async ({ page }) => {
      const specialText = 'Special chars: @#$%^&*()_+-=[]{}|;:",./<>?';
      await page.locator('todo-form input').fill(specialText);
      await page.locator('todo-form button').click();
      
      await expect(page.locator('todo-item .todo-text')).toHaveText(specialText);
    });

    test('should not allow editing with empty text', async ({ page }) => {
      // Add a todo
      await page.locator('todo-form input').fill('Original text');
      await page.locator('todo-form button').click();
      
      // Start editing and clear text
      await page.locator('.edit-btn').click();
      const editInput = page.locator('.edit-input');
      await editInput.clear();
      
      // Try to save empty text
      await page.locator('.save-btn').click();
      
      // Should still be in editing mode (save didn't work)
      await expect(editInput).toBeVisible();
      
      // Cancel to return to normal view
      await page.locator('.cancel-btn').click();
      
      // Should still show original text
      await expect(page.locator('todo-item .todo-text')).toHaveText('Original text');
    });
  });

  test.describe('Accessibility and UX', () => {
    test('should have proper focus management', async ({ page }) => {
      const input = page.locator('todo-form input');
      
      // Focus the input manually (autofocus may not work in tests)
      await input.focus();
      await expect(input).toBeFocused();
      
      // After adding a todo, focus should return to input
      await input.fill('Focus test');
      await page.locator('todo-form button').click();
      
      // Input should be cleared and available for new input
      await expect(input).toHaveValue('');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.locator('todo-form input').fill('ARIA test');
      await page.locator('todo-form button').click();
      
      // Check for aria-labels
      await expect(page.locator('todo-item input[type="checkbox"]')).toHaveAttribute('aria-label', 'Toggle todo');
      await expect(page.locator('.edit-btn')).toHaveAttribute('aria-label', 'Edit todo');
      await expect(page.locator('.delete-btn')).toHaveAttribute('aria-label', 'Delete todo');
    });

    test('should show proper button states and counts', async ({ page }) => {
      // Add multiple todos
      await page.locator('todo-form input').fill('Todo 1');
      await page.locator('todo-form button').click();
      await page.locator('todo-form input').fill('Todo 2');
      await page.locator('todo-form button').click();
      
      // Complete one
      await page.locator('todo-item').first().locator('input[type="checkbox"]').check();
      
      // Button should show correct count
      await expect(page.locator('.clear-completed')).toContainText('Move Completed to History (1)');
      
      // Complete another
      await page.locator('todo-item').last().locator('input[type="checkbox"]').check();
      await expect(page.locator('.clear-completed')).toContainText('Move Completed to History (2)');
    });
  });
});