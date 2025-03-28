import { ImageBackground } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
//import {images} from "../../../../../constants/images";


const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="HomePage"
        options={{
          headerShown: false,
          // tabBarIcon: ({ focused }) => (
          //   //<ImageBackground source={images.home} style={{ width: 24, height: 24 }} />
          // ),
        }}
      />
      <Tabs.Screen
        name="Chat_room"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default _layout;

