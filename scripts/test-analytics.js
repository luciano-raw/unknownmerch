const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTest() {
  console.log("=== INICIANDO PRUEBA DE INTEGRACIÓN DE ANALÍTICA ===");
  const testSession = `test-session-${Math.random().toString(36).substring(2, 10)}`;
  
  try {
    // 1. Simulate Pageview creation
    console.log("\n1. Simulando Pageview...");
    const pv = await prisma.analyticsEvent.create({
      data: {
        type: "pageview",
        path: "/product/polera-test-item",
        sessionToken: testSession,
        deviceType: "desktop"
      }
    });
    console.log(`✓ Pageview creado con ID: ${pv.id}`);

    // 2. Simulate Pageview duration update
    console.log("\n2. Simulando actualización de duración...");
    const lastPageview = await prisma.analyticsEvent.findFirst({
      where: {
        sessionToken: testSession,
        type: "pageview",
        path: "/product/polera-test-item",
      },
      orderBy: { createdAt: "desc" }
    });

    if (!lastPageview) throw new Error("No se encontró el Pageview creado.");

    const updatedPv = await prisma.analyticsEvent.update({
      where: { id: lastPageview.id },
      data: { duration: 15 } // 15 seconds
    });
    console.log(`✓ Duración actualizada a ${updatedPv.duration}s en ID: ${updatedPv.id}`);

    // 3. Simulate click event
    console.log("\n3. Simulando evento de clic...");
    const click = await prisma.analyticsEvent.create({
      data: {
        type: "click",
        path: "/product/polera-test-item",
        elementId: "add-to-cart-button",
        elementText: "Agregar al Carrito",
        sessionToken: testSession,
        deviceType: "desktop"
      }
    });
    console.log(`✓ Evento de clic creado con ID: ${click.id}`);

    // 4. Verify counts
    console.log("\n4. Verificando integridad en la base de datos...");
    const eventCount = await prisma.analyticsEvent.count({
      where: { sessionToken: testSession }
    });
    if (eventCount !== 2) {
      throw new Error(`Se esperaban 2 eventos, se encontraron ${eventCount}`);
    }
    console.log("✓ Integridad de base de datos verificada con éxito.");

    // 5. Simulate audit logging
    console.log("\n5. Simulando log de auditoría...");
    const audit = await prisma.auditLog.create({
      data: {
        userId: "clerk-user-test-id",
        userEmail: "luciano.raw04@gmail.com",
        action: "TEST_ACTION",
        description: "Acción de prueba del script de verificación"
      }
    });
    console.log(`✓ Log de auditoría creado con ID: ${audit.id}`);

    // 6. Clean up test data
    console.log("\n6. Limpiando datos de prueba...");
    await prisma.analyticsEvent.deleteMany({
      where: { sessionToken: testSession }
    });
    await prisma.auditLog.delete({
      where: { id: audit.id }
    });
    console.log("✓ Base de datos limpia de datos de prueba.");

    console.log("\n=== ¡TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO! ===");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR EN LA PRUEBA:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
