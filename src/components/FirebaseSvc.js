import firebase from 'react-native-firebase';
import md5 from 'md5';

const config = {
    apiKey: "AIzaSyBGv3PSssHzGjiD0jsnuO7mIkE3UuNbZ4Q",
    authDomain: "contacts-21d64.firebaseapp.com",
    databaseURL: "https://contacts-21d64.firebaseio.com/",
    projectId: "contacts-21d64",
    storageBucket: "gs://contacts-21d64.appspot.com",
    messagingSenderId: "353328083696"
}
var senderNewId = "";
var groupId = "";
class FirebaseSvc {
    constructor() {
        if (!firebase.apps.length) { //avoid re-initializing
            firebase.initializeApp(config);
        } else {
            console.log("firebase apps already running...")
        }
    }

    login = async(phonenumber, success_callback, failed_callback) => {
      console.log('user details', phonenumber)
        await firebase.auth().signInWithPhoneNumber(phonenumber).then(success_callback, failed_callback);
    }

    get uid() {
      return (firebase.auth().currentUser || {}).uid;
    }
  
    get ref() {      
      var number = senderNewId.replace(/\s/g,'');
      console.log('messages sent', "ref "+number)
      return firebase.database().ref(`chatOneToOne/${number}/${Date.parse(new Date())}`);
    }

    get ref1() {     
      var number = senderNewId.replace(/\s/g,'');
      console.log('messages sent', "refok "+number)
      return firebase.database().ref(`chatOneToOne/${number}`);
    }
    

    get refGroup() {     
      console.log('messages sent', "refok "+global.newCreatedKey)
      return firebase.database().ref(`UserGroups/${global.newCreatedKey}/groupMessages`);
    }
    
    

    //Send message in group
    get groupSendref() {       
      groupId = global.newCreatedKey
      groupId = groupId.replace(/\s/g,'');
      console.log('messages sent', "ref "+groupId)
      return firebase.database().ref(`UserGroups/${groupId}/groupMessages`);
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
  
    refOn = callback =>  {
      senderNewId = this.setOneToOneChat (global.userId,global.reciverUser).replace(/\s/g,'');;//global.reciverUser+global.phoneNumber;
      this.ref1
        .limitToLast(20)
        .on('child_added', snapshot => callback(this.parse(snapshot)));
    }
  

    refOnGroup = callback =>  {
       this.refGroup
        .limitToLast(20)
        .on('child_added', snapshot => callback(this.parse(snapshot)));
    }

    get timestamp() {
      return firebase.database.ServerValue.TIMESTAMP;
    }
    
    // send the message to the Backend
    send = messages => {      
      console.log('messages sent 333333', messages)
      for (let i = 0; i < messages.length; i++) {
        const { text, user } = messages[i];
        const senderUser = {
          phonenumber: global.phoneNumber,                      
          senderId:global.userId
        }
        const message = {
          text,
          user,
        //  senderUser: senderUser,
          createdAt: new Date(),
        };

        console.log('UserDetails reciverUser global used data', global.userId, global.reciverUser)

        senderNewId = this.setOneToOneChat (global.userId,global.reciverUser).replace(/\s/g,'');
        console.log('messages sent1111111', senderNewId)
        this.ref.set(message);
      }
    };

    // send the message to the Backend
    sendInGroup = messages => {      
      console.log('messages sent 333333', messages)
      for (let i = 0; i < messages.length; i++) {
        const { text, user } = messages[i];
        const senderUser = {
          phonenumber: global.phoneNumber,                      
          senderId:global.userId
        }
        const message = {
          text,
          user,
          senderUser: senderUser,
          createdAt: new Date(),
        };
        senderNewId = this.setOneToOneChat (global.userId,global.reciverUser).replace(/\s/g,'');
        console.log('messages sent1111111', senderNewId)
        this.groupSendref.push(message);
      }
    };

 setOneToOneChat( uid1, uid2)  {
  //Check if user1’s id is less than user2's
  if(uid1 <uid2){     
    return md5(uid1+uid2)
  } else {
    return md5(uid2+uid1)
  }
}
  
    sendGroupMessage = messages => {        
      return db.collection('GroupChat').add(messages);        
    }

    refOff() {
      this.ref.off();
    }
}

const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
  
