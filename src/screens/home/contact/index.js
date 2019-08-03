import React, { Component } from 'react'
import { SafeAreaView, View, Text, TextInput, Alert, Image, Modal, FlatList, TouchableOpacity } from 'react-native'
import styles from './styles'
import firebase from 'react-native-firebase'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import SimpleToast from 'react-native-simple-toast';
import { connect } from 'react-redux'
import { setContacts } from '../../../actions/contact'
import Contact from '../../../components/Contact';
import Spinner from 'react-native-loading-spinner-overlay'
import { parsePhoneNumber } from 'libphonenumber-js'
import Popover from 'react-native-popover-view'
import { Dimensions } from 'react-native'
import { Divider, CheckBox } from 'react-native-elements'
import SearchInput, { createFilter } from 'react-native-search-filter';
const KEYS_TO_FILTERS = ['name', 'phonenumber'];
import { getCommonContacts } from '../../../utils/contact'
const {width, height} = Dimensions.get('window')
import Contacts from 'react-native-contacts';
import SegmentedControlTab from "react-native-segmented-control-tab";
// import OneSignal from 'react-native-onesignal';

import firebaseSvc from '../../../components/FirebaseSvc'

class ContactScreen extends Component {
    constructor() {
        super()
        this.state = {
            loading: true,
            phoneNumber: null,
            countryCallingCode: null,
            contacts: [],
            modalVisible: false,
            filterItems: [{ id: 2, title: 'Alphabetical' }, { id: 3, title: 'Connections' }], //{ id: 4, title: 'Recently Added' }
            searchTerm: '',
            selectedValues: [],
            commonContacts: [],
            isSearching:false,
            newArray:[],
            ascending:false,
            selectedIndex: 0,
            groupArray: [],
            userGroupArray: [],
            largImageModal:false,
            groupName:''
        }

        // OneSignal.init("350aa5f2-ae5b-4e4b-b2e6-3178cbb6957b");

        // OneSignal.addEventListener('received', this.onReceived);
        // OneSignal.addEventListener('opened', this.onOpened);
        // OneSignal.addEventListener('ids', this.onIds);
        // OneSignal.configure(); 	// triggers the ids event
    }

    componentWillUnmount() {
        // OneSignal.removeEventListener('received', this.onReceived);
        // OneSignal.removeEventListener('opened', this.onOpened);
        // OneSignal.removeEventListener('ids', this.onIds);
    }
    
    // onReceived(notification) {
    //     console.log("Notification received: ", notification);
    // }

    // onOpened(openResult) {
    //     console.log('Message: ', openResult.notification.payload.body);
    //     console.log('Data: ', openResult.notification.payload.additionalData);
    //     console.log('isActive: ', openResult.notification.isAppInFocus);
    //     console.log('openResult: ', openResult);
    // }

    // onIds(device) {
    //     console.log('Device info: ', device);
    //     global.playerId = device.userId
    // }

     //Send message in group
     getGroupIdsref = () =>{  

        this.setState({ userGroupArray: [] })
        console.log('paldineshGroup number ', global.phoneNumber) 
        firebase.database().ref(`users/${global.phoneNumber}/chat_groups_ids`).once('value', snapshot => {
            if(snapshot.exists()) {
                var groupKeys = snapshot._value;
                console.log('paldineshGroup keys', groupKeys)  

                
                if(groupKeys!=undefined){                    
                    groupKeys.forEach(singleKey => {
                        
                        firebase.database().ref(`UserGroups/${singleKey}`).once('value', snapshot => {
                            if(snapshot.exists()) {
                                var groupDetails = snapshot._value;
                                
                                if(groupDetails != undefined){  
                                    
                                    console.log('paldineshGroup details singleKey', singleKey)  

                                    var object = {'groupKey' : singleKey, 'groupDetails' : groupDetails}                                    
                                    this.state.userGroupArray.push(object) 
                                    this.forceUpdate()   
                                }        
                            } else{
                        
                            }                      
                        })                        
                    });
                }        
        }
        else{
           
        }                      
        } )        
  }

