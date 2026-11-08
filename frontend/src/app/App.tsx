import type { PropsWithChildren } from "react"
import { Navigate, Route, Routes } from "react-router"

import { getAccessToken, getCurrentUser } from "../features/auth/authStorage"
import { DashboardPage } from "../pages/DashboardPage"
import { AdminCatalogPage } from "../pages/AdminCatalogPage"
import { CreateOrderPage } from "../pages/CreateOrderPage"
import { LoginPage } from "../pages/LoginPage"
import { OrdersPage } from "../pages/OrdersPage"
import { ProductDetailPage } from "../pages/ProductDetailPage"
import { ProductsPage } from "../pages/ProductsPage"

function ProtectedRoute({ children }: PropsWithChildren) {
	if (!getAccessToken()) {
		return <Navigate to="/login" replace />
	}

	return children
}

function AdminRoute({ children }: PropsWithChildren) {
	if (getCurrentUser()?.role !== "admin") {
		return <Navigate to="/dashboard" replace />
	}

	return children
}

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
			<Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
			<Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
			<Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
			<Route path="/orders/new" element={<ProtectedRoute><CreateOrderPage /></ProtectedRoute>} />
			<Route path="/admin/catalog" element={<ProtectedRoute><AdminRoute><AdminCatalogPage /></AdminRoute></ProtectedRoute>} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	)
}
