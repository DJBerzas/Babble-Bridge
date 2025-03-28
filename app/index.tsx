import React, { useState } from 'react';
import { Text, View, Image, TextInput } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Hides the default header (optional)
export const options = {
  headerShown: false,
};

export default function Index() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LinearGradient
      colors={["#6685B5", "#E9F1FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, paddingTop: 50, alignItems: "center" }}
    >
      {/* Welcome text at the top */}
      <Text style={{ fontSize: 32, color: 'white', marginBottom: 20, fontWeight: 'bold' }}>
        Welcome!
      </Text>

      {/* Image below the welcome text */}
      <Image
        source={require("./globe.png")}
        style={{ width: 150, height: 150, marginBottom: 20 }}
        resizeMode="contain"
      />

      {/* Login & Password Inputs */}
      <TextInput
        value={login}
        onChangeText={setLogin}
        placeholder="Login"
        placeholderTextColor="#666"
        style={{
          backgroundColor: 'white',
          padding: 10,
          marginVertical: 10,
          width: '80%',
          borderRadius: 5,
        }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry={true}
        style={{
          backgroundColor: 'white',
          padding: 10,
          marginVertical: 10,
          width: '80%',
          borderRadius: 5,
        }}
      />

      {/* Link to Homepage */}
      <Link href="/Tabs/HomePage">
        <Text style={{ fontSize: 18, color: 'white', textDecorationLine: 'underline', marginTop: 20 }}>
          Go to Homepage
        </Text>
      </Link>
    </LinearGradient>
  );
}
