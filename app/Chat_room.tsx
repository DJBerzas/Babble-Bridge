import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { addMessageToChatRoom, 
  getChatRoom, 
  Message, 
  ChatRoomData, 
  getCurrentUser, 
  getUserData, 
  getLanguageCode, 
  addParticipantToRoom, 
  Participant,
  deleteChatRoom } from '../scripts/firebaseDbAPI';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRoom() {
  const { roomCode } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [userNativeLanguage, setUserNativeLanguage] = useState<string>('en');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUserEmail(user.email);
        const userData = await getUserData(user.uid);
        if (userData.success && userData.userData) {
          setUserNativeLanguage(userData.userData.nativeLanguage);
          
          const participant: Participant = {
            id: user.uid,
            email: user.email || '',
            username: userData.userData.username,
            nativeLanguage: userData.userData.nativeLanguage
          };
          
          const result = await addParticipantToRoom(roomCode as string, participant);
          if (!result.success) {
            console.error('Failed to add participant:', result.error);
          }
        }
      }
    };
    loadUserData();
  }, [roomCode]);

  useEffect(() => {
    if (userNativeLanguage) {
      loadChatRoom();
    }
  }, [userNativeLanguage]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadChatRoom();
    }, 2000);

    return () => clearInterval(refreshInterval);
  }, [roomCode, userNativeLanguage]);

  const loadChatRoom = async () => {
    try {
      const result = await getChatRoom(roomCode as string);
      if (result.success && result.chatRoom) {
        const messagesInUserLanguage = result.chatRoom.messagesByLanguage[userNativeLanguage] || [];
        setMessages(messagesInUserLanguage);
      } else {
        setError(result.error || 'Failed to load messages');
      }
    } catch (err) {
      setError('Error loading messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const result = await addMessageToChatRoom(roomCode as string, { text: newMessage }, userNativeLanguage);
      if (result.success) {
        setNewMessage('');
        loadChatRoom();
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Error sending message');
    }
  };

  const handleDeleteRoom = async () => {
    Alert.alert(
      "Leave Chat Room",
      "Are you sure you want to leave this chat room? You can rejoin later if needed.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              const result = await deleteChatRoom(roomCode as string);
              if (result.success) {
                router.replace('/Tabs/HomePage');
              } else {
                setError(result.error || 'Failed to leave chat room');
              }
            } catch (error: any) {
              setError(error.message || 'Failed to leave chat room');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: `Room: ${roomCode}`,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#6685B5',
          },
          headerTintColor: '#fff',
          headerBackTitle: 'Home',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowQRCode(!showQRCode)}
              >
                <Ionicons name="qr-code" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDeleteRoom}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="close-circle" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {showQRCode ? (
        <View style={styles.qrContainer}>
          <QRCode
            value={`${process.env.EXPO_PUBLIC_APP_URL}/Chat_room?roomCode=${roomCode}`}
            size={200}
          />
          <Text style={styles.qrText}>Scan this QR code to join the chat room</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContentContainer}
            ref={(ref) => {
              if (ref) {
                setTimeout(() => {
                  ref.scrollToEnd({ animated: true });
                }, 100);
              }
            }}
          >
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.sender === currentUserEmail
                    ? styles.sentMessage
                    : styles.receivedMessage,
                ]}
              >
                <Text style={[
                  styles.senderText,
                  message.sender === currentUserEmail && styles.sentSenderText
                ]}>{message.sender}</Text>
                <Text style={[
                  styles.messageText,
                  message.sender === currentUserEmail && styles.sentMessageText
                ]}>{message.text}</Text>
                <Text style={[
                  styles.timestampText,
                  message.sender === currentUserEmail && styles.sentTimestampText
                ]}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons
                name="send"
                size={24}
                color={newMessage.trim() ? '#6685B5' : '#999'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerButton: {
    marginLeft: 15,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    padding: 10,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6685B5',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9F1FE',
  },
  senderText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sentSenderText: {
    color: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  sentMessageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentTimestampText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9F1FE',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    padding: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
  },
});
