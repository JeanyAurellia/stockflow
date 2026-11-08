import type { User } from "./types"

const accessTokenKey = "stockflow_access_token"
const currentUserKey = "stockflow_current_user"

export function saveAccessToken(token: string) {
	localStorage.setItem(accessTokenKey, token)
}

export function saveCurrentUser(user: User) {
	localStorage.setItem(currentUserKey, JSON.stringify(user))
}

export function getAccessToken() {
	return localStorage.getItem(accessTokenKey)
}

export function getCurrentUser(): User | null {
	const storedUser = localStorage.getItem(currentUserKey)
	if (!storedUser) return null

	try {
		return JSON.parse(storedUser) as User
	} catch {
		return null
	}
}

export function removeAccessToken() {
	localStorage.removeItem(accessTokenKey)
	localStorage.removeItem(currentUserKey)
}
