package com.abhinav.chatapp.chatapp_backend.config;

import com.abhinav.chatapp.chatapp_backend.security.WebSocketHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final AppConstants appConstants;
    private final WebSocketHandshakeInterceptor webSocketHandshakeInterceptor;

    public WebSocketConfig(AppConstants appConstants, WebSocketHandshakeInterceptor webSocketHandshakeInterceptor){
        this.appConstants = appConstants;
        this.webSocketHandshakeInterceptor = webSocketHandshakeInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        config.enableSimpleBroker("/topic");
        // /topic/messages

        config.setApplicationDestinationPrefixes("/app");
        // /app/chat
        // server-side: @MessagingMapping("/chat)


    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")//connection establishment
                .setAllowedOrigins(appConstants.getFrontEndBaseUrl())
                .addInterceptors(webSocketHandshakeInterceptor)
                .withSockJS();
    }
    // /chat endpoint par connection apka establish hoga
}