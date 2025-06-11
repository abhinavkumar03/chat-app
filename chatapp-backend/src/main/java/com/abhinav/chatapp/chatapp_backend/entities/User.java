package com.abhinav.chatapp.chatapp_backend.entities;

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
    private String role;

    private boolean isActive = true;
    private boolean isEmailVerified = false;

    private String emailOtp;
    private LocalDateTime otpGeneratedAt;

    private String createdAt;
    private String updatedAt;
}
