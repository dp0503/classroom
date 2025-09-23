// Role switching micro-logic and reduced motion handling
(function(){
	const tabs=document.querySelectorAll('.role-tab');
	const roleCopy=document.getElementById('roleCopy');
	const root=document.documentElement;
	const messages={
		student:"Welcome back, Student! Let’s continue learning 🚀",
		teacher:"Hello Teacher 👋 Ready to inspire today?",
		admin:"Welcome Admin 🔐 Access with confidence."
	};
	function setTheme(role){
		switch(role){
			case 'teacher':
				root.style.setProperty('--grad-button','linear-gradient(90deg,#00C2A8 0%,#6C63FF 100%)');
				break;
			case 'admin':
				root.style.setProperty('--grad-button','linear-gradient(90deg,#0F172A 0%,#00C2A8 100%)');
				break;
			default:
				root.style.setProperty('--grad-button','linear-gradient(90deg,#6C63FF 0%,#00C2A8 100%)');
		}
	}
	function onTabClick(e){
		const btn=e.currentTarget;const role=btn.dataset.role;
		tabs.forEach(b=>b.setAttribute('aria-selected',String(b===btn)));
		if(roleCopy){roleCopy.textContent=messages[role];}
		setTheme(role);
	}
	tabs.forEach(t=>t.addEventListener('click',onTabClick));
	// Keyboard navigation for tabs
	function focusNext(current,dir){
		const idx=[...tabs].indexOf(current);const next=(idx+dir+tabs.length)%tabs.length;tabs[next].focus();
	}
	tabs.forEach(t=>t.addEventListener('keydown',e=>{
		if(e.key==='ArrowRight'){e.preventDefault();focusNext(e.currentTarget,1);} 
		if(e.key==='ArrowLeft'){e.preventDefault();focusNext(e.currentTarget,-1);} 
	}));
	// prefers-reduced-motion: remove fade-up class
	const media=window.matchMedia('(prefers-reduced-motion: reduce)');
	if(media.matches){document.querySelectorAll('.fade-up').forEach(el=>el.classList.remove('fade-up'));}
})();

