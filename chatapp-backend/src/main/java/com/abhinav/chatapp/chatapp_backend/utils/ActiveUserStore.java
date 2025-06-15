package com.abhinav.chatapp.chatapp_backend.utils;

import lombok.Getter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Getter
public class ActiveUserStore {

    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();
    private final SimpMessagingTemplate messagingTemplate;

    public ActiveUserStore(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void addUser(String email) {
        activeUsers.add(email);
        broadcast();
    }

    public void removeUser(String email) {
        activeUsers.remove(email);
        broadcast();
    }

    private void broadcast() {
        messagingTemplate.convertAndSend("/topic/active-users", activeUsers);
    }

}
