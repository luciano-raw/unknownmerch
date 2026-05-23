import { getProducts } from "@/actions/products"
import ProductsList from "./products-list"

export default async function AdminProductsPage() {
  const products = await getProducts()

  return <ProductsList initialProducts={products} />
}
