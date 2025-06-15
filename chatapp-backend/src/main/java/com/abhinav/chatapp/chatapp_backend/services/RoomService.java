package com.abhinav.chatapp.chatapp_backend.services;

import com.abhinav.chatapp.chatapp_backend.entities.Message;
import com.abhinav.chatapp.chatapp_backend.entities.Room;
import com.abhinav.chatapp.chatapp_backend.enums.Role;
import com.abhinav.chatapp.chatapp_backend.repositories.RoomRepository;
import com.abhinav.chatapp.chatapp_backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public Room createRoom(String roomId, String userId) {
        Room room = new Room();
        room.setRoomId(roomId);
        room.getParticipants().put(userId, Role.SUPER_ADMIN);
        return roomRepository.save(room);
    }

    public List<Room> getRooms(){
        return roomRepository.findAll();
    }

    public Room addUserToRoom(String roomId, String userId) {
        Room room = roomRepository.findByRoomId(roomId);

        room.getParticipants().put(userId, Role.MEMBER);
        return roomRepository.save(room);
    }

    public Room removeUserFromRoom(String roomId, String userId) {
        Room room = roomRepository.findByRoomId(roomId);

        room.getParticipants().remove(userId);
        return roomRepository.save(room);
    }

    public Room promoteUser(String roomId, String userId) {
        Room room = roomRepository.findByRoomId(roomId);

        room.getParticipants().put(userId, Role.ADMIN);
        return roomRepository.save(room);
    }

    public Room demoteUser(String roomId, String userId) {
        Room room = roomRepository.findByRoomId(roomId);

        room.getParticipants().put(userId, Role.MEMBER);
        return roomRepository.save(room);
    }

    public ResponseEntity<List<Message>> getPaginatedMessages(String roomId, int page, int size) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Message> messages = room.getMessages();
        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);
        List<Message> paginatedMessages = messages.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);
    }

}
