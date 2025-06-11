package com.abhinav.chatapp.chatapp_backend.playload;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String userId;
    private String name;
    private String email;
    private boolean isEmailVerified;
    private String token;
}

