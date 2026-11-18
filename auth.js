// auth.js - Log in and Create Account only - British English
const ALLOWED_DOMAIN = "@topshugar.site";
const DB_USERS = "toptalk_db_users_v2";
const DB_SESSION = "toptalk_db_session_v2";
let currentUser = null;
let profile = null;

function getUsers(){ return JSON.parse(localStorage.getItem(DB_USERS) || "[]"); }
function saveUsers(u){ localStorage.setItem(DB_USERS, JSON.stringify(u)); }
function showError(m){ const e=document.getElementById("authError"); e.textContent=m; e.style.display="block"; }
function hideError(){ document.getElementById("authError").style.display="none"; }
function toast(m){ const el=document.getElementById("toast"); el.textContent=m; el.style.display="block"; setTimeout(()=>el.style.display="none",2200); }
function hashPass(p){ let h=0; for(let i=0;i<p.length;i++){ h=((h<<5)-h)+p.charCodeAt(i); h|=0; } return "local_"+h; }

function showAuth(mode){
  document.getElementById("loginForm").style.display = mode==="login" ? "block":"none";
  document.getElementById("signupForm").style.display = mode==="signup" ? "block":"none";
  document.getElementById("tabLoginBtn").className = "auth-tab"+(mode==="login"?" active":"");
  document.getElementById("tabSignupBtn").className = "auth-tab"+(mode==="signup"?" active":"");
  hideError();
}

function doSignup(){
  const name = document.getElementById("suName").value.trim();
  const age = parseInt(document.getElementById("suAge").value);
  const city = document.getElementById("suCity").value;
  const email = document.getElementById("suEmail").value.trim().toLowerCase();
  const password = document.getElementById("suPassword").value;

  if(!name) return showError("Please enter your first name.");
  if(!age || age < 18) return showError("You must be 18 or over to join TopTalk.");
  if(!email.includes("@")) return showError("Please enter a valid email address.");
  if(!email.endsWith(ALLOWED_DOMAIN)) return showError("Only @topshugar.site email addresses are accepted. Please obtain one from TOPSHUGAR.site.");
  if(!password || password.length < 6) return showError("Password must be at least 6 characters.");

  const users = getUsers();
  if(users.find(u=>u.email===email)){ showError("This email address already has an account. Please log in."); showAuth("login"); return; }

  const user = { id: Date.now(), name, age, city, email, pass: hashPass(password), bio:"Funny, loyal, God-fearing. I fall for good conversation.", handle: name.toLowerCase().replace(/[^a-z0-9]/g,"")||"topuser", created_at: new Date().toISOString() };
  users.push(user); saveUsers(users);
  loginUser(user);
  toast("Welcome to TopTalk, "+name);
}

function doLogin(){
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  if(!email || !password) return showError("Please enter your email address and password.");
  if(!email.endsWith(ALLOWED_DOMAIN)) return showError("Only @topshugar.site email addresses are accepted.");
  const user = getUsers().find(u=>u.email===email && u.pass===hashPass(password));
  if(!user) return showError("Incorrect email address or password. If you are new, please create an account.");
  loginUser(user);
  toast("Welcome back, "+user.name);
}

function loginUser(user){
  currentUser = user; profile = user;
  localStorage.setItem(DB_SESSION, JSON.stringify({email:user.email, id:user.id}));
  document.getElementById("authPage").style.display="none";
  document.getElementById("mainApp").style.display="block";
  document.getElementById("heroName").textContent = user.name;
  if(typeof renderProfile==="function") renderProfile();
  if(typeof renderFeed==="function") renderFeed();
}

function doLogout(){
  localStorage.removeItem(DB_SESSION);
  currentUser=null;
  document.getElementById("mainApp").style.display="none";
  document.getElementById("authPage").style.display="block";
  showAuth("login");
}

(function(){
  const s = JSON.parse(localStorage.getItem(DB_SESSION)||"null");
  if(s){ const u = getUsers().find(x=>x.email===s.email); if(u) loginUser(u); }
})();