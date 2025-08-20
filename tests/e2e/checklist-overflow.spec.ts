import { test, expect } from "../fixtures/test-helpers";

test.describe("Checklist overflow containment", () => {
  test("long checklist items remain inside the note card", async ({
    authenticatedPage,
    testContext,
    testPrisma,
  }) => {
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

    const longContent = "Line\n".repeat(200);
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

    const noteCard = authenticatedPage.getByTestId("note-card");
    const checklistContainer = noteCard.getByTestId("checklist-container");

    await expect(checklistContainer).toBeVisible();

    const card = await noteCard.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));

    const container = await checklistContainer.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));

    expect(card.scrollHeight).toBe(card.clientHeight);
    expect(container.scrollHeight).toBe(container.clientHeight);
    expect(card.clientHeight).toBeGreaterThan(1000);
  });
});
