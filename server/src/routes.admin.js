const express=require('express');
const {list,add,get,update,remove}=require('./datastore');
const bcrypt=require('bcryptjs');
const {log}=require('./audit');
const router=express.Router();

router.get('/users',(req,res)=>{ res.json(list('users')); });
router.post('/users',async (req,res)=>{ 
  const {name,email,password,role='student'}=req.body||{};
  if(!email||!password) return res.status(400).json({error:'Email & password required'});
  if(list('users',u=>u.email===email).length) return res.status(409).json({error:'Email exists'});
  const password_hash=await bcrypt.hash(password,10);
  const u=add('users',{name,email,role,password_hash,created_at:new Date().toISOString(),verified:true});
  log('CREATE_USER',req.user.id,{userId:u.id,email,role}); res.json({id:u.id,name,email,role});
});
router.get('/users/:id',(req,res)=>{ res.json(get('users',req.params.id)||{}); });
router.put('/users/:id',(req,res)=>{ const out=update('users',req.params.id,req.body||{}); log('UPDATE_USER',req.user.id,{userId:req.params.id,changes:req.body||{}}); res.json(out); });
router.delete('/users/:id',(req,res)=>{ remove('users',req.params.id); log('DELETE_USER',req.user.id,{userId:req.params.id}); res.json({ok:true}); });

router.get('/dashboard',(req,res)=>{
  res.json({activeUsers:list('users').length,backups:{status:'OK'},storage:{usedMB:12}});
});

router.get('/reports/attendance',(req,res)=>{ res.json({}); });
router.get('/reports/performance',(req,res)=>{ res.json({}); });
router.get('/reports/audit',(req,res)=>{ res.json(list('auditLogs')); });
router.post('/backups/run',(req,res)=>{ res.json({started:true}); });
router.get('/backups/status',(req,res)=>{ res.json([{id:'b1',date:new Date().toISOString(),status:'OK'}]); });
router.get('/audit/logs',(req,res)=>{ res.json(list('auditLogs')); });
router.post('/audit/export',(req,res)=>{ res.json({url:'s3://export.csv'}); });

module.exports=router;

