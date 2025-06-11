package com.abhinav.chatapp.chatapp_backend.playload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UpdateProfileRequest {
    private String userId;
    private String name;
    private String password;
}
