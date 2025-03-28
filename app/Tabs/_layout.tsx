import React from 'react';
import { Image, View } from 'react-native';
import { Tabs } from 'expo-router';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          height: 80,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="HomePage"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingVertical: 20,
                borderRadius: 20,
                backgroundColor: '#6685B5',
              }}
            >
              <Image
                source={require('./icons/home.png')}
                style={{
                  width: 26,
                  height: 26,
                  tintColor: '#fff',
                }}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="QR_Scan"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingVertical: 20,
                borderRadius: 20,
                backgroundColor: '#6685B5',
              }}
            >
              <Image
                source={require('./icons/goodCamera.png')}
                style={{
                  width: 26,
                  height: 26,
                  tintColor: '#fff',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="join_chat"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingVertical: 20,
                borderRadius: 20,
                backgroundColor: '#6685B5',
              }}
            >
              <Image
                source={require('./icons/Pound.png')}
                style={{
                  width: 28,
                  height: 28,
                  tintColor: '#fff',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create_room"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingVertical: 20,
                borderRadius: 20,
                backgroundColor: '#6685B5',
              }}
            >
              <Image
                source={require('./icons/plus.png')}
                style={{
                  width: 28,
                  height: 28,
                  tintColor: '#fff',
                }}
              />
            </View>
          ),
        }}
      />

      
    </Tabs>
  );
};

export default _layout;
