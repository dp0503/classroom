const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');

const router = Router();

const registerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).default('STUDENT')
});

router.post('/register', async (req, res) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { name, email, password, role } = parsed.data;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return res.status(409).json({ error: 'Email already registered' });
	const hash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({ data: { name, email, password: hash, role } });
	return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res) => {
	try {
		const parsed = loginSchema.safeParse(req.body);
		if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
		const { email, password } = parsed.data;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const secret = process.env.JWT_SECRET || 'dev_secret';
		const token = jwt.sign(
			{ sub: user.id, role: user.role, email: user.email },
			secret,
			{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
		);
		return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
	} catch (err) {
		return res.status(500).json({ error: 'Login failed' });
	}
});

module.exports = router;


