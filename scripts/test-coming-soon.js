const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTest() {
  console.log("=== INICIANDO PRUEBA DE CAMPO 'isComingSoon' EN SPECIFICATIONS ===");
  
  let product = null;
  let createdTempProduct = false;
  let originalSpecs = null;

  try {
    // 1. Find an existing product or create a temporary one
    product = await prisma.product.findFirst();
    if (!product) {
      console.log("No se encontró ningún producto existente. Creando producto temporal...");
      product = await prisma.product.create({
        data: {
          name: "Producto de Prueba Coming Soon",
          description: "Descripción de prueba",
          price: 9990,
          category: "stickers",
          images: ["/placeholder.jpg"],
          specifications: { original: true },
          shippingDetails: JSON.stringify({ type: "solo_envio", locations: [] }),
          stock: 5
        }
      });
      createdTempProduct = true;
      console.log(`✓ Producto temporal creado con ID: ${product.id}`);
    } else {
      console.log(`✓ Producto encontrado para prueba: "${product.name}" (ID: ${product.id})`);
    }

    // Store the original specifications
    originalSpecs = product.specifications;
    console.log("Especificaciones originales:", JSON.stringify(originalSpecs));

    // 2. Prepare new specifications with isComingSoon: true
    const currentSpecs = (originalSpecs && typeof originalSpecs === 'object') ? originalSpecs : {};
    const updatedSpecs = { ...currentSpecs, isComingSoon: true };
    console.log("Nuevas especificaciones a guardar:", JSON.stringify(updatedSpecs));

    // 3. Update the product specifications
    console.log("Actualizando producto en la base de datos...");
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { specifications: updatedSpecs }
    });
    console.log("✓ Producto actualizado.");

    // 4. Read back and verify
    console.log("Volviendo a leer el producto desde la base de datos...");
    const verifiedProduct = await prisma.product.findUnique({
      where: { id: product.id }
    });

    console.log("Especificaciones leídas de la base de datos:", JSON.stringify(verifiedProduct.specifications));

    const readSpecs = verifiedProduct.specifications;
    if (readSpecs && typeof readSpecs === 'object' && readSpecs.isComingSoon === true) {
      console.log("✓ VERIFICACIÓN EXITOSA: 'isComingSoon: true' se guardó y se leyó correctamente en el campo JSON 'specifications'.");
    } else {
      throw new Error("La verificación falló. 'isComingSoon' no es true en las especificaciones leídas.");
    }

    // 5. Revert changes or clean up
    if (createdTempProduct) {
      console.log("Eliminando producto temporal...");
      await prisma.product.delete({
        where: { id: product.id }
      });
      console.log("✓ Producto temporal eliminado.");
    } else {
      console.log("Restaurando especificaciones originales...");
      await prisma.product.update({
        where: { id: product.id },
        data: { specifications: originalSpecs }
      });
      console.log("✓ Especificaciones originales restauradas.");
    }

    console.log("\n=== ¡PRUEBA FINALIZADA CON ÉXITO! ===");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR DURANTE LA PRUEBA:", error);
    // Try to restore specifications if we modified an existing product and failed
    if (product && !createdTempProduct && originalSpecs !== undefined) {
      try {
        console.log("Intentando restaurar especificaciones originales después de error...");
        await prisma.product.update({
          where: { id: product.id },
          data: { specifications: originalSpecs }
        });
        console.log("✓ Especificaciones originales restauradas.");
      } catch (restoreError) {
        console.error("No se pudieron restaurar las especificaciones originales:", restoreError);
      }
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
