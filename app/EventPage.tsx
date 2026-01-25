import { useNavigation } from 'expo-router';
import React from 'react';
import { Alert, Button, View } from 'react-native';
import { supabase } from './lib/supabase';

export default function EventPage() {

    const navigation = useNavigation<any>();
    
    const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        Alert.alert("Error", "Could not sign out. Please try again.");
        console.error(error);
      }
      
      
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
       
    
              const goToCreateEvent = () => {
            
                navigation.navigate('CreateEvent');
              }
                const goTopublisgEvent = () => {
                  navigation.navigate('PublishEvent');
                }

                 const gohome = () => {
            
                navigation.navigate('HomeScreen');
              }


  return (
    <View>
      <Button title='Go to Create Event' onPress={
             goToCreateEvent
            }>
              
              
      </Button>
      <View style={{ marginTop: 20, width: '80%' }}>
        <Button 
          title="Log Out" 
          color="#FF3B30" // iOS Red color for destructive actions
          onPress={handleLogout} 
        />

           <Button title='Go to publish Event' onPress={
             goTopublisgEvent
            }></Button>

            <Button title='Go home' onPress={gohome}>

            </Button>
      </View>


    </View>
  )
}