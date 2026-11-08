import { apiClient } from "../../lib/apiClient"
import type { Product } from "./types"

export function listProducts(): Promise<Product[]> {
	return apiClient<Product[]>("/products")
}

export function getProduct(id: string): Promise<Product> {
	return apiClient<Product>(`/products/${id}`)
}
