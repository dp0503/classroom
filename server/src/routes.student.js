const express=require('express');
const {list,get,add,update}=require('./datastore');
const router=express.Router();

router.get('/dashboard',(req,res)=>{
  const studentId=req.user.id;
  const attendance=list('attendance',a=>a.student_id===studentId);
  const present=attendance.filter(a=>a.status==='present').length;
  const percent=attendance.length?Math.round((present/attendance.length)*100):0;
  const assignments=list('assignments');
  const notifications=list('notifications',n=>n.user_id===studentId).slice(-10);
  res.json({attendancePercent:percent,upcomingAssignments:assignments.slice(0,5),notifications});
});

router.get('/profile',(req,res)=>{ res.json({id:req.user.id}); });
router.put('/profile',(req,res)=>{ res.json({ok:true}); });

router.get('/attendance',(req,res)=>{
  const studentId=req.user.id;
  res.json(list('attendance',a=>a.student_id===studentId));
});

router.get('/assignments',(req,res)=>{ res.json(list('assignments')); });
router.get('/assignments/:id',(req,res)=>{ res.json(get('assignments',req.params.id)||{}); });
router.post('/assignments/:id/submit',(req,res)=>{
  const submission=add('submissions',{assignment_id:req.params.id,student_id:req.user.id,file_url:'s3://placeholder',submitted_at:new Date().toISOString()});
  res.json(submission);
});
router.get('/submissions',(req,res)=>{ res.json(list('submissions',s=>s.student_id===req.user.id)); });

router.get('/notifications',(req,res)=>{ res.json(list('notifications',n=>n.user_id===req.user.id)); });
router.put('/notifications/:id/read',(req,res)=>{ res.json(update('notifications',req.params.id,{read:true})); });

router.get('/messages',(req,res)=>{ res.json([]); });
router.post('/messages',(req,res)=>{ res.json({ok:true}); });

// Join classes and view materials/comments
router.post('/classes/join',(req,res)=>{
  const {code}=req.body||{}; if(!code) return res.status(400).json({error:'Join code required'});
  const cls=list('classes',c=>c.join_code===code)[0]; if(!cls) return res.status(404).json({error:'Class not found'});
  add('classMembers',{class_id:cls.id,student_id:req.user.id,joined_at:new Date().toISOString()});
  res.json({ok:true,classId:cls.id});
});
router.get('/classes',(req,res)=>{ res.json(list('classMembers',m=>m.student_id===req.user.id)); });
router.get('/classes/:id/materials',(req,res)=>{ res.json(list('classMaterials',m=>m.class_id===req.params.id)); });
router.get('/classes/:id/comments',(req,res)=>{ res.json(list('classComments',m=>m.class_id===req.params.id)); });

module.exports=router;

