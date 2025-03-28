import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router';

const _layout = () => {
  return (
    <Tabs>
    <Tabs.Screen
      name="HomePage"
      options={{
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="Chat_room"
      options={{
        headerShown: false,
      }}
    />
  </Tabs>
  )
}
export default _layout;