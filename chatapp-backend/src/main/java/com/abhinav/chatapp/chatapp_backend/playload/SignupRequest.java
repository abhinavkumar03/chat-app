package com.abhinav.chatapp.chatapp_backend.playload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
}

