import { apiClient } from "../../lib/apiClient"
import type { Category, CreateCategoryInput } from "./types"

export function listCategories(): Promise<Category[]> {
	return apiClient<Category[]>("/categories")
}

export function createCategory(input: CreateCategoryInput): Promise<Category> {
	return apiClient<Category>("/categories", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	})
}
