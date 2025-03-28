import { Camera, CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  AppState,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  View,
  Text,
} from "react-native";
import { Overlay } from "./Overlay";
import { useEffect, useRef, useState } from "react";

export default function QR_Scan() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      try {
        // Check if the QR code contains a valid room code (6 digits)
        const roomCode = data.trim();
        if (/^\d{6}$/.test(roomCode)) {
          router.push(`/Chat_room?roomCode=${roomCode}`);
        } else {
          Alert.alert(
            "Invalid QR Code",
            "Please scan a valid Babble Bridge room QR code.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Error handling QR code:", error);
        Alert.alert(
          "Error",
          "Failed to process QR code. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setTimeout(() => {
          qrLock.current = false;
        }, 1000);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={StyleSheet.absoluteFillObject}>
        <Stack.Screen
          options={{
            title: "QR Scanner",
            headerShown: false,
          }}
        />
        <StatusBar hidden />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={StyleSheet.absoluteFillObject}>
        <Stack.Screen
          options={{
            title: "QR Scanner",
            headerShown: false,
          }}
        />
        <StatusBar hidden />
        <View style={styles.container}>
          <Text style={styles.text}>No access to camera</Text>
          <Text style={styles.text}>Please enable camera access in your device settings</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "QR Scanner",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 5,
  },
});