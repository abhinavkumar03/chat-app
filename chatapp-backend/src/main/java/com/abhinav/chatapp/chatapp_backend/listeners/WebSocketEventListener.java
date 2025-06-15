package com.abhinav.chatapp.chatapp_backend.listeners;

import com.abhinav.chatapp.chatapp_backend.repositories.UserRepository;
import com.abhinav.chatapp.chatapp_backend.utils.ActiveUserStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
public class WebSocketEventListener {
    private final UserRepository userRepository;
    private final ActiveUserStore activeUserStore;

    public WebSocketEventListener(UserRepository userRepository, @Lazy ActiveUserStore activeUserStore) {
        this.userRepository = userRepository;
        this.activeUserStore = activeUserStore;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userEmail = accessor.getSessionAttributes() != null
                ? (String) accessor.getSessionAttributes().get("email")
                : accessor.getFirstNativeHeader("email");

        if (userEmail != null) {
            activeUserStore.addUser(userEmail);
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                userRepository.save(user);
                log.info("User connected: {}", userEmail);
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap((event.getMessage()));
        String userEmail = (String) accessor.getSessionAttributes().get("email");
        if (userEmail != null) {
            activeUserStore.removeUser(userEmail);
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                userRepository.save(user);
                log.info("User disconnected: {}", userEmail);
            });
        }
    }

}
