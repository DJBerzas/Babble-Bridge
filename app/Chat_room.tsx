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
} from 'react-native';
import { addMessageToChatRoom, getChatRoom, Message, ChatRoomData } from '../scripts/firebaseDbAPI';
import { useLocalSearchParams } from 'expo-router';

export default function ChatRoom() {
  const { roomCode } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadChatRoom();
  }, []);

  const loadChatRoom = async () => {
    const result = await getChatRoom(roomCode as string);
    if (result.success && result.chatRoom) {
      const chatRoom = result.chatRoom as ChatRoomData;
      const englishMessages = chatRoom.messagesByLanguage?.English || [];
      console.log('Chat room data:', chatRoom);
      console.log('English messages:', JSON.stringify(englishMessages, null, 2));
      setMessages(englishMessages);
    } else {
      setError('Failed to load chat room');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        sender: 'User1', // Hardcoded for now
      };

      console.log('Sending message:', messageData);
      const result = await addMessageToChatRoom(roomCode as string, messageData, 'English');
      if (result.success) {
        setNewMessage('');
        loadChatRoom(); // Reload messages
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Room: {roomCode}</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {Array.isArray(messages) && messages.map((message, index) => {
          console.log('Rendering message:', JSON.stringify(message, null, 2));
          return (
            <View 
              key={index} 
              style={[
                styles.messageBox,
                message.sender === 'User1' ? styles.sentMessage : styles.receivedMessage
              ]}
            >
              <Text style={styles.senderText}>{String(message.sender)}</Text>
              <Text style={styles.messageText}>{String(message.text)}</Text>
              <Text style={styles.timestampText}>
                {new Date(message.timestamp || '').toLocaleTimeString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
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
      </KeyboardAvoidingView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
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
  messagesContainer: {
    flex: 1,
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
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestampText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
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