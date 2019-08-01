import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import SplashScreen from './src/screens/splash'
import SigninScreen from './src/screens/signin'
import ContactScreen from './src/screens/home/contact'
import MutualContactScreen from './src/screens/home/mutualcontact'
import MessageScreen from './src/screens/home/message'

const MainSectionNavigator = createStackNavigator({
    contact: ContactScreen,
    mutual: MutualContactScreen,
    message:MessageScreen
}, {
    initialRouteName: 'contact',
    headerMode: 'none'
})

const MainNavigator = createSwitchNavigator({
    splash: SplashScreen,
    sign: SigninScreen,
    home: MainSectionNavigator
}, {
    initialRouteName: 'splash'
})

export default App = createAppContainer(MainNavigator)