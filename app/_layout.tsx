import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';



import CreateEvent from './createEvent';
import EventPage from './EventPage';

import PublishEvent from './PublishEvent';
import SignIn from './signIn';
import SignUp from './signUp';

const Stack = createNativeStackNavigator();


const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signIn" component={SignIn} />
      <Stack.Screen name="signUp" component={SignUp} />
    </Stack.Navigator>
  );
};


const AppStack = () => {
  return (
    <Stack.Navigator>
    <Stack.Screen name="EventPage" component={EventPage} />
      <Stack.Screen name="CreateEvent" component={CreateEvent} />
      <Stack.Screen name="PublishEvent" component={PublishEvent} />
    </Stack.Navigator>
  );
};

// --- 3. THE ROOT NAVIGATOR (The "Switch") ---
export default function AppNavigation() {
  
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session && session.user ? <AppStack /> : <AuthStack />
    
}