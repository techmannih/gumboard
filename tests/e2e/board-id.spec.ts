import { test, expect } from "../fixtures/test-helpers";

// Ensures board pages handle array-style query parameters without breaking
// the board ID extraction logic.
test.describe("Board ID Handling", () => {
  test("loads board even when query contains multiple id params", async ({
    authenticatedPage,
    testPrisma,
    testContext,
  }) => {
    const board = await testPrisma.board.create({
      data: {
        name: testContext.getBoardName("Query Board"),
        description: testContext.prefix("Board with query id"),
        createdBy: testContext.userId,
        organizationId: testContext.organizationId,
      },
    });

    // Append multiple id query parameters to simulate array-style ids
    await authenticatedPage.goto(`/boards/${board.id}?id=${board.id}&id=extra`);

    // Should still render the board normally using the path parameter
    await expect(authenticatedPage.locator(`text=${board.name}`)).toBeVisible();
  });
});
