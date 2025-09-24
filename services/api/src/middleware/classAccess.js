const { prisma } = require('../lib/prisma');

async function loadClass(req, res, next) {
	const classId = req.params.classId || req.params.id || req.body.classId;
	if (!classId) return res.status(400).json({ error: 'classId is required' });
	const cls = await prisma.class.findUnique({ where: { id: classId } });
	if (!cls) return res.status(404).json({ error: 'Class not found' });
	req.classroom = cls;
	return next();
}

function requireClassOwnerOrAdmin(req, res, next) {
	const user = req.user;
	const cls = req.classroom;
	if (!user || !cls) return res.status(500).json({ error: 'Context not loaded' });
	if (user.role === 'ADMIN' || cls.teacherId === user.sub) return next();
	return res.status(403).json({ error: 'Forbidden' });
}

async function requireEnrollmentOrOwnerOrAdmin(req, res, next) {
	const user = req.user;
	const cls = req.classroom;
	if (!user || !cls) return res.status(500).json({ error: 'Context not loaded' });
	if (user.role === 'ADMIN' || cls.teacherId === user.sub) return next();
	const enrollment = await prisma.classEnrollment.findUnique({ where: { classId_userId: { classId: cls.id, userId: user.sub } } });
	if (enrollment) return next();
	return res.status(403).json({ error: 'Forbidden' });
}

module.exports = { loadClass, requireClassOwnerOrAdmin, requireEnrollmentOrOwnerOrAdmin };


