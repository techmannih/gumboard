import { test, expect } from "../fixtures/test-helpers";

// E2E test for app/boards/[id]/page.tsx search URL synchronization

test.describe("Board search URL synchronization", () => {
  test("updates URL with search term and restores it on reload", async ({
    authenticatedPage,
    testContext,
    testPrisma,
  }) => {
    const board = await testPrisma.board.create({
      data: {
        name: testContext.getBoardName("Test Board"),
        description: testContext.prefix("Test board description"),
        createdBy: testContext.userId,
        organizationId: testContext.organizationId,
      },
    });

    const itemA = testContext.prefix("Item A");
    const noteA = await testPrisma.note.create({
      data: {
        color: "#fef3c7",
        boardId: board.id,
        createdBy: testContext.userId,
      },
    });
    await testPrisma.checklistItem.create({
      data: {
        content: itemA,
        checked: false,
        order: 0,
        noteId: noteA.id,
      },
    });

    const itemB = testContext.prefix("Item B");
    const noteB = await testPrisma.note.create({
      data: {
        color: "#fef3c7",
        boardId: board.id,
        createdBy: testContext.userId,
      },
    });
    await testPrisma.checklistItem.create({
      data: {
        content: itemB,
        checked: false,
        order: 0,
        noteId: noteB.id,
      },
    });

    await authenticatedPage.goto(`/boards/${board.id}`);

    // Ensure notes are visible before searching
    await expect(authenticatedPage.locator(`text=${itemA}`)).toBeVisible();
    await expect(authenticatedPage.locator(`text=${itemB}`)).toBeVisible();

    const searchInput = authenticatedPage.locator(
      'input[placeholder="Search notes..."]'
    );
    await searchInput.fill(itemB);

    // Wait for debounce and URL update
    await authenticatedPage.waitForTimeout(1500);

    const encodedSearch = encodeURIComponent(itemB).replace(/%20/g, "+");
    await expect(authenticatedPage).toHaveURL(
      `/boards/${board.id}?search=${encodedSearch}`
    );

    // Verify only matching note is visible
    await expect(authenticatedPage.locator(`text=${itemB}`)).toBeVisible();
    await expect(
      authenticatedPage.locator(`text=${itemA}`)
    ).not.toBeVisible();

    // Reload page and confirm state persists
    await authenticatedPage.reload();
    await authenticatedPage.waitForTimeout(1000);

    await expect(searchInput).toHaveValue(itemB);
    await expect(authenticatedPage.locator(`text=${itemB}`)).toBeVisible();
    await expect(
      authenticatedPage.locator(`text=${itemA}`)
    ).not.toBeVisible();
  });
});

