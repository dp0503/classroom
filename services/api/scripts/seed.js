require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertUser({ email, name, role, password }) {
	const hash = await bcrypt.hash(password, 10);
	return prisma.user.upsert({
		where: { email },
		update: { name, role, password: hash },
		create: { email, name, role, password: hash },
	});
}

async function main() {
	const users = [
        { email: 'student@example.com', name: 'Student One', role: 'STUDENT', password: 'Student#2025' },
        { email: 'teacher@example.com', name: 'Teacher One', role: 'TEACHER', password: 'Teacher#2025' },
        { email: 'admin@example.com', name: 'Admin One', role: 'ADMIN', password: 'Admin#2025' },
	];

	for (const u of users) {
		await upsertUser(u);
	}

	console.log('Seeded users:');
	users.forEach(u => console.log(`${u.role}: ${u.email} / ${u.password}`));
}

main()
	.catch(err => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