    //Create group
    creatGroup = () =>{

        var that = this        
        this.setState({ largImageModal: false })
       const groupMambers = [];
        var selfUid = global.userId

        groupMambers.push(selfUid);
        
        var  groupMambers1 = [];
        
        groupMambers1.push(global.phoneNumber)
        this.state.selectedValues.forEach(element => {
            groupMambers.push(element.userUid);    
            groupMambers1.push(element.phonenumber)
           
            // groupMambers.push('qL14U05gXmgBWDCBm7dMZ1u675n1');    
        });
        //Message formate
        const groupWelcomeMessage = {
            createdAt: new Date(),
            sender: selfUid,
            message: 'welcome',
        }

        const groupMessages = [groupWelcomeMessage];
        
        var groupName = this.state.groupName;
        const groupData = {
            createdBy: selfUid,
            groupName,
            groupMambers,
            createdAt: new Date(),
            groupMessages
        };
        console.log('udidNumber', selfUid)

    firebase.database().ref(`UserGroups`).push(groupData).once('value').then(function (snapshot) {
            //if(snapshot.exists()) {
            const contacts = snapshot
            // this.setState({loading: false, commonContacts: getCommonContacts(this.props.contactInfo.myContacts, contacts)})
            console.log('movegroupChat', contacts)           
            var newCreatedKey = contacts.key;
            console.log('movegroupChat1 Keys', newCreatedKey)  

        // var  groupMambers1 = [];
        // groupMambers1.push('+918817040143')
        // groupMambers1.push('+919893074069')

        var counts = 0;
        groupMambers1.forEach(contact => {
            var contactNumber = contact.replace(/\s/g,'')
            console.log('movegroupChat $$ $$ >>', contactNumber+" " +newCreatedKey)
            var chat_groups_ids = [newCreatedKey];
            counts++;
            firebase.database().ref(`users/${contactNumber}/chat_groups_ids`).once('value', snapshot => {
                if(snapshot.exists()) {
            var groupKeys = snapshot._value;
            console.log('paldinesh', groupKeys)  
            if(groupKeys!=undefined){
                chat_groups_ids.push(...groupKeys)
            }
            firebase.database().ref(`users/${contactNumber}/`).update({chat_groups_ids})              
                console.log('paldinesh list', chat_groups_ids)  
            }
            else{
                firebase.database().ref(`users/${contactNumber}/`).update({chat_groups_ids})
            }                      
            }            
            )  

            console.log('global.newCreatedKey 2311212', counts, (groupMambers1.length) - 1)

            if(counts == (groupMambers1.length) - 1){
                global.newCreatedKey = newCreatedKey
                
                setTimeout(() => {
                    var groupDetails = {groupDetails:{groupName:that.state.groupName}}
                
                    that.props.navigation.navigate('message', {selectedIndex: 1, groupDetailsNew: groupDetails})
                }, 1000);                
            }
        })      
        })
    }

    componentDidMount() {        
        this.updateContacts()        
    }

    handleIndexChange = index => {
        this.setState({
          ...this.state,
          selectedIndex: index
        });

        if (index == 1) {
            this.getGroupIdsref()
        }
      };

