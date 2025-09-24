const { Router } = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');
const { loadClass, requireEnrollmentOrOwnerOrAdmin, requireClassOwnerOrAdmin } = require('../middleware/classAccess');

const router = Router();

const markSchema = z.object({
	studentId: z.string().uuid(),
	date: z.coerce.date(),
	method: z.enum(['FACE_RECOGNITION', 'MANUAL', 'ID_CHECKIN'])
});

// Manual / ID-based marking by TEACHER or ADMIN
router.post('/:classId/mark', requireAuth, loadClass, requireClassOwnerOrAdmin, async (req, res) => {
	const { classId } = req.params;
	const parsed = markSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { studentId, date, method } = parsed.data;
	try {
		const record = await prisma.attendance.create({ data: { classId, studentId, date, method } });
		return res.status(201).json(record);
	} catch (e) {
		if (e.code === 'P2002') return res.status(409).json({ error: 'Already marked' });
		return res.status(500).json({ error: 'Failed to mark attendance' });
	}
});

// Get attendance for a class (teacher/admin) or self view for students
router.get('/:classId', requireAuth, loadClass, requireEnrollmentOrOwnerOrAdmin, async (req, res) => {
	const { classId } = req.params;
	if (req.user.role === 'STUDENT') {
		const mine = await prisma.attendance.findMany({ where: { classId, studentId: req.user.sub }, orderBy: { date: 'desc' } });
		return res.json(mine);
	}
	const all = await prisma.attendance.findMany({ where: { classId }, orderBy: { date: 'desc' } });
	return res.json(all);
});

module.exports = router;


