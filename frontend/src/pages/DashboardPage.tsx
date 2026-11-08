import { DashboardLayout } from "../app/DashboardLayout"
import { getCurrentUser } from "../features/auth/authStorage"
import { Link } from "react-router"

export function DashboardPage() {
	const currentUser = getCurrentUser()
	const isAdmin = currentUser?.role === "admin"
	const firstName = currentUser?.full_name.split(" ")[0] ?? ""

	return (
		<DashboardLayout>
			<section className="px-6 py-8 sm:px-10 sm:py-12">
				<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">DASHBOARD</p>
				<h2 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Selamat datang{firstName ? `, ${firstName}` : ""}</h2>
				<p className="mt-3 max-w-xl text-[#5e665f]">{isAdmin ? "Kelola katalog, cek produk, dan pantau pesanan dari satu tempat." : "Buat pesanan baru atau lihat riwayat pesananmu dari sini."}</p>

				<div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
					<Link to="/orders" className="rounded-lg border border-[#dce2dd] bg-white p-5 transition hover:border-[#3b8159] hover:shadow-sm">
						<p className="font-bold text-[#161a17]">Pesanan</p>
						<p className="mt-2 text-sm text-[#5e665f]">{isAdmin ? "Lihat pesanan yang tercatat." : "Buat atau lihat pesananmu."}</p>
					</Link>
					{isAdmin ? (
						<Link to="/admin/catalog" className="rounded-lg border border-[#dce2dd] bg-white p-5 transition hover:border-[#3b8159] hover:shadow-sm">
							<p className="font-bold text-[#161a17]">Kelola katalog</p>
							<p className="mt-2 text-sm text-[#5e665f]">Tambah kategori dan produk baru.</p>
						</Link>
					) : (
						<Link to="/products" className="rounded-lg border border-[#dce2dd] bg-white p-5 transition hover:border-[#3b8159] hover:shadow-sm">
							<p className="font-bold text-[#161a17]">Produk</p>
							<p className="mt-2 text-sm text-[#5e665f]">Lihat produk yang tersedia.</p>
						</Link>
					)}
				</div>
			</section>
		</DashboardLayout>
	)
}
