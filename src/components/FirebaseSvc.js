import firebase from 'react-native-firebase';

const config = {
    apiKey: "AIzaSyBGv3PSssHzGjiD0jsnuO7mIkE3UuNbZ4Q",
    authDomain: "contacts-21d64.firebaseapp.com",
    databaseURL: "https://contacts-21d64.firebaseio.com/",
    projectId: "contacts-21d64",
    storageBucket: "gs://contacts-21d64.appspot.com",
    messagingSenderId: "353328083696"
}

class FirebaseSvc {
    constructor() {
        if (!firebase.apps.length) { //avoid re-initializing
            firebase.initializeApp(config);
        } else {
            console.log("firebase apps already running...")
        }
    }

    login = async(user, success_callback, failed_callback) => {
        await firebase.auth().signInWithPhoneNumber(user.phonenumber).then(success_callback, failed_callback);
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
      }
    
      get ref() {
        return firebase.database().ref('Messages');
      }
    
      parse = snapshot => {
        const { timestamp: numberStamp, text, user } = snapshot.val();
        const { key: id } = snapshot;
        const { key: _id } = snapshot; //needed for giftedchat
        const timestamp = new Date(numberStamp);
    
        const message = {
          id,
          _id,
          timestamp,
          text,
          user,
        };
        return message;
      };
    
      refOn = callback => {
        this.ref
          .limitToLast(20)
          .on('child_added', snapshot => callback(this.parse(snapshot)));
      }
    
      get timestamp() {
        return firebase.database.ServerValue.TIMESTAMP;
      }
      
      // send the message to the Backend
      send = messages => {
        console.log('messages sent', messages)
        for (let i = 0; i < messages.length; i++) {
          const { text, user } = messages[i];
          const senderUser = {
            phonenumber: global.phoneNumber,                      
            senderId:global.userId
          }

          const message = {
            text,
            user:user,
            senderUser: senderUser,
            createdAt: new Date(),
          };
          this.ref.push(message);
        }
      };
    
      refOff() {
        this.ref.off();
      }
}

const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
  
