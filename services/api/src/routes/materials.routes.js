const { Router } = require('express');
const multer = require('multer');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { uploadToS3 } = require('../lib/s3');
const { requireAuth, requireRole } = require('../middleware/auth');
const { loadClass, requireEnrollmentOrOwnerOrAdmin, requireClassOwnerOrAdmin } = require('../middleware/classAccess');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const uploadSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	category: z.enum(['ASSIGNMENT', 'QUIZ', 'READING', 'RESOURCE'])
});

router.post('/:classId/upload', requireAuth, loadClass, requireClassOwnerOrAdmin, upload.single('file'), async (req, res) => {
	const { classId } = req.params;
	const parsed = uploadSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	if (!req.file) return res.status(400).json({ error: 'File is required' });
	const { title, description, category } = parsed.data;
	const key = `classes/${classId}/materials/${Date.now()}_${req.file.originalname}`;
	await uploadToS3({ bucket: process.env.AWS_S3_BUCKET, key, body: req.file.buffer, contentType: req.file.mimetype });
	const material = await prisma.material.create({
		data: { classId, title, description, category, s3Key: key, createdById: req.user.sub }
	});
	return res.status(201).json(material);
});

router.get('/:classId', requireAuth, loadClass, requireEnrollmentOrOwnerOrAdmin, async (req, res) => {
	const { classId } = req.params;
	const materials = await prisma.material.findMany({ where: { classId }, orderBy: { createdAt: 'desc' } });
	return res.json(materials);
});

module.exports = router;


