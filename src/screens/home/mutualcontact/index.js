import React, { Component } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import styles from './styles'
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import { Dimensions } from 'react-native'

const {width, height} = Dimensions.get('window')
class MutualContactScreen extends Component {
    constructor() {
        super()
        this.state = {

        }
    }

    componentDidMount () {
        
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
                        <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>{params.name}</Text>
                    </View>
                </View>
                <View style={{width: '100%', flex: 1}}>
                    <ScrollView style={{width: '100%', flex: 1}}>
                        <View style={{paddingTop: 20, paddingBottom: 10, alignItems: 'center'}}>
                            <Text style={{fontSize: 16, color: 'gray'}}>Also connected with {params.name}</Text>
                        </View>
                        {
                            params.mutual.map((contact, index) => (
                                <TouchableOpacity onPress={ () => this.props.navigation.navigate('message', {phonenumber: contact})} >
                                    <View style={{justifyContent:'space-between' ,width:'100%', flexDirection:'row'}}>
                                        <View style={{flexDirection:'column', paddingVertical: 5, paddingLeft: 20,}} key={index}>
                                            <Text style={{fontSize: 18}}>{contact.name}</Text>
                                            <Text style={{color: 'gray', fontSize: 16}}>{contact.phonenumber}</Text>                                                                                
                                        </View>                                        
                                        <View style={{height:50, alignItems:'center', justifyContent:'center', left:-10,}} >
                                            <Icon name="chevron-right" size={20} color="gray" />                                        
                                        </View>                                          
                                    </View>
                                    <View style={{borderBottomWidth: 1, borderBottomColor: 'lightgray'}} />                                      
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}

export default MutualContactScreen