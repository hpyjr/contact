// import * as Location from 'expo-location'
// import * as Permissions from 'expo-permissions'
// import * as ImagePicker from 'expo-image-picker'
import ImagePicker from 'react-native-image-picker';

import { Alert, Linking, Permissions } from 'react-native'

export default async function getPermissionAsync(permission) {
  const { status } = await Permissions.askAsync(permission)
  if (status !== 'granted') {
    const { name } = Constants.manifest
    const permissionName = permission.toLowerCase().replace('_', ' ')
    Alert.alert(
      'Cannot be done 😞',
      `If you would like to use this feature, you'll need to enable the ${permissionName} permission in your phone settings.`,
      [
        {
          text: "Let's go!",
          onPress: () => Linking.openURL('app-settings:'),
        },
        { text: 'Nevermind', onPress: () => {}, style: 'cancel' },
      ],
      { cancelable: true },
    )

    return false
  }
  return true
}

// export async function getLocationAsync(onSend) {
//   if (await getPermissionAsync(Permissions.LOCATION)) {
//     const location = await Location.getCurrentPositionAsync({})
//     if (location) {
//       onSend([{ location: location.coords }])
//     }
//   }
// }

export async function pickImageAsync(onSend) {
  // if (await getPermissionAsync(Permissions.CAMERA_ROLL)) {
    const options = {
      title: 'Select Photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      mediaType:'photo',
      storageOptions: {
          skipBackup: true
      }
  };

  ImagePicker.showImagePicker(options, (response) => {
    // console.log('response: ', response);
    if (response.didCancel) {
        console.log('User cancelled image picker');
        
    } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        
    } else {
        const source = {
            uri: response.uri,
            name: response.fileName,
            type: 'image/jpeg'
        };        
        onSend([{ image: source.uri }])
        return source.uri        
    }
  });
  // }
}

export async function pickVideoAsync(onSend) {
  // if (await getPermissionAsync(Permissions.CAMERA_ROLL)) {
    const options = {
      title: 'Select Video',
      takePhotoButtonTitle:'Take Video...',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      mediaType:'video',
      storageOptions: {
          skipBackup: true
      }
  };

  ImagePicker.showImagePicker(options, (response) => {
    // console.log('response: ', response);
    if (response.didCancel) {
        console.log('User cancelled image picker');
        
    } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        
    } else {
        const source = {
            uri: response.uri,
            name: response.fileName,
            type: 'image/jpeg'
        };        
        onSend([{ image: source.uri }])
        return source.uri        
    }
  });
  // }
}