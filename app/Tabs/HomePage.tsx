import React, { useEffect, useState } from 'react';
import { Image, Text, View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserChatRooms, UserChatRoom, deleteChatRoom } from '../../scripts/firebaseDbAPI';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<UserChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<string | null>(null);

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

  useEffect(() => {
    loadChatRooms();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadChatRooms();
    }, [])
  );

  const handleBackToLogin = () => {
    router.replace(`/`);
  };

  const handleJoinRoom = (roomCode: string) => {
    router.push(`/Chat_room?roomCode=${roomCode}`);
  };

  const handleDeleteRoom = async (roomCode: string) => {
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
              setDeletingRoom(roomCode);
              const result = await deleteChatRoom(roomCode);
              if (result.success) {
                Alert.alert("Success", "You have left the chat room");
                loadChatRooms();
              } else {
                Alert.alert("Error", result.error || "Failed to leave chat room");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to leave chat room");
            } finally {
              setDeletingRoom(null);
            }
          }
        }
      ]
    );
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
              <View key={room.roomCode} style={styles.chatRoomItemContainer}>
                <TouchableOpacity
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
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRoom(room.roomCode)}
                    disabled={deletingRoom === room.roomCode}
                  >
                    {deletingRoom === room.roomCode ? (
                      <ActivityIndicator color="#FF3B30" size="small" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
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
  chatRoomItemContainer: {
    marginBottom: 10,
  },
  chatRoomItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  chatRoomInfo: {
    gap: 5,
    paddingRight: 30,
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
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
});
