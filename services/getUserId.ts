
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';
export const getUserId = async (setUserId: (userId: string) => void) => {
	try {
		if (Platform.OS === 'web') {
			const user_id = localStorage.getItem('user_id');
			if (!user_id || user_id === 'undefined' || user_id === 'null' || user_id === '') {
				const newUserId = uuidv4();
				console.log('Setting new user_id in localStorage:', newUserId);
				setUserId(newUserId);
				localStorage.setItem('user_id', newUserId);
			} else {
				setUserId(user_id);
				console.log('Existing user_id in localStorage:', user_id);
			}
		} else {
			if (!SecureStore || !SecureStore.getItemAsync) {
				console.error('SecureStore is not available');
				return;
			}

			const user_id = await SecureStore.getItemAsync('user_id');
			if (!user_id || user_id === 'undefined' || user_id === 'null' || user_id === '') {
				const newUserId = uuidv4();
				console.log('Setting new user_id in SecureStore:', newUserId);
				setUserId(newUserId);
				await SecureStore.setItemAsync('user_id', newUserId);
			} else {
				setUserId(user_id);
				console.log('Existing user_id in SecureStore:', user_id);
			}
		}
	} catch (error) {
		console.error('Error getting/setting user ID:', error);
	}
};