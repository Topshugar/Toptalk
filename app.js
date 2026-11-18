// app.js - Feed, Matches, Chat
let posts = JSON.parse(localStorage.getItem("toptalk_posts_v2")||"null") || [
  {id:1, name:"Ada", handle:"ada_lagos", age:23, city:"Lagos", text:"Make me laugh on a voice note and I am yours.", likes:42, liked:false, comments:[]},
  {id:2, name:"Chidi", handle:"chidi_abj", age:25, city:"Abuja", text:"Good conversation is more attractive than good looks.", likes:38, liked:false, comments:[]}
];
let matches = JSON.parse(localStorage.getItem("toptalk_matches_v2")||"[]");
let chats = JSON.parse(localStorage.getItem("toptalk_chats_v2")||"{}");
let activeChat = null;
let vibe = {v1:"funny", v2:"text", v3:"hustle"};

function saveAll(){
  localStorage.setItem("toptalk_posts_v2", JSON.stringify(posts));
  localStorage.setItem("toptalk_matches_v2", JSON.stringify(matches));
  localStorage.setItem("toptalk_chats_v2", JSON.stringify(chats));
}
function esc(v){ return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function switchTab(p){
  ["feed","discover","matches","profile"].forEach(x=>{
    const el=document.getElementById("page-"+x); if(el) el.style.display = x===p ? "block":"none";
    const t=document.getElementById("tab-"+x); if(t) t.className="tab"+(x===p?" active":"");
  });
  if(p==="feed") renderFeed();
  if(p==="discover") renderDiscover();
  if(p==="matches") renderMatches();
  if(p==="profile") renderProfile();
}
function renderProfile(){
  if(!profile) return;
  document.getElementById("myName").textContent = profile.name;
  document.getElementById("myEmail").textContent = profile.email;
  document.getElementById("editBio").value = profile.bio||"";
}
function saveProfile(){
  if(!profile) return;
  profile.bio = document.getElementById("editBio").value || profile.bio;
  const users = getUsers(); const i = users.findIndex(u=>u.id===profile.id);
  if(i>-1){ users[i]=profile; saveUsers(users); }
  toast("Profile saved.");
}
function updateChar(){
  const v=document.getElementById("postText").value;
  document.getElementById("charCount").textContent = (280-v.length)+" left";
  document.getElementById("postBtn").disabled = v.trim().length===0;
}
function createPost(){
  const text=document.getElementById("postText").value.trim(); if(!text) return;
  posts.unshift({id:Date.now(), name:profile.name, handle:profile.handle, age:profile.age, city:profile.city, text, likes:0, liked:false, comments:[]});
  saveAll(); document.getElementById("postText").value=""; updateChar(); renderFeed(); toast("Your talk is live.");
}
function toggleLike(id){ const p=posts.find(x=>x.id===id); p.liked=!p.liked; p.likes+=p.liked?1:-1; saveAll(); renderFeed(); }
function renderFeed(){
  document.getElementById("feed").innerHTML = posts.map(p=>`<div class="card"><b>${esc(p.name)}</b> @${esc(p.handle)} • ${p.age} • ${esc(p.city)}<p>${esc(p.text)}</p><button onclick="toggleLike(${p.id})">Like ${p.likes}</button> <button onclick="likePerson(${p.id})">Like Their Vibe</button></div>`).join("");
}
function renderDiscover(){
  document.getElementById("discoverList").innerHTML = posts.map(p=>`<div class="card"><b>${esc(p.name)}</b><p>${esc(p.text)}</p><button class="btn-primary" onclick="likePerson(${p.id})">Match</button></div>`).join("");
}
function likePerson(id){
  const p=posts.find(x=>x.id===id);
  if(matches.find(m=>m.handle===p.handle)) return toast("Already matched.");
  matches.push({name:p.name, handle:p.handle, age:p.age, city:p.city, text:p.text});
  saveAll(); document.getElementById("matchCount").textContent=matches.length; toast("Matched with "+p.name);
}
function renderMatches(){
  document.getElementById("matchCount").textContent=matches.length;
  const el=document.getElementById("matchesList");
  if(!matches.length){ el.innerHTML="<p>No matches yet.</p>"; return; }
  el.innerHTML=matches.map((m,i)=>`<div class="card"><b>${esc(m.name)}</b> • ${m.age} • ${esc(m.city)}<br><button class="btn-dark" onclick="openChat(${i})">Chat</button></div>`).join("");
}
function openChat(i){ activeChat=i; document.getElementById("chatArea").style.display="block"; document.getElementById("chatWith").textContent="Chat with "+matches[i].name; renderChat(); }
function renderChat(){
  if(activeChat===null) return;
  const m=matches[activeChat]; const list=chats[m.handle]||[{from:"them", text:"Hello. I liked your talk."}]; chats[m.handle]=list; saveAll();
  document.getElementById("chatBox").innerHTML=list.map(x=>`<div class="msg ${x.from==="me"?"me":"them"}">${esc(x.text)}</div>`).join("");
}
function sendChat(){
  if(activeChat===null) return;
  const inp=document.getElementById("chatInput"); const t=inp.value.trim(); if(!t) return;
  const m=matches[activeChat]; if(!chats[m.handle]) chats[m.handle]=[];
  chats[m.handle].push({from:"me", text:t}); saveAll(); inp.value=""; renderChat();
}