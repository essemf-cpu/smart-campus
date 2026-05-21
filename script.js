// =====================
// FIREBASE
// =====================
const firebaseConfig = {

apiKey: "AIzaSyCrdqwoG_K39s7_mWCeLprvnUDIBGqcfUY",

authDomain:
"smart-campus-58151.firebaseapp.com",

projectId:
"smart-campus-58151",

messagingSenderId:
"631084577067",

appId:
"1:631084577067:web:bb690c895fc96411dc556e"

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

avatar:"assets/default-user.png",

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

let doc =
snapshot.docs[0];

let user = {

id:doc.id,

...doc.data()

};

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
// CHARGER INSCRIPTIONS ADMIN
// =====================

function chargerInscriptions(){

let container =
document.getElementById(
"inscriptions"
);

if(!container) return;

container.innerHTML="";

db.collection("users")

.where(
"valide",
"==",
false
)

.get()

.then((snapshot)=>{

if(snapshot.empty){

container.innerHTML=
"<p>Aucune inscription en attente</p>";

return;
}

snapshot.forEach((doc)=>{

let user = doc.data();

container.innerHTML += `

<div class="admin-user-card">

<h4>${user.nom}</h4>

<p>Carte : ${user.carte}</p>

<p>Faculté : ${user.faculte}</p>

<p>Niveau : ${user.niveau}</p>

<button
onclick="validerCompte('${doc.id}')"
>

Valider

</button>

</div>

`;

});

});

}



// =====================
// VALIDER COMPTE
// =====================

function validerCompte(id){

db.collection("users")

.doc(id)

.update({

valide:true

})

.then(()=>{

alert("Compte validé");

chargerInscriptions();

});

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

fromAvatar:
user.avatar ||

"assets/default-user.png",

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

db.collection("users")

.where(
"carte",
"==",
amiCarte
)

.get()

.then((snapshot)=>{

if(snapshot.empty){

alert(
"Utilisateur introuvable"
);

return;
}

let amiData =
snapshot.docs[0].data();

/* AJOUT AMI USER */

db.collection("friends").add({

userCarte:user.carte,
userNom:user.nom,

friendCarte:amiCarte,
friendNom:amiNom,

friendAvatar:
amiData.avatar ||

"assets/default-user.png"

});


/* AJOUT AMI AUTRE */

db.collection("friends").add({

userCarte:amiCarte,
userNom:amiNom,

friendCarte:user.carte,
friendNom:user.nom,

friendAvatar:
user.avatar ||

"assets/default-user.png"

});


/* UPDATE DEMANDE */

db.collection("friendRequests")
.doc(id)

.update({

status:"accepted",

message:
"Vous et " +
amiNom +
" êtes désormais amis",

date:Date.now()

});


/* NOTIFICATION POUR L’AUTRE */

db.collection("notifications")
.add({

to:amiCarte,

type:"amis",

title:"Demande acceptée",

text:
user.nom +
" a accepté votre demande d’ami",

date:Date.now(),

seen:false

});

alert(
"Ami ajouté"
);

});

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

<img
class="real-avatar"
src="${
ami.friendAvatar ||
'assets/default-user.png'
}">

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

delivered:true,

reaction:""

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

let user=
JSON.parse(
localStorage.getItem(
"user"
)
);

if(
m.deletedFor
&&
m.deletedFor.includes(
user.carte
)
){

return;

}

let reactionHTML="";

if(m.reaction){

reactionHTML=`

<div
class="message-reaction">

${m.reaction}

</div>

`;

}

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

<div
class="${classe}"
data-id="${doc.id}"
data-message="${m.message}"
data-moi="${
m.from===user.carte
}"

>

<div class="message-text">

${m.message}

${m.edited ?

`<small
style="
display:block;
color:gray;
margin-top:5px;
">

(modifié)

</small>`

:

""
}

</div>

<div class="message-date">

${m.heure}
&nbsp;
${statusHTML}

