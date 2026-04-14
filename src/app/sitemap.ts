import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://unknown-club.store'

  // Get all products from database
  const products = await prisma.product.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  })

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const routes = ['', '/category/capilares_corporales', '/category/joyas', '/nosotros', '/search'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    })
  )

  return [...routes, ...productUrls]
}
