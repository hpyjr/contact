import React, { Component } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import styles from './styles'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import firebase from 'react-native-firebase'
import { GiftedChat } from 'react-native-gifted-chat';
import firebaseSvc from '../../../components/FirebaseSvc'
import { Dimensions } from 'react-native'

const {width, height} = Dimensions.get('window')
class MessageScreen extends Component {
    constructor() {
        super()
        this.state = {
            messages: [],            
        }
    }

    componentDidMount () {    
        
        console.log('params log 22222', this.props.navigation.state.params.selectedIndex)

        if (this.props.navigation.state.params.selectedIndex == 0) {
            var selectedUserPhon =  this.props.navigation.state.params.phonenumber.phonenumber.replace(/\s/g,'')
            
            firebase.database().ref(`users/${selectedUserPhon}`).once('value', snapshot => {
                //if(snapshot.exists()) {
                    const contacts = snapshot
                // this.setState({loading: false, commonContacts: getCommonContacts(this.props.contactInfo.myContacts, contacts)})
                if (contacts._value != undefined) {
                    var chatIdValue = Object.keys(contacts._value)[0]

                    console.log('UserDetails reciverUser', Object.keys(contacts._value)[0])

                    if (chatIdValue === 'chat_groups_ids') {
                        global.reciverUser = Object.keys(contacts._value)[1];                        
                    } else {
                        global.reciverUser = Object.keys(contacts._value)[0];                        
                    }
                }
                
                //} else {
                //    this.setState({loading: false, commonContacts: []})
                //}
            })
    
        } else {
            // this.getGroupMessages()

            firebaseSvc.refOnGroup(message =>
                this.setState(previousState => ({
                  messages: GiftedChat.append(previousState.messages, message),
                })),
                this.forceUpdate()
            );            
        }      
        

        firebaseSvc.refOn(message =>
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, message),
            })),
            this.forceUpdate()
        );

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

    componentWillUnmount() {
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
                        this.props.navigation.state.params.selectedIndex === 1 ?
                        firebaseSvc.sendInGroup
                        :
                        firebaseSvc.send
                    }
                    user={this.user}                    
                />
                </View>
            </SafeAreaView>
        )
    }
}

export default MessageScreen