import * as React from 'react'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { api } from '../api/client'

export default function StudentDashboard() {
	const [classes, setClasses] = React.useState([])
	React.useEffect(() => {
		api.get('/classes/me').then(({ data }) => setClasses(data))
	}, [])
	return (
		<>
			<Typography variant="h5">Student Dashboard</Typography>
			<List>
				{classes.map(c => (
					<ListItem key={c.id} disableGutters>
						<ListItemText primary={c.name} secondary={`Code: ${c.code}`} />
					</ListItem>
				))}
			</List>
		</>
	)
}
