importScripts(
"https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"
);

importScripts(
"https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

firebase.initializeApp({

apiKey: "AIzaSyCrdqwoG_K39s7_mWCeLprvnUDIBGqcfUY",

authDomain: "smart-campus-58151.firebaseapp.com",

projectId: "smart-campus-58151",

messagingSenderId: "631084577067",

appId: "1:631084577067:web:bb690c895fc96411dc556e"

});

const messaging =
firebase.messaging();

messaging.setBackgroundMessageHandler(

function(payload){

return self.registration.showNotification(

payload.notification.title,

{
body:
payload.notification.body,

icon:"logo.png"
}

);

});