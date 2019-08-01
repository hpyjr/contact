import React, { Component } from 'react'
import { SafeAreaView, View, Text, Alert, Image, FlatList, TouchableOpacity } from 'react-native'
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
            ascending:false
        }
    }

    componentDidMount() {        
        this.updateContacts()        
    }

    syncContactsToFirebase = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ phoneNumber: user.phoneNumber, countryCallingCode: parsePhoneNumber(user.phoneNumber).countryCallingCode });
                firebase.database().ref(`users/${user.phoneNumber}`).once('value', snapshot => {
                    const contacts = snapshot.val()
                    this.props.setContacts(contacts)
                    this.setState({contacts, loading: false})
                                    
                    this.getCommonContact()                    
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
                        console.log('logged in', user)
                        if(user === null) {
                            this.setState({loading: false})
                        } else {
                            global.phoneNumber = user._user.phoneNumber
                            global.userId = user._user.uid
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

                this.syncContactsToFirebase()
                this.setState({ loading: false});
            })
        }                       
    }

    getCommonContact = () => {        
        this.state.contacts.forEach(element => {
            var phonenumber = element.phonenumber.replace(/\s/g, '')
            if(phonenumber.charAt(0) !== '+'){
                phonenumber = '+' + this.state.countryCallingCode + phonenumber
            }
            var object = {}
            // firebase.database().ref(`users/${phonenumber}`).remove()
            firebase.database().ref(`users/${phonenumber}`).once('value', snapshot => {
                console.log('contacts list222222', snapshot.exists())
                if(snapshot.exists()) {
                    this.setState({loading: false, commonContacts: getCommonContacts(this.state.contacts, this.state.contacts)})
                    var object = {'name' : element.name, 'phonenumber': element.phonenumber, 'count' : this.state.commonContacts.length}
                    this.state.newArray.push(object)
                } else {                    
                    this.setState({loading: false, commonContacts: []})
                    var object = {'name' : element.name, 'phonenumber': element.phonenumber, 'count' : 0}
                    this.state.newArray.push(object)
                }
                
                
                this.forceUpdate()
            })             
        });                    
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

    render() {
        const filteredEmails = this.state.newArray.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        // console.log('filteredEmails', filteredEmails)

        // console.log('new object creataed', this.state.newArray)

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
                <View style={{height:57, flexDirection:'row' }}> 
                    <SearchInput returnKeyType='search' onChangeText={(term) => { this.searchUpdated(term) }}  style={styles.searchInput} placeholder="Search"/>
                        <View style={{ width:75, flexDirection:'row', top:20,}}>
                            <TouchableOpacity style={{ height:30, width: 80}} ref={ref => this.touchable = ref} onPress={() => { this.setModalVisible(true) }}>                            
                                <Text style={{width:80}}> Sort By </Text>                                
                                <Image source={{ uri: 'arrow_down' }} style={{ left:50, top:-25, width: 35, height: 35, }} />
                            </TouchableOpacity>                                                        
                        </View>
                        
                </View>
                <View style={{width: '100%', flex: 1}}>
                    {
                        !this.state.loading ? (
                            <FlatList
                                keyboardDismissMode='on-drag'
                                style={{width: '100%',}}
                                data={
                                    this.state.isSearching 
                                    ?
                                    filteredEmails
                                    :
                                    this.state.newArray
                                }
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item}) => (                                    
                                    <Contact contact={item} countryCallingCode={this.state.countryCallingCode} onDetailConnection={(mutualcontacts) => this.props.navigation.navigate('mutual', {name: item.name, mutual: mutualcontacts})} />
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