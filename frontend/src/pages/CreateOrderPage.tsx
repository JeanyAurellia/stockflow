import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"

import { DashboardLayout } from "../app/DashboardLayout"
import { createOrder } from "../features/orders/api"
import { listProducts } from "../features/product/api"
import type { Product } from "../features/product/types"

const rupiah = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0,
})

type DraftItem = {
	productID: string
	quantity: number
}

export function CreateOrderPage() {
	const navigate = useNavigate()
	const [products, setProducts] = useState<Product[]>([])
	const [items, setItems] = useState<DraftItem[]>([])
	const [selectedProductID, setSelectedProductID] = useState("")
	const [quantity, setQuantity] = useState(1)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		async function loadProducts() {
			try {
				setProducts(await listProducts())
			} catch {
				setError("Produk belum dapat dimuat. Coba lagi.")
			} finally {
				setIsLoading(false)
			}
		}

		void loadProducts()
	}, [])

	const itemsWithProduct = useMemo(
		() => items.flatMap((item) => {
			const product = products.find((candidate) => candidate.id === item.productID)
			return product ? [{ ...item, product }] : []
		}),
		[items, products],
	)

	const total = itemsWithProduct.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

	function addItem() {
		const product = products.find((candidate) => candidate.id === selectedProductID)
		if (!product || quantity < 1) {
			setError("Pilih produk dan masukkan jumlah yang valid.")
			return
		}

		if (quantity > product.stock_quantity) {
			setError("Jumlah pesanan melebihi stok yang tersedia.")
			return
		}

		setError("")
		setItems((current) => {
			const existing = current.find((item) => item.productID === product.id)
			if (!existing) return [...current, { productID: product.id, quantity }]

			const nextQuantity = existing.quantity + quantity
			if (nextQuantity > product.stock_quantity) {
				setError("Jumlah pesanan melebihi stok yang tersedia.")
				return current
			}

			return current.map((item) => item.productID === product.id ? { ...item, quantity: nextQuantity } : item)
		})
		setSelectedProductID("")
		setQuantity(1)
	}

	function removeItem(productID: string) {
		setItems((current) => current.filter((item) => item.productID !== productID))
	}

	async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (items.length === 0) {
			setError("Tambahkan minimal satu produk ke pesanan.")
			return
		}

		setIsSubmitting(true)
		setError("")
		try {
			await createOrder({ items: items.map((item) => ({ product_id: item.productID, quantity: item.quantity })) })
			navigate("/orders", { replace: true })
		} catch (requestError) {
			const message = requestError instanceof Error ? requestError.message : "Pesanan belum dapat dibuat."
			setError(message === "insufficient stock" ? "Stok produk tidak mencukupi." : "Pesanan belum dapat dibuat. Coba lagi.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<DashboardLayout>
			<main className="px-6 py-8 sm:px-10 sm:py-12">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">PESANAN</p>
						<h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Buat pesanan</h1>
						<p className="mt-3 text-[#5e665f]">Pilih produk dan jumlahnya. Stok akan berkurang setelah pesanan berhasil dibuat.</p>
					</div>
					<Link to="/orders" className="text-sm font-semibold text-[#276541] hover:underline">Kembali ke pesanan</Link>
				</div>

				<form onSubmit={submitOrder} className="mt-8 grid max-w-4xl gap-6 lg:grid-cols-[1fr_0.8fr]">
					<section className="rounded-lg border border-[#dce2dd] bg-white p-5">
						<h2 className="font-bold text-[#161a17]">Tambah produk</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
							<label className="grid gap-1.5 text-sm font-semibold text-[#303631]">Produk
								<select value={selectedProductID} onChange={(event) => setSelectedProductID(event.target.value)} disabled={isLoading} className="rounded-md border border-[#cbd2cc] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#3b8159]">
									<option value="">Pilih produk</option>
									{products.filter((product) => product.stock_quantity > 0).map((product) => <option key={product.id} value={product.id}>{product.name} — {rupiah.format(product.price)}</option>)}
								</select>
							</label>
							<label className="grid gap-1.5 text-sm font-semibold text-[#303631]">Jumlah
								<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="rounded-md border border-[#cbd2cc] px-3 py-2.5 font-normal outline-none focus:border-[#3b8159]" />
							</label>
							<button type="button" onClick={addItem} disabled={isLoading} className="rounded-md bg-[#276541] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#205536] disabled:cursor-not-allowed disabled:bg-[#9cac9f]">Tambah</button>
						</div>
					</section>

					<aside className="rounded-lg border border-[#dce2dd] bg-[#f8faf8] p-5">
						<h2 className="font-bold text-[#161a17]">Ringkasan</h2>
						<p className="mt-2 text-sm text-[#5e665f]">{itemsWithProduct.length} jenis produk</p>
						<p className="mt-6 border-t border-[#dce2dd] pt-4 text-2xl font-bold text-[#161a17]">{rupiah.format(total)}</p>
						<button type="submit" disabled={isSubmitting || isLoading || items.length === 0} className="mt-5 w-full rounded-md bg-[#276541] px-4 py-3 text-sm font-bold text-white hover:bg-[#205536] disabled:cursor-not-allowed disabled:bg-[#9cac9f]">{isSubmitting ? "Membuat pesanan..." : "Buat pesanan"}</button>
					</aside>

					<section className="rounded-lg border border-[#dce2dd] bg-white p-5 lg:col-span-2">
						<h2 className="font-bold text-[#161a17]">Item pesanan</h2>
						{itemsWithProduct.length === 0 ? <p className="mt-4 text-sm text-[#5e665f]">Belum ada produk yang ditambahkan.</p> : <ul className="mt-4 divide-y divide-[#e6e9e6]">{itemsWithProduct.map((item) => <li key={item.productID} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-[#161a17]">{item.product.name}</p><p className="text-sm text-[#5e665f]">{item.quantity} × {rupiah.format(item.product.price)}</p></div><div className="flex items-center gap-4"><p className="font-semibold text-[#161a17]">{rupiah.format(item.quantity * item.product.price)}</p><button type="button" onClick={() => removeItem(item.productID)} className="text-sm font-semibold text-[#9d3328] hover:underline">Hapus</button></div></li>)}</ul>}
						{error && <p role="alert" className="mt-4 text-sm text-[#9d3328]">{error}</p>}
					</section>
				</form>
			</main>
		</DashboardLayout>
	)
}
