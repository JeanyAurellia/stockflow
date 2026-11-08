import { useEffect, useState } from "react"

import { DashboardLayout } from "../app/DashboardLayout"
import { listProducts } from "../features/product/api"
import type { Product } from "../features/product/types"

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0,
})

function stockLabel(stock: number) {
	if (stock === 0) {
		return { text: "Stok habis", className: "bg-[#f9e4df] text-[#9d3328]" }
	}

	if (stock <= 5) {
		return { text: `${stock} tersisa`, className: "bg-[#fbf1d8] text-[#8a6217]" }
	}

	return { text: `${stock} tersedia`, className: "bg-[#e1f0e5] text-[#276541]" }
}

export function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		async function loadProducts() {
			try {
				setProducts(await listProducts())
			} catch {
				setError("Tidak dapat memuat produk. Coba lagi.")
			} finally {
				setIsLoading(false)
			}
		}

		void loadProducts()
	}, [])

	return (
		<DashboardLayout>
			<section className="px-6 py-8 sm:px-10 sm:py-12">
				<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">KATALOG</p>
				<h2 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Produk</h2>
				<p className="mt-3 max-w-md text-[#5e665f]">Pantau harga dan stok produk yang tersedia.</p>

				{isLoading && <p className="mt-10 text-sm text-[#5e665f]">Memuat produk...</p>}
				{error && <p className="mt-10 text-sm text-[#9d3328]">{error}</p>}

				{!isLoading && !error && products.length === 0 && (
					<div className="mt-10 max-w-md border-l-2 border-[#3b8159] pl-4">
						<h3 className="font-bold text-[#161a17]">Belum ada produk</h3>
						<p className="mt-1 text-sm text-[#5e665f]">Tambahkan produk dari akun admin untuk mulai mencatat stok.</p>
					</div>
				)}

				{!isLoading && !error && products.length > 0 && (
					<div className="mt-10 overflow-x-auto rounded-lg border border-[#dce2dd] bg-white">
						<table className="w-full min-w-160 border-collapse text-left">
							<thead className="border-b border-[#dce2dd] bg-[#f9faf8] text-xs font-bold tracking-wide text-[#5e665f]">
								<tr>
									<th className="px-5 py-3">Produk</th>
									<th className="px-5 py-3">SKU</th>
									<th className="px-5 py-3">Harga</th>
									<th className="px-5 py-3">Stok</th>
								</tr>
							</thead>
							<tbody>
								{products.map((product) => {
									const stock = stockLabel(product.stock_quantity)

									return (
										<tr key={product.id} className="border-b border-[#edf0ed] last:border-b-0">
											<td className="px-5 py-4">
												<p className="font-bold text-[#161a17]">{product.name}</p>
												{product.description && <p className="mt-1 max-w-xs text-sm text-[#5e665f]">{product.description}</p>}
											</td>
											<td className="px-5 py-4 font-mono text-xs text-[#5e665f]">{product.sku}</td>
											<td className="px-5 py-4 text-sm text-[#161a17]">{rupiahFormatter.format(product.price)}</td>
											<td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${stock.className}`}>{stock.text}</span></td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</DashboardLayout>
	)
}
