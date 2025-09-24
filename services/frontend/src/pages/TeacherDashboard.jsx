import * as React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { api } from '../api/client'

export default function TeacherDashboard() {
	const [classes, setClasses] = React.useState([])
	const [name, setName] = React.useState('')
	const [code, setCode] = React.useState('')

	async function loadMyClasses() {
		const { data } = await api.get('/classes/me')
		setClasses(data)
	}

	async function createClass() {
		if (!name || !code) return
		await api.post('/classes', { name, code })
		setName(''); setCode('')
		loadMyClasses()
	}

	React.useEffect(() => { loadMyClasses() }, [])

	return (
		<Stack spacing={2}>
			<Typography variant="h5">Teacher Dashboard</Typography>
			<Stack direction="row" spacing={2}>
				<TextField label="Class name" value={name} onChange={e => setName(e.target.value)} />
				<TextField label="Code" value={code} onChange={e => setCode(e.target.value)} />
				<Button variant="contained" onClick={createClass}>Create</Button>
			</Stack>
			<List>
				{classes.map(c => (
					<ListItem key={c.id} disableGutters>
						<ListItemText primary={c.name} secondary={`Code: ${c.code}`} />
					</ListItem>
				))}
			</List>
		</Stack>
	)
}
