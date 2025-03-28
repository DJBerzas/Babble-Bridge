import { Text, View, Image } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Hides the default header (optional)
export const options = {
  headerShown: false,
};

export default function Index() {
  return (
    <LinearGradient
      
      colors={["#6685B5", "#E9F1FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      
      <Image
        source={require("./globe.png")} 
        style={{ width: 150, height: 150, marginBottom: 20 }}
        resizeMode="contain"
      />

      
      <Text className="text-5xl text-main mb-2">Welcome!</Text>

      
      <Link href="/Tabs/HomePage">
        <Text className="text-xl text-white underline">Go to Homepage</Text>
      </Link>
    </LinearGradient>
  );
}
