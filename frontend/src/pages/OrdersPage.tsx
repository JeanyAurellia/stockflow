import { useEffect, useState } from "react"
import { Link } from "react-router"

import { getOrders } from "../features/orders/api"
import type { Order } from "../features/orders/types"

const rupiah = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat("id-ID", {
	dateStyle: "medium",
})

export function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		async function loadOrders() {
			try {
				setError("")
				const response = await getOrders()
				setOrders(response)
			} catch {
				setError("Pesanan belum dapat dimuat. Coba lagi.")
			} finally {
				setIsLoading(false)
			}
		}

		void loadOrders()
	}, [])

	if (isLoading) {
		return <main className="px-6 py-8 sm:px-10 sm:py-12"><p className="text-sm text-[#5e665f]">Memuat pesanan...</p></main>
	}

	if (error) {
		return <main className="px-6 py-8 sm:px-10 sm:py-12"><p className="text-sm text-[#9d3328]">{error}</p></main>
	}

	if (orders.length === 0) {
		return (
			<main className="px-6 py-8 sm:px-10 sm:py-12">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
				<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">PESANAN</p>
				<h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Belum ada pesanan</h1>
				<p className="mt-3 max-w-md text-[#5e665f]">Pesanan baru akan muncul di sini setelah dibuat.</p>
					</div>
					<Link to="/orders/new" className="rounded-md bg-[#276541] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#205536]">Buat pesanan</Link>
				</div>
			</main>
		)
	}

	return (
		<main className="px-6 py-8 sm:px-10 sm:py-12">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">PESANAN</p>
					<h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Daftar pesanan</h1>
					<p className="mt-3 text-[#5e665f]">{orders.length} pesanan tercatat.</p>
				</div>
				<Link to="/orders/new" className="rounded-md bg-[#276541] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#205536]">Buat pesanan</Link>
			</div>

			<div className="mt-8 overflow-hidden rounded-lg border border-[#d9ded9] bg-white">
				<div className="hidden grid-cols-[1.2fr_1fr_1.5fr_1fr] gap-4 border-b border-[#d9ded9] px-5 py-3 font-mono text-xs font-bold tracking-[0.08em] text-[#5a7261] md:grid">
					<span>NO. PESANAN</span>
					<span>TANGGAL</span>
					<span>ITEM</span>
					<span className="text-right">TOTAL</span>
				</div>

				{orders.map((order) => (
					<article key={order.id} className="grid gap-3 border-b border-[#e6e9e6] px-5 py-4 last:border-0 md:grid-cols-[1.2fr_1fr_1.5fr_1fr] md:items-center md:gap-4">
						<div>
							<p className="font-semibold text-[#161a17]">{order.order_number}</p>
							<p className="mt-1 text-xs text-[#5e665f] md:hidden">{dateFormat.format(new Date(order.created_at))}</p>
						</div>
						<p className="hidden text-sm text-[#5e665f] md:block">{dateFormat.format(new Date(order.created_at))}</p>
						<p className="text-sm text-[#5e665f]">{order.items.map((item) => `${item.product_name} ×${item.quantity}`).join(", ")}</p>
						<p className="font-semibold text-[#161a17] md:text-right">{rupiah.format(order.total_amount)}</p>
					</article>
				))}
			</div>
		</main>
	)
}
