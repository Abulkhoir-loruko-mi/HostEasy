import { useNavigation } from 'expo-router';
import React from 'react';
import { Button, View } from 'react-native';


    


export default function Index() {

  const navigation = useNavigation<any>();

     const goToLogin = () => {
      navigation.navigate('/signIn');
    }

    const goTosignup = () => {
      navigation.navigate('/signUp');
    }

     const goToCreateEvent = () => {
   
      navigation.navigate('/CreateEvent');
   
    }

  return (


    <View style={{alignItems:'center', justifyContent:"center", padding:50}}>
      
      <Button title='go to login' onPress={
       goToLogin
      }></Button>

    

       <Button title='Go to Create Event' onPress={
       goToCreateEvent
      }></Button>

        

        <Button title='Go to Sign up' onPress={
       goTosignup
      }></Button>
    </View>
  )
}