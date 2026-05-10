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

    let nom = document.getElementById("nom").value;
    let carte = document.getElementById("carte").value;
    let faculte = document.getElementById("faculte").value;
    let niveau = document.getElementById("niveau").value;
    let password = document.getElementById("password").value;

    if(!nom || !carte || !password) {
        alert("Remplis tous les champs");
        return;
    }

    db.collection("users").add({
        nom: nom,
        carte: carte,
        faculte: faculte,
        niveau: niveau,
        password: password,
        role: "etudiant",
        valide: false,
        codifie: false
    })

    .then(() => {

        alert("Inscription envoyée");

        window.location.href = "index.html";
    })

    .catch((error) => {

        console.error(error);

        alert("Erreur inscription");
    });
}

// =====================
// LOGIN ETUDIANT
// =====================
function login() {

    let carte = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    db.collection("users")
      .where("carte", "==", carte)
      .where("password", "==", password)
      .get()

      .then((snapshot) => {

        if(snapshot.empty) {
            alert("Identifiants incorrects");
            return;
        }

        let user = snapshot.docs[0].data();

        if(user.valide === false) {
            alert("Compte non validé");
            return;
        }

        localStorage.setItem("user", JSON.stringify(user));
        db.collection("status")
        .doc(user.carte)

        .set({
           nom: user.nom,

           online: true
        });

        window.location.href = "dashboard.html";
      });
}

// =====================
// LOGIN ADMIN
// =====================
function loginAdmin() {

    let user = document.getElementById("adminUser").value;
    let pass = document.getElementById("adminPass").value;

    if(user === "admin" && pass === "1234") {

        localStorage.setItem("user", JSON.stringify({
            role: "admin",
            nom: "Administrateur"
        }));

        window.location.href = "admin.html";

    } else {

        alert("Accès refusé");
    }
}

// =====================
// VERIFICATION
// =====================
function verifierConnexion(role) {

    let user = JSON.parse(localStorage.getItem("user"));

    if(!user || user.role !== role) {

        window.location.href = "index.html";
    }
}

// =====================
// AFFICHER INSCRIPTIONS
// =====================
function afficherInscriptions() {

    let zone = document.getElementById("inscriptions");

    if(!zone) return;

    db.collection("users")
      .where("valide", "==", false)
      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let u = doc.data();
            let id = doc.id;

            zone.innerHTML += `
                <div class="card">
                    <strong>${u.nom}</strong><br>
                    Carte : ${u.carte}<br>
                    Faculté : ${u.faculte}<br>
                    Niveau : ${u.niveau}<br><br>

                    <button onclick="validerUser('${id}')">
                        Valider
                    </button>
                </div>
            `;
        });
    });
}

// =====================
// VALIDER USER
// =====================
function validerUser(id) {

    db.collection("users").doc(id).update({
        valide: true
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

    let texte =

`Nom : ${user.nom}
Carte : ${user.carte}`;

    zone.innerHTML = "";

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
function afficherInfosQR() {

    let zone = document.getElementById("qr-info");

    if(!zone) return;

    let user = JSON.parse(localStorage.getItem("user"));

    if(!user) return;

    zone.innerHTML = `
        <p><strong>Nom :</strong> ${user.nom}</p>
        <p><strong>Carte :</strong> ${user.carte}</p>
        <p><strong>Faculté :</strong> ${user.faculte}</p>
        <p><strong>Niveau :</strong> ${user.niveau}</p>
    `;
}

function envoyerMaintenance() {

    let probleme =
        document.getElementById("probleme").value;

    if(!probleme) {

        alert("Décris le problème");

        return;
    }

    let user =
        JSON.parse(localStorage.getItem("user"));

    db.collection("maintenance").add({

        nom: user.nom,
        carte: user.carte,
        probleme: probleme,
        statut: "En attente",
        date: new Date().toLocaleString()

    })

    .then(() => {

        alert("Demande envoyée");

        document.getElementById("probleme").value = "";

    })

    .catch((error) => {

        console.error(error);

        alert("Erreur");
    });
}

function afficherMaintenance() {

    let zone =
        document.getElementById("maintenance-list");

    if(!zone) return;

    db.collection("maintenance")
      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let d = doc.data();

            zone.innerHTML += `

                <div class="card">

                    <strong>${d.nom}</strong><br>

                    Carte : ${d.carte}<br>

                    Problème : ${d.probleme}<br>

                    Statut : ${d.statut}<br>

                </div>
            `;
        });
    });
}

function chargerSolde() {

    let user =
        JSON.parse(localStorage.getItem("user"));

    let solde =
        user.solde || 5000;

    document.getElementById("solde").innerHTML =
        solde + " FCFA";
}

