import { apiClient } from "../../lib/apiClient"
import type { Order } from "./types"

export function getOrders(): Promise<Order[]> {
	return apiClient<Order[]>("/orders")
}
