import { View, Text } from 'react-native'
import React from 'react'
import { Link } from "expo-router";


const HomePage = () => {
  return (
    <View className="flex-1 justify-center items-center bg-violet-400">
      <Link href="/Tabs/profile">
        <Text className="text-xl text-white underline">Go to profile</Text>
      </Link>
      <Link href="/Tabs/QR_Scan">
        <Text className="text-xl text-white underline">Go to QR scanner</Text>
      </Link>
      <Link href="/">
        <Text className="text-xl text-white underline">Go to login</Text>
      </Link>
      <Link href="/Tabs/Chat_room">
        <Text className="text-xl text-white underline">Go to Chat Room</Text>
      </Link>
    </View>
  )
}

export default HomePage