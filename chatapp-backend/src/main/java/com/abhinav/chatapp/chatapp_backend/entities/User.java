package com.abhinav.chatapp.chatapp_backend.entities;

import com.abhinav.chatapp.chatapp_backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private Role role;

    private boolean isActive = false;
    private boolean isEmailVerified = false;

    private String emailOtp;
    private LocalDateTime otpGeneratedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
