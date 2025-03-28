import React, { useEffect, useState } from 'react';
import { Image, Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserChatRooms, UserChatRoom } from '../../scripts/firebaseDbAPI';
import { useRouter } from 'expo-router';

export default function HomePage() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<UserChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      const result = await getUserChatRooms();
      if (result.success && result.chatRooms) {
        setChatRooms(result.chatRooms);
      } else {
        setError(result.error || 'Failed to load chat rooms');
      }
    } catch (err) {
      setError('Error loading chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace(`/`);
  };

  const handleJoinRoom = (roomCode: string) => {
    router.push(`/Chat_room?roomCode=${roomCode}`);
  };

  return (
    <LinearGradient
      colors={["#6685B5", "#E9F1FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <TouchableOpacity onPress={handleBackToLogin} style={styles.logoutButton}>
        <View style={styles.logoutContainer}>
          <Image
            source={require('./icons/right-arrow.png')}
            style={styles.logoutIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Chat Rooms</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading chat rooms...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : chatRooms.length === 0 ? (
          <Text style={styles.emptyText}>No chat rooms yet. Join one to get started!</Text>
        ) : (
          <ScrollView style={styles.chatRoomsList}>
            {chatRooms.map((room) => (
              <TouchableOpacity
                key={room.roomCode}
                style={styles.chatRoomItem}
                onPress={() => handleJoinRoom(room.roomCode)}
              >
                <View style={styles.chatRoomInfo}>
                  <Text style={styles.roomCode}>Room: {room.roomCode}</Text>
                  <Text style={styles.participantCount}>
                    {room.participants.length} participants
                  </Text>
                  <Text style={styles.lastVisited}>
                    Last active: {new Date(room.lastVisited).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    alignItems: 'center',
    zIndex: 10,
    overflow: 'visible',
  },
  logoutContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 25,
    height: 32,
  },
  logoutText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  chatRoomsList: {
    flex: 1,
  },
  chatRoomItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatRoomInfo: {
    gap: 5,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6685B5',
  },
  participantCount: {
    fontSize: 14,
    color: '#666',
  },
  lastVisited: {
    fontSize: 12,
    color: '#999',
  },
});
