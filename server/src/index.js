const express=require('express');
const cors=require('cors');
const {errorHandler,notFound}=require('./error');
const auth=require('./auth');
const rbac=require('./rbac');
const studentRoutes=require('./routes.student');
const teacherRoutes=require('./routes.teacher');
const adminRoutes=require('./routes.admin');
const sharedRoutes=require('./routes.shared');

require('dotenv').config?.();
const app=express();
app.use(cors());
app.use(express.json());

// auth
app.post('/auth/register',auth.register);
app.post('/auth/login',auth.login);
app.post('/auth/logout',auth.logout);
app.post('/auth/refresh',auth.refresh);
app.post('/auth/oauth',auth.oauth); // provider,id_token,email,name,role
app.get('/auth/verify',auth.verifyEmail);
app.post('/auth/2fa/verify',rbac.requireRole('admin'),auth.verify2fa);
app.get('/auth/me',auth.requireAuth,auth.me);

// student
app.use('/student',auth.requireAuth,rbac.requireRole('student'),studentRoutes);
// teacher
app.use('/teacher',auth.requireAuth,rbac.requireRole('teacher'),teacherRoutes);
// admin
app.use('/admin',auth.requireAuth,rbac.requireRole('admin'),adminRoutes);
// shared
app.use('/',auth.requireAuth,sharedRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT||4000;
app.listen(PORT,()=>console.log(`API listening on :${PORT}`));

