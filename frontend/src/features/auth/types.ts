export type UserRole = "admin" | "customer"

export type User = {
	id: string
	email: string
	full_name: string
	role: UserRole
	created_at: string
}

export type LoginRequest = {
	email: string
	password: string
}

export type LoginResponse = {
	access_token: string
	user: User
}
