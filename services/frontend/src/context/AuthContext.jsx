import * as React from 'react'
import { api, setAuthToken } from '../api/client'

export const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = React.useState(null)
	const [token, setToken] = React.useState(null)

	React.useEffect(() => {
		const saved = localStorage.getItem('auth')
		if (saved) {
			const { token: t, user: u } = JSON.parse(saved)
			setToken(t)
			setUser(u)
			setAuthToken(t)
		}
	}, [])

	async function login(email, password) {
		const { data } = await api.post('/auth/login', { email, password })
		setUser(data.user)
		setToken(data.token)
		setAuthToken(data.token)
		localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }))
	}

	function logout() {
		setUser(null)
		setToken(null)
		setAuthToken(null)
		localStorage.removeItem('auth')
	}

	return (
		<AuthContext.Provider value={{ user, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}