</div>

${reactionHTML}

</div>

`;

});

zone.scrollTop =
zone.scrollHeight;

});

}


let timerAppui;

document.addEventListener(

"touchstart",

function(e){

let message =

e.target.closest(
".message-moi,.message-ami"
);

if(!message)return;

timerAppui =

setTimeout(()=>{

ouvrirMenuMessage(
e,
message.dataset.id,
message.dataset.message,
message.dataset.moi
);

},700);
},

{passive:true}

);

document.addEventListener(

"touchend",

function(){

clearTimeout(
timerAppui
);

}

);

function modifierActuel(){

db.collection(
"messages"
)

.doc(
messageActuel
)

.get()

.then((doc)=>{

let m=
doc.data();

let diff=

Date.now()
-
m.date;

if(
diff >
120000
){

alert(
"Modification expirée"
);

return;
}

let nouveau=

prompt(
"Modifier :",
m.message
);

if(
!nouveau
)return;

db.collection(
"messages"
)

.doc(
messageActuel
)

.update({

message:nouveau,

edited:true

});

fermerMenu();

});

}

function supprimerActuel(){

let choix=

prompt(

"1 Moi\n2 Tous"

);

if(
!choix
)return;

let user=

JSON.parse(
localStorage.getItem(
"user"
)
);


/* POUR MOI */

if(
choix==="1"
){

db.collection(
"messages"
)

.doc(
messageActuel
)

.update({

deletedFor:

firebase.firestore
.FieldValue
.arrayUnion(

user.carte

)

});

}


/* POUR TOUS */

if(
choix==="2"
){

db.collection(
"messages"
)

.doc(
messageActuel
)

.get()

.then((doc)=>{

let m=
doc.data();

let diff=

Date.now()
-
m.date;

if(
diff >
120000
){

alert(
"Suppression expirée"
);

return;
}

db.collection(
"messages"
)

.doc(
messageActuel
)

.update({

message:
"Ce message a été supprimé",

deleted:true

});

});

}

fermerMenu();

}

function transfererActuel(){

let carte=

prompt(
"Carte ami :"
);

if(
!carte
)return;

let user=

JSON.parse(
localStorage.getItem(
"user"
)
);

db.collection(
"messages"
)

.doc(
messageActuel
)

.get()

.then((doc)=>{

let m=
doc.data();

db.collection(
"messages"
)

.add({

from:user.carte,

fromNom:user.nom,

to:carte,

message:
"📤 " +
m.message,

forwarded:true,

date:Date.now(),

heure:new Date()

.toLocaleTimeString([],
{

hour:"2-digit",

minute:"2-digit"

}),

seen:false

});

});

fermerMenu();

}

function emojiPlus(){

let emoji =

prompt(
"Entrez un emoji :"
);

if(
!emoji
)return;

reagirActuel(
emoji
);

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

let messageActuel=null;
let texteActuel=null;

function ouvrirMenuMessage(
e,
id,
texte,
moi
){

e.preventDefault();

messageActuel=id;

texteActuel=texte;

let modifier =

document.getElementById(
"optionModifier"
);

let supprimer =

document.getElementById(
"optionSupprimer"
);

if(
moi==="true"
){

modifier.style.display=
"flex";

supprimer.style.display=
"flex";

}else{

modifier.style.display=
"none";

supprimer.style.display=
"none";

}

document
.getElementById(
"messageMenu"
)
.style.display=
"block";

}

function reagirActuel(
emoji
){

reagirMessage(
messageActuel,
emoji
);

fermerMenu();

}

function copierActuel(){

navigator.clipboard
.writeText(
texteActuel
);

alert(
"Copié"
);

fermerMenu();

}

function fermerMenu(){

document
.getElementById(
"messageMenu"
)
.style.display=
"none";

}

// =====================
// MENU MESSAGE
// =====================

function menuMessage(
messageId,
texte
){

let choix = prompt(

`1 ❤️ Réagir
2 ✏️ Modifier
3 🗑️ Supprimer pour moi
4 🗑️ Supprimer pour tous
5 📋 Copier
6 📤 Transférer`

);

if(!choix)return;


/* REACTION */

if(choix==="1"){

let emoji=
prompt(
"❤️ 👍 😂"
);

if(!emoji)return;

reagirMessage(
messageId,
emoji
);

}


/* MODIFIER */

else if(
choix==="2"
){

let nouveau=
prompt(
"Modifier :",
texte
);

if(!nouveau)return;

db.collection(
"messages"
)

.doc(
messageId
)

.update({

message:nouveau,

edited:true

});

}


/* COPIER */

else if(
choix==="5"
){

navigator.clipboard
.writeText(
texte
);

alert(
"Message copié"
);

}


/* TRANSFERER */

else if(
choix==="6"
){

alert(
"Transfert bientôt relié aux amis"
);

}

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
// REACTION MESSAGE
// =====================

function reagirMessage(
messageId,
emoji
){

db.collection(
"messages"
)

.doc(
messageId
)

.update({

reaction:emoji

});

}


function mettreAJourStatus(){

let user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user)return;

db.collection("status")
.doc(user.carte)

.set({

nom:user.nom,

online:true,

lastActive:Date.now()

});

}

setInterval(()=>{

mettreAJourStatus();

},20000);

// =====================
// STATUS AMI
// =====================

function afficherStatusAmi(){

let params =
new URLSearchParams(
window.location.search
);

let friend =
params.get(
"friend"
);

let zone =
document.getElementById(
"friend-status"
);

if(!zone) return;

console.log(
"Friend:",
friend
);

db.collection("status")
.doc(friend)

.onSnapshot((doc)=>{

console.log(
"Document existe:",
doc.exists
);

if(!doc.exists){

zone.innerHTML=
"⚫ Hors ligne";

return;
}

let data =
doc.data();

console.log(
"DATA STATUS:",
data
);

let now =
Date.now();

let lastActive =
data.lastActive || 0;

console.log(
"Diff:",
now-lastActive
);

let actif =

data.online ||

(
now-lastActive
<25000
);

console.log(
"Actif:",
actif
);

if(actif){

zone.innerHTML=
"🟢 En ligne";

}else{

zone.innerHTML=
"⚫ Hors ligne";

}

});

}


// =====================
// CONVERSATIONS PREMIUM
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

.onSnapshot(async(snapshot)=>{

zone.innerHTML = "";

let conversations = [];

/* LOOP AMIS */

for(const doc of snapshot.docs){

let ami =
doc.data();

/* DERNIER MESSAGE */

let dernierMessage =
"Commencez la discussion";

let heure =
"";

let dateMessage = 0;

let messagesSnap =
await db.collection("messages")

.orderBy("date","desc")

.get();

messagesSnap.forEach((mDoc)=>{

let m =
mDoc.data();

let ok =

(
m.from === user.carte
&&
m.to === ami.friendCarte
)

||

(
m.from === ami.friendCarte
&&
m.to === user.carte
);

if(
ok
&&
dateMessage === 0
){

dernierMessage =
m.message;

heure =
m.heure || "";

dateMessage =
m.date || 0;

}

});

/* PUSH */

conversations.push({

ami:ami,

dernierMessage:
dernierMessage,

heure:heure,

date:dateMessage

});

}

/* TRI RECENT */

conversations.sort((a,b)=>{

let pinA=

localStorage.getItem(
"pinned_"+a.ami.friendCarte
);

let pinB=

localStorage.getItem(
"pinned_"+b.ami.friendCarte
);

if(
pinA &&
!pinB
)return -1;

if(
!pinA &&
pinB
)return 1;

return b.date-a.date;

});

/* RENDER */

conversations.forEach((c)=>{

let ami = c.ami;

zone.innerHTML += `

