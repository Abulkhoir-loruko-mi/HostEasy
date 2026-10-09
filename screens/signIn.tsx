// import Styles from "@/constants/styles";
// import { useNavigation } from "@react-navigation/native";
// import React, { useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     Pressable,
//     StyleSheet,
//     Text,
//     TextInput,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";

// const SignIn = () => {
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

//   const navigation = useNavigation<any>();

//   const validate = () => {
//     let valid = true;
//     let tempErrors: { [key: string]: string } = {};

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email) {
//       tempErrors.email = "Email is required";
//       valid = false;
//     } else if (!emailRegex.test(email)) {
//       tempErrors.email = "Please enter a valid email address";
//       valid = false;
//     }

//     if (!password) {
//       tempErrors.password = "Password is required";
//       valid = false;
//     } else if (password.length < 6) {
//       tempErrors.password = "Password must be at least 8 characters";
//       valid = false;
//     }

//     setErrors(tempErrors);
//     return valid;
//   };

//   const handleSignIn = async () => {
//     // 1. Basic Input Validation

//     if (!validate()) return;

//     setLoading(true);

//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email,
//         password: password,
//       });

//       // Errors (e.g., Wrong password, User not found)
//       if (error) {
//         Alert.alert("Login Failed", error.message);
//         return;
//       }

//       // 4. Success!
//       // save tokens. Supabase/AsyncStorage does it.
//       //console.log('User ID:', data.user.id);
//     } catch (err) {
//       Alert.alert("Error", "An unexpected error occurred");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView>
//       <View style={Styles.containersign}>
//         <View style={Styles.container3}>
//           <Text style={Styles.title}>Signin</Text>
//           <Text style={Styles.subtitle}>
//             SignIn with your email and password
//           </Text>
//           <View>
//             <Text>Email</Text>
//             <TextInput
//               style={[styles.textInput, errors.email && styles.inputError]}
//               value={email}
//               onChangeText={(text) => {
//                 setEmail(text);
//                 if (errors.email) setErrors({ ...errors, email: null });
//               }}
//               placeholder="Enter your Mail"
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
//             {errors.email && (
//               <Text style={styles.errorText}>{errors.email}</Text>
//             )}

//             <Text>Password</Text>
//             <TextInput
//               style={[styles.textInput, errors.password && styles.inputError]}
//               value={password}
//               onChangeText={(text) => {
//                 setPassword(text);
//                 if (errors.password) setErrors({ ...errors, password: null });
//               }}
//               placeholder="Password"
//               secureTextEntry
//             />
//             {errors.password && (
//               <Text style={styles.errorText}>{errors.password}</Text>
//             )}

//             <Text style={Styles.text} onPress={() => console.log("pressed")}>
//               Forgot password
//             </Text>
//           </View>

//           {loading ? (
//             <ActivityIndicator size="large" color="#007BFF" />
//           ) : (
//             <Pressable style={Styles.button} onPress={handleSignIn}>
//               <Text style={Styles.buttonText}>Login</Text>
//             </Pressable>
//           )}

//           <Pressable onPress={() => navigation.navigate("signUp")}>
//             <Text style={Styles.linkText}>Don't have an account? Sign Up</Text>
//           </Pressable>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default SignIn;

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 30,
//     textAlign: "center",
//     color: "#333",
//   },

//   inputGroup: { marginBottom: 15 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 15,
//     borderRadius: 8,
//     fontSize: 16,
//     // backgroundColor: '#fafafa'
//   },
//   textInput: {
//     borderWidth: 0.5,
//     borderColor: "grey",
//     borderRadius: 12,
//     padding: 8,
//     fontSize: 16,
//     margin: 8,
//   },
//   inputError: {
//     borderColor: "red", // Highlight border red on error
//     backgroundColor: "#fff0f0",
//   },
//   errorText: {
//     color: "red",
//     fontSize: 12,
//     marginTop: 5,
//     marginLeft: 5,
//   },

//   buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
//   linkText: { color: "#007BFF", textAlign: "center" },
// });

import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
//import { supabase } from './lib/supabase'; // Ensure this path matches your structure

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const navigation = useNavigation<any>();

  const validate = () => {
    let valid = true;
    let tempErrors: { [key: string]: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      tempErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
      }
      // On success, the AppNavigation component automatically detects the session and switches to AppStack
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      {/* Top Dark Green Background */}
      <View style={styles.topBackground}>
        <Text style={styles.logoText}>HostEasy</Text>
      </View>

      {/* Bottom White Card */}
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Sign in with your email and password
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.textInput, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.textInput, errors.password && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            placeholder="Password"
            secureTextEntry
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        <Text
          style={styles.forgotPassword}
          onPress={() => console.log("Forgot password pressed")}
        >
          Forgot password?
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007BFF"
            style={{ marginTop: 20 }}
          />
        ) : (
          <Pressable style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => navigation.navigate("signUp")}
          style={styles.signUpContainer}
        >
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#02200fff", // Dark green background
  },
  topBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  cardContainer: {
    flex: 2.5, // Takes up more space at the bottom
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
    marginLeft: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#ff3b30",
    backgroundColor: "#fff0f0",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPassword: {
    color: "#ff3b30",
    textAlign: "right",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signUpContainer: {
    marginTop: 25,
    padding: 10,
  },
  linkText: {
    color: "#007BFF",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
});
