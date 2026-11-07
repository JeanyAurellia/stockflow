const apiURL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
	status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = "ApiError"
		this.status = status
	}
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
	if (!apiURL) {
		throw new Error("VITE_API_URL is not configured")
	}

	const response = await fetch(`${apiURL}${path}`, {
		...options,
		headers: {
			Accept: "application/json",
			...options.headers,
		},
	})

	if (!response.ok) {
		const message = (await response.text()) || "API request failed"
		throw new ApiError(message, response.status)
	}

	return response.json() as Promise<T>
}
