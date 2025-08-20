import { test, expect } from "../fixtures/test-helpers";

test.describe("Checklist text overflow", () => {
  test("long checklist items should stay within the note card", async ({ authenticatedPage, testContext, testPrisma }) => {
    const boardName = testContext.getBoardName("Overflow Board");
    const board = await testPrisma.board.create({
      data: {
        name: boardName,
        description: testContext.prefix("A test board"),
        createdBy: testContext.userId,
        organizationId: testContext.organizationId,
      },
    });

    const note = await testPrisma.note.create({
      data: {
        color: "#fef3c7",
        boardId: board.id,
        createdBy: testContext.userId,
      },
    });

    const longContent = "x".repeat(200);
    const itemId = testContext.prefix("item-overflow");

    await testPrisma.checklistItem.create({
      data: {
        id: itemId,
        content: longContent,
        checked: false,
        order: 0,
        noteId: note.id,
      },
    });

    await authenticatedPage.goto(`/boards/${board.id}`);

    const checklistTextarea = authenticatedPage
      .getByTestId(itemId)
      .locator("textarea");

    await expect(checklistTextarea).toBeVisible();

    const hasOverflow = await checklistTextarea.evaluate(
      (el) => el.scrollWidth > el.clientWidth
    );

    expect(hasOverflow).toBe(false);
  });
});
