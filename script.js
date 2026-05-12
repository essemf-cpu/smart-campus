// =====================
// FIREBASE
// =====================
const firebaseConfig = {
apiKey: "AIzaSyCrdqwoG_K39s7_mWCeLprvnUDIBGqcfUY",
authDomain: "smart-campus-58151.firebaseapp.com",
projectId: "smart-campus-58151"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// =====================
// INSCRIPTION
// =====================
function inscription() {

let nom =
document.getElementById("nom").value;

let carte =
document.getElementById("carte").value;

let faculte =
document.getElementById("faculte").value;

let niveau =
document.getElementById("niveau").value;

let password =
document.getElementById("password").value;

if(!nom || !carte || !password){

alert("Remplis tous les champs");

return;
}

db.collection("users").add({

nom:nom,
carte:carte,
faculte:faculte,
niveau:niveau,
password:password,

role:"etudiant",

valide:false,

codifie:false

})

.then(()=>{

alert("Inscription envoyée");

window.location.href =
"index.html";

});

}


// =====================
// LOGIN
// =====================
function login(){

let carte =
document.getElementById("username").value;

let password =
document.getElementById("password").value;

db.collection("users")

.where(
"carte",
"==",
carte
)

.where(
"password",
"==",
password
)

.get()

.then((snapshot)=>{

if(snapshot.empty){

alert("Identifiants incorrects");

return;
}

let user =
snapshot.docs[0].data();

if(user.valide === false){

alert("Compte non validé");

return;
}

localStorage.setItem(
"user",
JSON.stringify(user)
);

db.collection("status")
.doc(user.carte)

.set({

nom:user.nom,

online:true,

lastActive:Date.now()

});

window.location.href =
"dashboard.html";

});

}


// =====================
// ADMIN LOGIN
// =====================
function loginAdmin(){

let user =
document.getElementById("adminUser").value;

let pass =
document.getElementById("adminPass").value;

if(
user === "admin"
&&
pass === "1234"
){

localStorage.setItem(
"user",
JSON.stringify({

role:"admin",

nom:"Administrateur"

})
);

window.location.href =
"admin.html";

}else{

alert("Accès refusé");

}

}


// =====================
// VERIFIER CONNEXION
// =====================
function verifierConnexion(role){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(
!user
||
user.role !== role
){

window.location.href =
"index.html";

}

}


// =====================
// QR CODE
// =====================
function genererQR(){

let zone =
document.getElementById(
"qrcode"
);

if(!zone) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

zone.innerHTML = "";

let texte =

`Nom : ${user.nom}
Carte : ${user.carte}`;

QRCode.toCanvas(

document.createElement(
"canvas"
),

texte,

{
width:300,
margin:2
},

function(error, canvas){

if(error){

console.error(error);

return;
}

zone.appendChild(canvas);

}

);

}


// =====================
// INFOS QR
// =====================
function afficherInfosQR(){

let zone =
document.getElementById(
"qr-info"
);

if(!zone) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

zone.innerHTML = `

<p>
<strong>Nom :</strong>
${user.nom}
</p>

<p>
<strong>Carte :</strong>
${user.carte}
</p>

<p>
<strong>Faculté :</strong>
${user.faculte}
</p>

<p>
<strong>Niveau :</strong>
${user.niveau}
</p>

`;

}


// =====================
// AJOUTER AMI
// =====================
function ajouterAmi(){

let friendCarte =
document.getElementById(
"friendCarte"
).value;

if(!friendCarte){

alert("Entre une carte");

return;
}

let user =
JSON.parse(
localStorage.getItem("user")
);

db.collection("friendRequests")

.add({

from:user.carte,

fromNom:user.nom,

to:friendCarte,

status:"pending",

date:Date.now()

})

.then(()=>{

alert("Demande envoyée");

document.getElementById(
"friendCarte"
).value = "";

});

}


// =====================
// ACCEPTER DEMANDE
// =====================
function accepterDemande(
id,
amiCarte,
amiNom
){

let user =
JSON.parse(
localStorage.getItem("user")
);

/* AJOUT 1 */

db.collection("friends").add({

userCarte:user.carte,
userNom:user.nom,

friendCarte:amiCarte,
friendNom:amiNom

});

/* AJOUT 2 */

db.collection("friends").add({

userCarte:amiCarte,
userNom:amiNom,

friendCarte:user.carte,
friendNom:user.nom

});

/* UPDATE DEMANDE */

db.collection("friendRequests")
.doc(id)

.update({

status:"accepted",

message:
"Vous et " +
amiNom +
" êtes désormais amis"

});

alert("Ami ajouté");

}


// =====================
// AFFICHER AMIS
// =====================
function afficherAmis(){

let zone =
document.getElementById(
"liste-amis"
);

if(!zone) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

db.collection("friends")

.where(
"userCarte",
"==",
user.carte
)

.onSnapshot((snapshot)=>{

zone.innerHTML = "";

if(snapshot.empty){

zone.innerHTML = `

<div class="card">

Aucun ami

</div>

`;

return;
}

snapshot.forEach((doc)=>{

let ami =
doc.data();

zone.innerHTML += `

<div class="friend-card">

<div class="friend-left">

<div class="friend-avatar">

<i class="fa-solid fa-user"></i>

</div>

<div class="friend-info">

<strong>

${ami.friendNom}

</strong>

<p>

${ami.friendCarte}

</p>

</div>

</div>

<div class="friend-actions">

<button
onclick="
ouvrirMessage(
'${ami.friendCarte}'
)">

<i class="fa-solid fa-comments"></i>

</button>

<button
onclick="
voirPosition(
'${ami.friendCarte}'
)">

<i class="fa-solid fa-location-dot"></i>

</button>

</div>

</div>

`;

});

});

}


// =====================
// OUVRIR MESSAGE
// =====================
function ouvrirMessage(friendCarte){

window.location.href =
"conversation.html?friend=" +
friendCarte;

}


// =====================
// ENVOYER MESSAGE
// =====================
function envoyerMessagePrive(){

let texte =
document.getElementById(
"message"
).value;

if(!texte) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

let params =
new URLSearchParams(
window.location.search
);

let friend =
params.get("friend");

db.collection("messages")

.add({

from:user.carte,

fromNom:user.nom,

to:friend,

message:texte,

date:Date.now(),

heure:new Date()
.toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

}),

seen:false,

delivered:true

})