<div
class="conversation-card"

onclick="
ouvrirMessage(
'${ami.friendCarte}'
)"

ontouchstart="
demarrerConversationLong(
'${ami.friendCarte}'
)
"

ontouchend="
annulerConversationLong()
"

>

<div class="conversation-left">

<div class="conversation-avatar">

<img
class="real-avatar"
src="${
ami.friendAvatar ||
'assets/default-user.png'
}">

</div>

<div class="conversation-info">

<div class="conversation-top-row">

<strong>

${ami.friendNom}

</strong>

<span class="conversation-time">

${c.heure}

</span>

</div>

<p class="conversation-preview">

${c.dernierMessage}

</p>

<p
class="conversation-status"
id="status-${ami.friendCarte}">

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

if(
    data.online &&
    diff < 25000
)
{

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

function afficherInfosConversation(){

let params =
new URLSearchParams(
window.location.search
);

let friendCarte =
params.get(
"friend"
);

if(!friendCarte)return;

db.collection("users")

.where(
"carte",
"==",
friendCarte
)

.get()

.then((snapshot)=>{

if(snapshot.empty)return;

let ami =
snapshot.docs[0].data();

/* NOM */

document
.getElementById(
"friend-name"
)
.innerText =
ami.nom;

/* AVATAR */

document
.getElementById(
"friend-avatar"
)
.src =

ami.avatar ||

"assets/default-user.png";

db.collection("status")
.doc(friendCarte)

.onSnapshot((doc)=>{

let zoneStatus =
document.getElementById(
"friend-status"
);

if(!zoneStatus)return;

if(!doc.exists){

zoneStatus.innerHTML =
"⚫ Hors ligne";

return;

}

let data =
doc.data();

let diff =

Date.now() -
(data.lastActive || 0);

if(
data.online &&
diff < 25000
){

zoneStatus.innerHTML =
"🟢 En ligne";

}else{

zoneStatus.innerHTML =
"⚫ Hors ligne";

}

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

let conversationActuelle=null;

let timerConversation;

function demarrerConversationLong(
carte
){

timerConversation=

setTimeout(()=>{

conversationActuelle=
carte;

document
.getElementById(
"conversationMenu"
)

.style.display=
"block";

},700);

}


function annulerConversationLong(){

clearTimeout(
timerConversation);

}


function epinglerConversation(){

localStorage.setItem(

"pinned_"+

conversationActuelle,

true

);

fermerConversationMenu();

}


function archiverConversation(){

localStorage.setItem(

"archived_"+

conversationActuelle,

true

);

fermerConversationMenu();

}


function supprimerConversation(){

localStorage.setItem(

"deleted_"+

conversationActuelle,

true

);

fermerConversationMenu();

}


function fermerConversationMenu(){

document
.getElementById(
"conversationMenu"
)

.style.display=
"none";

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

if(!user) return;

let notifications = [];

/* ========================= */
/* MARQUER DEMANDES LUES */
/* ========================= */

db.collection("friendRequests")

.where(
"from",
"==",
user.carte
)

.where(
"status",
"==",
"accepted"
)

.get()

.then((snapshot)=>{

snapshot.forEach((doc)=>{

db.collection("friendRequests")
.doc(doc.id)

.update({

notificationSeen:true

});

});

});

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

/* TRI RECENT */

liste.sort((a,b)=>{

return b.date - a.date;

});

/* VIDE */

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

let dateFormatee =
new Date(n.date)
.toLocaleString();

zone.innerHTML += `

<div class="history-card notification-card">

<div class="history-icon ${n.iconBg}">

${
n.avatar

?

`<img
src="${n.avatar}"
class="real-avatar">`

:

`<i class="${n.icon}"></i>`
}

</div>

<div class="history-info">

<strong>

${n.title}

</strong>

<small>

${n.text}

<br><br>

${dateFormatee}

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
class="accept-friend-btn"

onclick="
accepterDemande(
'${doc.id}',
'${d.from}',
'${d.fromNom}'
)">

<i class="fa-solid fa-check"></i>

</button>

`;

}else{

texte =
d.message ||
"Vous êtes désormais amis";

}

notifications.push({

id:doc.id,

source:"friends",

type:"amis",

title:"Amis",

text:texte,

date:d.date || Date.now(),

avatar:
d.fromAvatar ||
"assets/default-user.png",

button:button

});

});

renderNotifications();

});

/* ========================= */
/* NOTIFICATIONS SYSTEME */
/* ========================= */

db.collection("notifications")

.where(
"to",
"==",
user.carte
)

.onSnapshot((snapshot)=>{

notifications =
notifications.filter((n)=>{

return n.source !== "system";

});

snapshot.forEach((doc)=>{

let n = doc.data();

notifications.push({

id:doc.id,

source:"system",

type:n.type,

title:n.title,

text:n.text,

date:n.date || Date.now(),

icon:"fa-solid fa-heart",

iconBg:"green-bg"

});

});

renderNotifications();

});

/* ========================= */
/* ANNONCES */
/* ========================= */

db.collection("annonces")

.onSnapshot((snapshot)=>{

notifications =
notifications.filter((n)=>{

return n.source !== "annonces";

});

snapshot.forEach((doc)=>{

let a = doc.data();

notifications.push({

id:doc.id,

source:"annonces",

type:"annonces",

title:"Annonce campus",

text:a.text,

date:a.date || Date.now(),

icon:"fa-solid fa-bullhorn",

iconBg:"orange-bg"

});

});

renderNotifications();

});

/* ========================= */
/* MAINTENANCE */
/* ========================= */

db.collection("maintenance")

.where(
"to",
"==",
user.carte
)

.onSnapshot((snapshot)=>{

notifications =
notifications.filter((n)=>{

return n.source !== "maintenance";

});

snapshot.forEach((doc)=>{

let m = doc.data();

notifications.push({

id:doc.id,

source:"maintenance",

type:"maintenance",

title:"Maintenance",

text:m.probleme || m.text,

date:m.date || Date.now(),

icon:"fa-solid fa-screwdriver-wrench",

iconBg:"red-bg"

});

});

renderNotifications();

});

/* ========================= */
/* RESTAURANT */
/* ========================= */

db.collection("restaurantNotifications")

.where(
"to",
"==",
user.carte
)

.onSnapshot((snapshot)=>{

notifications =
notifications.filter((n)=>{

return n.source !== "restaurant";

});

snapshot.forEach((doc)=>{

let r = doc.data();

notifications.push({

id:doc.id,

source:"restaurant",

type:"restaurant",

title:r.title,

text:r.text,

date:r.date || Date.now(),

icon:"fa-solid fa-utensils",

iconBg:"green-bg"

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

renderNotifications("all");

}

else if(
texte === "amis"
){

renderNotifications("amis");

}

else if(
texte === "maintenance"
){

renderNotifications("maintenance");

}

else if(
texte === "annonces"
||
texte === "campus"
){

renderNotifications("annonces");

}

else if(
texte === "restaurant"
){

renderNotifications("restaurant");

}

});

});

}

// =====================
// MARQUER NOTIFICATIONS LUES
// =====================

function marquerNotificationsLues(){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

db.collection("notifications")

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

db.collection("notifications")
.doc(doc.id)
.update({

seen:true

});

});

});

}

