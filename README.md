# Babble Bridge

Babble Bridge is a real-time multilingual chat application that enables seamless communication between users speaking different languages. The app automatically translates messages into each participant's native language, making cross-language communication effortless.

## Features

- **Real-time Translation**: Messages are instantly translated into each participant's native language
- **QR Code Sharing**: Easy room sharing through QR codes
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
  - Arabic
  - Hindi
  - And many more...

- **User Profiles**: Customizable user profiles with native language preferences
- **Chat Room Management**:
  - Create private chat rooms
  - Join rooms via QR code or room code
  - Leave rooms (instead of deleting them)
  - View recent chat rooms
  - See participant information and languages

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Real-time updates
- **Translation**: Google Cloud Translation API
- **UI Framework**: Native components with custom styling

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Firebase and Google Translate API credentials

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
Babble-Bridge/
├── app/
│   ├── Tabs/
│   │   ├── HomePage.tsx      # Main chat rooms list
│   │   ├── QR_Scan.tsx       # QR code scanner
│   │   ├── join_chat.tsx     # Join room interface
│   │   └── create_room.tsx   # Create new room interface
│   ├── Chat_room.tsx         # Chat room interface
│   └── _layout.tsx           # Tab navigation layout
├── scripts/
│   └── firebaseDbAPI.ts      # Firebase and translation logic
└── assets/                   # Images and other static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Cloud Translation API for language translation
- Firebase for backend services
- Expo for the development framework
