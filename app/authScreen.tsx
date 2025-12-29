import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import useAuthStore from './authStore';


const AuthScreen = () => {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      {isAuthenticated && user ? (
        <>
          <Text style={styles.text}>Welcome, {user.name}</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <>
          <Text style={styles.text}>You are not logged in.</Text>
           <Link href="/createEvent">Go to About</Link>
          <Button
            title="Login"
            onPress={() =>
              login({ id: '1', name: 'John Doe', email: 'john@example.com' })
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 10 },
});

export default AuthScreen;
