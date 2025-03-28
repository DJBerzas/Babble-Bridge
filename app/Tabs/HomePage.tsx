import { View, Text } from 'react-native'
import React from 'react'
import { Link } from "expo-router";

const HomePage = () => {
  return (
    <View className="flex-1 bg-violet-400">
      <View className="flex-1 justify-center items-center">
        <View className="space-y-4 w-full px-8">
          <Link href="/Tabs/profile" className="bg-white p-4 rounded-lg shadow-md">
            <Text className="text-xl text-violet-600 text-center">Go to profile</Text>
          </Link>
          <Link href="/Tabs/QR_Scan" className="bg-white p-4 rounded-lg shadow-md">
            <Text className="text-xl text-violet-600 text-center">Go to QR scanner</Text>
          </Link>
          <Link href="/" className="bg-white p-4 rounded-lg shadow-md">
            <Text className="text-xl text-violet-600 text-center">Go to login</Text>
          </Link>
          <Link href="/join_chat" className="bg-white p-4 rounded-lg shadow-md">
            <Text className="text-xl text-violet-600 text-center">Join Chat Room</Text>
          </Link>
        </View>
      </View>
    </View>
  )
}

export default HomePage