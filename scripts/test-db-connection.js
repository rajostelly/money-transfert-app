const { prisma } = require("./lib/prisma");

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL database");

    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);

    if (userCount === 0) {
      console.log(
        "🔄 Database appears to be empty. You may want to run seed scripts."
      );
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n📋 Troubleshooting steps:");
    console.log("1. Make sure PostgreSQL is installed and running");
    console.log("2. Check your DATABASE_URL in .env file");
    console.log('3. Ensure the database "moneytransferapp" exists');
    console.log("4. Run: createdb moneytransferapp (if using postgres user)");
    console.log("5. Run: npx prisma migrate dev --name init");
  } finally {
    await prisma.$disconnect();
  }
}

main();
