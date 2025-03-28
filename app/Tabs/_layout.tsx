import React from 'react';
import { Image, Text, View } from 'react-native';
import { Tabs } from 'expo-router';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="HomePage"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('./icons/home.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? '#007AFF' : '#8E8E93',
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: focused ? '#007AFF' : '#8E8E93',
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('./icons/profile.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? '#007AFF' : '#8E8E93',
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: focused ? '#007AFF' : '#8E8E93',
                }}
              >
                Chat Room
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