function genererQRResto() {

    let zone =
        document.getElementById("qrcode");

    if(!zone) return;

    let user =
        JSON.parse(localStorage.getItem("user"));

    let texte = `
Restaurant COUD
Nom : ${user.nom}
Carte : ${user.carte}
`;

    QRCode.toCanvas(
        document.createElement("canvas"),
        texte,
        function(error, canvas) {

            if(error) return console.error(error);

            zone.appendChild(canvas);
        }
    );
}

function acheterTicket(prix) {

    let user =
        JSON.parse(localStorage.getItem("user"));

    let solde =
        user.solde || 5000;

    if(solde < prix) {

        alert("Solde insuffisant");

        return;
    }

    solde -= prix;

    user.solde = solde;

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    chargerSolde();

    alert("Ticket acheté");
}

function initialiserCarte() {

    let map = L.map('map').setView([14.6928, -17.4467], 15);

    L.tileLayer(
       'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: 'OpenStreetMap'
        }
    ).addTo(map);

    navigator.geolocation.getCurrentPosition(

        function(position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            map.setView([lat, lon], 16);

           let icon = L.icon({

             iconUrl:
             'https://cdn-icons-png.flaticon.com/512/684/684908.png',

             iconSize: [45, 45]
           });

           L.marker(
               [lat, lon],
               { icon: icon }
           )
             .addTo(map)
             .bindPopup("📍 Vous êtes ici")
             .openPopup();
        },

        function() {

            alert("Impossible d’obtenir votre position");
        }
    );
}

function afficherNotifications() {

    let zone =
        document.getElementById("notifications-list");

    if(!zone) return;

    let user =
        JSON.parse(localStorage.getItem("user"));

    db.collection("notifications")
      .where("to", "==", user.carte)

      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let n = doc.data();

            zone.innerHTML += `

                <div class="card">

                    🔔 ${n.text}<br>

                    <small>${n.date}</small>

                </div>
            `;
        });
    });
}

function ajouterAmi() {

    let friendCarte =
        document.getElementById("friendCarte").value;

    let user =
        JSON.parse(localStorage.getItem("user"));

    if(!friendCarte) {

        alert("Entre une carte");

        return;
    }

    db.collection("friendRequests").add({

        from: user.carte,

        fromNom: user.nom,

        to: friendCarte,

        status: "pending"

    })

    .then(() => {

        alert("Demande envoyée");

        document.getElementById("friendCarte").value = "";
    });
}

function afficherAmis() {

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

            <div class="history-card">

                <div class="history-info">

                    <strong>

                        Aucun ami trouvé

                    </strong>

                    <small>

                        Ajoutez des amis
                        depuis les notifications

                    </small>

                </div>

            </div>
            `;

            return;
        }

        snapshot.forEach((doc)=>{

            let ami = doc.data();

            zone.innerHTML += `

            <div class="friend-card">

                <!-- LEFT -->
                <div class="friend-left">

                    <!-- AVATAR -->
                    <div class="friend-avatar">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <!-- INFO -->
                    <div class="friend-info">

                        <strong>

                            ${ami.friendNom}

                        </strong>

                        <p>

                            ${ami.friendCarte}

                        </p>

                    </div>

                </div>

                <!-- ACTIONS -->
                <div class="friend-actions">

                    <!-- MESSAGE -->
                    <button
                    onclick="
                    ouvrirMessage(
                    '${ami.friendCarte}'
                    )">

                        <i class="fa-solid fa-comments"></i>

                    </button>

                    <!-- GPS -->
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

function afficherDemandesAmis() {

    let zone =
        document.getElementById("friend-requests");

    if(!zone) return;

    let user =
        JSON.parse(localStorage.getItem("user"));

    db.collection("friendRequests")
      .where("to", "==", user.carte)

      .where("status", "==", "pending")

      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let d = doc.data();

            zone.innerHTML += `

            <div class="friend-card">

                <div class="friend-left">

                    <div class="friend-avatar">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <div class="friend-info">

                        <strong>

                            ${d.fromNom}

                        </strong>

                        <p>

                            ${d.from}

                        </p>

                    </div>

                </div>

                <div class="friend-actions">

                    <button
                    onclick="accepterDemande(
                    '${doc.id}',
                    '${d.from}',
                    '${d.fromNom}'
                    )">

                        <i class="fa-solid fa-check"></i>

                    </button>

                </div>

            </div>
            `;
        });
    });
}

