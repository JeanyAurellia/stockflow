import type { PropsWithChildren } from "react"
import { NavLink, useNavigate } from "react-router"

import { removeAccessToken } from "../features/auth/authStorage"

const linkClassName = ({ isActive }: { isActive: boolean }) =>
	`rounded-md px-3 py-2 text-sm ${isActive ? "bg-white/12 font-bold text-white" : "text-[#c4dccb] hover:bg-white/8 hover:text-white"}`

export function DashboardLayout({ children }: PropsWithChildren) {
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
					<NavLink to="/dashboard" className={linkClassName}>Dashboard</NavLink>
					<NavLink to="/products" className={linkClassName}>Produk</NavLink>
					<NavLink to="/orders" className={linkClassName}>Pesanan</NavLink>
					<span className="rounded-md px-3 py-2 text-sm text-[#c4dccb]/60">Persediaan</span>
				</nav>

				<button type="button" onClick={handleLogout} className="mt-auto rounded-md border border-white/20 px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
					Keluar
				</button>
			</aside>

			{children}
		</main>
	)
}
