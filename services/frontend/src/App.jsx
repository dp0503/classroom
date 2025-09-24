import * as React from 'react'
import { Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

export default function App() {
    return (
        <AuthProvider>
        <Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						Classroom
					</Typography>
					<Link to="/student">Student</Link>
					<Link to="/teacher" style={{ marginLeft: 16 }}>Teacher</Link>
					<Link to="/admin" style={{ marginLeft: 16 }}>Admin</Link>
				</Toolbar>
			</AppBar>
			<Container sx={{ mt: 3 }}>
				<Typography>Welcome to Classroom</Typography>
			</Container>
        </Box>
        </AuthProvider>
	)
}
