import React, { useState } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { loginUser, registerUser } from '../scripts/firebaseDbAPI';
import LanguageSelector from './components/LanguageSelector';
import QRCode from 'react-native-qrcode-svg';

export const options = {
  headerShown: false,
};

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('en');

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const result = await loginUser(email, password);
        if (result.success) {
          router.replace('/Tabs/HomePage');
        } else {
          Alert.alert('Login Failed', result.error);
        }
      } else {
        const result = await registerUser(email, password, username, nativeLanguage);
        if (result.success) {
          Alert.alert('Success', 'Registration successful! Please login.', [
            { text: 'OK', onPress: () => setIsLogin(true) }
          ]);
        } else {
          Alert.alert('Registration Failed', result.error);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#6685B5", "#E9F1FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 120 }}>
        <Text style={{ fontSize: 32, color: 'white', marginBottom: 20, fontWeight: 'bold' }}>
          {isLogin ? 'Welcome!' : 'Create Account'}
        </Text>

        <Image
          source={require("./globe.png")}
          style={{ width: 150, height: 150, marginBottom: 20 }}
          resizeMode="contain"
        />

        {!isLogin && (
          <>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#666"
              style={{
                backgroundColor: 'white',
                padding: 10,
                marginVertical: 10,
                width: '80%',
                borderRadius: 5,
              }}
            />
            <View style={{ width: '80%', marginVertical: 10 }}>
              <LanguageSelector
                value={nativeLanguage}
                onChange={setNativeLanguage}
                placeholder="Select Native Language"
              />
            </View>
          </>
        )}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
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

        <TouchableOpacity
          onPress={handleAuth}
          style={{
            backgroundColor: '#6685B5',
            padding: 15,
            borderRadius: 5,
            width: '80%',
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {isLogin ? 'Login' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: 'white', textDecorationLine: 'underline' }}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
