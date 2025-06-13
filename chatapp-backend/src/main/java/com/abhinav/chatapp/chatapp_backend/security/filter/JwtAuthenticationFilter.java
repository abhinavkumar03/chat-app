package com.abhinav.chatapp.chatapp_backend.security.filter;

import com.abhinav.chatapp.chatapp_backend.repositories.UserRepository;
import com.abhinav.chatapp.chatapp_backend.entities.User;
import com.abhinav.chatapp.chatapp_backend.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        System.out.println("Incoming request: " + method + " " + path);

        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + header);

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            System.out.println("Extracted Token: " + token.substring(0, Math.min(20, token.length())) + "...");
            try {
                Claims claims = jwtUtil.validateToken(token);
                String email = claims.getSubject();
                System.out.println("Token is valid. Email from token: " + email);

                Optional<User> user = userRepository.findByEmail(email);
                if (user.isPresent()) {
                    System.out.println("User found in DB: " + user.get().getEmail());
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, List.of());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext");
                } else {
                    System.out.println("User not found in DB for email: " + email);
                }
            } catch (Exception e) {
                System.out.println("JWT validation failed: " + e.getMessage());
                e.printStackTrace();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                return;
            }
        } else {
            System.out.println("No valid Authorization header found. Request will be rejected.");
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth") ||
                path.startsWith("/chat") ||
                path.startsWith("/websocket") ||
                path.startsWith("/topic") ||
                path.startsWith("/app") ||
                path.contains("/info") ||
                path.contains("/iframe") ||
                path.contains("/xhr") ||
                path.contains("/xhr_send") ||
                path.contains("/xhr_streaming") ||
                path.contains("/eventsource") ||
                path.contains("/jsonp");
    }

}
