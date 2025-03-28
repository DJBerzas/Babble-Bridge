import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { createChatRoom, getCurrentUser, getUserData, Participant, detectLanguage } from '../../scripts/firebaseDbAPI';
import { Ionicons } from '@expo/vector-icons';

const create_room = () => {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Add current user as first participant when component mounts
  useEffect(() => {
    const addCurrentUser = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userData = await getUserData(currentUser.uid);
        if (userData.success && userData.userData) {
          setParticipants([{
            id: currentUser.uid,
            email: currentUser.email || '',
            username: userData.userData.username,
            nativeLanguage: userData.userData.nativeLanguage
          }]);
        }
      }
    };
    addCurrentUser();
  }, []);

  const addParticipant = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Check if email is already added
    if (participants.some(p => p.email === email)) {
      Alert.alert('Error', 'This participant has already been added');
      return;
    }

    setLoading(true);
    try {
      // Detect language from email (using a sample text)
      const detectedLanguage = await detectLanguage(email);
      
      // Add new participant
      setParticipants([...participants, {
        id: email, // Using email as ID for now
        email: email,
        username: email.split('@')[0], // Simple username from email
        nativeLanguage: detectedLanguage
      }]);

      // Clear input
      setEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter(p => p.email !== email));
  };

  const createRoom = async () => {
    if (participants.length < 2) {
      Alert.alert('Error', 'Please add at least one participant');
      return;
    }

    setLoading(true);
    try {
      const result = await createChatRoom(participants);
      if (result.success) {
        Alert.alert(
          'Success',
          `Room created with code: ${result.roomCode}`,
          [
            {
              text: 'OK',
              onPress: () => router.push(`/Chat_room?roomCode=${result.roomCode}`)
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create room');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Create New Chat Room</Text>
          
          {/* Add Participant Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Participant Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.addButton, loading && styles.disabledButton]}
              onPress={addParticipant}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Adding...' : 'Add Participant'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Participants List */}
          <View style={styles.participantsContainer}>
            <Text style={styles.sectionTitle}>Participants</Text>
            {participants.map((participant) => (
              <View key={participant.email} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantEmail}>{participant.email}</Text>
                  <Text style={styles.participantLanguage}>Language: {participant.nativeLanguage}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeParticipant(participant.email)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Create Room Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={createRoom}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Room...' : 'Create Room'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  participantInfo: {
    flex: 1,
  },
  participantEmail: {
    color: '#fff',
    fontSize: 16,
  },
  participantLanguage: {
    color: '#ccc',
    fontSize: 14,
  },
  removeButton: {
    padding: 5,
  },
  createButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default create_room;