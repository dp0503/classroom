const express=require('express');
const {list,add,update}=require('./datastore');
const {log}=require('./audit');
const router=express.Router();

router.get('/dashboard',(req,res)=>{
  const classes=list('classes',c=>c.teacher_id===req.user.id);
  const today=new Date().toISOString().slice(0,10);
  const attendance=list('attendance',a=>a.date===today);
  res.json({classesToday:classes.length,attendanceToday:attendance.length,pendingGrading:0});
});

router.post('/classes',(req,res)=>{
  const join_code=(Math.random()*1e6|0).toString().padStart(6,'0');
  const cls=add('classes',{name:req.body.name||'New Class',teacher_id:req.user.id,join_code,schedule:{},created_at:new Date().toISOString()});
  log('CREATE_CLASS',req.user.id,{classId:cls.id});
  res.json(cls);
});
router.get('/classes',(req,res)=>{ res.json(list('classes',c=>c.teacher_id===req.user.id)); });
router.get('/classes/:id',(req,res)=>{ res.json(list('classes',c=>c.id===req.params.id)[0]||{}); });
router.get('/classes/:id/members',(req,res)=>{ res.json(list('classMembers',m=>m.class_id===req.params.id)); });

// Materials and comments
router.post('/classes/:id/materials',(req,res)=>{
  const mat=add('classMaterials',{class_id:req.params.id,title:req.body.title||'Material',url:req.body.url||'',created_at:new Date().toISOString(),created_by:req.user.id});
  res.json(mat);
});
router.get('/classes/:id/materials',(req,res)=>{ res.json(list('classMaterials',m=>m.class_id===req.params.id)); });
router.post('/classes/:id/comments',(req,res)=>{
  const com=add('classComments',{class_id:req.params.id,text:req.body.text||'',user_id:req.user.id,created_at:new Date().toISOString()});
  res.json(com);
});
router.get('/classes/:id/comments',(req,res)=>{ res.json(list('classComments',m=>m.class_id===req.params.id)); });

router.post('/classes/:id/attendance/live',(req,res)=>{
  // stub for face recognition trigger
  res.json({ok:true,started:true});
});
router.post('/classes/:id/attendance/manual',(req,res)=>{
  const {student_id,status,confidence_score}=req.body||{};
  const rec=add('attendance',{class_id:req.params.id,student_id,status,status_ts:new Date().toISOString(),date:new Date().toISOString().slice(0,10),confidence_score:confidence_score||null});
  log('ATTENDANCE_MANUAL',req.user.id,{classId:req.params.id,student_id,status});
  res.json(rec);
});
router.get('/classes/:id/attendance',(req,res)=>{ res.json(list('attendance',a=>a.class_id===req.params.id)); });

router.post('/classes/:id/assignments',(req,res)=>{
  const asg=add('assignments',{class_id:req.params.id,title:req.body.title||'Untitled',description:req.body.description||'',due_date:req.body.due_date||null,created_at:new Date().toISOString()});
  res.json(asg);
});
router.get('/classes/:id/assignments',(req,res)=>{ res.json(list('assignments',a=>a.class_id===req.params.id)); });
router.put('/assignments/:id',(req,res)=>{ res.json(update('assignments',req.params.id,req.body||{})); });
router.delete('/assignments/:id',(req,res)=>{ res.json({ok:true}); });
router.post('/assignments/:id/grade',(req,res)=>{
  const {student_id,grade,feedback}=req.body||{};
  const rec=add('submissions',{assignment_id:req.params.id,student_id,grade,feedback,submitted_at:new Date().toISOString()});
  res.json(rec);
});

router.get('/classes/:id/reports/attendance',(req,res)=>{
  // simple aggregate
  const rows=list('attendance',a=>a.class_id===req.params.id);
  const present=rows.filter(r=>r.status==='present').length;
  res.json({total:rows.length,present,percent:rows.length?Math.round(present/rows.length*100):0});
});
router.get('/classes/:id/reports/performance',(req,res)=>{
  res.json({avg:0});
});

router.get('/messages',(req,res)=>{ res.json([]); });
router.post('/messages',(req,res)=>{ res.json({ok:true}); });

module.exports=router;

