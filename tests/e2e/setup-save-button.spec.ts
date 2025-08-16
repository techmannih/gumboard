import { test, expect } from "../fixtures/test-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test profile setup save button loading state
// Ensure button shows "Saving..." and is disabled during submission

test("profile setup save button shows loading state", async ({ page, testContext }) => {
  await prisma.user.create({
    data: {
      id: testContext.userId,
      email: testContext.userEmail,
    },
  });
  await prisma.session.create({
    data: {
      sessionToken: testContext.sessionToken,
      userId: testContext.userId,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: testContext.sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/setup/profile");
  await page.fill("input[name=\"name\"]", "Test User");
  const submit = page.getByRole("button", { name: "Save" });
  await submit.click();
  await expect(page.getByRole("button", { name: "Saving..." })).toBeDisabled();
  await page.waitForURL("**/setup/organization");

  // cleanup user/session created for test
  await prisma.session.deleteMany({ where: { userId: testContext.userId } });
  await prisma.user.deleteMany({ where: { id: testContext.userId } });
});

// Test organization setup save button loading state

test("organization setup save button shows loading state", async ({ page, testContext }) => {
  await prisma.user.create({
    data: {
      id: testContext.userId,
      email: testContext.userEmail,
      name: "Test User",
    },
  });
  await prisma.session.create({
    data: {
      sessionToken: testContext.sessionToken,
      userId: testContext.userId,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: testContext.sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/setup/organization");
  await page.fill("#organizationName", "Test Org");
  const submit = page.getByRole("button", { name: "Save" });
  await submit.click();
  await expect(page.getByRole("button", { name: "Saving..." })).toBeDisabled();
  await page.waitForURL("**/dashboard");

  // set organization id for automatic cleanup
  const user = await prisma.user.findUnique({ where: { id: testContext.userId } });
  if (user?.organizationId) {
    testContext.organizationId = user.organizationId;
  }
});
