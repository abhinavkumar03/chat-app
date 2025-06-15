package com.abhinav.chatapp.chatapp_backend.services;

import com.abhinav.chatapp.chatapp_backend.entities.User;
import com.abhinav.chatapp.chatapp_backend.enums.Role;
import com.abhinav.chatapp.chatapp_backend.playload.*;
import com.abhinav.chatapp.chatapp_backend.repositories.UserRepository;
import com.abhinav.chatapp.chatapp_backend.security.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    @Autowired
    private JavaMailSender mailSender;

    public ResponseEntity<?> signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .isActive(true)
                .password(new BCryptPasswordEncoder().encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.MEMBER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    public ResponseEntity<?> updateProfile(UpdateProfileRequest request) {
        Optional<User> optionalUser = userRepository.findById(request.getUserId());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        user.setName(request.getName());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(new BCryptPasswordEncoder().encode(request.getPassword()));
        }
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        return ResponseEntity.ok("User updated successfully");
    }

    public ResponseEntity<?> updateUserStatus(UserStatusUpdateRequest request) {
        Optional<User> optionalUser = userRepository.findById(request.getUserId());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        user.setActive(request.getIsActive());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        String statusMsg = request.getIsActive() ? "activated" : "deactivated";
        return ResponseEntity.ok("User " + statusMsg + " successfully");
    }

    public ResponseEntity<?> login(LoginRequest request) {
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

        String token = jwtUtil.generateToken(user);
        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEmailVerified(),
                token
        );

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        user.setPassword(new BCryptPasswordEncoder().encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    public ResponseEntity<?> sendOtp(EmailRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        user.setEmailOtp(otp);
        user.setOtpGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            String subject = "Your OTP Code";
            String body = "<p>Hello <b>" + user.getName() + "</b>,</p>" +
                    "<p>Your OTP is: <b>" + otp + "</b></p>" +
                    "<p>This OTP is valid for 10 minutes.</p>" +
                    "<br><p>Regards,<br>ChatApp Team</p>";

            this.sendEmail(user.getEmail(), subject, body);
            return ResponseEntity.ok("OTP sent successfully to email");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send OTP email: " + e.getMessage());
        }
    }

    public ResponseEntity<?> verifyOtp(VerifyOtpRequest request) {
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
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        return ResponseEntity.ok("Email verified successfully");
    }

    public void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
