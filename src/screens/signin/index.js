import React, { Component } from 'react'
import { SafeAreaView, View, TextInput, Text, Image, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native'
import logo from '../../../assets/images/logo.png'
import styles from './styles'
import PhoneInput from 'react-native-phone-input'
import Toast from 'react-native-simple-toast'
import firebase from 'react-native-firebase'
import Contacts from 'react-native-contacts';
import Spinner from 'react-native-loading-spinner-overlay'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import firebaseSvc from '../../components/FirebaseSvc'
import Utility from '../../lib/Utility'
import LocalStorage from '../../lib/LocalStorage'

class SigninScreen extends Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            loadingMsg: 'Authorizing',
            phonenumber: '',
            confirmResult: null,
            code: ''
        }
    }


    componentDidMount() {
        // Contacts.requestPermission()
        if (Platform.OS == 'ios') {
            Contacts.checkPermission((err, permission) => {
                if (err) throw err;
              
                // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
                if (permission === 'undefined') {
                  Contacts.requestPermission((err, permission) => {
                    // ...
                  })
                }
                if (permission === 'authorized') {
                  // yay!
                }
                if (permission === 'denied') {
                  // x.x
                }
            })
        }

        firebase.messaging().hasPermission()
        .then(enabled => {
            if (enabled) {
                // user has permissions
                console.log('user has permissions', enabled)
                firebase.messaging().getToken().then(token =>{
                    console.log('user has permissions', token)
                    // stores the token in the user's document                    
                    global.deviceToken = token                    
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

    onConfirm = () => {
        const { confirmResult } = this.state;
        
        if ( !confirmResult) {

            var countryCodeNew = this.phone.getCountryCode()
            var countryCode = {
                countryCode: countryCodeNew,
            }

            LocalStorage.setCountryCode(countryCode)
            

            let phone = this.phone.getValue();
            if (phone === ''){
                Toast.show('Please type your phone number.');
                return ;
            }

            if (!this.phone.isValidNumber()) {
                Toast.show('Invalid phone number.');
                return ;
            }

            console.log('user details 1111', phone)

            this.setState({phonenumber: phone, loading: true, loadingMsg: 'Authorizing...'})

            // const user = {
            //     phonenumber: this.state.phonenumber,                
            // };

            // console.log('user details 1111', user)

            firebaseSvc.login(phone, this.loginSuccess, this.loginFailed);

            // firebase.auth().signInWithPhoneNumber(phone)
            // .then(confirmResult => {
                // console.log('confirmResult', confirmResult)
                // this.setState({confirmResult, authStep: 'code', loading: false, loadingMsg: 'Confirming...'})
            // }).catch(error => {
                // console.log('confirmResult error', error)
                // this.setState({loading: false})
                // Toast.show(error.message)
            // })
        } else {
            
            const { code, confirmResult } = this.state;

            if (code === '') {
                Toast.show('Please type your phone number.');
                return ;
            }

            this.setState({loading: true})
            confirmResult.confirm(code)
            .then((user) => {
                this.setState({})

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
                                
                            } else {
                                firebase.database().ref(`users/${this.state.phonenumber}`).remove()
                                var cur = 0;
                                var selfUid = user._user.uid
                                contacts.forEach(contact => {
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
                            this.setState({ loading: false});
                            this.props.navigation.navigate('home')
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
                            
                        } else {
                            var selfUid = user._user.uid

                            firebase.database().ref(`users/${selfUid}`).remove()
                            var cur = 0;
                                                        
                            contacts.forEach(contact => {
                                contact.phoneNumbers.forEach(item => {
                                    var mobileNumber = item.number

                                    LocalStorage.getCountryCode((countryCode) => {
                                        console.log('countryCode new', countryCode)

                                        if (Utility.hasWhiteSpace(item.number)) {
                                            
                                        } else {                                            
                                            mobileNumber = '+' + countryCode.countryCode + ' ' + mobileNumber
                                        }
                                        firebase.database().ref(`users/${selfUid}/${selfUid}/${cur}`).set({
                                            name: contact.displayName ? contact.displayName : contact.familyName + ' ' + contact.givenName,
                                            phonenumber: item.number,
                                            userId: Date.parse(new Date()) + cur
                                        })
                                        cur++
                                    })                                    
                                })
                            })
                        }
                        this.setState({ loading: false});
                        this.props.navigation.navigate('home')
                    })
                }               
            })
            .catch(error => {
                this.setState({ loading: false })
                Toast.show(error.message)
            });
        }
    }
    
    loginSuccess = (confirmResult) => {
        console.log('confirmResult', confirmResult)
        this.setState({confirmResult, authStep: 'code', loading: false, loadingMsg: 'Confirming...'})
    };

    loginFailed = (error) => {
        console.log('confirmResult error', error)
        this.setState({loading: false})
        // Toast.show(error.message)
    };

    resendCode = () => {
        
        this.setState({loading: true, loadingMsg: 'Authorizing...'})
        
        const user = {
            phonenumber: this.state.phonenumber,                
        };

        firebaseSvc.login(user, this.loginSuccess, this.loginFailed);

        // firebase.auth().signInWithPhoneNumber(this.state.phonenumber)
        // .then(confirmResult => {
        //     this.setState({confirmResult, authStep: 'code', loading: false, loadingMsg: 'Confirming...'})
        // }).catch(error => {
        //     this.setState({loading: false})
        //     Toast.show(error.message)
        // })
    }
    
    renderPhoneNumberInput() {
        return (
            <View style={{width: '100%', paddingHorizontal: 10, paddingVertical: 13, borderColor: 'lightgray', borderWidth: 1}}>
                <PhoneInput style={{width: '100%'}} ref={ref => { this.phone = ref; }} value={this.state.phonenumber}/>
            </View>
        )
    }

    renderVerificationCodeInput() {
        return (
            <View style={{width: '100%'}}>
                <View style={{width: '100%', paddingHorizontal: 10, borderColor: 'lightgray', borderWidth: 1}}>
                    <TextInput style={{width: '100%', height:44,}} keyboardType='number-pad' onChangeText={code => this.setState({code})} value={this.state.code}/>
                </View>
                <View style={{flexDirection: 'row', paddingTop: 10}}>
                    <Text style={{color: '#00aade', fontSize: 18}} onPress={() => this.resendCode()}>Resend code</Text>
                </View>
            </View>
        )
    }

    render() {
        const { confirmResult } = this.state;
        return (
            <SafeAreaView style={styles.container} >
                
                <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} >

                <Spinner visible={this.state.loading} textContent={'Authorizing...'} textStyle={{color: '#FFF'}} />
                <View style={{width: '100%', justifyContent: 'center', alignItems: 'center', paddingVertical: 100}}>
                    <Image source={logo} style={{width: 243, height: 55}} />
                </View>
                <View style={{width: '100%', paddingHorizontal: 20}}>
                    {!confirmResult && this.renderPhoneNumberInput()}
                    {confirmResult && this.renderVerificationCodeInput()}
                </View>                
                </KeyboardAwareScrollView>

                <View style={{ width: '100%', position:'absolute', bottom:0, paddingHorizontal: 20, paddingBottom: 10}}>
                    <TouchableOpacity onPress={() => this.onConfirm()}>
                        <View style={{justifyContent: 'center', alignItems: 'center', width: '100%', paddingVertical: 10, backgroundColor: '#00aade', borderRadius: 5}}>
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>{!confirmResult ? 'Next' : 'Confirm'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>                
                
            </SafeAreaView>
        )
    }
}

export default SigninScreen