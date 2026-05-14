const functions =
require("firebase-functions");

const admin =
require("firebase-admin");

admin.initializeApp();

exports.nouveauMessage =
functions.firestore

.document("messages/{id}")

.onCreate(async(snapshot)=>{

const message =
snapshot.data();

/* DESTINATAIRE */

const users =
await admin.firestore()

.collection("users")

.where(
"carte",
"==",
message.to
)

.get();

if(users.empty){

return null;

}

const userData =
users.docs[0].data();

if(!userData.fcmToken){

return null;

}

/* NOTIFICATION */

const payload = {

notification:{

title:
"Nouveau message 💬",

body:
message.fromNom +
" : " +
message.message

}

};

/* ENVOI */

return admin.messaging()

.sendToDevice(
userData.fcmToken,
payload
);

});