import React from 'react';
import { Image, TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router'; 

const HomePage = () => {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={["#6685B5", "#E9F1FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      
      <TouchableOpacity onPress={handleBackToLogin} style={{ position: 'absolute', top: 50, left: 30, alignItems: 'center' }}>
        
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('./icons/left-arrow.png')} 
            style={{ width: 30, height: 30 }} 
            resizeMode="contain" 
          />
          
          <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Logout</Text>
        </View>
      </TouchableOpacity>

      <Link href="/Tabs/profile">
        
      </Link>

      <Link href="/Tabs/QR_Scan">
        
      </Link>
       
      <Link href="/Chat_room">
       
      </Link>
    </LinearGradient>
  );
};

export default HomePage;
