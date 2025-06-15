package com.abhinav.chatapp.chatapp_backend.controllers;

import com.abhinav.chatapp.chatapp_backend.utils.ActiveUserStore;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final ActiveUserStore activeUserStore;

    @GetMapping("/active")
    public Set<String> getActiveUsers() {
        return activeUserStore.getActiveUsers();
    }
}
