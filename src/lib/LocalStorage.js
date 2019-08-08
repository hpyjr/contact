import { AsyncStorage } from 'react-native'
export const currentScreenNId = 'countryCode'
export default class LocalStorage {

  static async getCountryCode(action) {
    try {
      const data = await AsyncStorage.getItem(currentScreenNId);
      const parsedData = JSON.parse(data);
      action(parsedData);
    } catch (error) {
      action(null);
    }
  }

  static async setCountryCode(value) {
    try {
      await AsyncStorage.setItem(currentScreenNId, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }
}
