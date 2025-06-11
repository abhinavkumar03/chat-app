package com.abhinav.chatapp.chatapp_backend.controllers;


import com.abhinav.chatapp.chatapp_backend.config.AppConstants;
import com.abhinav.chatapp.chatapp_backend.entities.User;
import com.abhinav.chatapp.chatapp_backend.playload.*;
import com.abhinav.chatapp.chatapp_backend.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(AppConstants.FRONT_END_BASE_URL)
public class AuthController {
    private UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request){
        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .isActive(true)
                .password(new BCryptPasswordEncoder().encode(request.getPassword()))
                .createdAt(LocalDateTime.now().toString())
                .updatedAt(LocalDateTime.now().toString())
                .build();
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Optional<User> optionalUser = userRepository.findById(request.getUserId());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        User user = optionalUser.get();

        user.setName(request.getName());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(new BCryptPasswordEncoder().encode(request.getPassword()));
        }
        user.setUpdatedAt(LocalDateTime.now().toString());

        userRepository.save(user);

        return ResponseEntity.ok("User updated successfully");
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateUserStatus(@RequestBody UserStatusUpdateRequest request) {
        System.out.println("Full request: " + request);


        Optional<User> optionalUser = userRepository.findById(request.getUserId());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        user.setActive(request.getIsActive());

        user.setUpdatedAt(LocalDateTime.now().toString());
        userRepository.save(user);

        String statusMsg = request.getIsActive() ? "activated" : "deactivated";
        return ResponseEntity.ok("User " + statusMsg + " successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is deactivated");
        }

        boolean passwordMatch = new BCryptPasswordEncoder().matches(request.getPassword(), user.getPassword());

        if (!passwordMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEmailVerified()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();

        user.setPassword(new BCryptPasswordEncoder().encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now().toString());

        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody EmailRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();

        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP

        user.setEmailOtp(otp);
        user.setOtpGeneratedAt(LocalDateTime.now());

        userRepository.save(user);

        System.out.println("Simulated OTP for " + user.getEmail() + ": " + otp); // simulate sending

        return ResponseEntity.ok("OTP sent successfully (check logs)");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();

        if (!request.getOtp().equals(user.getEmailOtp())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
        }

        Duration diff = Duration.between(user.getOtpGeneratedAt(), LocalDateTime.now());
        if (diff.toMinutes() > 10) {
            return ResponseEntity.status(HttpStatus.GONE).body("OTP expired");
        }

        user.setEmailVerified(true);
        user.setEmailOtp(null);
        user.setOtpGeneratedAt(null);
        user.setUpdatedAt(LocalDateTime.now().toString());

        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully");
    }




}
