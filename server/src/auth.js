const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const {add,get,list,update}=require('./datastore');
const {v4:uuid}=require('uuid');

const JWT_SECRET=process.env.JWT_SECRET||'dev-secret';

function sign(user){ return jwt.sign({id:user.id,role:user.role},JWT_SECRET,{expiresIn:'1h'}); }

function requireAuth(req,res,next){
  const hdr=req.headers.authorization||'';
  const token=hdr.startsWith('Bearer ')?hdr.slice(7):null;
  if(!token) return res.status(401).json({error:'Unauthorized'});
  try{ const payload=jwt.verify(token,JWT_SECRET); req.user=payload; next(); }catch(e){ return res.status(401).json({error:'Unauthorized'}); }
}

async function register(req,res){
  // Public self-registration disabled. Use Admin endpoint /admin/users
  return res.status(403).json({error:'Registration disabled. Ask admin to create your account.'});
}

async function login(req,res){
  const {email,password}=req.body||{};
  const user=list('users',u=>u.email===email)[0];
  if(!user) return res.status(401).json({error:'Invalid credentials'});
  const ok=user.password_hash?await bcrypt.compare(password,user.password_hash):password==='admin';
  if(!ok) return res.status(401).json({error:'Invalid credentials'});
  if(!user.verified) return res.status(403).json({error:'Email not verified'});
  return res.json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}

function logout(req,res){ return res.json({ok:true}); }
function refresh(req,res){
  if(!req.user) return res.status(401).json({error:'Unauthorized'});
  const user=get('users',req.user.id); if(!user) return res.status(401).json({error:'Unauthorized'});
  return res.json({token:sign(user)});
}

function verify2fa(req,res){
  // stub: accept any 6-digit code for admin
  const {otp}=req.body||{}; if(!otp||String(otp).length<6) return res.status(400).json({error:'Invalid OTP'});
  return res.json({ok:true});
}

function verifyEmail(req,res){
  const {token}=req.query;
  if(!token) return res.status(400).json({error:'Missing token'});
  const rec=list('verificationTokens',t=>t.id===token)[0];
  if(!rec) return res.status(400).json({error:'Invalid token'});
  const user=get('users',rec.user_id); if(!user) return res.status(400).json({error:'Invalid token'});
  update('users',user.id,{verified:true});
  return res.json({ok:true});
}

function me(req,res){
  const user=get('users',req.user.id); if(!user) return res.status(404).json({error:'Not found'});
  return res.json({id:user.id,name:user.name,email:user.email,role:user.role});
}

// OAuth stubs: Google/Microsoft. In real app, verify id_token against provider
async function oauth(req,res){
  const {provider,id_token,email,name,role='student'}=req.body||{};
  if(!provider||!id_token) return res.status(400).json({error:'Missing provider or id_token'});
  // pretend token is valid; find or create user by email
  if(!email) return res.status(400).json({error:'Email required'});
  let user=list('users',u=>u.email===email)[0];
  if(!user){ return res.status(403).json({error:'Not registered. Ask admin to create your account.'}); }
  return res.json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}

module.exports={register,login,logout,refresh,verify2fa,requireAuth,me,oauth,verifyEmail};

