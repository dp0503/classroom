const { Router } = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');
const { loadClass, requireClassOwnerOrAdmin } = require('../middleware/classAccess');

const router = Router();

// Create a class (TEACHER or ADMIN)
const createClassSchema = z.object({ name: z.string().min(1), code: z.string().min(3) });
router.post('/', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
	const parsed = createClassSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { name, code } = parsed.data;
	try {
		const cls = await prisma.class.create({ data: { name, code, teacherId: req.user.sub } });
		return res.status(201).json(cls);
	} catch (e) {
		if (e.code === 'P2002') return res.status(409).json({ error: 'Class code already exists' });
		return res.status(500).json({ error: 'Failed to create class' });
	}
});

// Enroll a student into a class (TEACHER or ADMIN)
const enrollSchema = z.object({ userId: z.string().uuid(), roleInClass: z.enum(['STUDENT', 'TEACHING_ASSISTANT']).default('STUDENT') });
router.post('/:classId/enroll', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
	const { classId } = req.params;
	const parsed = enrollSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { userId, roleInClass } = parsed.data;
	try {
		const enrollment = await prisma.classEnrollment.create({ data: { classId, userId, roleInClass } });
		return res.status(201).json(enrollment);
	} catch (e) {
		if (e.code === 'P2002') return res.status(409).json({ error: 'User already enrolled' });
		return res.status(500).json({ error: 'Failed to enroll' });
	}
});

// Get my classes (any authenticated user)
router.get('/me', requireAuth, async (req, res) => {
	const classes = await prisma.classEnrollment.findMany({
		where: { userId: req.user.sub },
		include: { class: true },
	});
	return res.json(classes.map(e => e.class));
});

// List class roster (TEACHER/ADMIN in that class)
router.get('/:classId/roster', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
	const { classId } = req.params;
	const roster = await prisma.classEnrollment.findMany({ where: { classId }, include: { user: true } });
	return res.json(roster.map(r => ({ id: r.user.id, name: r.user.name, email: r.user.email, roleInClass: r.roleInClass })));
});

module.exports = router;


