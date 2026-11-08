import { useNavigate } from "react-router"

import { removeAccessToken } from "../features/auth/authStorage"

const navigation = ["Dashboard", "Produk", "Pesanan", "Persediaan"]

export function DashboardPage() {
	const navigate = useNavigate()

	function handleLogout() {
		removeAccessToken()
		navigate("/login", { replace: true })
	}

	return (
		<main className="grid min-h-svh grid-cols-1 bg-[#f6f7f4] lg:grid-cols-[17rem_1fr]">
			<aside className="flex flex-col bg-[#1f5138] p-6 text-white">
				<div>
					<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#c4dccb]">INVENTORY SYSTEM</p>
					<h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em]">Stockflow</h1>
				</div>

				<nav className="mt-12 grid gap-1" aria-label="Menu utama">
					{navigation.map((item) => (
						<span key={item} className={item === "Dashboard" ? "rounded-md bg-white/12 px-3 py-2 text-sm font-bold" : "rounded-md px-3 py-2 text-sm text-[#c4dccb]"}>
							{item}
						</span>
					))}
				</nav>

				<button type="button" onClick={handleLogout} className="mt-auto rounded-md border border-white/20 px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
					Keluar
				</button>
			</aside>

			<section className="px-6 py-8 sm:px-10 sm:py-12">
				<p className="font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">DASHBOARD</p>
				<h2 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[#161a17]">Selamat datang</h2>
				<p className="mt-3 max-w-md text-[#5e665f]">Pilih Produk, Pesanan, atau Persediaan dari menu untuk mulai bekerja.</p>
			</section>
		</main>
	)
}
