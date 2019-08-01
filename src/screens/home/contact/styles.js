const React = require('react-native')
import { Dimensions } from 'react-native'
const { StyleSheet } = React
const {width, height} = Dimensions.get('window')
export default {
    container: {
        flex: 1,
        backgroundColor: '#F5FcFF'
    },
    searchInput:{
        padding: 10,
        margin:10,
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius:20,
        width:width - 100,
        height:44
      },
      myrazzle_subtitle_text:{
        fontSize: 12, 
        marginRight: 20,        
    },
}