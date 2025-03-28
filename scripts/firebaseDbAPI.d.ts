export interface Message {
  text: string;
  sender: string;
  timestamp?: string;
}

export interface ChatRoomData {
  id: string;
  roomCode: string;
  participants: any[];
  languages: string[];
  messagesByLanguage: {
    [key: string]: Message[];
  };
  createdAt: string;
  lastUpdated: string;
}

export interface ChatRoomResponse {
  success: boolean;
  chatRoom?: ChatRoomData;
  error?: string;
}

export function addMessageToChatRoom(roomCode: string, message: Message, senderLanguage: string): Promise<{ success: boolean; error?: string }>;
export function getChatRoom(roomCode: string): Promise<ChatRoomResponse>; 