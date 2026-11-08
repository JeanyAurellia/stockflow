import { type FormEvent, useEffect, useState } from "react"

import { DashboardLayout } from "../app/DashboardLayout"
import { createCategory, listCategories } from "../features/category/api"
import type { Category } from "../features/category/types"
import { createProduct } from "../features/product/api"

type ProductForm = {
	categoryID: string
	name: string
	description: string
	sku: string
	price: string
	stockQuantity: string
}

const emptyProductForm: ProductForm = {
	categoryID: "",
	name: "",
	description: "",
	sku: "",
	price: "",
	stockQuantity: "0",
}

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error && error.message ? error.message : fallback
}

export function AdminCatalogPage() {
	const [categories, setCategories] = useState<Category[]>([])
	const [categoryName, setCategoryName] = useState("")
	const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm)
	const [isLoadingCategories, setIsLoadingCategories] = useState(true)
	const [isSavingCategory, setIsSavingCategory] = useState(false)
	const [isSavingProduct, setIsSavingProduct] = useState(false)
	const [categoryMessage, setCategoryMessage] = useState("")
	const [productMessage, setProductMessage] = useState("")

	useEffect(() => {
		async function loadCategories() {
			try {
				setCategories(await listCategories())
			} catch {
				setCategoryMessage("Kategori belum dapat dimuat. Muat ulang halaman lalu coba lagi.")
			} finally {
				setIsLoadingCategories(false)
			}
		}

		void loadCategories()
	}, [])

	async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const name = categoryName.trim()
		if (!name) {
			setCategoryMessage("Nama kategori wajib diisi.")
			return
		}

		try {
			setIsSavingCategory(true)
			setCategoryMessage("")
			const category = await createCategory({ name })
			setCategories((current) => [...current, category])
			setCategoryName("")
			setCategoryMessage("Kategori berhasil dibuat.")
		} catch (error) {
			setCategoryMessage(getErrorMessage(error, "Kategori tidak dapat dibuat. Coba lagi."))
		} finally {
			setIsSavingCategory(false)
		}
	}

	async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const price = Number(productForm.price)
		const stockQuantity = Number(productForm.stockQuantity)

		if (!productForm.categoryID || !productForm.name.trim() || !productForm.sku.trim()) {
			setProductMessage("Kategori, nama produk, dan SKU wajib diisi.")
			return
		}
		if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stockQuantity) || stockQuantity < 0) {
			setProductMessage("Harga dan stok harus berupa angka nol atau lebih.")
			return
		}

		try {
			setIsSavingProduct(true)
			setProductMessage("")
			await createProduct({
				category_id: productForm.categoryID,
				name: productForm.name.trim(),
				description: productForm.description.trim(),
				sku: productForm.sku.trim(),
				price,
				stock_quantity: stockQuantity,
			})
			setProductForm(emptyProductForm)
			setProductMessage("Produk berhasil dibuat.")
		} catch (error) {
			setProductMessage(getErrorMessage(error, "Produk tidak dapat dibuat. Coba lagi."))
		} finally {
			setIsSavingProduct(false)
		}
	}

	return (
		<DashboardLayout>
			<main className="px-6 py-8 sm:px-10 sm:py-12">
				<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">ADMIN</p>
				<h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Kelola katalog</h1>
				<p className="mt-3 max-w-xl text-[#5e665f]">Tambahkan kategori dan produk baru ke katalog Stockflow.</p>

				<div className="mt-10 grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
					<section className="rounded-lg border border-[#dce2dd] bg-white p-6">
						<h2 className="text-xl font-bold text-[#161a17]">Kategori baru</h2>
						<form className="mt-5 space-y-4" onSubmit={handleCategorySubmit}>
							<label className="block text-sm font-semibold text-[#303832]">Nama kategori
								<input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="mt-2 w-full rounded-md border border-[#cbd3cc] px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]" placeholder="Contoh: Elektronik" />
							</label>
							<button type="submit" disabled={isSavingCategory} className="w-full rounded-md bg-[#276541] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1f5435] disabled:cursor-not-allowed disabled:opacity-60">{isSavingCategory ? "Menyimpan..." : "Tambah kategori"}</button>
						</form>
						{categoryMessage && <p aria-live="polite" className="mt-4 text-sm text-[#5e665f]">{categoryMessage}</p>}
						<div className="mt-6 border-t border-[#edf0ed] pt-5">
							<h3 className="text-sm font-bold text-[#303832]">Kategori tersedia</h3>
							{isLoadingCategories ? <p className="mt-2 text-sm text-[#5e665f]">Memuat kategori...</p> : <ul className="mt-3 space-y-2 text-sm text-[#5e665f]">{categories.map((category) => <li key={category.id}>{category.name}</li>)}</ul>}
						</div>
					</section>

					<section className="rounded-lg border border-[#dce2dd] bg-white p-6">
						<h2 className="text-xl font-bold text-[#161a17]">Produk baru</h2>
						<form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleProductSubmit}>
							<label className="block text-sm font-semibold text-[#303832] sm:col-span-2">Kategori
								<select value={productForm.categoryID} onChange={(event) => setProductForm((form) => ({ ...form, categoryID: event.target.value }))} disabled={isLoadingCategories} className="mt-2 w-full rounded-md border border-[#cbd3cc] bg-white px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]">
									<option value="">Pilih kategori</option>
									{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
								</select>
							</label>
							<label className="block text-sm font-semibold text-[#303832]">Nama produk
								<input value={productForm.name} onChange={(event) => setProductForm((form) => ({ ...form, name: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cbd3cc] px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]" />
							</label>
							<label className="block text-sm font-semibold text-[#303832]">SKU
								<input value={productForm.sku} onChange={(event) => setProductForm((form) => ({ ...form, sku: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cbd3cc] px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]" placeholder="CONTOH-001" />
							</label>
							<label className="block text-sm font-semibold text-[#303832]">Harga
								<input type="number" min="0" value={productForm.price} onChange={(event) => setProductForm((form) => ({ ...form, price: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cbd3cc] px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]" />
							</label>
							<label className="block text-sm font-semibold text-[#303832]">Stok awal
								<input type="number" min="0" step="1" value={productForm.stockQuantity} onChange={(event) => setProductForm((form) => ({ ...form, stockQuantity: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cbd3cc] px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]" />
							</label>
							<label className="block text-sm font-semibold text-[#303832] sm:col-span-2">Deskripsi <span className="font-normal text-[#5e665f]">(opsional)</span>
								<textarea value={productForm.description} onChange={(event) => setProductForm((form) => ({ ...form, description: event.target.value }))} rows={3} className="mt-2 w-full resize-y rounded-md border border-[#cbd3cc] px-3 py-2.5 text-[#161a17] outline-none focus:border-[#3b8159] focus:ring-2 focus:ring-[#d8ebde]" />
							</label>
							<button type="submit" disabled={isSavingProduct || isLoadingCategories || categories.length === 0} className="rounded-md bg-[#276541] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1f5435] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{isSavingProduct ? "Menyimpan..." : "Tambah produk"}</button>
						</form>
						{categories.length === 0 && !isLoadingCategories && <p className="mt-4 text-sm text-[#8a6217]">Buat kategori terlebih dahulu sebelum menambah produk.</p>}
						{productMessage && <p aria-live="polite" className="mt-4 text-sm text-[#5e665f]">{productMessage}</p>}
					</section>
				</div>
			</main>
		</DashboardLayout>
	)
}
