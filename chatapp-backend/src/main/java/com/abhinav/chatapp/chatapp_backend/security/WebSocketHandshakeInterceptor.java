package com.abhinav.chatapp.chatapp_backend.security;

import com.abhinav.chatapp.chatapp_backend.entities.User;
import com.abhinav.chatapp.chatapp_backend.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public WebSocketHandshakeInterceptor(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token");
            if (token == null) {
                String authHeader = httpRequest.getHeader("Authorization"); // SockJS will NOT set this
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (token != null) {
                try {
                    Claims claims = jwtUtil.validateToken(token);
                    String email = claims.getSubject();
                    Optional<User> optionalUser = userRepository.findByEmail(email);
                    if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(user, null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        attributes.put("user", user);
                        return true;
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        }

        response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            System.out.println("Handshake failed: " + exception.getMessage());
        } else {
            System.out.println("Handshake completed successfully for " + request.getRemoteAddress());
        }
        SecurityContextHolder.clearContext();
    }
}