function accepterDemande(id, amiCarte, amiNom) {

    let user =
        JSON.parse(localStorage.getItem("user"));

    db.collection("friends").add({

        userCarte: user.carte,
        userNom: user.nom,

        friendCarte: amiCarte,
        friendNom: amiNom,
        online: false

    });

    db.collection("friends").add({

        userCarte: amiCarte,
        userNom: amiNom,
        online: false,

        friendCarte: user.carte,
        friendNom: user.nom

    });

    db.collection("friendRequests")
      .doc(id)
      .update({

          status: "accepted"
      });

    alert("Ami ajouté");
}

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

        let data = doc.data();

        if(data.online){

            zone.innerHTML =
            "🟢 En ligne";

        }else{

            zone.innerHTML =
            "⚫ Hors ligne";
        }
    });
}

function envoyerMessage() {

    let destinataire =
        document.getElementById("destinataire").value;

    let texte =
        document.getElementById("message").value;

    let user =
        JSON.parse(localStorage.getItem("user"));

    if(!destinataire || !texte) {

        alert("Remplis tous les champs");

        return;
    }

    db.collection("messages").add({

        from: user.carte,
        to: destinataire,
        message: texte,
        date: new Date().toLocaleString()

    })

    .then(() => {

        alert("Message envoyé");

        document.getElementById("message").value = "";

    });
}

function ouvrirMessage(friendCarte) {

    window.location.href =
        "conversation.html?friend=" + friendCarte;
}

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

            let m = doc.data();

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

            if(conversation){

                let classe =
                "message-ami";

                let expediteur =
                m.fromNom;

                if(
                    m.from === user.carte
                ){

                    classe =
                    "message-moi";

                    expediteur =
                    "Vous";
                }

                zone.innerHTML += `

                <div class="${classe}">

                    <div class="message-text">

                        ${m.message}

                    </div>

                    <div class="message-date">

                        ${expediteur}
                        •
                        ${m.date}

                    </div>

                </div>
                `;
            }
        });

        zone.scrollTop =
        zone.scrollHeight;
    });
}

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

            let ami = doc.data();

            zone.innerHTML += `

            <div class="conversation-card"

            onclick="
            ouvrirMessage(
            '${ami.friendCarte}'
            )">

                <!-- LEFT -->
                <div class="conversation-left">

                    <!-- AVATAR -->
                    <div class="conversation-avatar">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <!-- INFO -->
                    <div class="conversation-info">

                        <strong>

                            ${ami.friendNom}

                        </strong>

                        <p>

                            ${ami.friendCarte}

                        </p>

                    </div>

                </div>

                <!-- RIGHT -->
                <div class="conversation-right">

                    <div class="conversation-time">

                        Hors ligne

                    </div>

                </div>

            </div>
            `;
        });
    });
}

function afficherNomConversation() {

    let params =
        new URLSearchParams(window.location.search);

    let friend =
        params.get("friend");

    let zone =
        document.getElementById("friend-name");

    if(!zone) return;

    db.collection("friends")
      .where("friendCarte", "==", friend)

      .get()

      .then((snapshot) => {

        if(snapshot.empty) return;

        let data =
            snapshot.docs[0].data();

        zone.innerHTML =
            data.friendNom;
      });
}

function partagerPosition() {

    let user =
        JSON.parse(localStorage.getItem("user"));

    let carte =
        user.carte.trim().toUpperCase();

    navigator.geolocation.getCurrentPosition(

        function(position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            db.collection("locations")
              .doc(carte)

              .set({

                  carte: carte,
                  lat: lat,
                  lon: lon

              })

              .then(() => {

                  alert("Position partagée");

                  console.log("Position enregistrée :", carte);
              });
        },

        function(error) {

            console.error(error);

            alert("Impossible d’obtenir la position");
        }
    );
}

function voirPosition(friendCarte) {

    let carte =
        friendCarte.trim().toUpperCase();

    console.log("Recherche position :", carte);

    db.collection("locations")
      .doc(carte)
      .get()

      .then((doc) => {

        if(!doc.exists) {

            alert("Position indisponible");

            return;
        }

        let data = doc.data();

        window.location.href =
            `gps.html?lat=${data.lat}&lon=${data.lon}`;
      })

      .catch((error) => {

          console.error(error);

          alert("Erreur GPS");
      });
}

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

        date:new Date()
        .toLocaleTimeString([],{

            hour:"2-digit",

            minute:"2-digit"
        })
    })

    .then(()=>{

        document.getElementById(
            "message"
        ).value = "";
    });
}

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

/* DASHBOARD */

if(
valeur.includes("dashboard")
||
valeur.includes("accueil")
){

window.location.href =
"dashboard.html";

}

/* GUIDE */

else if(
valeur.includes("guide")
){

window.location.href =
"guide.html";

}

