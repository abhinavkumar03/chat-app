package com.abhinav.chatapp.chatapp_backend.controllers;

import com.abhinav.chatapp.chatapp_backend.entities.Message;
import com.abhinav.chatapp.chatapp_backend.playload.MessageRequest;
import com.abhinav.chatapp.chatapp_backend.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(@DestinationVariable String roomId, @RequestBody MessageRequest request) {
        return chatService.handleSendMessage(request);
    }
}
