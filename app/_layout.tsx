import { Stack, Tabs } from "expo-router";
import './global.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 👈 hides all headers
      }}
    >
      <Stack.Screen name="Tabs" options={{ headerShown: false }} />
      <Stack.Screen name="Chat_room" options={{ headerShown: false }} />
      <Stack.Screen name="join_chat" options={{ headerShown: false }} />
    </Stack>
  );
}
