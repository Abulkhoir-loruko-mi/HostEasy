import { Link, useNavigation } from 'expo-router';
import React from 'react';
import { Button, View } from 'react-native';


    


export default function Index() {

  const navigation = useNavigation<any>();

     const goToLogin = () => {
      navigation.navigate('/authScreen');
    }

    const goTosignup = () => {
      navigation.navigate('/signUp');
    }

     const goToCreateEvent = () => {
   
      navigation.navigate('/createEvent');
   
    }

  return (


    <View>
      
      <Button title='go to login' onPress={
       goToLogin
      }></Button>

    

       <Button title='Go to Create Event' onPress={
       goToCreateEvent
      }></Button>

        <Link href="/createEvent">CreateEvent</Link>

        <Button title='Go to Sign up' onPress={
       goTosignup
      }></Button>
    </View>
  )
}