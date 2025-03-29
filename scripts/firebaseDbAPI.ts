import { collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

export interface UserData {
    id: string;
    email: string;
    username: string;
    nativeLanguage: string;
    createdAt: string;
}

export interface Participant {
    id: string;
    email: string;
    username: string;
    nativeLanguage: string;
}

export interface Message {
    text: string;
    sender: string;
    senderId: string;
    timestamp: string;
}

export interface ChatRoomData {
    id?: string;
    roomCode: string;
    participants: Participant[];
    languages: string[];
    messagesByLanguage: { [key: string]: Message[] };
    createdAt: string;
    lastUpdated: string;
}

export interface UserChatRoom {
    roomCode: string;
    lastVisited: string;
    participants: Participant[];
}

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCV7-PIC7MOlbTd-aZtVSP7KgR9BKy_kCo",
  authDomain: "babblebridge.firebaseapp.com",
  projectId: "babblebridge",
  storageBucket: "babblebridge.firebasestorage.app",
  messagingSenderId: "157389739525",
  appId: "1:157389739525:web:4ef10b80a7193c275b2e6c",
  measurementId: "G-QHD4TMNK89"
};

const GOOGLE_TRANSLATE_API_KEY = "AIzaSyAmtq77wGBFT8-eJa31KuVXorFktEXy_ag"; 


const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
let currentUser: User | null = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    currentUser = null;
  }
});

