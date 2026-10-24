package com.bunique.app.controller;

import com.bunique.app.model.EmailVerification;
import com.bunique.app.model.PasswordReset;
import com.bunique.app.model.User;
import com.bunique.app.repository.EmailVerificationRepository;
import com.bunique.app.repository.PasswordResetRepository;
import com.bunique.app.repository.UserRepository;
import com.bunique.app.security.CurrentUser;
import com.bunique.app.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetRepository passwordResetRepository;
    @Autowired private EmailVerificationRepository emailVerificationRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private CurrentUser currentUser;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        String password = body.getOrDefault("password", "");
        var opt = userRepository.findByEmail(email);
        if (opt.isEmpty() || !passwordEncoder.matches(password, opt.get().getPassword())) {
            res.put("success", false);
            res.put("message", "Invalid email or password.");
            return res;
        }
        User user = opt.get();
        if (user.getStatus() == User.Status.banned) {
            res.put("success", false);
            res.put("message", "Your account has been banned. Please contact support.");
            return res;
        }
        res.put("success", true);
        res.put("token", jwtService.generateToken(user.getId(), user.getEmail(), "user", user.getName()));
        res.put("user", publicUser(user));
        return res;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            res.put("success", false);
            res.put("message", "An account with this email already exists.");
            return res;
        }
        User user = User.builder()
                .name(body.getOrDefault("name", ""))
                .email(email)
                .password(passwordEncoder.encode(body.getOrDefault("password", "")))
                .phone(body.get("phone"))
                .status(User.Status.active)
                .country("India")
                .build();
        userRepository.save(user);
        String token = UUID.randomUUID().toString().replace("-", "");
        emailVerificationRepository.save(EmailVerification.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build());
        System.out.println("[B.unique] Email verification link: http://localhost:3000/verify-email?token=" + token);
        res.put("success", true);
        res.put("message", "Account created! We sent a verification link to your email.");
        res.put("token", jwtService.generateToken(user.getId(), user.getEmail(), "user", user.getName()));
        res.put("user", publicUser(user));
        return res;
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        Long id = currentUser.id();
        if (id == null) return Map.of("success", false);
        return userRepository.findById(id)
                .<Map<String, Object>>map(u -> Map.of("success", true, "user", publicUser(u)))
                .orElse(Map.of("success", false));
    }

    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, String> body) {
        Long id = currentUser.id();
        if (id == null) return Map.of("success", false, "message", "Unauthorized");
        User user = userRepository.findById(id).orElseThrow();
        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("address")) user.setAddress(body.get("address"));
        if (body.containsKey("city")) user.setCity(body.get("city"));
        if (body.containsKey("state")) user.setState(body.get("state"));
        if (body.containsKey("zip")) user.setZip(body.get("zip"));
        if (body.containsKey("country")) user.setCountry(body.get("country"));
        userRepository.save(user);
        return Map.of("success", true, "message", "Profile updated successfully.", "user", publicUser(user));
    }

    @PostMapping("/change-password")
    public Map<String, Object> changePassword(@RequestBody Map<String, String> body) {
        Long id = currentUser.id();
        if (id == null) return Map.of("success", false, "message", "Unauthorized");
        User user = userRepository.findById(id).orElseThrow();
        if (!passwordEncoder.matches(body.getOrDefault("currentPassword", ""), user.getPassword())) {
            return Map.of("success", false, "message", "Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(body.getOrDefault("newPassword", "")));
        userRepository.save(user);
        return Map.of("success", true, "message", "Password changed successfully.");
    }

    @PostMapping("/forgot-password")
    @Transactional
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        var opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            passwordResetRepository.deleteByEmail(email);
            String token = UUID.randomUUID().toString().replace("-", "");
            passwordResetRepository.save(PasswordReset.builder()
                    .email(email)
                    .token(token)
                    .expiresAt(LocalDateTime.now().plusMinutes(60))
                    .build());
            System.out.println("[B.unique] Password reset link: http://localhost:3000/reset-password?token="
                    + token + "&email=" + email);
        }
        return Map.of("success", true, "message", "If an account exists for that email, a password reset link has been sent.");
    }

    @GetMapping("/reset-password/validate")
    public Map<String, Object> validateReset(@RequestParam String token, @RequestParam String email) {
        var opt = passwordResetRepository.findByTokenAndEmail(token, email.toLowerCase().trim());
        boolean valid = opt.isPresent() && opt.get().getExpiresAt().isAfter(LocalDateTime.now());
        return Map.of("success", valid, "message", valid ? "Token is valid." : "This reset link is invalid or has expired.");
    }

    @PostMapping("/reset-password")
    @Transactional
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.getOrDefault("token", "");
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        String password = body.getOrDefault("password", "");
        if (password.length() < 6) {
            return Map.of("success", false, "message", "Password must be at least 6 characters.");
        }
        var opt = passwordResetRepository.findByTokenAndEmail(token, email);
        if (opt.isEmpty() || opt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            return Map.of("success", false, "message", "This reset link is invalid or has expired.");
        }
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "This reset link is invalid or has expired.");
        }
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        passwordResetRepository.deleteByEmail(email);
        return Map.of("success", true, "message", "Password reset successfully. Please login with your new password.");
    }

    @GetMapping("/verify-email")
    @Transactional
    public Map<String, Object> verifyEmail(@RequestParam(required = false) String token) {
        if (token == null || token.isBlank()) {
            return Map.of("success", false, "message", "Please check your inbox and click the verification link.");
        }
        var opt = emailVerificationRepository.findByToken(token);
        if (opt.isEmpty() || opt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            return Map.of("success", false, "message", "This verification link is invalid or has expired.");
        }
        EmailVerification ev = opt.get();
        User user = userRepository.findById(ev.getUserId()).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "This verification link is invalid or has expired.");
        }
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);
        emailVerificationRepository.deleteByUserId(user.getId());
        return Map.of("success", true, "message", "Email verified successfully.");
    }

    private Map<String, Object> publicUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("phone", u.getPhone());
        m.put("address", u.getAddress());
        m.put("city", u.getCity());
        m.put("state", u.getState());
        m.put("zip", u.getZip());
        m.put("country", u.getCountry());
        m.put("avatar", u.getAvatar());
        m.put("emailVerifiedAt", u.getEmailVerifiedAt());
        m.put("status", u.getStatus());
        return m;
    }
}
