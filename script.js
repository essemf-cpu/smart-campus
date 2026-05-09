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
function genererQR() {

    let zone = document.getElementById("qrcode");

    if(!zone) return;

    let user = JSON.parse(localStorage.getItem("user"));

    if(!user) return;

    let texte = `
Nom : ${user.nom}
Carte : ${user.carte}
`;

    zone.innerHTML = "";

    QRCode.toCanvas(
        document.createElement("canvas"),
        texte,
        function(error, canvas) {

            if(error) return console.error(error);

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

            L.marker([lat, lon])
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
        document.getElementById("liste-amis");

    if(!zone) return;

    let user =
        JSON.parse(localStorage.getItem("user"));

    db.collection("friends")
      .where("userCarte", "==", user.carte)

      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let ami = doc.data();

            zone.innerHTML += `

    <div class="friend-card">

        <div class="friend-avatar">

            <i class="fa-solid fa-user"></i>

        </div>

        <div class="friend-info">

            <strong>${ami.friendNom}</strong>

            <small>${ami.friendCarte}</small>

        </div>

        <div class="friend-actions">

            <button onclick="ouvrirMessage('${ami.friendCarte}')">

                <i class="fa-solid fa-comments"></i>

            </button>

            <button onclick="voirPosition('${ami.friendCarte}')">

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

        <div class="friend-avatar">

            <i class="fa-solid fa-user"></i>

        </div>

        <div class="friend-info">

            <strong>${d.fromNom}</strong>

            <small>${d.from}</small>

        </div>

        <div class="friend-actions">

            <button onclick="accepterDemande('${doc.id}', '${d.from}', '${d.fromNom}')">

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
        friendNom: amiNom

    });

    db.collection("friends").add({

        userCarte: amiCarte,
        userNom: amiNom,

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

function afficherMessages() {

    let zone =
        document.getElementById("messages-list");

    if(!zone) return;

    let user =
        JSON.parse(localStorage.getItem("user"));

    let params =
        new URLSearchParams(window.location.search);

    let friend =
        params.get("friend");

    db.collection("messages")
      .orderBy("date")

      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let m = doc.data();

            let conversation =
            (
                m.from === user.carte &&
                m.to === friend
            )
            ||
            (
                m.from === friend &&
                m.to === user.carte
            );

      if(conversation) {

          let expediteur = m.fromNom;

          let classeMessage = "message-ami";

       if(m.from === user.carte) {

          expediteur = "Vous";

          classeMessage = "message-moi";
        }

          zone.innerHTML += `

    <div class="${classeMessage}">

        <div class="message-name">

            ${expediteur}

        </div>

        <div class="message-text">

            ${m.message}

        </div>

        <div class="message-date">

            ${m.date}

        </div>

    </div>
`;
            }
        });
    });
}

function afficherConversations() {

    let zone =
        document.getElementById("conversations-list");

    if(!zone) return;

    let user =
        JSON.parse(localStorage.getItem("user"));

    db.collection("friends")
      .where("userCarte", "==", user.carte)

      .onSnapshot((snapshot) => {

        zone.innerHTML = "";

        snapshot.forEach((doc) => {

            let ami = doc.data();

            zone.innerHTML += `

                <div class="friend-card"

                     onclick="ouvrirMessage('${ami.friendCarte}')">

                    <div class="friend-avatar">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <div class="friend-info">

                        <strong>${ami.friendNom}</strong>

                        <small>${ami.friendCarte}</small>

                    </div>

                </div>
            `;
        });
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

function envoyerMessagePrive() {

    let texte =
        document.getElementById("message").value;

    let user =
        JSON.parse(localStorage.getItem("user"));

    let params =
        new URLSearchParams(window.location.search);

    let friend =
        params.get("friend");

    if(!texte) {

        alert("Entre un message");

        return;
    }

    db.collection("messages").add({

        from: user.carte,

        fromNom: user.nom,

        to: friend,

        message: texte,

        date: new Date().toLocaleString()

    })

    .then(() => {

        document.getElementById("message").value = "";
    });
}

// =====================
// LOGOUT
// =====================
function logout() {

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

    afficherDemandesAmis();

    afficherAmis();

    afficherNotifications();
};