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

        console.log('this.props.navigation.state.params.phonenumber', this.props.navigation.state.params.phonenumber)
        firebaseSvc.refOn(message =>
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, message),
            }))
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
          phonenumber: this.props.navigation.state.params.phonenumber.phonenumber,          
          id: firebaseSvc.uid,
          receiverId:this.props.navigation.state.params.phonenumber.userId
        };
      }

    render() {
        const { params } = this.props.navigation.state

        return (
            <SafeAreaView style={styles.container}>
                <View style={{width: '100%', height: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderColor: 'lightgray', borderBottomWidth: 1}}>
                    <TouchableOpacity style={{height:44, alignItems:'center', justifyContent:'center', width:44,}} onPress={() => this.props.navigation.goBack()}>
                        <Icon name="chevron-left" size={24} color="gray" />
                    </TouchableOpacity>
                    <View style={{flex: 1, paddingLeft: 20}}>
                        <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>{'Message'}</Text>
                    </View>
                </View>
                <View style={{width: '100%', flex: 1}}>
                <GiftedChat                     
                    messages={this.state.messages}
                    onSend={firebaseSvc.send}
                    user={this.user}                    
                />
                </View>
            </SafeAreaView>
        )
    }
}

export default MessageScreen