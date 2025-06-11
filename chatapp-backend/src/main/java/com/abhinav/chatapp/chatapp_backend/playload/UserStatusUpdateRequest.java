package com.abhinav.chatapp.chatapp_backend.playload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserStatusUpdateRequest {
    private String userId;
    private Boolean isActive;

    public Boolean getIsActive() {
        return isActive;
    }
}

