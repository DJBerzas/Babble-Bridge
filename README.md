# Babble Bridge

Babble Bridge is a real-time multilingual chat application that enables seamless communication between users speaking different languages. The app automatically translates messages in real-time, allowing users to communicate in their native languages while others receive the messages in their preferred language.

## Features

- **Real-time Multilingual Chat**: Users can communicate in their native languages while messages are automatically translated for other participants
- **QR Code Room Sharing**: Easy room sharing through QR codes
- **Language Detection**: Automatic detection of message language
- **Multiple Language Support**: Supports a wide range of languages including:
  - English (US/UK)
  - Spanish
  - French
  - German
  - Italian
  - Portuguese (Brazil/Portugal)
  - Russian
  - Chinese
  - Japanese
  - Korean
  - And many more...

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Real-time updates
- **Translation API**: Google Cloud Translation API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Google Cloud account (for Translation API)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/babble-bridge.git
cd babble-bridge
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
```

4. Start the development server:
```bash
npx expo start
```

## Project Structure

```
Babble-Bridge/
├── app/
│   ├── Tabs/
│   │   ├── Chat_room.tsx      # Main chat room interface
│   │   ├── create_room.tsx    # Room creation screen
│   │   ├── QR_Scan.tsx        # QR code scanner
│   │   └── Overlay.tsx        # UI overlay components
│   └── _layout.tsx            # Root layout component
├── scripts/
│   └── firebaseDbAPI.ts       # Firebase and translation API integration
└── assets/                    # Static assets
```

## Key Components

### Chat Room
- Real-time message updates
- Automatic message translation
- Language-specific message storage
- Participant management

### QR Scanner
- Camera integration
- QR code detection
- Room code extraction
- Automatic navigation to chat rooms

### Firebase Integration
- User authentication
- Real-time database updates
- Message storage and retrieval
- Participant tracking

## API Integration

### Google Translate API
The application uses Google Cloud Translation API for real-time message translation. The API supports:
- Language detection
- Text translation
- Multiple language pairs
- Error handling and fallback

### Firebase Services
- Authentication for user management
- Firestore for data storage
- Real-time updates for message synchronization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase for backend services
- Google Cloud for translation services
- Expo for the development framework
- React Native community for components and libraries