// Simple localStorage-backed demo store and renderers
window.App=(function(){
	const storeKey='classroom-demo-v1';
	function load(){
		try{ return JSON.parse(localStorage.getItem(storeKey))||{} }catch(_){ return {} }
	}
	function save(data){ localStorage.setItem(storeKey,JSON.stringify(data)); }
	function init(){
		const data=load();
		if(!data.students){ data.students=[{id:'s1',name:'Alice Johnson'},{id:'s2',name:'Ben Carter'},{id:'s3',name:'Chloe Kim'}]; }
		if(!data.attendance){ data.attendance=[]; }
		if(!data.notifications){ data.notifications=[{id:'n1',text:'Welcome to Classroom!',read:false,ts:Date.now()}]; }
		save(data);
	}
	function get(){ init(); return load(); }
	function set(updater){ const current=get(); const next=updater(current); save(next); return next; }
	// Dashboards
	function renderDashboard(role){
		const grid=document.getElementById('dashboards'); if(!grid) return;
		const data=get();
		grid.innerHTML='';
		const userRole=role;
		let cards=[];
		if(userRole==='admin'){
			cards=[
				{title:'Users',value:'—',desc:'loading...'},
				{title:'Backups',value:'—',desc:'loading...'},
				{title:'Storage',value:'—',desc:'loading...'}
			];
			cards.forEach(c=>{ const el=document.createElement('div'); el.className='card'; el.style.padding='24px'; el.innerHTML=`<h3>${c.title}</h3><div style="font-size:28px;font-weight:700">${c.value}</div><p class="muted">${c.desc}</p>`; grid.appendChild(el); });
			api('/admin/dashboard').then(d=>{ grid.children[0].querySelector('div').textContent=d.activeUsers; grid.children[1].querySelector('div').textContent=d.backups.status; grid.children[2].querySelector('div').textContent=d.storage.usedMB+' MB'; }).catch(()=>{});
			return;
		}
		if(userRole==='teacher'){
			api('/teacher/dashboard').then(d=>{
				[{title:'Today\'s classes',value:d.classesToday,desc:'Scheduled'},{title:'Attendance entries',value:d.attendanceToday,desc:'Today'},{title:'Pending grading',value:d.pendingGrading,desc:'Submissions'}].forEach(c=>{ const el=document.createElement('div'); el.className='card'; el.style.padding='24px'; el.innerHTML=`<h3>${c.title}</h3><div style=\"font-size:28px;font-weight:700\">${c.value}</div><p class=\"muted\">${c.desc}</p>`; grid.appendChild(el); });
			}).catch(()=>{});
			return;
		}
		// student default
		api('/student/dashboard').then(d=>{
			[{title:'Attendance',value:d.attendancePercent+'%',desc:'Presence'},{title:'Assignments',value:d.upcomingAssignments.length,desc:'Upcoming'},{title:'Notifications',value:d.notifications.length,desc:'Recent'}].forEach(c=>{ const el=document.createElement('div'); el.className='card'; el.style.padding='24px'; el.innerHTML=`<h3>${c.title}</h3><div style=\"font-size:28px;font-weight:700\">${c.value}</div><p class=\"muted\">${c.desc}</p>`; grid.appendChild(el); });
		}).catch(()=>{});
		// attach role switching like login tabs if present
		document.querySelectorAll('.role-tab').forEach(btn=>{
			btn.addEventListener('click',()=>renderDashboard(btn.dataset.role));
		});
	}
	// Attendance
	function renderAttendance(){
		const tbody=document.getElementById('attendanceTable'); if(!tbody) return;
		const data=get();
		const today=new Date().toISOString().slice(0,10);
		function mark(id,status){
			set(d=>{ const rec={date:today,studentId:id,status}; d.attendance.push(rec); return d; });
			renderAttendance();
		}
		tbody.innerHTML='';
		data.students.forEach(s=>{
			const tr=document.createElement('tr');
			tr.innerHTML=`<td>${s.name}</td><td><span class="pill">Pending</span></td><td><div style="display:flex;gap:8px"><button class="btn" data-a="present">Present</button><button class="btn" data-a="absent">Absent</button></div></td>`;
			tr.querySelector('[data-a="present"]').addEventListener('click',()=>mark(s.id,'present'));
			tr.querySelector('[data-a="absent"]').addEventListener('click',()=>mark(s.id,'absent'));
			tbody.appendChild(tr);
		});
		// history
		const history=document.getElementById('historyList');
		if(history){
			history.innerHTML='';
			const recent=[...data.attendance].slice(-10).reverse();
			recent.forEach(r=>{
				const student=data.students.find(s=>s.id===r.studentId);
				const item=document.createElement('div');
				item.className='list-item';
				item.innerHTML=`<div><strong>${student?student.name:r.studentId}</strong><div class="muted">${r.date}</div></div><div class="pill">${r.status}</div>`;
				history.appendChild(item);
			});
		}
		const allBtn=document.getElementById('markAllPresent');
		if(allBtn){
			allBtn.onclick=()=>{
				set(d=>{ const t=new Date().toISOString().slice(0,10); d.students.forEach(s=>d.attendance.push({date:t,studentId:s.id,status:'present'})); return d; });
				renderAttendance();
			};
		}
	}
	// Notifications
	function renderNotifications(){
		const list=document.getElementById('notifyList'); if(!list) return;
		const data=get();
		list.innerHTML='';
		[...data.notifications].reverse().forEach(n=>{
			const item=document.createElement('div'); item.className='list-item';
			item.innerHTML=`<div><strong>${n.text}</strong><div class="muted">${new Date(n.ts).toLocaleString()}</div></div><div style="display:flex;gap:8px"><button class="btn" data-a="read">${n.read?'Read':'Mark read'}</button><button class="btn" data-a="delete">Delete</button></div>`;
			item.querySelector('[data-a="read"]').onclick=()=>{ set(d=>{ const m=d.notifications.find(x=>x.id===n.id); if(m){ m.read=true; } return d; }); renderNotifications(); };
			item.querySelector('[data-a="delete"]').onclick=()=>{ set(d=>{ d.notifications=d.notifications.filter(x=>x.id!==n.id); return d; }); renderNotifications(); };
			list.appendChild(item);
		});
		const form=document.getElementById('notifyForm');
		if(form){
			form.onsubmit=(e)=>{
				e.preventDefault(); const input=document.getElementById('notifyText'); const text=input.value.trim(); if(!text) return;
				set(d=>{ d.notifications.push({id:'n'+(Math.random()*1e6|0),text,read:false,ts:Date.now()}); return d; });
				input.value=''; renderNotifications();
			};
		}
	}
	function apiBase(){ return localStorage.getItem('apiBase')||'http://localhost:4000'; }
	function setToken(token){ localStorage.setItem('authToken',token); }
	function getToken(){ return localStorage.getItem('authToken'); }
	async function api(path,opts={}){
		const headers={ 'Content-Type':'application/json', ...(opts.headers||{}) };
		const token=getToken(); if(token) headers['Authorization']='Bearer '+token;
		const res=await fetch(apiBase()+path,{...opts,headers});
		if(!res.ok){ const err=await res.json().catch(()=>({error:'Request failed'})); throw new Error(err.error||res.statusText); }
		return res.json();
	}
	// expose a simple wrapper for pages not within module code
	function apiCall(path,body){ return api(path,{method:'POST',body:JSON.stringify(body)}); }
	function bindLogin(){
		const form=document.getElementById('loginForm'); if(!form) return;
		const emailEl=document.getElementById('email');
		const passEl=document.getElementById('password');
		const errEl=document.getElementById('loginError');
    // If already authenticated, redirect so login screen is not shown again
    api('/auth/me').then(user=>{ redirectByRole(user.role); }).catch(()=>{});
		form.onsubmit=async (e)=>{
			e.preventDefault(); errEl.textContent='';
			try{
				const out=await api('/auth/login',{method:'POST',body:JSON.stringify({email:emailEl.value,password:passEl.value})});
				setToken(out.token);
				localStorage.setItem('userId',out.user.id);
				redirectByRole(out.user.role);
			}catch(err){ errEl.textContent=err.message||'Login failed'; }
		};
		const btnGoogle=document.getElementById('btnGoogle');
		const btnMicrosoft=document.getElementById('btnMicrosoft');
		async function oauth(provider){
			// For demo: prompt email; real app would use provider SDK to get id_token
			const email=prompt(provider+" email"); if(!email) return;
			try{
				const out=await api('/auth/oauth',{method:'POST',body:JSON.stringify({provider,id_token:'demo',email})});
				setToken(out.token); redirectByRole(out.user.role);
			}catch(err){ errEl.textContent=err.message||'OAuth failed'; }
		}
		btnGoogle?.addEventListener('click',()=>oauth('google'));
		btnMicrosoft?.addEventListener('click',()=>oauth('microsoft'));
	}
	function bindRegister(){
		const form=document.getElementById('registerForm'); if(!form) return;
		const nameEl=document.getElementById('regName');
		const emailEl=document.getElementById('regEmail');
		const passEl=document.getElementById('regPassword');
		const roleEl=document.getElementById('regRole');
		const msgEl=document.getElementById('registerMsg');
		form.onsubmit=async (e)=>{
			e.preventDefault(); msgEl.textContent='';
			try{
				const out=await api('/auth/register',{method:'POST',body:JSON.stringify({name:nameEl.value,email:emailEl.value,password:passEl.value,role:roleEl.value})});
				msgEl.innerHTML='Verify your email via: <code>'+out.verifyUrl+'</code>';
			}catch(err){ msgEl.textContent=err.message||'Registration failed'; }
		};
	}
function redirectByRole(role){
    switch(role){
        case 'teacher': window.location.href='teacher.html'; break;
        case 'admin': window.location.href='admin.html'; break;
        default: window.location.href='student.html';
    }
}
	function applyRoleVisibility(){
		// Hide elements that require a specific role
		api('/auth/me').then(user=>{
			document.querySelectorAll('[data-required-role]')
				.forEach(el=>{ const need=el.getAttribute('data-required-role'); if(user.role!==need){ el.style.display='none'; } });
		}).catch(()=>{
			// Not logged in: hide role-gated elements
			document.querySelectorAll('[data-required-role]').forEach(el=>{ el.style.display='none'; });
		});
	}
	function guard(requiredRole){
		const token=getToken(); if(!token){ window.location.href='login.html'; return; }
		// Optionally fetch /auth/me and validate role
		api('/auth/me').then(user=>{
			if(requiredRole && user.role!==requiredRole){ window.location.href='login.html'; }
		}).catch(()=>{ localStorage.removeItem('authToken'); window.location.href='login.html'; });
	}
	return { renderDashboard, renderAttendance, renderNotifications, bindLogin, bindRegister, guard, apiCall };
})();

