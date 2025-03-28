import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { addMessageToChatRoom, 
  getChatRoom, 
  Message, 
  ChatRoomData, 
  getCurrentUser, 
  getUserData, 
  getLanguageCode, 
  addParticipantToRoom, 
  Participant } 
  from '../scripts/firebaseDbAPI';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

export default function ChatRoom() {
  const { roomCode } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false); // State to toggle QR code visibility
  const [userNativeLanguage, setUserNativeLanguage] = useState<string>('en');

  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUserEmail(user.email);
        const userData = await getUserData(user.uid);
        if (userData.success && userData.userData) {
          setUserNativeLanguage(userData.userData.nativeLanguage);
          
          // Add user as participant to the room
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

  // Reload messages when user's native language changes
  useEffect(() => {
    if (userNativeLanguage) {
      loadChatRoom();
    }
  }, [userNativeLanguage]);

  const loadChatRoom = async () => {
    try {
      const result = await getChatRoom(roomCode as string);
      if (result.success && result.chatRoom) {
        const chatRoom = result.chatRoom as ChatRoomData;
        // Get messages in the user's native language
        const userMessages = chatRoom.messagesByLanguage?.[userNativeLanguage] || [];
        console.log('Loading messages for language:', userNativeLanguage);
        console.log('Messages found:', userMessages);
        setMessages(userMessages);
      } else {
        setError('Failed to load chat room');
      }
    } catch (err) {
      console.error('Error loading chat room:', err);
      setError('Failed to load chat room');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserEmail) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        sender: currentUserEmail,
      };

      const result = await addMessageToChatRoom(roomCode as string, messageData, userNativeLanguage);
      if (result.success) {
        // Create new message object
        const newMessageObj: Message = {
          text: messageData.text,
          sender: messageData.sender,
          senderId: getCurrentUser()?.uid || '',
          timestamp: new Date().toISOString(),
        };

        // Update local state instead of reloading
        setMessages(prevMessages => [...prevMessages, newMessageObj]);
        setNewMessage('');
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Room: {roomCode}</Text>
        
        {/* Button to toggle QR code visibility */}
        <TouchableOpacity 
          style={styles.qrButton} 
          onPress={() => setShowQRCode(!showQRCode)}
        >
          <Text style={styles.qrButtonText}>
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditionally render QR code */}
      {showQRCode && (
        <View style={styles.qrContainer}>
          <QRCode value={`myapp://Chat_room?roomCode=${roomCode}`} size={200} />
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
        >
          {Array.isArray(messages) && messages.map((message, index) => {
            const isCurrentUser = message.sender === currentUserEmail;
            return (
              <View 
                key={index} 
                style={[
                  styles.messageBox,
                  isCurrentUser ? styles.sentMessage : styles.receivedMessage
                ]}
              >
                <Text style={[
                  styles.senderText,
                  isCurrentUser ? styles.sentSenderText : styles.receivedSenderText
                ]}>
                  {String(message.sender)}
                </Text>
                <Text style={[
                  styles.messageText,
                  isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
                ]}>
                  {String(message.text)}
                </Text>
                <Text style={[
                  styles.timestampText,
                  isCurrentUser ? styles.sentTimestampText : styles.receivedTimestampText
                ]}>
                  {new Date(message.timestamp || '').toLocaleTimeString()}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center', // Centers the QR code horizontally
    marginTop: 30, // Adds margin to push it further down
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    padding: 10,
  },
  messageBox: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  senderText: {
    fontSize: 12,
    marginBottom: 4,
  },
  sentSenderText: {
    color: '#fff',
  },
  receivedSenderText: {
    color: '#666',
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#000',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentTimestampText: {
    color: '#fff',
  },
  receivedTimestampText: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    padding: 10,
    textAlign: 'center',
  },
});
