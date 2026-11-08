import { apiClient } from "../../lib/apiClient"
import type { LoginRequest, LoginResponse } from "./types"

export function login(request: LoginRequest): Promise<LoginResponse> {
	return apiClient<LoginResponse>("/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	})
}
