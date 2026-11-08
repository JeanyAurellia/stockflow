import { useState, type FormEvent } from "react"

import { login } from "../features/auth/api"
import { saveAccessToken } from "../features/auth/authStorage"
import { ApiError } from "../lib/apiClient"

export function LoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setIsSubmitting(true)

		try {
			const response = await login({ email, password })
			saveAccessToken(response.access_token)
			setIsLoggedIn(true)
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				setError("Email atau password salah. Periksa lalu coba lagi.")
			} else {
				setError("Tidak dapat terhubung ke server. Coba lagi.")
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="grid min-h-svh grid-cols-1 lg:grid-cols-[5fr_7fr]">
			<section className="relative hidden overflow-hidden bg-[#286545] px-[clamp(2.5rem,5vw,5.5rem)] py-14 text-white lg:flex lg:min-h-svh lg:flex-col lg:justify-end" aria-labelledby="stockflow-title">
				<svg className="absolute inset-0 h-full w-full text-[#c8e6d0]/15" viewBox="0 0 100 100" fill="none" aria-hidden="true">
					<path d="M10 25 50 5l40 20-40 20Z" stroke="currentColor" strokeWidth="0.45" />
					<path d="M10 47 50 27l40 20-40 20Z" stroke="currentColor" strokeWidth="0.45" />
					<path d="M10 69 50 49l40 20-40 20Z" stroke="currentColor" strokeWidth="0.45" />
					<path d="M50 25v44" stroke="currentColor" strokeWidth="0.45" />
				</svg>

				<div className="relative z-10 max-w-sm">
					<p className="mb-2 font-mono text-xs font-bold tracking-[0.12em] text-[#d7ebdc]">INVENTORY SYSTEM</p>
					<h1 id="stockflow-title" className="text-6xl font-extrabold tracking-[-0.055em]">Stockflow</h1>
					<p className="mt-5 max-w-xs text-[1.05rem] leading-relaxed text-[#d7ebdc]">Kelola persediaan dan pesanan dari satu tempat.</p>
				</div>
			</section>

			<section className="flex items-center justify-center bg-white px-8 py-16 sm:px-12" aria-labelledby="login-title">
				<div className="w-full max-w-sm">
					<svg className="mb-8 h-11 w-11 text-[#2c6747]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="m4 7 8-4 8 4-8 4Z" />
						<path d="m4 12 8 4 8-4" />
						<path d="m4 17 8 4 8-4" />
					</svg>

					<p className="mb-2 font-mono text-xs font-bold tracking-[0.12em] text-[#5a7261]">SELAMAT DATANG</p>
					<h2 id="login-title" className="text-5xl font-bold tracking-[-0.055em] text-[#161a17]">Masuk</h2>
					<p className="mt-3 text-sm text-[#5e665f]">Gunakan akun Stockflow untuk masuk.</p>

					<form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
						<div className="grid gap-1.5">
							<label htmlFor="email" className="text-xs font-bold text-[#161a17]">Email</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="nama@email.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								className="min-h-11 w-full rounded-md border border-[#cdd3ce] px-3.5 text-sm text-[#161a17] outline-none placeholder:text-[#89908b] focus:border-[#3c8058] focus:ring-2 focus:ring-[#cde6d5]"
							/>
						</div>

						<div className="grid gap-1.5">
							<label htmlFor="password" className="text-xs font-bold text-[#161a17]">Password</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="Masukkan password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
									className="min-h-11 w-full rounded-md border border-[#cdd3ce] py-0 pr-12 pl-3.5 text-sm text-[#161a17] outline-none placeholder:text-[#89908b] focus:border-[#3c8058] focus:ring-2 focus:ring-[#cde6d5]"
								/>
								<button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute top-1/2 right-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded text-[#3c8058] hover:bg-[#edf5ef] focus:outline-none focus:ring-2 focus:ring-[#3c8058]" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
										<circle cx="12" cy="12" r="3" />
										{showPassword && <path d="m3 3 18 18" />}
									</svg>
								</button>
							</div>
						</div>

						{error && <p className="text-sm leading-snug text-[#9d3328]">{error}</p>}
						{isLoggedIn && <p className="text-sm leading-snug text-[#276541]">Kamu sudah masuk.</p>}

						<button type="submit" disabled={isSubmitting} className="mt-1 min-h-11 rounded-md border border-[#1f5738] bg-[#3b8159] px-4 text-sm font-bold text-white shadow-sm shadow-[#1f5738]/30 hover:bg-[#2c6c49] focus:outline-none focus:ring-2 focus:ring-[#3c8058] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65">
							{isSubmitting ? "Memeriksa akun..." : "Masuk"}
						</button>
					</form>
				</div>
			</section>
		</main>
	)
}
