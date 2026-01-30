// lib/notifications.js
import { supabase } from '@/app/lib/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


// Configure how notifications behave when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // alert('Failed to get push token for push notification!');
      console.log('Failed to get push token');
      return;
    }
    
    // Get the token that uniquely identifies this device
    token = (await Notifications.getExpoPushTokenAsync({
       projectId: Constants.expoConfig.extra.eas.projectId, // Ensure EAS project ID is set if using EAS
    })).data;
    console.log("My Push Token:", token);

    // SAVE TOKEN TO SUPABASE
    const { data: { user } } = await supabase.auth.getUser();
    if (user && token) {
       // Upsert: Update if exists, insert if not
       const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, push_token: token });
       
       if(error) console.error("Error saving token to DB:", error);
    }

  } else {
    // alert('Must use physical device for Push Notifications');
    console.log('Must use physical device for push');
  }

  return token;
}