    syncContactsToFirebase = () => {
        
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                var selfUid =user._user.uid
                            console.log('udidNumber', selfUid)
                this.setState({ phoneNumber: user.phoneNumber, countryCallingCode: parsePhoneNumber(user.phoneNumber).countryCallingCode });
                firebase.database().ref(`users/${user.phoneNumber}/${selfUid}`).once('value', snapshot => {
                    const contacts = snapshot.val()
                    this.props.setContacts(contacts)
                    this.setState({contacts, loading: false})
                                    
                    this.getCommonContact()     
                    this.getContactsForGroup()               
                })               
            } else {
                this.setState({loading: false})
            }
        });
    }

    updateContacts = () => {
        this.setState({loading: true})
        if (Platform.OS == 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    'title': 'Contacts',
                    'message': 'This app would like to view your contacts.'
                }
            ).then(() => {
                Contacts.getAll((err, contacts) => {
                    if (err === 'denied') {
                        this.setState({loading: false})
                    } else {
                        // firebase.database().ref(`users/${this.state.phonenumber}`).remove()                        

                        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
                            if(user === null) {
                                this.setState({loading: false})
                            } else {
                                global.phoneNumber = user._user.phoneNumber
                                var cur = 0;
                                contacts.forEach(contact => {                                    
                                    contact.phoneNumbers.forEach(item => {
                                        firebase.database().ref(`users/${user._user.phoneNumber}/${cur}`).set({
                                            name: contact.displayName ? contact.displayName : contact.familyName + ' ' + contact.givenName,
                                            phonenumber: item.number,
                                            userId: Date.parse(new Date()) + cur
                                        })
                                        cur++
                                    })
                                })
                            }
                        })                        
                    }
                    this.setState({ loading: false});
                    this.syncContactsToFirebase()
                })
            }).catch(error => {
                this.setState({ loading: false});
                this.props.navigation.navigate('home')
                Toast.show(error.toString())
            })
        } else {
            Contacts.getAll((err, contacts) => {
                console.log('error or data', err, contacts)
                if (err === 'denied') {
                    this.setState({loading: false})
                } else {
                    // firebase.database().ref(`users/${this.state.phonenumber}`).remove()

                    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
                       // console.log('logged in', global.)
                        if(user === null) {
                            this.setState({loading: false})
                        } else {
                            global.phoneNumber = user._user.phoneNumber
                            global.userId = user._user.uid
                           

                            var cur = 0;
                            var selfUid = user._user.uid
                            console.log('selfUidLog', selfUid)

                            contacts.forEach(contact => {

                                // setTimeout(() => {
                                //     console.log('user phone number', global.phoneNumber, global.playerId)
                                //     firebase.database().ref(`users/${global.phoneNumber}`).update({"playerId":global.playerId})    
                                // }, 2000);
                                
                                contact.phoneNumbers.forEach(item => {
                                    firebase.database().ref(`users/${user._user.phoneNumber}/${selfUid}/${cur}`).set({
                                        name: contact.displayName ? contact.displayName : contact.familyName + ' ' + contact.givenName,
                                        phonenumber: item.number,
                                        userId: Date.parse(new Date()) + cur
                                    })
                                    cur++
                                })
                            })
                        }
                    })   
                }

                this.syncContactsToFirebase()
                this.setState({ loading: false});
            })
        }                       
    }

    getCommonContact = () => {    
        var currVal = 0    
        this.state.contacts.forEach(element => {
            currVal++
            var phonenumber = element.phonenumber.replace(/\s/g, '')
            if(phonenumber.charAt(0) !== '+'){
                phonenumber = '+' + this.state.countryCallingCode + phonenumber
            }
            var object = {}
            // firebase.database().ref(`users/${phonenumber}`).remove()
            var selfUid =global.userId
                            console.log('udidNumber', selfUid)
            firebase.database().ref(`users/${phonenumber}/${selfUid}`).once('value', snapshot => {
                console.log('paldinesh', snapshot)
                if(snapshot.exists()) {
                    this.setState({loading: false, commonContacts: getCommonContacts(this.state.contacts, this.state.contacts)})
                    var object = {'name' : element.name, 'phonenumber': element.phonenumber, 'count' : this.state.commonContacts.length}

                    if (global.phoneNumber.replace(/\s/g,'') != element.phonenumber.replace(/\s/g,'')) {
                        this.state.newArray.push(object)
                    }
                    
                } else {                    
                    this.setState({loading: false, commonContacts: []})
                    var object = {'name' : element.name, 'phonenumber': element.phonenumber, 'count' : 0}
                    if (global.phoneNumber.replace(/\s/g,'') != element.phonenumber.replace(/\s/g,'')) {
                        this.state.newArray.push(object)
                    }                    
                }
                
                
                this.forceUpdate()
            })             
        });   

        // console.log('current value of object', currVal, this.state.contacts.length)

        // if (currVal === this.state.contacts.length) {
        //     this.getContactsForGroup()
        // }   
        
    }

    getContactsForGroup = () => {
        
        this.state.contacts.forEach(element => {
            
            console.log('current value of object', element.phonenumber.replace(/\s/g,''))

            firebase.database().ref(`users/${element.phonenumber.replace(/\s/g,'')}`).once('value', snapshot => {                
                const contacts = snapshot                                

                    
                if (contacts._value != null) {
                    let userUid = Object.keys (contacts._value)[0];
                    var object = {'name' : element.name, 'phonenumber': element.phonenumber, 'count' : 0, 'userUid' : userUid,}
                    if (global.phoneNumber.replace(/\s/g,'') != element.phonenumber.replace(/\s/g,'')) {
                        this.state.groupArray.push(object)
                    }                    
                } 
                
                this.forceUpdate()
            })
        }) 
                
    }

    groupMemeberSelected = (key) => {
        console.log("list key value", key)

        this.state.groupArray.map((item) => {
            if (item.userUid === key.userUid) {
                item.checked = !item.checked
              if (item.checked === true) {         
                this.state.selectedValues.push(item);
                 this.setState({flag : true})
                console.log("value 1" +JSON.stringify(this.state.selectedValues));
              } else if (item.checked === false) {
                const i = this.state.selectedValues.indexOf(item.userUid)
                if (1 != -1) {
                  this.state.selectedValues.splice(i, 1)
                  this.setState({flag : false})
                  console.log("value 2" +JSON.stringify(this.state.selectedValues));
                  return this.state.selectedValues
                }
              }
            }
          })

          this.forceUpdate()
    }
    searchUpdated(term) {
        this.setState({ isSearching:true, searchTerm: term })
    }

    signOut() {
        Alert.alert(
            'Contacts',
            'Will you sign out?',
            [
                {text: 'Yes', onPress: () => {
                    try {
                        firebase.auth().signOut()
                    } catch(error) {
                        SimpleToast.show(error.toString())
                    }
                }},
                {text: 'Cancel', style: 'cancel'}
            ]
        )
    }

    cancelPressed() {
        this.setModalVisible(false)
    }

    setModalVisible = (isVisible) => {
        this.setState({ modalVisible: isVisible })
    }

    filterTapped = (key) => {
        this.setState({ modalVisible: false })

        this.state.filterItems.map((item) => {
            item.checked = false            
        })

        this.state.filterItems.map((item) => {
            if (item.id === key.id) {
                item.checked = !item.checked                
            }
        })

        if (key.id == 2) {
            if (this.state.ascending) {
                this.state.newArray.sort((a, b) => (a.name > b.name) ? -1 : 1)                
            } else {
                this.state.newArray.sort((a, b) => (a.name > b.name) ? 1 : -1)                
            }
            this.setState({ascending: !this.state.ascending})            
        } else if (key.id == 3) {
            let sortedDescPoints = this.state.newArray.sort((a, b) => {
                return b.count - a.count;
            });
            // console.log('sortedDescPoints',sortedDescPoints);
            this.setState({newArray: sortedDescPoints})            
        }
    }

    largImageModal(isVisible) {
        this.setState({ largImageModal: isVisible })
    }


    startChat = (item) => {
        console.log('item value set', item, this.state.selectedIndex)

        if (this.state.selectedIndex == 0) {
            this.props.navigation.navigate('message', {selectedIndex: 0, phonenumber: item})
        } else {
            global.newCreatedKey = item.groupKey
            setTimeout(() => {
                this.props.navigation.navigate('message', {selectedIndex: 1, groupDetailsNew: item})
            }, 1000);            
        }
        
    }
    render() {
        const filteredEmails = this.state.newArray.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        // console.log('filteredEmails', filteredEmails)

        // console.log('new object creataed', this.state.newArray)
        
        console.log("groupArray list group data", this.state.userGroupArray)

        
        return (
            <SafeAreaView style={styles.container} >
                <View style={{width: '100%', height: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderColor: 'lightgray', borderBottomWidth: 1}}>
                    <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>Contacts</Text>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <Menu onSelect={(item) => {
                            if(item === 0) {
                                this.props.navigation.navigate('changepassword')
                            } else if(item === 1) {
                                this.signOut()
                            }
                        }}>
                            <MenuTrigger>
                                <Icon name="bars" size={24} color="gray" />                                
                            </MenuTrigger>
                            <MenuOptions style={{padding: 5}}>
                                <MenuOption value={0} style={{padding: 5}}>
                                    <Text style={{color: 'black', fontSize: 16}}>Setting</Text>
                                </MenuOption>
                                <MenuOption value={1}>
                                    <Text style={{color: 'black', fontSize: 16}}>Signout</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </View>                    
                </View>
                {
                    this.state.selectedIndex == 0
                    ?
                    <View style={{height:57, flexDirection:'row' }}> 
                        <SearchInput returnKeyType='search' onChangeText={(term) => { this.searchUpdated(term) }}  style={styles.searchInput} placeholder="Search"/>
                            <View style={{ width:75, flexDirection:'row', top:20,}}>
                                <TouchableOpacity style={{ height:30, width: 80}} ref={ref => this.touchable = ref} onPress={() => { this.setModalVisible(true) }}>                            
                                    <Text style={{width:80}}> Sort By </Text>                                
                                    <Image source={{ uri: 'arrow_down' }} style={{ left:50, top:-25, width: 35, height: 35, }} />
                                </TouchableOpacity>                                                        
                            </View>                            
                    </View>                
                    :
                    <View style={{paddingTop: 20, paddingBottom: 10, right:10, alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress={() => { this.largImageModal(true) }} >
                            <Text style={{paddingHorizontal: 10, paddingVertical: 5, borderColor: 'gray', borderWidth: 1}}>Create Group</Text>
                        </TouchableOpacity>                            
                    </View>
                }                

                <View style={{ marginTop:5, marginLeft:10,  width: width - 20, alignItems:'center', justifyContent:'center'}}>
                    <SegmentedControlTab values={["Contacts", "Group"]} selectedIndex={this.state.selectedIndex} onTabPress={this.handleIndexChange}/>
                </View>
                <View style={{width: '100%', flex:1 }}>                
                    {
                        !this.state.loading ? (
                            <FlatList
                                keyboardDismissMode='on-drag'
                                style={{width: '100%',}}
                                data={
                                    this.state.selectedIndex == 1
                                    ?
                                    this.state.userGroupArray
                                    :
                                    this.state.isSearching
                                    ?
                                    filteredEmails
                                    :
                                    this.state.newArray
                                }
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item}) => (
                                           
                                    this.state.selectedIndex == 1
                                    ?
                                    <Contact contact={item} selectedIndex={this.state.selectedIndex} countryCallingCode={this.state.userGroupArray} 
                                    onNoConnection={
                                        () =>this.startChat(item)                            
                                    } />                                    
                                    :
                                    <Contact selectedIndex={this.state.selectedIndex} contact={item} countryCallingCode={this.state.countryCallingCode} 
                                    onNoConnection={
                                        () => this.startChat(item)
                                    } onDetailConnection={
                                        () => this.startChat(item)
                                    } />                                    
                                )}
                            />
                        ) : (
                            <Spinner visible={this.state.loading} textContent={'Loading...'} textStyle={{color: '#FFF'}} />
                        )
                    }
                </View>
                <Popover
                    placement='bottom'
                    onRequestClose={() => this.setModalVisible(!this.state.modalVisible)}
                    fromView={this.touchable}
                    isVisible={this.state.modalVisible}>
                    <View style={{ flex: 1, marginTop: 0, alignContent: 'flex-end', alignItems: 'flex-end', height: (this.state.filterItems.length * 44) +20 }}>
                        <View borderRadius={5} style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', marginTop: 0, width: width * 0.45, height: (this.state.filterItems.length * 44) + 180 }}>
                            <FlatList
                                contentContainerStyle={{ marginTop: 10, bottom: 10, }}
                                data={this.state.filterItems}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index, count }) => {
                                    return (                                        
                                        <CheckBox
                                            title={item.title}
                                            textStyle={[ { marginLeft:40, fontSize: 14, height:20}]}
                                            checkedIcon={<Image source={{ uri: 'check' }} style={{ width: 35, height: 35, alignSelf: 'flex-end', position: 'absolute', bottom: -8 }} />}
                                            uncheckedIcon={<Image source={{ uri: 'uncheck' }} style={{ width: 35, height: 35, alignSelf: 'flex-end', position: 'absolute', bottom: -8 }} />}
                                            containerStyle={{ width: width * 0.85, top: 10, alignItems: 'stretch', backgroundColor: 'transparent', borderColor: 'transparent', height: 35, left: -5 }}                                            
                                            checked={item.checked}
                                            onPress={() => this.filterTapped(item)}                                        
                                        />
                                    )
                                }}
                            />                            
                            <Divider style={{ marginLeft: 0, backgroundColor: '#ccc', height: 1, width: width - 40, bottom: 50 }} />                            
                        </View>
                    </View>
                </Popover>
                <Modal transparent={true} animationType={'slide'} visible={this.state.largImageModal}
                    onRequestClose={() => { this.largImageModal(false) }}>                        
                    <View borderRadius={5} style={{  backgroundColor: '#F5FcFF', marginTop: 100, width: width, height: height-200}}>
                        <View style={{borderBottomColor:'lightgray', borderBottomWidth:1.0, flexDirection:'row'}}>
                            <TouchableOpacity style={{left:10, top:10, height:44}} onPress={() => { this.largImageModal(false) }} >
                                <Text style={{textAlign:'center', width:44, fontSize:20, borderColor: 'gray', justifyContent:'center', alignItems:'center', borderWidth: 1}}>X</Text>
                            </TouchableOpacity>  
                            <TouchableOpacity style={{ padding:10, left:width-130, width:80, height:50}} onPress={() => { this.creatGroup() }} >
                                <Text style={{textAlign:'center', fontSize:20, borderColor: 'gray', justifyContent:'center', alignItems:'center', borderWidth: 1}}>Done</Text>
                            </TouchableOpacity>  
                    </View>
                    <TextInput style={{ marginLeft:20, borderBottomColor:'lightgray', borderBottomWidth:1.0, alignSelf: 'auto', width: '90%', textAlign: 'left', height :44,}}
                        returnKeyType='done'
                        selectionColor={'#fff'}
                        underlineColorAndroid="#fff"
                        placeholder={'Please enter group name'}
                        placeholderTextColor={'gray'}
                        value={this.state.groupName}
                        onChangeText={text => { this.setState({ groupName: text }) }}
                    />
                    <FlatList
                            contentContainerStyle={{ marginTop: 10, bottom: 10, }}
                            data={this.state.groupArray}
                            scrollEnabled={true}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index, count }) => {
                                return (                                        
                                    <CheckBox 
                                        iconRight
                                        textStyle={{ fontSize: 14, left: 30 ,height:16}}
                                        checkedIcon={<Image source={{ uri: 'check' }} style={{ width: 35, height: 35, alignSelf: 'flex-end', position: 'absolute', bottom: -8 }} />}
                                        uncheckedIcon={<Image source={{ uri: 'uncheck' }} style={{ width: 35, height: 35, alignSelf: 'flex-end', position: 'absolute', bottom: -8 }} />}
                                        containerStyle={{ width: width * 0.85, top: 10, alignItems: 'stretch', backgroundColor: 'transparent', borderColor: 'transparent', height: 35, left: -5 }}
                                        title={item.name}
                                        checked={item.checked}
                                        onPress={() => this.groupMemeberSelected(item)}
                                    />
                                )
                            }}
                        />
                        </View>
                    </Modal>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        setContacts: (contacts) => {
            dispatch(setContacts(contacts))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactScreen)