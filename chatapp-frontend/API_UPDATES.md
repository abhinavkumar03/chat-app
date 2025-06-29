# ChatApp Frontend API Updates

This document outlines the changes made to the frontend to align with the updated backend APIs.

## Backend API Analysis

### AuthController (`/api/auth`)
- **POST** `/signup` - Register new user
  - **Payload**: `{ name, email, password, role }`
  - **Role Options**: `MEMBER`, `ADMIN`, `SUPER_ADMIN`
- **PUT** `/update` - Update user profile
  - **Payload**: `UpdateProfileRequest`
- **PUT** `/status` - Update user status
  - **Payload**: `UserStatusUpdateRequest`
- **POST** `/login` - Login with credentials
  - **Payload**: `{ email, password }`
- **PUT** `/reset-password` - Reset password
  - **Payload**: `ResetPasswordRequest`
- **POST** `/send-otp` - Send OTP to email
  - **Payload**: `{ email }`
- **POST** `/verify-otp` - Verify OTP
  - **Payload**: `VerifyOtpRequest`

### ChatController (WebSocket)
- **WebSocket** `/sendMessage/{roomId}` - Send message to room
  - **Payload**: `{ content, sender, roomId }`
  - **Destination**: `/topic/room/{roomId}`

### RoomController (`/api/v1/rooms`)
- **POST** `/` - Create room
  - **Payload**: `{ roomId, userId }`
- **GET** `/` - Get all rooms
- **POST** `/join` - Join room
  - **Payload**: `{ roomId, userId }`
- **POST** `/leave` - Leave room
  - **Payload**: `{ roomId, userId }`
- **POST** `/promote` - Promote user
  - **Payload**: `{ roomId, userId }`
- **POST** `/demote` - Demote user
  - **Payload**: `{ roomId, userId }`
- **GET** `/{roomId}/messages` - Get paginated messages
  - **Query Params**: `page` (default: 0), `size` (default: 20)

### UserController (`/api/users`)
- **GET** `/active` - Get active users

## Frontend Changes Made

### 1. Updated Services

#### `src/services/RoomService.js`
- **Added**: New `roomService` object with proper error handling
- **Updated**: All API calls to use correct endpoints and payloads
- **Added**: Support for all room operations (create, join, leave, promote, demote)
- **Fixed**: Message pagination with correct query parameters
- **Maintained**: Backward compatibility with legacy functions

#### `src/services/userService.js` (New)
- **Added**: Service for user-related API calls
- **Implemented**: `getActiveUsers()` method

#### `src/services/websocketService.js` (New)
- **Added**: WebSocket service using Stomp.js
- **Implemented**: Connection management, room subscriptions, message sending
- **Features**: Automatic reconnection, error handling, message parsing

### 2. Updated Components

#### `src/components/ChatPage.jsx`
- **Updated**: WebSocket integration to use new service
- **Fixed**: Message loading with proper error handling
- **Improved**: Connection status management
- **Added**: Better error messages and user feedback

#### `src/components/JoinCreateChat.jsx`
- **Updated**: Room operations to use new service
- **Fixed**: API calls for creating and joining rooms
- **Improved**: Error handling and user feedback
- **Updated**: Room display to show participant count correctly

#### `src/components/Signup.jsx`
- **Added**: Role selection field (MEMBER, ADMIN, SUPER_ADMIN)
- **Updated**: Form validation to include role
- **Added**: Proper toast notifications
- **Improved**: Form submission with role data

### 3. Data Models

#### User Entity
```javascript
{
  id: String,
  name: String,
  email: String,
  password: String,
  role: 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN',
  isActive: Boolean,
  isEmailVerified: Boolean,
  emailOtp: String,
  otpGeneratedAt: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Room Entity
```javascript
{
  id: String,
  roomId: String,
  messages: Array<Message>,
  participants: Map<String, Role>,
  activeUserIds: Array<String>
}
```

#### Message Entity
```javascript
{
  sender: String,
  content: String,
  timeStamp: DateTime
}
```

## Key Improvements

### 1. Error Handling
- **Consistent**: All API calls now return `{ success: boolean, data: any, error: string }`
- **User-Friendly**: Proper error messages displayed to users
- **Graceful**: Fallback behavior for failed operations

### 2. WebSocket Integration
- **Real-time**: Proper WebSocket connection for live messaging
- **Reliable**: Automatic reconnection and error recovery
- **Efficient**: Room-based subscriptions for targeted message delivery

### 3. API Consistency
- **Standardized**: All endpoints follow consistent patterns
- **Proper**: Correct HTTP methods and payload structures
- **Complete**: All backend endpoints now have frontend implementations

### 4. User Experience
- **Responsive**: Better loading states and feedback
- **Intuitive**: Clear error messages and success notifications
- **Accessible**: Proper form validation and user guidance

## Usage Examples

### Creating a Room
```javascript
const result = await roomService.createRoom({
  roomId: "my-room",
  userId: "user123"
});

if (result.success) {
  console.log("Room created:", result.data);
} else {
  console.error("Failed:", result.error);
}
```

### Joining a Room
```javascript
const result = await roomService.joinRoom("room-id", "user-id");
if (result.success) {
  // Navigate to chat
  navigate(`/chat/${result.data.roomId}`);
}
```

### Sending a Message
```javascript
const message = {
  content: "Hello world!",
  sender: "user123",
  roomId: "room-id"
};

const success = websocketService.sendMessage("room-id", message);
if (success) {
  console.log("Message sent successfully");
}
```

### Getting Messages
```javascript
const result = await roomService.getMessages("room-id", 0, 20);
if (result.success) {
  setMessages(result.data);
}
```

## Dependencies

The following dependencies are required:
- `@stomp/stompjs`: WebSocket client for real-time messaging
- `axios`: HTTP client for API calls
- `react-hot-toast`: Toast notifications
- `lucide-react`: Icons

## Environment Variables

Make sure to set the following environment variable:
```env
VITE_API_URL=https://your-backend-url.com
```

## Notes

1. **Backward Compatibility**: Legacy API functions are maintained for existing code
2. **Error Recovery**: WebSocket service includes automatic reconnection
3. **Security**: All API calls include proper authentication headers
4. **Performance**: Message pagination implemented for better performance
5. **Scalability**: Service-based architecture allows for easy extension

## Testing

To test the updated frontend:

1. **Start the backend server**
2. **Set the correct API URL** in environment variables
3. **Run the frontend**: `npm run dev`
4. **Test user registration** with different roles
5. **Test room creation and joining**
6. **Test real-time messaging**
7. **Test room management** (promote/demote users)

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend WebSocket endpoint is available
   - Verify authentication token is valid
   - Check network connectivity

2. **API Calls Failing**
   - Verify API URL is correct
   - Check authentication headers
   - Ensure backend is running

3. **Messages Not Loading**
   - Check room permissions
   - Verify room ID is correct
   - Check pagination parameters

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will log all API calls and WebSocket events to the console. 