const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function run() {
  try {
    const event = await p.analyticsEvent.findFirst({
      where: { sessionToken: "test-rest-token" }
    });
    console.log("Saved Event:", JSON.stringify(event, null, 2));

    const deleteResult = await p.analyticsEvent.deleteMany({
      where: { sessionToken: "test-rest-token" }
    });
    console.log("Cleaned up records:", deleteResult.count);
  } catch (err) {
    console.error(err);
  } finally {
    await p.$disconnect();
  }
}

run();
