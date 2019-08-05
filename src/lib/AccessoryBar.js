
import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'

import {
  pickImageAsync,
  pickVideoAsync,
} from './mediaUtils'

export default class AccessoryBar extends React.Component {
  render() {
    const { onSend } = this.props
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => pickImageAsync(onSend)}>
            <Icon name='photo' style={{top:7, height:44, width:44}} size={30}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickVideoAsync(onSend)}>
            <Image source={{uri:'video'}} style={{top:0, height:35, width:35}}/>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => pickImageAsync(onSend)} name='photo' >
          <Text>Select Photo</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity onPress={() => takePictureAsync(onSend)} name='camera'>
        <Text>Camera</Text>
        </TouchableOpacity> */}
        {/* <Button onPress={() => getLocationAsync(onSend)} name='my-location' /> */}
      </View>
    )
  }
}

// const Button = ({
//   onPress,
//   size = 30,
//   color = 'rgba(0,0,0,0.5)',
//   ...props
// }) => (
//   <TouchableOpacity onPress={onPress}>
//     <MaterialIcons size={size} color={color} {...props} />
//   </TouchableOpacity>
// )

const styles = StyleSheet.create({
  container: {
    height: 44,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.3)',
  },
})
