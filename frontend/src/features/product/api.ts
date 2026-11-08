import { apiClient } from "../../lib/apiClient"
import type { Product } from "./types"

export type CreateProductInput = {
	category_id: string
	name: string
	description: string
	sku: string
	price: number
	stock_quantity: number
}

export function listProducts(): Promise<Product[]> {
	return apiClient<Product[]>("/products")
}

export function createProduct(input: CreateProductInput): Promise<Product> {
	return apiClient<Product>("/products", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	})
}

export function getProduct(id: string): Promise<Product> {
	return apiClient<Product>(`/products/${id}`)
}
