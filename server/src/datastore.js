const {v4:uuid}=require('uuid');
const fs=require('fs');
const path=require('path');
const bcrypt=require('bcryptjs');
const DATA_FILE=path.join(__dirname,'..','data.json');
const ADMIN_EMAIL='2005dp0503@gmail.com';
const ADMIN_PASSWORD_HASH=bcrypt.hashSync('devarsh@22',10);
const DEMO_STUDENT_EMAIL='devarsh@gmail.com';
const DEMO_STUDENT_PASS_HASH=bcrypt.hashSync('devarsh',10);
const DEMO_TEACHER_EMAIL='dhruv@gmail.com';
const DEMO_TEACHER_PASS_HASH=bcrypt.hashSync('dhruv',10);
function ensure(){
  if(!fs.existsSync(DATA_FILE)){
    const seed={
      users:[{id:'u-admin',name:'Admin',email:'2005dp0503@gmail.com',role:'admin',password_hash:bcrypt.hashSync('devarsh@22',10),twofa_enabled:true,verified:true}],
      classes:[],classMembers:[],classMaterials:[],classComments:[],attendance:[],assignments:[],submissions:[],notifications:[],auditLogs:[],verificationTokens:[]
    };
    fs.writeFileSync(DATA_FILE,JSON.stringify(seed,null,2));
  }
}
function read(){
  ensure();
  const db=JSON.parse(fs.readFileSync(DATA_FILE,'utf-8'));
  // Ensure default admin exists
  if(!db.users) db.users=[];
  let admin=db.users.find(u=>u.email===ADMIN_EMAIL);
  if(!admin){
    admin={id:'u-admin',name:'Admin',email:ADMIN_EMAIL,role:'admin',password_hash:ADMIN_PASSWORD_HASH,verified:true,twofa_enabled:true,created_at:new Date().toISOString()};
    db.users.push(admin);
    write(db);
  }
  // Normalize existing admin to known password and verified state
  if(admin){
    const ok=bcrypt.compareSync('devarsh@22',admin.password_hash||'');
    if(!ok || !admin.verified){
      admin.password_hash=ADMIN_PASSWORD_HASH;
      admin.verified=true;
      write(db);
    }
  }
  // Ensure demo student exists and is normalized
  let stu=db.users.find(u=>u.email===DEMO_STUDENT_EMAIL);
  if(!stu){
    stu={id:'u-student-demo',name:'Demo Student',email:DEMO_STUDENT_EMAIL,role:'student',password_hash:DEMO_STUDENT_PASS_HASH,verified:true,created_at:new Date().toISOString()};
    db.users.push(stu);
    write(db);
  } else {
    const stuOk=bcrypt.compareSync('devarsh',stu.password_hash||'');
    if(!stuOk || !stu.verified){
      stu.password_hash=DEMO_STUDENT_PASS_HASH;
      stu.verified=true;
      write(db);
    }
  }
  // Ensure demo teacher exists and is normalized
  let tch=db.users.find(u=>u.email===DEMO_TEACHER_EMAIL);
  if(!tch){
    tch={id:'u-teacher-demo',name:'Demo Teacher',email:DEMO_TEACHER_EMAIL,role:'teacher',password_hash:DEMO_TEACHER_PASS_HASH,verified:true,created_at:new Date().toISOString()};
    db.users.push(tch);
    write(db);
  } else {
    const tchOk=bcrypt.compareSync('dhruv',tch.password_hash||'');
    if(!tchOk || !tch.verified){
      tch.password_hash=DEMO_TEACHER_PASS_HASH;
      tch.verified=true;
      write(db);
    }
  }
  return db;
}
function write(db){ fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2)); }
function add(collection,item){ const db=read(); const id=item.id||uuid(); const rec={id,...item}; db[collection].push(rec); write(db); return rec; }
function list(collection,filterFn=()=>true){ const db=read(); return db[collection].filter(filterFn); }
function get(collection,id){ const db=read(); return db[collection].find(x=>x.id===id); }
function update(collection,id,changes){ const db=read(); const it=db[collection].find(x=>x.id===id); if(!it) return null; Object.assign(it,changes); write(db); return it; }
function remove(collection,id){ const db=read(); const i=db[collection].findIndex(x=>x.id===id); if(i>-1){ db[collection].splice(i,1); write(db);} }
module.exports={add,list,get,update,remove};

