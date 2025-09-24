const { Router } = require('express');
const authRoutes = require('./auth.routes');
const classRoutes = require('./classes.routes');
const materialRoutes = require('./materials.routes');
const attendanceRoutes = require('./attendance.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/materials', materialRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;


