import type { PropsWithChildren } from "react"
import { Navigate, Route, Routes } from "react-router"

import { getAccessToken } from "../features/auth/authStorage"
import { DashboardPage } from "../pages/DashboardPage"
import { LoginPage } from "../pages/LoginPage"
import { OrdersPage } from "../pages/OrdersPage"
import { ProductsPage } from "../pages/ProductsPage"

function ProtectedRoute({ children }: PropsWithChildren) {
	if (!getAccessToken()) {
		return <Navigate to="/login" replace />
	}

	return children
}

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
			<Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
			<Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	)
}
