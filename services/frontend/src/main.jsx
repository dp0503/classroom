import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
	{ path: '/', element: <App /> },
	{ path: '/login', element: <Login /> },
	{ path: '/student', element: <ProtectedRoute><StudentDashboard /></ProtectedRoute> },
	{ path: '/teacher', element: <ProtectedRoute><TeacherDashboard /></ProtectedRoute> },
	{ path: '/admin', element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
])

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)
