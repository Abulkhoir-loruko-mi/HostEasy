import { Link } from 'expo-router';
import React from 'react';
import { Button, View } from 'react-native';


    


export default function index({navigation}: {navigation: any}) {

     const goToLogin = () => {
    
   
      navigation.push('authScreen');
     
   
     
    }

  return (
    <View>
      
      <Button title='go to login' onPress={
       goToLogin
      }></Button>

       <Link href="/authScreen">Go to About</Link>
        <Link href="/createEvent">CreateEvent</Link>
    </View>
  )
}