// =====================
// BADGE NOTIFICATIONS
// =====================

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

if(!user) return;

let demandes = 0;
let notificationsNonLues = 0;

function updateBadge(){

let total =
demandes + notificationsNonLues;

if(total <= 0){

badge.style.display =
"none";

badge.innerHTML = "";

return;

}

badge.style.display =
"flex";

badge.innerHTML =
total;

}

/* DEMANDES AMIS */

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

demandes =
snapshot.size;

updateBadge();

});

/* NOTIFICATIONS NON LUES */

db.collection("notifications")

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

notificationsNonLues =
snapshot.size;

updateBadge();

});

}

// =====================
// STATUS UTILISATEUR
// =====================

function gererPresenceUtilisateur(){

let user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user) return;


/* UPDATE */

function updatePresence(){

db.collection("status")
.doc(user.carte)

.set({

nom:user.nom,

online:true,

lastActive:Date.now()

});

}


/* lancement */

updatePresence();


/* refresh toutes les 15 sec */

setInterval(
updatePresence,
15000
);


/* quand app passe en arrière-plan */

document.addEventListener(
"visibilitychange",
function(){

if(document.hidden){

db.collection("status")
.doc(user.carte)

.update({

online:false,

lastActive:Date.now()

});

}else{

updatePresence();

}

});

}