export async function loginUser(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        return {
            success: true,
            user: {
                id: userCredential.user.uid,
                email: userCredential.user.email
            }
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function registerUser(email: string, password: string, username: string, nativeLanguage: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData: UserData = {
            id: userCredential.user.uid,
            email: email,
            username: username,
            nativeLanguage: nativeLanguage,
            createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "Users", userCredential.user.uid), userData);
        currentUser = userCredential.user;
        return {
            success: true,
            user: userData
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        currentUser = null;
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export function getCurrentUser(): User | null {
    return currentUser;
}

export async function addTestUser() {
    try {
        const usersCollection = collection(db, "Users");
        const userData: UserData = {
            id: "test-user",
            username: "Tester",
            email: "test@test.com",
            nativeLanguage: "English",
            createdAt: new Date().toISOString()
        };

        await addDoc(usersCollection, userData);
    } catch (error: any) {
        console.error("Error adding test user:", error);
    }
}

export async function getTestUser() {
    try {
        const usersCollection = collection(db, "Users");
        const querySnapshot = await getDocs(usersCollection);
        const users: UserData[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as UserData);
        });
        return users;
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function getNativeLanguage() {}

export async function createChatRoom(participants: Participant[]) {
    try {
        const chatRoomsCollection = collection(db, "ChatRooms");
        const roomCode = Math.floor(100000 + Math.random() * 900000);
        
        const languages = new Set<string>();
        participants.forEach(participant => {
            languages.add(participant.nativeLanguage);
        });

        const messagesByLanguage: { [key: string]: Message[] } = {};
        languages.forEach(language => {
            messagesByLanguage[language] = [];
        });

        const chatRoomData: ChatRoomData = {
            roomCode: roomCode.toString(),
            participants: participants,
            languages: Array.from(languages),
            messagesByLanguage: messagesByLanguage,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        const chatRoomRef = doc(chatRoomsCollection, roomCode.toString());
        await setDoc(chatRoomRef, chatRoomData);

        return {
            success: true,
            roomCode: roomCode,
            chatRoomData: chatRoomData
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getChatRoom(roomCode: string) {
    try {
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (chatRoomDoc.exists()) {
            const data = chatRoomDoc.data();
            const chatRoom: ChatRoomData = {
                id: chatRoomDoc.id,
                roomCode: data.roomCode,
                participants: data.participants,
                languages: data.languages,
                messagesByLanguage: data.messagesByLanguage,
                createdAt: data.createdAt,
                lastUpdated: data.lastUpdated
            };
            return {
                success: true,
                chatRoom
            };
        } else {
            return {
                success: false,
                error: "Chat room not found"
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export function getLanguageCode(languageName: string): string {
    const languageCodeMap: { [key: string]: string } = {
        'English': 'en-US',
        'English (US)': 'en-US',
        'English (UK)': 'en-GB',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Portuguese': 'pt-BR',
        'Portuguese (Brazil)': 'pt-BR',
        'Portuguese (Portugal)': 'pt-PT',
        'Russian': 'ru',
        'Chinese': 'zh',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Arabic': 'ar',
        'Hindi': 'hi',
        'Bengali': 'bn',
        'Dutch': 'nl',
        'Polish': 'pl',
        'Turkish': 'tr',
        'Vietnamese': 'vi',
        'Thai': 'th',
        'Greek': 'el',
        'Hebrew': 'he',
        'Indonesian': 'id',
        'Malay': 'ms',
        'Filipino': 'fil',
        'Swedish': 'sv',
        'Danish': 'da',
        'Finnish': 'fi',
        'Czech': 'cs',
        'Romanian': 'ro',
        'Hungarian': 'hu',
        'Ukrainian': 'uk',
        'Catalan': 'ca',
        'en': 'en-US',
        'en-US': 'en-US',
        'en-GB': 'en-GB',
        'es': 'es',
        'fr': 'fr',
        'de': 'de',
        'it': 'it',
        'pt': 'pt-BR',
        'pt-BR': 'pt-BR',
        'pt-PT': 'pt-PT',
        'ru': 'ru',
        'zh': 'zh',
        'ja': 'ja',
        'ko': 'ko',
        'ar': 'ar',
        'hi': 'hi',
        'bn': 'bn',
        'nl': 'nl',
        'pl': 'pl',
        'tr': 'tr',
        'vi': 'vi',
        'th': 'th',
        'el': 'el',
        'he': 'he',
        'id': 'id',
        'ms': 'ms',
        'fil': 'fil',
        'sv': 'sv',
        'da': 'da',
        'fi': 'fi',
        'cs': 'cs',
        'ro': 'ro',
        'hu': 'hu',
        'uk': 'uk',
        'ca': 'ca'
    };

    if (languageCodeMap[languageName]) {
        return languageCodeMap[languageName];
    }

    if (!languageCodeMap[languageName]) {
        return 'en-US';
    }
    return languageCodeMap[languageName];
}

export async function translateMessage(message: string, targetLanguage: string, sender: string, timestamp: string, sourceLanguage: string = 'en') {
    try {
        const sourceCode = getLanguageCode(sourceLanguage);
        const targetCode = getLanguageCode(targetLanguage);

        if (sourceCode === targetCode) {
            return {
                text: message,
                sender: sender,
                timestamp: timestamp
            };
        }

        const requestBody = {
            q: message,
            target: targetCode,
            source: sourceCode
        };

        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
            requestBody
        );

        if (!response.data || !response.data.data || !response.data.data.translations || !response.data.data.translations[0]) {
            throw new Error('Invalid response from translation API');
        }

        const translatedText = response.data.data.translations[0].translatedText;
        
        return {
            text: translatedText,
            sender: sender,
            timestamp: timestamp
        };
    } catch (error: any) {
        return {
            text: message,
            sender: sender,
            timestamp: timestamp
        };
    }
}

export async function addMessageToChatRoom(roomCode: string, message: { text: string }, senderLanguage: string) {
    try {
        if (!currentUser) {
            throw new Error("User must be logged in to send messages");
        }

        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (!chatRoomDoc.exists()) {
            throw new Error("Chat room not found");
        }

        const chatRoomData = chatRoomDoc.data() as ChatRoomData;
        const participants = chatRoomData.participants;

        const messageObject: Message = {
            text: message.text,
            sender: currentUser.email || 'Anonymous',
            senderId: currentUser.uid,
            timestamp: new Date().toISOString()
        };

        const updates: any = {
            lastUpdated: new Date().toISOString()
        };

        updates[`messagesByLanguage.${senderLanguage}`] = arrayUnion(messageObject);

        for (const participant of participants) {
            if (participant.nativeLanguage !== senderLanguage) {
                try {
                    const translatedMessage = await translateMessage(
                        message.text,
                        participant.nativeLanguage,
                        messageObject.sender,
                        messageObject.timestamp,
                        senderLanguage
                    );

                    const translatedMessageObject: Message = {
                        text: translatedMessage.text,
                        sender: messageObject.sender,
                        senderId: messageObject.senderId,
                        timestamp: messageObject.timestamp
                    };

                    updates[`messagesByLanguage.${participant.nativeLanguage}`] = arrayUnion(translatedMessageObject);
                } catch (translationError: any) {
                    updates[`messagesByLanguage.${participant.nativeLanguage}`] = arrayUnion(messageObject);
                }
            }
        }
        
        await updateDoc(chatRoomRef, updates);
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getRoomsByLanguage(roomCode: string) {
    try {
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (chatRoomDoc.exists()) {
            const chatRoomData = chatRoomDoc.data() as ChatRoomData;
            return {
                success: true,
                languages: chatRoomData.languages || []
            };
        } else {
            return {
                success: false,
                error: "Chat room not found"
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getUserChatRooms(): Promise<{ success: boolean; chatRooms?: UserChatRoom[]; error?: string }> {
    try {
        if (!currentUser) {
            throw new Error("User must be logged in to fetch chat rooms");
        }

        const chatRoomsCollection = collection(db, "ChatRooms");
        const querySnapshot = await getDocs(chatRoomsCollection);
        
        const userChatRooms: UserChatRoom[] = [];
        
        querySnapshot.forEach((doc) => {
            const chatRoomData = doc.data() as ChatRoomData;
            const isParticipant = chatRoomData.participants.some(
                participant => participant.id === currentUser?.uid
            );
            
            if (isParticipant) {
                userChatRooms.push({
                    roomCode: chatRoomData.roomCode,
                    lastVisited: chatRoomData.lastUpdated,
                    participants: chatRoomData.participants
                });
            }
        });

        userChatRooms.sort((a, b) => 
            new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
        );

        return {
            success: true,
            chatRooms: userChatRooms
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getUserData(userId: string): Promise<{ success: boolean; userData?: UserData; error?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "Users", userId));
        if (userDoc.exists()) {
            return {
                success: true,
                userData: userDoc.data() as UserData
            };
        } else {
            return {
                success: false,
                error: "User data not found"
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function detectLanguage(text: string): Promise<string> {
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`,
            { q: text }
        );

        if (response.data?.data?.detections?.[0]?.[0]?.language) {
            const detectedCode = response.data.data.detections[0][0].language;
            for (const [languageName, code] of Object.entries({
                'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
                'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Chinese': 'zh',
                'Japanese': 'ja', 'Korean': 'ko', 'Arabic': 'ar', 'Hindi': 'hi',
                'Bengali': 'bn', 'Dutch': 'nl', 'Polish': 'pl', 'Turkish': 'tr',
                'Vietnamese': 'vi', 'Thai': 'th', 'Greek': 'el', 'Hebrew': 'he',
                'Indonesian': 'id', 'Malay': 'ms', 'Filipino': 'fil', 'Swedish': 'sv',
                'Danish': 'da', 'Finnish': 'fi', 'Czech': 'cs', 'Romanian': 'ro',
                'Hungarian': 'hu', 'Ukrainian': 'uk', 'Catalan': 'ca'
            })) {
                if (code === detectedCode) {
                    return languageName;
                }
            }
        }
        return 'English';
    } catch (error) {
        return 'English';
    }
}

export async function addParticipantToRoom(roomCode: string, participant: Participant) {
    try {
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (!chatRoomDoc.exists()) {
            throw new Error("Chat room not found");
        }

        const chatRoomData = chatRoomDoc.data() as ChatRoomData;
        
        const existingParticipant = chatRoomData.participants.find(p => p.id === participant.id);
        if (existingParticipant) {
            return { success: true };
        }

        const updatedParticipants = [...chatRoomData.participants, participant];

        const updatedMessagesByLanguage = { ...chatRoomData.messagesByLanguage };
        if (!updatedMessagesByLanguage[participant.nativeLanguage]) {
            updatedMessagesByLanguage[participant.nativeLanguage] = [];
        }

        const updatedLanguages = [...new Set([...chatRoomData.languages, participant.nativeLanguage])];

        await updateDoc(chatRoomRef, {
            participants: updatedParticipants,
            languages: updatedLanguages,
            messagesByLanguage: updatedMessagesByLanguage,
            lastUpdated: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function deleteChatRoom(roomCode: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!currentUser) {
            throw new Error("User must be logged in to leave chat rooms");
        }

        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (!chatRoomDoc.exists()) {
            throw new Error("Chat room not found");
        }

        const chatRoomData = chatRoomDoc.data() as ChatRoomData;
        
        const isParticipant = chatRoomData.participants.some(
            participant => participant.id === currentUser?.uid
        );

        if (!isParticipant) {
            throw new Error("You are not a participant in this chat room");
        }

        const updatedParticipants = chatRoomData.participants.filter(
            participant => participant.id !== currentUser?.uid
        );

        await updateDoc(chatRoomRef, {
            participants: updatedParticipants,
            lastUpdated: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}


