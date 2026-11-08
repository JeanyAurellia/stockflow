export type OrderItem = {
	id: string
	product_id: string
	product_name: string
	unit_price: number
	quantity: number
	line_total: number
}

export type Order = {
	id: string
	user_id: string
	order_number: string
	status: string
	subtotal: number
	total_amount: number
	created_at: string
	items: OrderItem[]
}
