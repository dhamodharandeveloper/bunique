package com.bunique.app.controller;

import com.bunique.app.model.Admin;
import com.bunique.app.repository.AdminRepository;
import com.bunique.app.security.CurrentUser;
import com.bunique.app.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminAuthController {

    @Autowired private AdminRepository adminRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private CurrentUser currentUser;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        var opt = adminRepository.findByEmail(email);
        if (opt.isEmpty() || !passwordEncoder.matches(body.getOrDefault("password", ""), opt.get().getPassword())) {
            res.put("success", false);
            res.put("message", "Invalid email or password.");
            return res;
        }
        Admin admin = opt.get();
        if (admin.getStatus() == null || admin.getStatus() != 1) {
            res.put("success", false);
            res.put("message", "This admin account is inactive.");
            return res;
        }
        res.put("success", true);
        res.put("token", jwtService.generateToken(admin.getId(), admin.getEmail(), admin.getRole().name(), admin.getName()));
        admin.setPassword(null);
        res.put("admin", admin);
        return res;
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        if (!currentUser.isAdmin() || currentUser.id() == null) {
            return Map.of("success", false);
        }
        Admin admin = adminRepository.findById(currentUser.id()).orElse(null);
        if (admin == null) return Map.of("success", false);
        admin.setPassword(null);
        return Map.of("success", true, "admin", admin);
    }
}