// =====================
// QR RESTAURANT
// =====================

function genererQRRestaurant(){

let zone=
document.getElementById(
"restaurant-qrcode"
);

if(!zone)return;

let user=
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user)return;

zone.innerHTML="";

QRCode.toCanvas(

document.createElement(
"canvas"
),

JSON.stringify({

nom:user.nom,

carte:user.carte,

tickets:{

petitdej:
user.ticketPetitDej||0,

dejeuner:
user.ticketDejeuner||0,

diner:
user.ticketDiner||0

}

}),

{

width:220

},

function(error,canvas){

if(error){

console.log(error);

return;

}

zone.appendChild(
canvas
);

}

);

}

// =====================
// SOLDE RESTAURANT
// =====================
function chargerSolde(){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

/* SOLDE PAR DEFAUT */

if(user.solde === undefined){

user.solde = 5000;

localStorage.setItem(
"user",
JSON.stringify(user)
);

}

document.getElementById(
"solde"
).innerHTML =

user.solde + " FCFA";

}

// =====================
// CHARGER TICKETS
// =====================
function chargerTickets(){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

/* INIT */

if(user.ticketPetitDej === undefined){

user.ticketPetitDej = 0;

}

if(user.ticketDejeuner === undefined){

user.ticketDejeuner = 0;

}

if(user.ticketDiner === undefined){

user.ticketDiner = 0;

}

/* SAVE */

localStorage.setItem(
"user",
JSON.stringify(user)
);

/* UI */

let petitdej =
document.getElementById(
"ticket-petitdej"
);

let dejeuner =
document.getElementById(
"ticket-dejeuner"
);

let diner =
document.getElementById(
"ticket-diner"
);

if(petitdej){

petitdej.innerHTML =
user.ticketPetitDej;

}

if(dejeuner){

dejeuner.innerHTML =
user.ticketDejeuner;

}

if(diner){

diner.innerHTML =
user.ticketDiner;

}

}

