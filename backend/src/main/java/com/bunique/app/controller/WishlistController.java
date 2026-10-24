package com.bunique.app.controller;

import com.bunique.app.model.Wishlist;
import com.bunique.app.repository.ProductRepository;
import com.bunique.app.repository.UserRepository;
import com.bunique.app.repository.WishlistRepository;
import com.bunique.app.security.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CurrentUser currentUser;

    @GetMapping
    public Map<String, Object> getWishlist() {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("items", List.of());
        List<Map<String, Object>> items = new ArrayList<>();
        for (Wishlist w : wishlistRepository.findByUserId(uid)) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", w.getProduct().getId());
            m.put("name", w.getProduct().getName());
            m.put("slug", w.getProduct().getSlug());
            m.put("price", w.getProduct().getPrice());
            m.put("oldPrice", w.getProduct().getOldPrice());
            m.put("image", w.getProduct().getImage());
            m.put("stock", w.getProduct().getStock());
            items.add(m);
        }
        return Map.of("items", items);
    }

    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody Map<String, Object> body) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        Long productId = Long.valueOf(String.valueOf(body.get("productId")));
        if (wishlistRepository.findByUserIdAndProductId(uid, productId).isEmpty()) {
            wishlistRepository.save(Wishlist.builder()
                    .user(userRepository.getReferenceById(uid))
                    .product(productRepository.getReferenceById(productId))
                    .build());
        }
        return Map.of("success", true, "message", "Added to wishlist.", "count", wishlistRepository.findByUserId(uid).size());
    }

    @PostMapping("/remove")
    public Map<String, Object> remove(@RequestBody Map<String, Object> body) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        Long productId = Long.valueOf(String.valueOf(body.get("productId")));
        wishlistRepository.findByUserIdAndProductId(uid, productId).ifPresent(wishlistRepository::delete);
        return Map.of("success", true, "message", "Removed from wishlist.", "count", wishlistRepository.findByUserId(uid).size());
    }
}
