import { Text, View } from "react-native";
import { Link } from "expo-router";


export const options = {
  headerShown: false,
};


export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-violet-400">
      <Text className="text-5xl text-main">Welcome!</Text>
      <Link href="/Tabs/HomePage">
        <Text className="text-xl text-white underline">Go to Homepage</Text>
      </Link>
  
      
     


    </View>
  );
}
