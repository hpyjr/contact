import React, { Component } from 'react'
import { SafeAreaView, Image, BackHandler, Alert} from 'react-native'
import logo from '../../../assets/images/logo.png'
import styles from './styles'
import firebase from 'react-native-firebase'

class SplashScreen extends Component {
    constructor() {
        super()
        this.state = {

        }
    }

    performTimeConsumingTask = async() => {
        return new Promise((resolve)=>
            setTimeout(() => { resolve('result') }, 2000)
        )
    }

    async componentDidMount() {
        const data = await this.performTimeConsumingTask();

        if(data != null) {
			try {
				this.unsubscribe = firebase.auth().onAuthStateChanged(user => {                    
					if(user === null) {
						this.props.navigation.navigate('sign')
					} else {
						this.props.navigation.navigate('home')
					}
				})
			} catch(error) {
				Alert.alert(
					'Contacts',
					error.toString(),
					[
						{text: 'Ok', onPress: () => BackHandler.exitApp()},
					],
					{cancelable: false}
				)
			}
        } else {
            this.props.navigation.navigate('sign')
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    render() {
        const viewStyles = [
            styles.container,
            {
                backgroundColor: 'white'
            }
        ]
        return (
            <SafeAreaView style={viewStyles} >
                <Image source={logo} style={{width: 243, height: 55}} />
            </SafeAreaView>
        )
    }
}

export default SplashScreen