/* RESTAURATION */

else if(
valeur.includes("restaurant")
||
valeur.includes("restauration")
||
valeur.includes("menu")
){

window.location.href =
"restauration.html";

}

/* GPS */

else if(
valeur.includes("gps")
||
valeur.includes("carte")
||
valeur.includes("localisation")
){

window.location.href =
"gps.html";

}

/* AMIS */

else if(
valeur.includes("ami")
||
valeur.includes("amis")
){

window.location.href =
"amis.html";

}

/* NOTIFICATIONS */

else if(
valeur.includes("notification")
||
valeur.includes("notifications")
||
valeur.includes("alerte")
){

window.location.href =
"notifications.html";

}

/* PLANNING */

else if(
valeur.includes("planning")
||
valeur.includes("emploi du temps")
||
valeur.includes("cours")
){

window.location.href =
"planning.html";

}

/* BIBLIOTHEQUE */

else if(
valeur.includes("bibliothèque")
||
valeur.includes("livre")
){

window.location.href =
"bibliotheque.html";

}

/* PROFIL */

else if(
valeur.includes("profil")
||
valeur.includes("compte")
){

window.location.href =
"profile.html";

}

/* SECURITE */

else if(
valeur.includes("sécurité")
||
valeur.includes("mot de passe")
){

window.location.href =
"securite.html";

}

/* LANGUE */

else if(
valeur.includes("langue")
||
valeur.includes("english")
||
valeur.includes("français")
||
valeur.includes("arabe")
){

window.location.href =
"langue.html";

}

/* QR */

else if(
valeur.includes("qr")
||
valeur.includes("scanner")
){

window.location.href =
"scanner.html";

}

/* NOTHING */

else{

alert(
"Aucun résultat trouvé."
);

}

});
});

}

/* INIT */

initialiserRechercheIntelligente();


// =====================
// LANGUES
// =====================

const traductions = {

fr: {

bonjour: "Bonjour 👋",

guide: "Guide",

restaurant: "Restaurant",

amis: "Amis",

messages: "Messages",

profil: "Profil",

notifications: "Notifications",

planning: "Planning",

rechercher: "Rechercher un service..."

},

en: {

bonjour: "Hello 👋",

guide: "Guide",

restaurant: "Restaurant",

amis: "Friends",

messages: "Messages",

profil: "Profile",

notifications: "Notifications",

planning: "Schedule",

rechercher: "Search a service..."

},

ar: {

bonjour: "مرحبا 👋",

guide: "الدليل",

restaurant: "المطعم",

amis: "الأصدقاء",

messages: "الرسائل",

profil: "الملف الشخصي",

notifications: "الإشعارات",

planning: "الجدول",

rechercher: "ابحث عن خدمة..."

}

};

// =====================
// APPLIQUER LANGUE
// =====================

function appliquerLangue(){

let langue =
localStorage.getItem("langue") || "fr";

/* DIRECTION */

if(langue === "ar"){

document.body.style.direction = "rtl";

}else{

document.body.style.direction = "ltr";

}

/* BONJOUR */

let hello =
document.querySelector(".hello-title");

if(hello){

hello.innerHTML =
traductions[langue].bonjour;
}

/* SEARCH */

let search =
document.querySelector(".modern-search input");

if(search){

search.placeholder =
traductions[langue].rechercher;
}

/* CARTES */

document.querySelectorAll(".premium-card span")
.forEach((item)=>{

let texte =
item.innerHTML.trim();

if(texte === "Guide"){

item.innerHTML =
traductions[langue].guide;

}

if(texte === "Restaurant"){

item.innerHTML =
traductions[langue].restaurant;

}

if(texte === "Amis"){

item.innerHTML =
traductions[langue].amis;

}

if(texte === "Messages"){

item.innerHTML =
traductions[langue].messages;

}

});

/* NAVBAR */

document.querySelectorAll(".ios-navbar a")
.forEach((item,index)=>{

if(index === 2){

item.title =
traductions[langue].notifications;

}

if(index === 4){

item.title =
traductions[langue].profil;

}

});

}

/* LOAD */

appliquerLangue();


// =====================
// LOGOUT
// =====================
function logout() {

    let user =
    JSON.parse(localStorage.getItem("user"));

    if(user) {

      db.collection("status")
        .doc(user.carte)

        .set({

          nom: user.nom,
          online: false
      });
    }

    localStorage.removeItem("user");

    window.location.href = "index.html";
}

// =====================
// LOAD
// =====================
window.onload = function() {

    afficherInscriptions();

    afficherInfosQR();

    genererQR();

    afficherMaintenance();

    afficherAmis();

    afficherNotifications();
};