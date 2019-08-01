const React = require('react-native')

const { StyleSheet } = React
import { Dimensions } from 'react-native'

const {width, height} = Dimensions.get('window')

export default {
    container: {
        flex: 1,
        backgroundColor: '#F5FcFF',
        height,
    }
}