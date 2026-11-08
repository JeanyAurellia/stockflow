import { DashboardLayout } from "../app/DashboardLayout"

export function DashboardPage() {
	return (
		<DashboardLayout>
			<section className="px-6 py-8 sm:px-10 sm:py-12">
				<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">DASHBOARD</p>
				<h2 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Selamat datang</h2>
				<p className="mt-3 max-w-md text-[#5e665f]">Pilih Produk, Pesanan, atau Persediaan dari menu untuk mulai bekerja.</p>
			</section>
		</DashboardLayout>
	)
}
