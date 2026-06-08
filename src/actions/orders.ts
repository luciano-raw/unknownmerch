"use server"

import { prisma } from "@/lib/prisma"
import { createAuditLog } from "./audit"
import { revalidatePath } from "next/cache"

export interface CreateOrderInput {
  customerName: string
  total: number
  items: {
    productId: string
    quantity: number
    price: number
    selectedVariant?: string
  }[]
}

export async function createOrder(data: CreateOrderInput) {
  try {
    if (!data.customerName.trim()) {
      throw new Error("El nombre del cliente es requerido")
    }
    if (data.items.length === 0) {
      throw new Error("El pedido debe tener al menos un producto")
    }

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        total: data.total,
        status: "pending",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            selectedVariant: item.selectedVariant || null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return { success: true, orderId: order.id }
  } catch (err: any) {
    console.error("Error creating order:", err)
    return { success: false, error: err.message || "Error al registrar el pedido" }
  }
}

export async function getOrders() {
  try {
    return await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (err) {
    console.error("Error fetching orders:", err)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: "approved" | "rejected") {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error("Pedido no encontrado")
    }

    if (order.status !== "pending") {
      throw new Error(
        `El pedido ya fue ${order.status === "approved" ? "aprobado" : "rechazado"}`
      )
    }

    if (status === "approved") {
      // Run stock updates in a database transaction
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          })

          if (!product) {
            throw new Error(`Producto con ID ${item.productId} no encontrado`)
          }

          // Deduct from stock. Ensure it doesn't go below 0 unless forced
          const newStock = Math.max(0, product.stock - item.quantity)

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          })
        }

        // Update order status to approved
        await tx.order.update({
          where: { id: orderId },
          data: { status: "approved" },
        })
      })

      await createAuditLog(
        "APPROVE_ORDER",
        `Pedido de "${order.customerName}" aprobado. Stock descontado. Total: $${order.total.toLocaleString("es-CL")}`
      )
    } else {
      // Just update status to rejected
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "rejected" },
      })

      await createAuditLog(
        "REJECT_ORDER",
        `Pedido de "${order.customerName}" rechazado. Sin cambios en stock. Total: $${order.total.toLocaleString("es-CL")}`
      )
    }

    revalidatePath("/admin/orders")
    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (err: any) {
    console.error("Error updating order status:", err)
    return { success: false, error: err.message || "Error al actualizar el estado del pedido" }
  }
}
