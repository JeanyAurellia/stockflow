import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"

import { DashboardLayout } from "../app/DashboardLayout"
import { ApiError } from "../lib/apiClient"
import { getProduct } from "../features/product/api"
import type { Product } from "../features/product/types"

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0,
})

function stockMessage(stock: number) {
	if (stock === 0) return "Stok saat ini habis"
	if (stock <= 5) return `Stok menipis: tersisa ${stock}`
	return `${stock} unit tersedia`
}

export function ProductDetailPage() {
	const { id } = useParams()
	const productID = id ?? ""
	const [product, setProduct] = useState<Product | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		if (!productID) return

		async function loadProduct() {
			try {
				setProduct(await getProduct(productID))
			} catch (requestError) {
				if (requestError instanceof ApiError && requestError.status === 404) {
					setError("Produk tidak ditemukan.")
					return
				}

				setError("Tidak dapat memuat produk. Coba lagi.")
			} finally {
				setIsLoading(false)
			}
		}

		void loadProduct()
	}, [productID])

	return (
		<DashboardLayout>
			<section className="px-6 py-8 sm:px-10 sm:py-12">
				<Link to="/products" className="text-sm font-bold text-[#276541] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3b8159]">
					← Kembali ke produk
				</Link>

				{!productID && (
					<div className="mt-10 max-w-md border-l-2 border-[#9d3328] pl-4">
						<h2 className="font-bold text-[#161a17]">Detail produk tidak tersedia</h2>
						<p className="mt-1 text-sm text-[#9d3328]">Produk tidak ditemukan.</p>
					</div>
				)}

				{productID && isLoading && <p className="mt-10 text-sm text-[#5e665f]">Memuat detail produk...</p>}

				{productID && !isLoading && error && (
					<div className="mt-10 max-w-md border-l-2 border-[#9d3328] pl-4">
						<h2 className="font-bold text-[#161a17]">Detail produk tidak tersedia</h2>
						<p className="mt-1 text-sm text-[#9d3328]">{error}</p>
					</div>
				)}

				{productID && !isLoading && product && (
					<div className="mt-10 max-w-3xl">
						<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">DETAIL PRODUK</p>
						<h2 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">{product.name}</h2>
						<p className="mt-3 max-w-2xl text-[#5e665f]">{product.description || "Belum ada deskripsi produk."}</p>

						<dl className="mt-10 grid gap-px overflow-hidden rounded-lg border border-[#dce2dd] bg-[#dce2dd] sm:grid-cols-2">
							<div className="bg-white p-5"><dt className="text-xs font-bold tracking-wide text-[#5e665f]">SKU</dt><dd className="mt-2 font-mono text-sm text-[#161a17]">{product.sku}</dd></div>
							<div className="bg-white p-5"><dt className="text-xs font-bold tracking-wide text-[#5e665f]">HARGA</dt><dd className="mt-2 text-lg font-bold text-[#161a17]">{rupiahFormatter.format(product.price)}</dd></div>
							<div className="bg-white p-5"><dt className="text-xs font-bold tracking-wide text-[#5e665f]">STOK</dt><dd className="mt-2 text-lg font-bold text-[#276541]">{stockMessage(product.stock_quantity)}</dd></div>
							<div className="bg-white p-5"><dt className="text-xs font-bold tracking-wide text-[#5e665f]">ID KATEGORI</dt><dd className="mt-2 break-all font-mono text-sm text-[#161a17]">{product.category_id}</dd></div>
						</dl>
					</div>
				)}
			</section>
		</DashboardLayout>
	)
}
