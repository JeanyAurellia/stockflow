const accessTokenKey = "stockflow_access_token"

export function saveAccessToken(token: string) {
	localStorage.setItem(accessTokenKey, token)
}

export function getAccessToken() {
	return localStorage.getItem(accessTokenKey)
}

export function removeAccessToken() {
	localStorage.removeItem(accessTokenKey)
}
