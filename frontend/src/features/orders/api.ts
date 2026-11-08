import { apiClient } from "../../lib/apiClient"
import type { CreateOrderRequest, Order } from "./types"

export function getOrders(): Promise<Order[]> {
	return apiClient<Order[]>("/orders")
}

export function createOrder(request: CreateOrderRequest): Promise<Order> {
	return apiClient<Order>("/orders", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request),
	})
}