// =====================
// ACHETER TICKET
// =====================
function acheterTicket(
prix,
type
){

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

/* INIT SOLDE */

if(user.solde === undefined){

user.solde = 5000;

}

/* VERIF */

if(user.solde < prix){

alert(
"Solde insuffisant"
);

return;

}

/* RETRAIT */

user.solde -= prix;

/* TICKETS */

if(type === "petitdej"){

user.ticketPetitDej =
(user.ticketPetitDej || 0) + 1;

}

if(type === "dejeuner"){

user.ticketDejeuner =
(user.ticketDejeuner || 0) + 1;

}

if(type === "diner"){

user.ticketDiner =
(user.ticketDiner || 0) + 1;

}

/* NOTIFICATION RESTAURANT */

db.collection("restaurantNotifications")

.add({

to:user.carte,

type:"restaurant",

title:"Restaurant universitaire",

text:
"Ticket acheté avec succès",

date:Date.now()

});

/* SAVE */

localStorage.setItem(
"user",
JSON.stringify(user)
);

/* REFRESH */

chargerSolde();

chargerTickets();

/* SUCCESS */

alert(
"Ticket acheté avec succès"
);

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
// GPS PREMIUM
// =====================
let map;
let marker;

function initialiserCarte(){

let zone =
document.getElementById(
"map"
);

if(!zone) return;

/* POSITION PAR DEFAUT */

let lat = 14.6928;
let lon = -17.4467;

/* PARAMS URL */

let params =
new URLSearchParams(
window.location.search
);

if(params.get("lat")){

lat =
parseFloat(
params.get("lat")
);

}

if(params.get("lon")){

lon =
parseFloat(
params.get("lon")
);

}

/* MAP */

map = L.map("map",{

zoomControl:false

}).setView(
[lat, lon],
16
);

/* TILES PREMIUM */

L.tileLayer(

'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

{
attribution:'Smart Campus'
}

).addTo(map);

/* MARKER */

marker = L.marker(
[lat, lon]
).addTo(map);

/* POSITION USER */

navigator.geolocation
.getCurrentPosition(

function(position){

let userLat =
position.coords.latitude;

let userLon =
position.coords.longitude;

/* MOVE MAP */

map.setView(
[userLat, userLon],
17
);

/* MOVE MARKER */

marker.setLatLng(
[userLat, userLon]
);

}

);

}

if("serviceWorker" in navigator){

navigator.serviceWorker
.register("/smart-campus/firebase-messaging-sw.js")

.then((registration)=>{

console.log(
"Service Worker enregistré"
);

});

}

// =====================
// PUSH NOTIFICATIONS
// =====================

async function initialiserNotificationsPush(){

if(!("Notification" in window)){

return;

}

let permission =
await Notification.requestPermission();

if(permission !== "granted"){

return;

}

const messaging =
firebase.messaging();

const registration =
await navigator.serviceWorker.ready;

const token =
await messaging.getToken({

vapidKey:
"BPX6FMJnRXI7t_-RxGINWHEQk7ouHb04-ftgfa34w8-FifQqNHp2LIPVmJoybWjW-UL_QVqt1XPoEUAIY41CiHY",

serviceWorkerRegistration:
registration

});

let user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

db.collection("users")

.where(
"carte",
"==",
user.carte
)

.get()

.then((snapshot)=>{

snapshot.forEach((doc)=>{

db.collection("users")
.doc(doc.id)

.update({

fcmToken:token

});

});

});

messaging.onMessage((payload)=>{

new Notification(

payload.notification.title,

{
body:
payload.notification.body,

icon:"logo.png"
}

);

});

}

/*=====================
SMART CAMPUS AVATAR
=====================*/

const avatars={

garcons:[
"assets/avatars/garcons/g1.png",
"assets/avatars/garcons/g2.png",
"assets/avatars/garcons/g3.png",
"assets/avatars/garcons/g4.png",
"assets/avatars/garcons/g5.png",
"assets/avatars/garcons/g6.png",
"assets/avatars/garcons/g7.png",
"assets/avatars/garcons/g8.png",
"assets/avatars/garcons/g9.png",
"assets/avatars/garcons/g10.png",
"assets/avatars/garcons/g11.png",
"assets/avatars/garcons/g12.png",
"assets/avatars/garcons/g13.png"
],

filles:[
"assets/avatars/filles/f1.png",
"assets/avatars/filles/f2.png",
"assets/avatars/filles/f3.png",
"assets/avatars/filles/f4.png",
"assets/avatars/filles/f5.png",
"assets/avatars/filles/f6.png",
"assets/avatars/filles/f7.png",
"assets/avatars/filles/f8.png",
"assets/avatars/filles/f9.png",
"assets/avatars/filles/f10.png",
"assets/avatars/filles/f11.png",
"assets/avatars/filles/f12.png"
]

};

let avatarChoisi=null;


/* CHARGER */

function chargerAvatars(type="all"){

let container=
document.getElementById(
"avatar-grid"
);

if(!container)return;

container.innerHTML="";

let liste=[];

if(type==="all"){

liste=[
...avatars.garcons,
...avatars.filles
];

}else{

liste=avatars[type];

}

liste.forEach((avatar)=>{

container.innerHTML+=`

<img
src="${avatar}"
class="avatar-item"
data-avatar="${avatar}"
onclick="selectionAvatar(this)"
>

`;

});


if(!avatarChoisi){

avatarChoisi=liste[0];

}

document.getElementById(
"selected-avatar"
).src=
avatarChoisi;

}


/* SELECTION */

function selectionAvatar(img){

document
.querySelectorAll(
".avatar-item"
)

.forEach((a)=>{

a.classList.remove(
"avatar-selected"
);

});

img.classList.add(
"avatar-selected"
);

avatarChoisi=

img.dataset.avatar;

document
.getElementById(
"selected-avatar"
)
.src=

avatarChoisi;

}


/* FILTRE */

function filtrerAvatar(type,btn){

document
.querySelectorAll(
".avatar-filters button"
)

.forEach((b)=>{

b.classList.remove(
"active-filter"
);

});

btn.classList.add(
"active-filter"
);

chargerAvatars(type);

}


/* SAVE */

function sauvegarderAvatarChoisi(){

let user = JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user) return;

db.collection("users")
.doc(user.id)
.update({

avatar:avatarChoisi

})

.then(()=>{

user.avatar=
avatarChoisi;

localStorage.setItem(
"user",
JSON.stringify(user)
);

afficherAvatar();

history.back();

});

}


