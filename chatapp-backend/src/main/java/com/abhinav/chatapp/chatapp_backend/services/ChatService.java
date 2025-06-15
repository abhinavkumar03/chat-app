package com.abhinav.chatapp.chatapp_backend.services;

import com.abhinav.chatapp.chatapp_backend.entities.Message;
import com.abhinav.chatapp.chatapp_backend.entities.Room;
import com.abhinav.chatapp.chatapp_backend.playload.MessageRequest;
import com.abhinav.chatapp.chatapp_backend.repositories.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChatService {

    private final RoomRepository roomRepository;

    public ChatService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Message handleSendMessage(MessageRequest request) {
        Room room = roomRepository.findByRoomId(request.getRoomId());
        if (room == null) {
            throw new RuntimeException("Room not found!");
        }

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        room.getMessages().add(message);
        roomRepository.save(room);

        return message;
    }
}
