package com.bunique.app.controller;

import com.bunique.app.model.*;
import com.bunique.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HomeController {

    @Autowired private BannerRepository bannerRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private SettingRepository settingRepository;

    @GetMapping("/home")
    public Map<String, Object> getHome() {
        Map<String, Object> response = new HashMap<>();
        response.put("banners", bannerRepository.findByStatusAndPositionOrderBySortOrderAscIdAsc(1, "home_slider"));
        List<Map<String, Object>> categories = new ArrayList<>();
        for (Category c : categoryRepository.findByStatusOrderBySortOrderAscNameAsc(1)) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("name", c.getName());
            cm.put("slug", c.getSlug());
            cm.put("image", c.getImage());
            cm.put("description", c.getDescription());
            cm.put("productCount", productRepository.countByCategory_IdAndStatus(c.getId(), 1));
            categories.add(cm);
        }
        response.put("categories", categories);
        List<Product> newArrivals = new ArrayList<>(productRepository.findTop4ByStatusAndIsNewTrueOrderByCreatedAtDesc(1));
        if (newArrivals.isEmpty()) {
            newArrivals = new ArrayList<>(productRepository.findTop4ByStatusOrderByCreatedAtDesc(1));
        }
        List<Product> bestSellers = new ArrayList<>(productRepository.findTop4ByStatusAndIsBestSellerTrueOrderByViewsDesc(1));
        List<Product> featured = new ArrayList<>(productRepository.findTop4ByStatusAndFeaturedTrueOrderByViewsDesc(1));
        newArrivals.forEach(HomeController::initializeCategory);
        bestSellers.forEach(HomeController::initializeCategory);
        featured.forEach(HomeController::initializeCategory);
        response.put("newArrivals", newArrivals);
        response.put("bestSellers", bestSellers);
        response.put("featured", featured);
        return response;
    }

    /**
     * Loads the lazy category so it serializes with its name and slug instead
     * of just an id (product cards display the category name).
     */
    private static void initializeCategory(Product product) {
        if (product.getCategory() != null) {
            product.getCategory().getName();
        }
    }

    @GetMapping("/settings")
    public Map<String, String> getSettings() {
        Map<String, String> map = new HashMap<>();
        settingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return map;
    }

    @PostMapping("/newsletter/subscribe")
    public Map<String, Object> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return Map.of("success", false, "message", "Invalid email");
        }
        if (newsletterRepository.findByEmail(email).isEmpty()) {
            newsletterRepository.save(Newsletter.builder().email(email.toLowerCase()).token(UUID.randomUUID().toString().substring(0, 32)).status(1).build());
        }
        return Map.of("success", true, "message", "Subscribed successfully");
    }

    @Autowired private NewsletterRepository newsletterRepository;

    @PostMapping("/contact")
    public Map<String, Object> contact(@RequestBody ContactMessage msg) {
        msg.setStatus("new");
        contactMessageRepository.save(msg);
        return Map.of("success", true, "message", "Message sent successfully");
    }

    @Autowired private ContactMessageRepository contactMessageRepository;
}
