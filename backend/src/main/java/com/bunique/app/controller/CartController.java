package com.bunique.app.controller;

import com.bunique.app.model.Cart;
import com.bunique.app.model.Coupon;
import com.bunique.app.model.Product;
import com.bunique.app.repository.CartRepository;
import com.bunique.app.repository.CouponRepository;
import com.bunique.app.repository.ProductRepository;
import com.bunique.app.repository.SettingRepository;
import com.bunique.app.repository.UserRepository;
import com.bunique.app.security.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired private CartRepository cartRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private SettingRepository settingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CurrentUser currentUser;

    @GetMapping("/cart")
    public Map<String, Object> getCart() {
        Long uid = currentUser.id();
        Map<String, Object> res = new HashMap<>();
        if (uid == null) {
            res.put("items", List.of());
            res.put("subtotal", 0);
            res.put("total", 0);
            return res;
        }
        List<Cart> carts = cartRepository.findByUserId(uid);
        List<Map<String, Object>> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (Cart c : carts) {
            Product p = c.getProduct();
            BigDecimal line = p.getPrice().multiply(BigDecimal.valueOf(c.getQuantity()));
            subtotal = subtotal.add(line);
            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("cartId", c.getId());
            item.put("name", p.getName());
            item.put("slug", p.getSlug());
            item.put("price", p.getPrice());
            item.put("image", p.getImage());
            item.put("sku", p.getSku());
            item.put("stock", p.getStock());
            item.put("qty", c.getQuantity());
            item.put("subtotal", line);
            items.add(item);
        }
        res.put("items", items);
        res.put("subtotal", subtotal);
        res.put("total", subtotal);
        return res;
    }

    @PostMapping("/cart/add")
    public Map<String, Object> add(@RequestBody Map<String, Object> body) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        Long productId = Long.valueOf(String.valueOf(body.get("productId")));
        int qty = body.get("quantity") == null ? 1 : Integer.parseInt(String.valueOf(body.get("quantity")));
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null || product.getStatus() != 1) {
            return Map.of("success", false, "message", "Product not found.");
        }
        int maxQty = Math.max(1, product.getStock());
        Cart cart = cartRepository.findByUserIdAndProductId(uid, productId).orElse(null);
        if (cart == null) {
            cart = Cart.builder().user(userRepository.getReferenceById(uid))
                    .product(product).quantity(Math.min(qty, maxQty)).build();
        } else {
            cart.setQuantity(Math.min(cart.getQuantity() + qty, maxQty));
        }
        cartRepository.save(cart);
        return Map.of("success", true, "message", "Added to cart!", "cart_count", cartRepository.findByUserId(uid).size());
    }

    @PostMapping("/cart/update")
    public Map<String, Object> update(@RequestBody Map<String, Object> body) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        Long productId = Long.valueOf(String.valueOf(body.get("productId")));
        int qty = Math.max(1, Integer.parseInt(String.valueOf(body.get("quantity"))));
        Cart cart = cartRepository.findByUserIdAndProductId(uid, productId).orElse(null);
        if (cart != null) {
            int maxQty = Math.max(1, cart.getProduct().getStock());
            cart.setQuantity(Math.min(qty, maxQty));
            cartRepository.save(cart);
        }
        return Map.of("success", true, "message", "Cart updated.", "cart_count", cartRepository.findByUserId(uid).size());
    }

    @PostMapping("/cart/remove")
    public Map<String, Object> remove(@RequestBody Map<String, Object> body) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        Long productId = Long.valueOf(String.valueOf(body.get("productId")));
        cartRepository.findByUserIdAndProductId(uid, productId).ifPresent(cartRepository::delete);
        return Map.of("success", true, "message", "Removed from cart.", "cart_count", cartRepository.findByUserId(uid).size());
    }

    @PostMapping("/coupon/apply")
    public Map<String, Object> applyCoupon(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").toUpperCase().trim();
        var opt = couponRepository.findByCodeAndStatus(code, 1);
        if (opt.isEmpty()) return Map.of("success", false, "message", "Invalid coupon code.");
        Coupon coupon = opt.get();
        if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(LocalDate.now())) {
            return Map.of("success", false, "message", "This coupon has expired.");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return Map.of("success", false, "message", "This coupon has reached its usage limit.");
        }
        Long uid = currentUser.id();
        BigDecimal subtotal = BigDecimal.ZERO;
        if (uid != null) {
            for (Cart c : cartRepository.findByUserId(uid)) {
                subtotal = subtotal.add(c.getProduct().getPrice().multiply(BigDecimal.valueOf(c.getQuantity())));
            }
        }
        if (coupon.getMinOrder() != null && subtotal.compareTo(coupon.getMinOrder()) < 0) {
            return Map.of("success", false, "message", "Minimum order amount of ₹ " + coupon.getMinOrder() + " required for this coupon.");
        }
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Coupon applied successfully.");
        res.put("coupon", Map.of(
                "id", coupon.getId(),
                "code", coupon.getCode(),
                "discountType", coupon.getDiscountType(),
                "discountValue", coupon.getDiscountValue(),
                "maxDiscount", coupon.getMaxDiscount() == null ? "" : coupon.getMaxDiscount()
        ));
        return res;
    }
}
