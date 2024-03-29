import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase';
import { getCommonContacts } from '../utils/contact'
import { removeWhiteSpace } from '../utils/string'

class Contact extends Component {
    constructor(props){
        super(props)
        this.state = {
            loading: true,
            commonContacts: []
        }
    }

    componentDidMount() {
        
        console.log('this.props.selectedIndex', this.props.contact)

        if (this.props.selectedIndex == 0) {
            var phonenumber = this.props.contact.phonenumber.replace(/\s/g, '')
            if(phonenumber.charAt(0) !== '+'){
                phonenumber = '+' + this.props.countryCallingCode + phonenumber
            }
            var selfUid =global.userId
            console.log('udidNumber', selfUid)
            firebase.database().ref(`users/${phonenumber}/${selfUid}`).once('value', snapshot => {
                if(snapshot.exists()) {
                    const contacts = snapshot.val()
                    this.setState({loading: false, commonContacts: getCommonContacts(this.props.contactInfo.myContacts, contacts)})
                    console.log('commonContacts 44444', this.state.commonContacts)
                } else {
                    this.setState({loading: false, commonContacts: []})
                }
            })
        }        
    }

    renderConnection(){
        if (this.state.loading){
            return (
                <Text style={{paddingHorizontal: 10, paddingVertical: 5, borderColor: 'gray', borderWidth: 1}}>Calculating...</Text>
            )
        }

        if (!this.state.loading && this.state.commonContacts.length === 0) {
            return (null)
        }

        return (
            <TouchableOpacity onPress={() => this.props.onDetailConnection(this.state.commonContacts)}>
                <Text style={{paddingHorizontal: 10, paddingVertical: 5, borderColor: 'gray', borderWidth: 1}}>{this.state.commonContacts.length} connections</Text>
            </TouchableOpacity>
        )
    }

    render() {

        return (
            <View style={{flexDirection: 'row', height: 60, alignItems: 'center', borderColor: 'lightgray', borderBottomWidth: 1}}>
                <View style={{width: '60%', paddingLeft: 25}}>
                    <Text>{
                        this.props.selectedIndex == 1
                        ?
                        this.props.contact.groupDetails.groupName
                        :
                        this.props.contact.name
                        }</Text>
                    <Text style={{color: 'gray'}}>{
                        this.props.selectedIndex == 0
                        ?
                        this.props.contact.phonenumber
                        :
                        ''
                    }</Text>
                </View>

            {/* {this.renderConnection()} */}
                {
                    // this.props.contact.count == 0
                    // ?
                    // null
                    // :
                    <View style={{paddingHorizontal: 10}}>                    
                        <TouchableOpacity onPress={() =>                                                 
                        {
                            this.props.contact.count == 0 || this.props.selectedIndex == 1
                            ?
                            this.props.onNoConnection(this.state.commonContacts)
                            :
                            this.props.onDetailConnection(this.state.commonContacts)
                        }
                        }>
                            <Text style={{paddingHorizontal: 10, paddingVertical: 5, borderColor: 'gray', borderWidth: 1}}>
                            {
                                this.props.selectedIndex == 0
                                ?
                                this.props.contact.count + ' connections'
                                :
                                'Start Chat'
                                } </Text>
                        </TouchableOpacity>
                    </View>
                }                
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(Contact)