.then(()=>{

document.getElementById(
"message"
).value = "";

});

}


// =====================
// AFFICHER MESSAGES
// =====================
function afficherMessages(){

let zone =
document.getElementById(
"messages-list"
);

if(!zone) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

let params =
new URLSearchParams(
window.location.search
);

let friend =
params.get("friend");

db.collection("messages")

.orderBy("date")

.onSnapshot((snapshot)=>{

zone.innerHTML = "";

snapshot.forEach((doc)=>{

let m =
doc.data();

let conversation =

(
m.from === user.carte
&&
m.to === friend
)

||

(
m.from === friend
&&
m.to === user.carte
);

if(!conversation) return;

let classe =
"message-ami";

if(
m.from === user.carte
){

classe =
"message-moi";

}

let statusHTML = "";

if(
m.from === user.carte
){

if(m.seen){

statusHTML =
"✔✔ Vu";

}else{

statusHTML =
"✔ Livré";

}

}

zone.innerHTML += `

<div class="${classe}">

<div class="message-text">

${m.message}

</div>

<div class="message-date">

${m.heure}
&nbsp;
${statusHTML}

</div>

</div>

`;

});

zone.scrollTop =
zone.scrollHeight;

});

}


// =====================
// LUS
// =====================
function marquerMessagesCommeLus(){

let user =
JSON.parse(
localStorage.getItem("user")
);

let params =
new URLSearchParams(
window.location.search
);

let friend =
params.get("friend");

db.collection("messages")

.where(
"from",
"==",
friend
)

.where(
"to",
"==",
user.carte
)

.where(
"seen",
"==",
false
)

.get()

.then((snapshot)=>{

snapshot.forEach((doc)=>{

db.collection("messages")
.doc(doc.id)

.update({

seen:true

});

});

});

}


// =====================
// NOM CONVERSATION
// =====================
function afficherNomConversation(){

let params =
new URLSearchParams(
window.location.search
);

let friend =
params.get("friend");

let zone =
document.getElementById(
"friend-name"
);

if(!zone) return;

db.collection("friends")

.where(
"friendCarte",
"==",
friend
)

.get()

.then((snapshot)=>{

if(snapshot.empty) return;

let data =
snapshot.docs[0].data();

zone.innerHTML =
data.friendNom;

});

}


// =====================
// STATUS AMI
// =====================
function afficherStatusAmi(){

let params =
new URLSearchParams(
window.location.search
);

let friend =
params.get("friend");

let zone =
document.getElementById(
"friend-status"
);

if(!zone) return;

db.collection("status")
.doc(friend)

.onSnapshot((doc)=>{

if(!doc.exists){

zone.innerHTML =
"⚫ Hors ligne";

return;
}

let data =
doc.data();

let diff =
Date.now() -
(data.lastActive || 0);

if(diff < 45000){

zone.innerHTML =
"🟢 En ligne";

}else{

zone.innerHTML =
"⚫ Hors ligne";

}

});

}


