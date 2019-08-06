import React, { Component } from 'react'
import { SafeAreaView, View, DeviceEventEmitter, Text, TouchableOpacity, ScrollView } from 'react-native'
import styles from './styles'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import firebase from 'react-native-firebase'
import { GiftedChat } from 'react-native-gifted-chat';
import firebaseSvc from '../../../components/FirebaseSvc'
import { Dimensions } from 'react-native'
import AccessoryBar from '../../../lib/AccessoryBar'
import OneSignal from 'react-native-onesignal';

const {width, height} = Dimensions.get('window')
class MessageScreen extends Component {
    constructor() {
        super()
        this.state = {
            messages: [],            
        }
    }

    componentDidMount () {  
        // OneSignal.removeEventListener('received', this.onReceived);        
        OneSignal.inFocusDisplaying(0);

        DeviceEventEmitter.addListener('callMethod', this.refreshMessages.bind(this))        

        if (this.props.navigation.state.params.selectedIndex == 0) {
            var selectedUserPhon =  this.props.navigation.state.params.phonenumber.phonenumber.replace(/\s/g,'')
            
            firebase.database().ref(`users/${selectedUserPhon}`).once('value', snapshot => {
                //if(snapshot.exists()) {
                    const contacts = snapshot
                // this.setState({loading: false, commonContacts: getCommonContacts(this.props.contactInfo.myContacts, contacts)})
                if (contacts._value != undefined) {
                    var chatIdValue = Object.keys(contacts._value)[0]

                    console.log('UserDetails reciverUser 111111', chatIdValue)

                    if (chatIdValue === 'chat_groups_ids' || chatIdValue === 'playerId') {
                        chatIdValue = Object.keys(contacts._value)[1];
                    } 

                    console.log('UserDetails reciverUser 2222 ', chatIdValue)

                    if (chatIdValue === 'chat_groups_ids' || chatIdValue === 'playerId') {
                        chatIdValue = Object.keys(contacts._value)[2];
                    }

                    console.log('UserDetails reciverUser 33333', chatIdValue)

                    global.reciverUser = chatIdValue;                        
                }
            })    
            setTimeout(() => {
                firebaseSvc.refOn(message =>                                
                    this.setState(previousState => ({
                      messages: GiftedChat.append(previousState.messages, message),
                    })),
                    this.forceUpdate()
                );
            },1000);            

        } else {
            firebaseSvc.refOnGroup(message =>
                this.setState(previousState => ({
                  messages: GiftedChat.append(previousState.messages, message),
                })),
                this.forceUpdate()
            );            
        }      
    firebase.messaging().hasPermission()
        .then(enabled => {
            if (enabled) {
                // user has permissions
                console.log('user has permissions', enabled)
                firebase.messaging().getToken().then(token =>{
                    console.log('user has permissions', token)
                })
            } else {
                // user doesn't have permission
                console.log('user doesnt have permission')

                firebase.messaging().requestPermission()
                .then()
                .catch(error => {
                    // User has rejected permissions  
                });
            } 
        });
    }

    removeAllObjecstFromArray = () => {
        var start_index = 0
        var number_of_elements_to_remove = this.state.messages.length
        var removed_elements = this.state.messages.splice(start_index, number_of_elements_to_remove);
    }
    
    refreshMessages = (currentMessage) => {
        // this.removeAllObjecstFromArray()

        console.log('current message which is deleted', currentMessage.currentMessage)

        this.setState(previousState =>
            ({ messages: previousState.messages.filter(message => message.id !== currentMessage.currentMessage.id) }))

        // setTimeout(() => {
        //     if (this.props.navigation.state.params.selectedIndex == 0) {
        //         firebaseSvc.refOn(message =>                                                    
        //             this.setState(previousState => ({
        //                 messages: GiftedChat.append(previousState.messages, message),                        
        //             })),                    
        //         );            
    
        //     } else {
        //         firebaseSvc.refOnGroup(message =>
        //             this.setState(previousState => ({
        //               messages: GiftedChat.append(previousState.messages, message),
        //             })),                    
        //         );            
        //     } 
        // }, 1000);        
    }

    componentWillUnmount() {
        OneSignal.inFocusDisplaying(1);
        firebaseSvc.refOff();
    }