/* SUPPRIMER */

function supprimerAvatar(){

let user=

JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user)return;

delete user.avatar;

localStorage.setItem(
"user",
JSON.stringify(user)
);

avatarChoisi=
avatars.garcons[0];

afficherAvatar();

chargerAvatars();

}


/* AFFICHAGE GLOBAL */

function afficherAvatar(){

let user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user)return;

let avatar =

user.avatar ||

"assets/default-user.png";

document
.querySelectorAll(
"#profileAvatar,.nav-avatar,#dashboardAvatar"
)

.forEach((img)=>{

img.src =
avatar;

});

}

function afficherAvatarDashboard(){

let user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user)return;

let avatar =

user.avatar ||

"assets/default-user.png";

let img =
document.getElementById(
"dashboardAvatar"
);

if(img){

img.src = avatar;

}

}

function afficherAvatarAmi(){

let params =
new URLSearchParams(
window.location.search
);

let friendCarte =
params.get(
"friend"
);

if(!friendCarte)return;

db.collection("users")

.where(
"carte",
"==",
friendCarte
)

.get()

.then((snapshot)=>{

if(snapshot.empty)return;

let ami =
snapshot.docs[0].data();

let img =
document.getElementById(
"friend-avatar"
);

if(img){

img.src =

ami.avatar ||

"assets/default-user.png";

}

});

}

document.addEventListener(
"contextmenu",
function(e){

if(
e.target.classList.contains("profile-avatar")
||
e.target.classList.contains("selected-avatar")
||
e.target.classList.contains("nav-avatar")
||
e.target.classList.contains("avatar-item")
){

e.preventDefault();

}

}
);


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
// LOGOUT
// =====================

function logout(){

let user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(user){

db.collection("status")
.doc(user.carte)

.update({

online:false,

lastActive:Date.now()

})

.then(()=>{

localStorage.removeItem(
"user"
);

window.location.href =
"index.html";

})

.catch(()=>{

localStorage.removeItem(
"user"
);

window.location.href =
"index.html";

});

}

}



// =====================
// LOAD
// =====================
window.onload = function(){

afficherAvatar();

afficherAvatarDashboard();

afficherAvatarAmi();

initialiserRechercheIntelligente();

initialiserNotificationsPush();

afficherInfosQR();

genererQR();

genererQRRestaurant();

afficherAmis();

afficherNotifications();

afficherBadgeMessages();

gererPresenceUtilisateur();

afficherBadgeNotifications();

marquerNotificationsLues();


};

document.body.style.direction = "ltr";