const express=require('express');
const multer=require('multer');
const {get,add,list}=require('./datastore');
const router=express.Router();
const upload=multer({storage:multer.memoryStorage()});

router.get('/files/:id',(req,res)=>{ res.json({url:'s3://file/'+req.params.id}); });
router.post('/files/upload',upload.single('file'),(req,res)=>{ const file=add('files',{name:req.file?.originalname||'file',size:req.file?.size||0}); res.json(file); });
router.get('/resources',(req,res)=>{ res.json([{id:'r1',title:'Welcome PDF'}]); });
router.get('/timetable',(req,res)=>{ res.json({}); });

module.exports=router;