    componentWillMount() {
        this.setState({
          // messages: [
          //   {
          //     _id: 2,
          //     text: 'Hello developer',
          //     createdAt: new Date(),
          //     user: {
          //       _id: 1,
          //       name: 'React Native',
          //       avatar: 'https://placeimg.com/140/140/any',
          //     },
          //   },
          // ],
        })
    }
    
    get user() {
        return {
            _id: global.userId,
        };           
    }

    getGroupMessages = () =>{  
        console.log('paldineshGroup number ', global.newCreatedKey) 
        firebase.database().ref(`UserGroups/${global.newCreatedKey}/groupMessages`).once('value', snapshot => {
            if(snapshot.exists()) {
                var groupKeys = snapshot._value;

                
                if(groupKeys!=undefined){   
                    console.log('paldineshGroup keys', groupKeys.groupKeys) 
                 
                    this.setState(previousState => ({
                        messages: GiftedChat.append(previousState.messages, groupKeys.groupKeys),
                      })),
                      this.forceUpdate()
                }        
        }
        else{
           
        }                      
        } )        
  }

  onDelete(messageIdToDelete) {
    this.setState(previousState =>
      ({ messages: previousState.messages.filter(message => message.id !== messageIdToDelete) }))
  }

    showImagePicker = (uri) =>{
        console.log('image uri', uri[0].image)
        this.uploadImage (uri[0].image)
    }
    uploadImage = (uri) => {
        uri = uri
        const ext = uri.split('.').pop(); // Extract image extension
        const filename = ""+`${new Date()}.${ext}`; // Generate unique name
        var fileTypeFolder = 'images';
        if(ext==='jpg'|| ext==='JPG' || ext==='JPEG' || ext==='jpeg' || ext==='PNG' || ext==='png'){
            //Call fuction to upload image  
            fileTypeFolder = 'images'; 
        } else {
            //if(ext==='jpg'|| ext==='JPG' || ext==='JPEG' || ext==='jpeg' || ext==='PNG' || ext==='png'){
            //Call fuction to upload image
            fileTypeFolder = 'videos';   
        }

        //Uploading image
        firebase
        .storage()
        .ref(`${fileTypeFolder}/${filename}`)
        .putFile(uri)
        .on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
            let state = {};
            state = {
                ...state,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // Calculate progress percentage
            };
            if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
                // global.image = snapshot.downloadURL ;  
                
                //Create message for send if image selected
                var messageData = {text: '',
                user: {_id:global.userId},             
                _id:global.userId }  

                this.state.messages.push(messageData);      //Update message list 

                console.log('messages with image', this.state.messages)
                if(ext != null) {
                    var fileType =0;
                    if(ext==='jpg'|| ext==='JPG' || ext==='JPEG' || ext==='jpeg' || ext==='PNG' || ext==='png'){
                        //Call fuction to upload image  
                        fileType = 1;             
                    } else {                    
                        fileType = 2;      
                    }
                    firebaseSvc.sendMedia(fileType,snapshot.downloadURL); 
                    
                }                          
            }
        },
            error => {       
                alert('Sorry, Try again.');
            }
        );
    };

   

    renderAccessory = () => <AccessoryBar onSend={this.showImagePicker} />

    render() {
        // const { params } = this.props.navigation.state.params

        console.log('params log 1111111', this.props.navigation.state.params.groupDetailsNew)

        return (
            <SafeAreaView style={styles.container}>
                <View style={{width: '100%', height: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderColor: 'lightgray', borderBottomWidth: 1}}>
                    <TouchableOpacity style={{height:44, alignItems:'center', justifyContent:'center', width:44,}} onPress={() => this.props.navigation.goBack()}>
                        <Icon name="chevron-left" size={24} color="gray" />
                    </TouchableOpacity>
                    <View style={{flex: 1, paddingLeft: 20}}>
                        <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>{ 
                            this.props.navigation.state.params.selectedIndex === 1 ? this.props.navigation.state.params.groupDetailsNew.groupDetails.groupName : this.props.navigation.state.params.phonenumber.name
                        }</Text>
                    </View>
                </View>
                <View style={{width: '100%', flex: 1}}>
                <GiftedChat                     
                    messages={this.state.messages}
                    onSend={
                        this.props.navigation.state.params.selectedIndex === 1 
                        ?
                        firebaseSvc.sendInGroup
                        :
                        firebaseSvc.send
                    }
                    user={this.user}     
                    renderAccessory={this.renderAccessory}               
                />
                </View>
            </SafeAreaView>
        )
    }
}

export default MessageScreen