import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  createChatRoom,
  getCurrentUser,
  getUserData,
  Participant,
  getUserDataByEmail,
} from '../../scripts/firebaseDbAPI';
import { Ionicons } from '@expo/vector-icons';

const create_room = () => {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const addCurrentUser = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userData = await getUserData(currentUser.uid);
        if (userData.success && userData.userData) {
          setParticipants([
            {
              id: currentUser.uid,
              email: currentUser.email || '',
              username: userData.userData.username,
              nativeLanguage: userData.userData.nativeLanguage,
            },
          ]);
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

    if (participants.some((p) => p.email === email)) {
      Alert.alert('Error', 'This participant has already been added');
      return;
    }

    setLoading(true);
    try {
      const userResult = await getUserDataByEmail(email);
      let nativeLanguage = 'English'; // Default language

      if (userResult.success && userResult.userData) {
        nativeLanguage = userResult.userData.nativeLanguage;
      }

      setParticipants([
        ...participants,
        {
          id: email,
          email: email,
          username: email.split('@')[0],
          nativeLanguage: nativeLanguage,
        },
      ]);

      setEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p.email !== email));
  };

  const createRoom = async () => {
    if (participants.length < 1) {
      Alert.alert('Error', 'Please add at least one participant');
      return;
    }

    setLoading(true);
    try {
      const result = await createChatRoom(participants);
      if (result.success) {
        Alert.alert('Success', `Room created with code: ${result.roomCode}`, [
          {
            text: 'OK',
            onPress: () =>
              router.push(`/Chat_room?roomCode=${result.roomCode}`),
          },
        ]);
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
      colors={['#6685B5', '#E9F1FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Create New Chat Room</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Participant Email"
              placeholderTextColor="#666"
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

          <View style={styles.participantsContainer}>
            <Text style={styles.sectionTitle}>Participants</Text>
            {participants.map((participant) => (
              <View key={participant.email} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantEmail}>
                    {participant.email}
                  </Text>
                  <Text style={styles.participantLanguage}>
                    Language: {participant.nativeLanguage}
                  </Text>
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
    paddingTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    color: '#000',
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // light gray
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  participantInfo: {
    flex: 1,
  },
  participantEmail: {
    color: '#000',
    fontSize: 16,
  },
  participantLanguage: {
    color: '#555',
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
