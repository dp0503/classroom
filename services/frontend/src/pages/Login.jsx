import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export default function Login() {
	const { login } = React.useContext(AuthContext)
	const navigate = useNavigate()
	const [email, setEmail] = React.useState('admin@example.com')
	const [password, setPassword] = React.useState('Passw0rd!')
	const [error, setError] = React.useState('')

	async function onSubmit(e) {
		e.preventDefault()
		setError('')
		try {
			await login(email, password)
			navigate('/student')
		} catch (err) {
			setError('Login failed')
		}
	}

	return (
		<Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 360, m: '40px auto' }}>
			<Stack spacing={2}>
				<Typography variant="h5">Login</Typography>
				<TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
				<TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
				{error ? <Typography color="error">{error}</Typography> : null}
				<Button type="submit" variant="contained">Sign in</Button>
			</Stack>
		</Box>
	)
}