// =====================
// CONVERSATIONS
// =====================
function afficherConversations(){

let zone =
document.getElementById(
"conversations-list"
);

if(!zone) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

db.collection("friends")

.where(
"userCarte",
"==",
user.carte
)

.onSnapshot((snapshot)=>{

zone.innerHTML = "";

snapshot.forEach((doc)=>{

let ami =
doc.data();

zone.innerHTML += `

<div class="conversation-card"

onclick="
ouvrirMessage(
'${ami.friendCarte}'
)">

<div class="conversation-left">

<div class="conversation-avatar">

<i class="fa-solid fa-user"></i>

</div>

<div class="conversation-info">

<strong>

${ami.friendNom}

</strong>

<p id="status-${ami.friendCarte}">

⚫ Hors ligne

</p>

</div>

</div>

<div class="conversation-right">

<div
id="badge-${ami.friendCarte}">

</div>

</div>

</div>

`;

/* STATUS */

db.collection("status")
.doc(ami.friendCarte)

.onSnapshot((statusDoc)=>{

let zoneStatus =
document.getElementById(
`status-${ami.friendCarte}`
);

if(!zoneStatus) return;

if(!statusDoc.exists){

zoneStatus.innerHTML =
"⚫ Hors ligne";

return;
}

let data =
statusDoc.data();

let diff =
Date.now() -
(data.lastActive || 0);

if(diff < 45000){

zoneStatus.innerHTML =
"🟢 En ligne";

}else{

zoneStatus.innerHTML =
"⚫ Hors ligne";

}

});


/* BADGE */

db.collection("messages")

.where(
"from",
"==",
ami.friendCarte
)

.where(
"to",
"==",
user.carte
)

.where(
"seen",
"==",
false
)

.onSnapshot((snap)=>{

let badge =
document.getElementById(
`badge-${ami.friendCarte}`
);

if(!badge) return;

if(snap.empty){

badge.innerHTML = "";

}else{

badge.innerHTML = `

<div class="conversation-badge">

${snap.size}

</div>

`;

}

});

});

});

}


// =====================
// BADGE DASHBOARD
// =====================
function afficherBadgeMessages(){

let badge =
document.getElementById(
"message-badge"
);

if(!badge) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

db.collection("messages")

.where(
"to",
"==",
user.carte
)

.where(
"seen",
"==",
false
)

.onSnapshot((snapshot)=>{

if(snapshot.empty){

badge.style.display =
"none";

return;
}

badge.style.display =
"flex";

badge.innerHTML =
snapshot.size;

});

}


// =====================
// NOTIFICATIONS
// =====================
function afficherNotifications(){

let zone =
document.getElementById(
"notifications-list"
);

if(!zone) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

let notifications = [];

/* ========================= */
/* RENDER */
/* ========================= */

function renderNotifications(type="all"){

zone.innerHTML = "";

let liste = notifications;

/* FILTRES */

if(type !== "all"){

liste =
notifications.filter((n)=>{

return n.type === type;

});

}

/* TRI PAR DATE */

liste.sort((a,b)=>{

return b.date - a.date;

});

/* AUCUNE */

if(liste.length === 0){

zone.innerHTML = `

<div class="card">

Aucune notification

</div>

`;

return;
}

/* AFFICHAGE */

liste.forEach((n)=>{

zone.innerHTML += `

<div class="history-card notification-card">

<div class="history-icon ${n.iconBg}">

<i class="${n.icon}"></i>

</div>

<div class="history-info">

<strong>

${n.title}

</strong>

<small>

${n.text}

</small>

</div>

${n.button || ""}

</div>

`;

});

}

/* ========================= */
/* DEMANDES AMIS */
/* ========================= */

db.collection("friendRequests")

.where(
"to",
"==",
user.carte
)

.onSnapshot((snapshot)=>{

notifications =
notifications.filter((n)=>{

return n.source !== "friends";

});

snapshot.forEach((doc)=>{

let d = doc.data();

let texte = "";
let button = "";

if(d.status === "pending"){

texte =
`${d.fromNom}
souhaite vous ajouter`;

button = `

<button
onclick="
accepterDemande(
'${doc.id}',
'${d.from}',
'${d.fromNom}'
)">

✔

</button>

`;

}else{

texte =
d.message ||
"Vous êtes désormais amis";

}

notifications.push({

source:"friends",

type:"amis",

title:"Amis",

text:texte,

date:d.date || Date.now(),

icon:"fa-solid fa-user-plus",

iconBg:"purple-bg",

button:button

});

});

renderNotifications();

});


/* ========================= */
/* MESSAGES */
/* ========================= */

db.collection("messages")

.where(
"to",
"==",
user.carte
)

.where(
"seen",
"==",
false
)

.onSnapshot((snapshot)=>{

notifications =
notifications.filter((n)=>{

return n.source !== "messages";

});

snapshot.forEach((doc)=>{

let m = doc.data();

notifications.push({

source:"messages",

type:"messages",

title:"Nouveau message",

text:
`${m.fromNom} : ${m.message}`,

date:m.date || Date.now(),

icon:"fa-solid fa-envelope",

iconBg:"blue-bg"

});

});

renderNotifications();

});


/* ========================= */
/* FILTRES */
/* ========================= */

document
.querySelectorAll(
".category-pill"
)

.forEach((pill)=>{

pill.addEventListener(
"click",
function(){

document
.querySelectorAll(
".category-pill"
)

.forEach((p)=>{

p.classList.remove(
"active-pill"
);

});

pill.classList.add(
"active-pill"
);

let texte =
pill.innerText
.toLowerCase();

if(texte === "tout"){

renderNotifications(
"all"
);

}else if(
texte === "messages"
){

renderNotifications(
"messages"
);

}else if(
texte === "amis"
){

renderNotifications(
"amis"
);

}

});

});

}

