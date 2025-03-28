import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 140,
          backgroundColor: '#fff', 
          borderTopWidth: 0,
          elevation: 10,
          paddingTop: 20,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="HomePage"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View style={styles.tabIcon}>
              <Image
                source={require('./icons/home.png')}
                style={styles.iconImage}
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
            <View style={styles.tabIcon}>
              <Image
                source={require('./icons/goodCamera.png')}
                style={styles.iconImage}
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
            <View style={styles.tabIcon}>
              <Image
                source={require('./icons/Pound.png')}
                style={styles.iconImage}
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
            <View style={styles.tabIcon}>
              <Image
                source={require('./icons/plus.png')}
                style={styles.iconImage}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30, 
    paddingVertical: 20,   
    borderRadius: 24,      
    backgroundColor: '#6685B5',
    marginTop : 20,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
});


export default _layout;