function afficherBadgeNotifications(){

let badge =
document.getElementById(
"notification-badge"
);

if(!badge) return;

let user =
JSON.parse(
localStorage.getItem("user")
);

let total = 0;

/* MESSAGES */

db.collection("messages")

.where(
"to",
"==",
user.carte
)

.where(
"seen",
"==",
false
)

.onSnapshot((snapshot)=>{

total += snapshot.size;

updateBadge();

});

/* DEMANDES */

db.collection("friendRequests")

.where(
"to",
"==",
user.carte
)

.where(
"status",
"==",
"pending"
)

.onSnapshot((snapshot)=>{

total += snapshot.size;

updateBadge();

});

function updateBadge(){

if(total <= 0){

badge.style.display =
"none";

return;
}

badge.style.display =
"flex";

badge.innerHTML =
total;

}

}


// =====================
// STATUS UTILISATEUR
// =====================
function gererPresenceUtilisateur(){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

function updatePresence(){

db.collection("status")
.doc(user.carte)

.set({

nom:user.nom,

online:true,

lastActive:Date.now()

});

}

updatePresence();

setInterval(
updatePresence,
15000
);

window.addEventListener(
"beforeunload",
function(){

db.collection("status")
.doc(user.carte)

.update({

online:false,

lastActive:0

});

});

}


// =====================
// GPS
// =====================
function partagerPosition(){

let user =
JSON.parse(
localStorage.getItem("user")
);

navigator.geolocation.getCurrentPosition(

function(position){

db.collection("locations")
.doc(user.carte)

.set({

lat:position.coords.latitude,

lon:position.coords.longitude

});

});

}


function voirPosition(friendCarte){

db.collection("locations")
.doc(friendCarte)

.get()

.then((doc)=>{

if(!doc.exists){

alert("Position indisponible");

return;
}

let data =
doc.data();

window.location.href =

`gps.html?lat=${data.lat}&lon=${data.lon}`;

});

}


// =====================
// LOGOUT
// =====================
function logout(){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(user){

db.collection("status")
.doc(user.carte)

.update({

online:false,

lastActive:0

});

}

localStorage.removeItem(
"user"
);

window.location.href =
"index.html";

}


// =====================
// RECHERCHE
// =====================
function initialiserRechercheIntelligente(){

let searchInputs =
document.querySelectorAll(
".modern-search input"
);

searchInputs.forEach(function(input){

input.addEventListener(
"keyup",
function(event){

if(event.key !== "Enter"){

return;
}

let valeur =
input.value
.toLowerCase()
.trim();

if(
valeur.includes("guide")
){

window.location.href =
"guide.html";

}

else if(
valeur.includes("restaurant")
){

window.location.href =
"restauration.html";

}

else if(
valeur.includes("gps")
){

window.location.href =
"gps.html";

}

else if(
valeur.includes("amis")
){

window.location.href =
"amis.html";

}

else if(
valeur.includes("message")
){

window.location.href =
"messages.html";

}

else if(
valeur.includes("notification")
){

window.location.href =
"notifications.html";

}

else{

alert(
"Aucun résultat"
);

}

});

});

}


// =====================
// LOAD
// =====================
window.onload = function(){

initialiserRechercheIntelligente();

afficherInfosQR();

genererQR();

afficherAmis();

afficherNotifications();

afficherBadgeMessages();

gererPresenceUtilisateur();

afficherBadgeNotifications();

};