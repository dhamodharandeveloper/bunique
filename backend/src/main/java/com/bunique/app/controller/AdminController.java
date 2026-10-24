package com.bunique.app.controller;

import com.bunique.app.model.*;
import com.bunique.app.repository.*;
import com.bunique.app.security.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BannerRepository bannerRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private NewsletterRepository newsletterRepository;
    @Autowired private ContactMessageRepository contactMessageRepository;
    @Autowired private SettingRepository settingRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ProductImageRepository productImageRepository;
    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private CurrentUser currentUser;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private void requireAdmin() {
        if (!currentUser.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
    }

    /* ---------------- DASHBOARD ---------------- */
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        requireAdmin();
        Map<String, Object> res = new HashMap<>();
        List<Order> orders = orderRepository.findAll();
        BigDecimal sales = orders.stream()
                .filter(o -> o.getOrderStatus() != Order.OrderStatus.cancelled)
                .map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        res.put("totalSales", sales);
        res.put("totalOrders", orders.size());
        res.put("totalCustomers", userRepository.count());
        res.put("totalProducts", productRepository.count());
        res.put("totalSubscribers", newsletterRepository.findAll().stream().filter(n -> n.getStatus() != null && n.getStatus() == 1).count());
        long pendingOrders = orders.stream().filter(o -> o.getOrderStatus() == Order.OrderStatus.pending).count();
        long confirmedOrders = orders.stream().filter(o -> o.getOrderStatus() == Order.OrderStatus.confirmed).count();
        res.put("pendingOrders", pendingOrders);
        res.put("pendingShipments", confirmedOrders);
        res.put("todayOrders", orders.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(LocalDate.now())).count());
        long pendingReviews = reviewRepository.findAll().stream().filter(r -> r.getStatus() == Review.Status.pending).count();
        res.put("pendingReviews", pendingReviews);
        res.put("lowStockCount", productRepository.findAll().stream().filter(p -> p.getStock() != null && p.getStock() <= 5).count());
        Map<String, Long> breakdown = new LinkedHashMap<>();
        for (String st : List.of("pending", "confirmed", "shipped", "delivered", "cancelled", "returned")) {
            breakdown.put(st, orders.stream().filter(o -> o.getOrderStatus() != null && o.getOrderStatus().name().equals(st)).count());
        }
        res.put("statusBreakdown", breakdown);
        List<Order> recent = orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8).toList();
        res.put("recentOrders", recent.stream().map(this::orderMap).toList());
        res.put("lowStock", productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 5)
                .sorted(Comparator.comparing(Product::getStock))
                .limit(8).toList());
        return res;
    }

    /* ---------------- PRODUCTS ---------------- */
    @GetMapping("/products")
    public List<Product> products() {
        requireAdmin();
        return productRepository.findAll();
    }

    @PostMapping("/products")
    public Map<String, Object> createProduct(@RequestBody Map<String, Object> body) {
        requireAdmin();
        Product p = new Product();
        applyProduct(p, body);
        productRepository.save(p);
        return Map.of("success", true, "message", "Product created successfully.", "product", p);
    }

    @PutMapping("/products/{id}")
    public Map<String, Object> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin();
        Product p = productRepository.findById(id).orElseThrow();
        applyProduct(p, body);
        productRepository.save(p);
        return Map.of("success", true, "message", "Product updated successfully.", "product", p);
    }

    @DeleteMapping("/products/{id}")
    public Map<String, Object> deleteProduct(@PathVariable Long id) {
        requireAdmin();
        productRepository.deleteById(id);
        return Map.of("success", true, "message", "Product deleted.");
    }

    @PostMapping("/products/{id}/stock")
    public Map<String, Object> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin();
        Product p = productRepository.findById(id).orElseThrow();
        p.setStock(Integer.parseInt(String.valueOf(body.get("stock"))));
        productRepository.save(p);
        return Map.of("success", true, "message", "Stock updated.");
    }

    @GetMapping("/products/{id}/images")
    public List<ProductImage> productImages(@PathVariable Long id) {
        requireAdmin();
        return productImageRepository.findByProductId(id);
    }

    @PostMapping("/products/{id}/images")
    public Map<String, Object> addProductImage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        requireAdmin();
        Product p = productRepository.findById(id).orElseThrow();
        ProductImage img = ProductImage.builder().product(p).image(body.get("image")).build();
        productImageRepository.save(img);
        return Map.of("success", true, "message", "Image added.", "image", img);
    }

    @DeleteMapping("/products/images/{imageId}")
    public Map<String, Object> deleteProductImage(@PathVariable Long imageId) {
        requireAdmin();
        productImageRepository.deleteById(imageId);
        return Map.of("success", true, "message", "Image removed.");
    }

    private void applyProduct(Product p, Map<String, Object> b) {
        if (b.get("name") != null) p.setName(String.valueOf(b.get("name")));
        if (b.get("name") != null) {
            if (b.get("slug") == null || String.valueOf(b.get("slug")).isEmpty()) {
                p.setSlug(String.valueOf(b.get("name")).toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", ""));
            } else {
                p.setSlug(String.valueOf(b.get("slug")));
            }
        } else if (b.get("slug") != null && !String.valueOf(b.get("slug")).isEmpty()) {
            p.setSlug(String.valueOf(b.get("slug")));
        }
        if (b.get("categoryId") != null && !String.valueOf(b.get("categoryId")).isEmpty()) {
            p.setCategory(categoryRepository.getReferenceById(Long.valueOf(String.valueOf(b.get("categoryId")))));
        }
        if (b.get("shortDescription") != null) p.setShortDescription(String.valueOf(b.get("shortDescription")));
        if (b.get("description") != null) p.setDescription(String.valueOf(b.get("description")));
        if (b.get("price") != null) p.setPrice(new BigDecimal(String.valueOf(b.get("price"))));
        if (b.get("oldPrice") != null && !String.valueOf(b.get("oldPrice")).isEmpty()) p.setOldPrice(new BigDecimal(String.valueOf(b.get("oldPrice"))));
        if (b.get("sku") != null) p.setSku(String.valueOf(b.get("sku")));
        if (b.get("stock") != null) p.setStock(Integer.parseInt(String.valueOf(b.get("stock"))));
        if (b.get("material") != null) p.setMaterial(String.valueOf(b.get("material")));
        if (b.get("weight") != null) p.setWeight(String.valueOf(b.get("weight")));
        if (b.get("featured") != null) p.setFeatured(Boolean.parseBoolean(String.valueOf(b.get("featured"))));
        if (b.get("isNew") != null) p.setIsNew(Boolean.parseBoolean(String.valueOf(b.get("isNew"))));
        if (b.get("isBestSeller") != null) p.setIsBestSeller(Boolean.parseBoolean(String.valueOf(b.get("isBestSeller"))));
        if (b.get("status") != null) p.setStatus(Integer.parseInt(String.valueOf(b.get("status"))));
        if (b.get("image") != null) p.setImage(String.valueOf(b.get("image")));
    }

    /* ---------------- CATEGORIES ---------------- */
    @GetMapping("/categories")
    public List<Category> categories() {
        requireAdmin();
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    public Map<String, Object> createCategory(@RequestBody Map<String, Object> body) {
        requireAdmin();
        Category c = new Category();
        applyCategory(c, body);
        categoryRepository.save(c);
        return Map.of("success", true, "message", "Category created successfully.", "category", c);
    }

    @PutMapping("/categories/{id}")
    public Map<String, Object> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin();
        Category c = categoryRepository.findById(id).orElseThrow();
        applyCategory(c, body);
        categoryRepository.save(c);
        return Map.of("success", true, "message", "Category updated successfully.", "category", c);
    }

    @DeleteMapping("/categories/{id}")
    public Map<String, Object> deleteCategory(@PathVariable Long id) {
        requireAdmin();
        categoryRepository.deleteById(id);
        return Map.of("success", true, "message", "Category deleted.");
    }

    private void applyCategory(Category c, Map<String, Object> b) {
        if (b.get("name") != null) c.setName(String.valueOf(b.get("name")));
        if (b.get("name") != null) {
            if (b.get("slug") == null || String.valueOf(b.get("slug")).isEmpty()) {
                c.setSlug(String.valueOf(b.get("name")).toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", ""));
            } else {
                c.setSlug(String.valueOf(b.get("slug")));
            }
        } else if (b.get("slug") != null && !String.valueOf(b.get("slug")).isEmpty()) {
            c.setSlug(String.valueOf(b.get("slug")));
        }
        if (b.get("description") != null) c.setDescription(String.valueOf(b.get("description")));
        if (b.get("image") != null) c.setImage(String.valueOf(b.get("image")));
        if (b.get("sortOrder") != null && !String.valueOf(b.get("sortOrder")).isEmpty()) c.setSortOrder(Integer.parseInt(String.valueOf(b.get("sortOrder"))));
        if (b.get("status") != null) c.setStatus(Integer.parseInt(String.valueOf(b.get("status"))));
    }

    /* ---------------- ORDERS ---------------- */
    @GetMapping("/orders")
    public List<Map<String, Object>> orders() {
        requireAdmin();
        return orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::orderMap).toList();
    }

    @GetMapping("/orders/{id}")
    public Map<String, Object> orderDetails(@PathVariable Long id) {
        requireAdmin();
        Order o = orderRepository.findById(id).orElseThrow();
        Map<String, Object> res = new HashMap<>();
        res.put("order", orderMap(o));
        res.put("items", orderItemRepository.findByOrderId(id).stream().map(this::itemMap).toList());
        res.put("payments", paymentRepository.findByOrderId(id).stream()
                .map(pm -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", pm.getId());
                    m.put("method", pm.getPaymentMethod());
                    m.put("transactionId", pm.getTransactionId());
                    m.put("amount", pm.getAmount());
                    m.put("status", pm.getStatus());
                    return m;
                }).toList());
        return res;
    }

    @PutMapping("/orders/{id}/status")
    @Transactional
    public Map<String, Object> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        requireAdmin();
        Order o = orderRepository.findById(id).orElseThrow();
        Order.OrderStatus oldStatus = o.getOrderStatus();
        Order.OrderStatus newStatus = body.get("orderStatus") != null ? Order.OrderStatus.valueOf(body.get("orderStatus")) : oldStatus;
        boolean wasStocked = oldStatus == Order.OrderStatus.cancelled || oldStatus == Order.OrderStatus.returned;
        boolean willStock = newStatus == Order.OrderStatus.cancelled || newStatus == Order.OrderStatus.returned;
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        if (willStock && !wasStocked) {
            for (OrderItem it : items) {
                if (it.getProduct() != null) {
                    Product p = it.getProduct();
                    p.setStock((p.getStock() != null ? p.getStock() : 0) + it.getQuantity());
                    productRepository.save(p);
                }
            }
        } else if (!willStock && wasStocked) {
            for (OrderItem it : items) {
                if (it.getProduct() != null) {
                    Product p = it.getProduct();
                    p.setStock(Math.max((p.getStock() != null ? p.getStock() : 0) - it.getQuantity(), 0));
                    productRepository.save(p);
                }
            }
        }
        if (newStatus == Order.OrderStatus.cancelled && o.getPaymentStatus() == Order.PaymentStatus.paid) {
            o.setPaymentStatus(Order.PaymentStatus.refunded);
        }
        o.setOrderStatus(newStatus);
        if (body.get("paymentStatus") != null) o.setPaymentStatus(Order.PaymentStatus.valueOf(body.get("paymentStatus")));
        orderRepository.save(o);
        return Map.of("success", true, "message", "Order status updated.");
    }

    /* ---------------- CUSTOMERS ---------------- */
    @GetMapping("/customers")
    public Map<String, Object> customers() {
        requireAdmin();
        List<Map<String, Object>> list = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(u.getId());
            BigDecimal spent = orders.stream()
                    .filter(o -> o.getOrderStatus() != Order.OrderStatus.cancelled && o.getOrderStatus() != Order.OrderStatus.returned)
                    .map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("city", u.getCity());
            m.put("state", u.getState());
            m.put("avatar", u.getAvatar());
            m.put("status", u.getStatus());
            m.put("emailVerifiedAt", u.getEmailVerifiedAt());
            m.put("createdAt", u.getCreatedAt());
            m.put("ordersCount", orders.size());
            m.put("spent", spent);
            m.put("lastOrder", orders.isEmpty() ? null : orders.get(0).getCreatedAt());
            list.add(m);
        }
        list.sort((a, b) -> String.valueOf(b.get("createdAt")).compareTo(String.valueOf(a.get("createdAt"))));
        return Map.of("customers", list);
    }

    @GetMapping("/customers/{id}")
    public Map<String, Object> customerDetails(@PathVariable Long id) {
        requireAdmin();
        User u = userRepository.findById(id).orElseThrow();
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(id);
        BigDecimal spent = orders.stream()
                .filter(o -> o.getOrderStatus() != Order.OrderStatus.cancelled && o.getOrderStatus() != Order.OrderStatus.returned)
                .map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> res = new HashMap<>();
        res.put("customer", u);
        res.put("ordersCount", orders.size());
        res.put("totalSpent", spent);
        res.put("orders", orders.stream().map(this::orderMap).toList());
        res.put("wishlistCount", wishlistRepository.findByUserId(id).size());
        List<Map<String, Object>> reviews = new ArrayList<>();
        for (Review r : reviewRepository.findAll()) {
            if (r.getUser() == null || !r.getUser().getId().equals(id)) continue;
            Map<String, Object> rm = new HashMap<>();
            rm.put("id", r.getId());
            rm.put("rating", r.getRating());
            rm.put("title", r.getTitle());
            rm.put("comment", r.getComment());
            rm.put("status", r.getStatus());
            rm.put("createdAt", r.getCreatedAt());
            rm.put("productName", r.getProduct() != null ? r.getProduct().getName() : "");
            rm.put("productId", r.getProduct() != null ? r.getProduct().getId() : null);
            reviews.add(rm);
        }
        reviews.sort((a, b) -> String.valueOf(b.get("createdAt")).compareTo(String.valueOf(a.get("createdAt"))));
        res.put("reviews", reviews.stream().limit(10).toList());
        return res;
    }

    @PutMapping("/customers/{id}/status")
    public Map<String, Object> customerStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        requireAdmin();
        User u = userRepository.findById(id).orElseThrow();
        u.setStatus(User.Status.valueOf(body.getOrDefault("status", "active")));
        userRepository.save(u);
        return Map.of("success", true, "message", "Customer status updated.");
    }

    @DeleteMapping("/customers/{id}")
    public Map<String, Object> deleteCustomer(@PathVariable Long id) {
        requireAdmin();
        userRepository.deleteById(id);
        return Map.of("success", true, "message", "Customer deleted.");
    }

    /* ---------------- BANNERS ---------------- */
    @GetMapping("/banners")
    public List<Banner> banners() {
        requireAdmin();
        return bannerRepository.findAll();
    }

    @PostMapping("/banners")
    public Map<String, Object> createBanner(@RequestBody Map<String, Object> body) {
        requireAdmin();
        Banner b = new Banner();
        applyBanner(b, body);
        bannerRepository.save(b);
        return Map.of("success", true, "message", "Banner created successfully.", "banner", b);
    }

    @PutMapping("/banners/{id}")
    public Map<String, Object> updateBanner(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin();
        Banner b = bannerRepository.findById(id).orElseThrow();
        applyBanner(b, body);
        bannerRepository.save(b);
        return Map.of("success", true, "message", "Banner updated successfully.", "banner", b);
    }

    @DeleteMapping("/banners/{id}")
    public Map<String, Object> deleteBanner(@PathVariable Long id) {
        requireAdmin();
        bannerRepository.deleteById(id);
        return Map.of("success", true, "message", "Banner deleted.");
    }

    private void applyBanner(Banner b, Map<String, Object> body) {
        if (body.get("title") != null) b.setTitle(String.valueOf(body.get("title")));
        if (body.get("subtitle") != null) b.setSubtitle(String.valueOf(body.get("subtitle")));
        if (body.get("image") != null) b.setImage(String.valueOf(body.get("image")));
        if (body.get("link") != null) b.setLink(String.valueOf(body.get("link")));
        if (body.get("position") != null) b.setPosition(String.valueOf(body.get("position")));
        if (body.get("sortOrder") != null && !String.valueOf(body.get("sortOrder")).isEmpty()) b.setSortOrder(Integer.parseInt(String.valueOf(body.get("sortOrder"))));
        if (body.get("status") != null) b.setStatus(Integer.parseInt(String.valueOf(body.get("status"))));
    }

    /* ---------------- COUPONS ---------------- */
    @GetMapping("/coupons")
    public List<Coupon> coupons() {
        requireAdmin();
        return couponRepository.findAll();
    }

    @PostMapping("/coupons")
    public Map<String, Object> createCoupon(@RequestBody Map<String, Object> body) {
        requireAdmin();
        Coupon c = new Coupon();
        applyCoupon(c, body);
        couponRepository.save(c);
        return Map.of("success", true, "message", "Coupon created successfully.", "coupon", c);
    }

    @PutMapping("/coupons/{id}")
    public Map<String, Object> updateCoupon(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin();
        Coupon c = couponRepository.findById(id).orElseThrow();
        applyCoupon(c, body);
        couponRepository.save(c);
        return Map.of("success", true, "message", "Coupon updated successfully.", "coupon", c);
    }

    @DeleteMapping("/coupons/{id}")
    public Map<String, Object> deleteCoupon(@PathVariable Long id) {
        requireAdmin();
        couponRepository.deleteById(id);
        return Map.of("success", true, "message", "Coupon deleted.");
    }

    private void applyCoupon(Coupon c, Map<String, Object> b) {
        if (b.get("code") != null) c.setCode(String.valueOf(b.get("code")).toUpperCase());
        if (b.get("discountType") != null) c.setDiscountType(Coupon.DiscountType.valueOf(String.valueOf(b.get("discountType"))));
        if (b.get("discountValue") != null) c.setDiscountValue(new BigDecimal(String.valueOf(b.get("discountValue"))));
        if (b.get("minOrder") != null && !String.valueOf(b.get("minOrder")).isEmpty()) c.setMinOrder(new BigDecimal(String.valueOf(b.get("minOrder"))));
        if (b.get("maxDiscount") != null && !String.valueOf(b.get("maxDiscount")).isEmpty()) c.setMaxDiscount(new BigDecimal(String.valueOf(b.get("maxDiscount"))));
        if (b.get("usageLimit") != null && !String.valueOf(b.get("usageLimit")).isEmpty()) c.setUsageLimit(Integer.parseInt(String.valueOf(b.get("usageLimit"))));
        if (b.get("perUserLimit") != null && !String.valueOf(b.get("perUserLimit")).isEmpty()) c.setPerUserLimit(Integer.parseInt(String.valueOf(b.get("perUserLimit"))));
        if (b.get("startDate") != null && !String.valueOf(b.get("startDate")).isEmpty()) c.setStartDate(LocalDate.parse(String.valueOf(b.get("startDate"))));
        if (b.get("endDate") != null && !String.valueOf(b.get("endDate")).isEmpty()) c.setEndDate(LocalDate.parse(String.valueOf(b.get("endDate"))));
        if (b.get("status") != null) c.setStatus(Integer.parseInt(String.valueOf(b.get("status"))));
    }

    /* ---------------- REVIEWS ---------------- */
    @GetMapping("/reviews")
    public List<Map<String, Object>> reviews() {
        requireAdmin();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Review r : reviewRepository.findAll()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("rating", r.getRating());
            m.put("title", r.getTitle());
            m.put("comment", r.getComment());
            m.put("status", r.getStatus());
            m.put("createdAt", r.getCreatedAt());
            m.put("productId", r.getProduct() != null ? r.getProduct().getId() : null);
            m.put("productName", r.getProduct() != null ? r.getProduct().getName() : "");
            m.put("userId", r.getUser() != null ? r.getUser().getId() : null);
            m.put("userName", r.getUser() != null ? r.getUser().getName() : "");
            m.put("userEmail", r.getUser() != null ? r.getUser().getEmail() : "");
            list.add(m);
        }
        list.sort((a, b) -> String.valueOf(b.get("createdAt")).compareTo(String.valueOf(a.get("createdAt"))));
        return list;
    }

    @PutMapping("/reviews/{id}/approve")
    public Map<String, Object> approveReview(@PathVariable Long id) {
        requireAdmin();
        Review r = reviewRepository.findById(id).orElseThrow();
        r.setStatus(Review.Status.approved);
        reviewRepository.save(r);
        return Map.of("success", true, "message", "Review approved.");
    }

    @PutMapping("/reviews/{id}/toggle")
    public Map<String, Object> toggleReview(@PathVariable Long id) {
        requireAdmin();
        Review r = reviewRepository.findById(id).orElseThrow();
        r.setStatus(r.getStatus() == Review.Status.approved ? Review.Status.pending : Review.Status.approved);
        reviewRepository.save(r);
        return Map.of("success", true, "message", "Review status updated.", "status", r.getStatus());
    }

    @DeleteMapping("/reviews/{id}")
    public Map<String, Object> deleteReview(@PathVariable Long id) {
        requireAdmin();
        reviewRepository.deleteById(id);
        return Map.of("success", true, "message", "Review deleted.");
    }

    /* ---------------- NEWSLETTER / MESSAGES ---------------- */
    @GetMapping("/newsletter")
    public List<Newsletter> newsletter() {
        requireAdmin();
        return newsletterRepository.findAll();
    }

    @PutMapping("/newsletter/{id}/toggle")
    public Map<String, Object> toggleNewsletter(@PathVariable Long id) {
        requireAdmin();
        Newsletter n = newsletterRepository.findById(id).orElseThrow();
        n.setStatus(n.getStatus() != null && n.getStatus() == 1 ? 0 : 1);
        newsletterRepository.save(n);
        return Map.of("success", true, "message", "Subscriber status updated.", "status", n.getStatus());
    }

    @DeleteMapping("/newsletter/{id}")
    public Map<String, Object> deleteNewsletter(@PathVariable Long id) {
        requireAdmin();
        newsletterRepository.deleteById(id);
        return Map.of("success", true, "message", "Subscriber deleted.");
    }

    @GetMapping("/newsletter/export")
    public String exportNewsletter() {
        requireAdmin();
        StringBuilder sb = new StringBuilder("Email,Status,Subscribed On\n");
        for (Newsletter n : newsletterRepository.findAll()) {
            sb.append(n.getEmail()).append(',')
              .append(n.getStatus() != null && n.getStatus() == 1 ? "Active" : "Inactive").append(',')
              .append(n.getCreatedAt() != null ? n.getCreatedAt() : "").append('\n');
        }
        return sb.toString();
    }

    @GetMapping("/contact-messages")
    public List<ContactMessage> contactMessages() {
        requireAdmin();
        return contactMessageRepository.findAll();
    }

    @PutMapping("/contact-messages/{id}/status")
    public Map<String, Object> contactMessageStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        requireAdmin();
        ContactMessage m = contactMessageRepository.findById(id).orElseThrow();
        String status = body.getOrDefault("status", "read");
        m.setStatus(status);
        contactMessageRepository.save(m);
        return Map.of("success", true, "message", "Message status updated.");
    }

    @DeleteMapping("/contact-messages/{id}")
    public Map<String, Object> deleteContactMessage(@PathVariable Long id) {
        requireAdmin();
        contactMessageRepository.deleteById(id);
        return Map.of("success", true, "message", "Message deleted.");
    }

    /* ---------------- UPLOADS ---------------- */
    @PostMapping("/upload")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file,
                                      @RequestParam(value = "type", defaultValue = "products") String type) {
        requireAdmin();
        try {
            if (file == null || file.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file selected.");
            }
            String contentType = file.getContentType() == null ? "" : file.getContentType();
            if (!contentType.startsWith("image/")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed.");
            }
            String safeType = type.replaceAll("[^a-z]", "");
            if (safeType.isEmpty()) safeType = "products";
            Path dir = Paths.get(uploadDir, safeType).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
            String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".jpg";
            String filename = UUID.randomUUID().toString().replace("-", "") + ext.toLowerCase();
            file.transferTo(dir.resolve(filename).toFile());
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("filename", filename);
            res.put("image", filename);
            res.put("url", "/uploads/" + safeType + "/" + filename);
            return res;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed: " + e.getMessage());
        }
    }

    /* ---------------- SETTINGS ---------------- */
    @GetMapping("/settings")
    public Map<String, String> settings() {
        requireAdmin();
        Map<String, String> map = new LinkedHashMap<>();
        settingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return map;
    }

    @PutMapping("/settings")
    @Transactional
    public Map<String, Object> saveSettings(@RequestBody Map<String, String> body) {
        requireAdmin();
        body.forEach((k, v) -> {
            Setting s = settingRepository.findBySettingKey(k).orElseGet(() -> Setting.builder().settingKey(k).build());
            s.setSettingValue(v);
            settingRepository.save(s);
        });
        return Map.of("success", true, "message", "Settings saved successfully.");
    }

    /* ---------------- ADMIN PROFILE ---------------- */
    @GetMapping("/profile")
    public Admin profile() {
        requireAdmin();
        Admin a = adminRepository.findById(currentUser.id()).orElseThrow();
        a.setPassword(null);
        return a;
    }

    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, String> body) {
        requireAdmin();
        Admin a = adminRepository.findById(currentUser.id()).orElseThrow();
        if (body.get("name") != null && !body.get("name").isBlank()) a.setName(body.get("name"));
        if (body.get("email") != null && !body.get("email").isBlank()) {
            adminRepository.findByEmail(body.get("email")).ifPresent(existing -> {
                if (!existing.getId().equals(a.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use.");
                }
            });
            a.setEmail(body.get("email"));
        }
        if (body.get("avatar") != null) a.setAvatar(body.get("avatar"));
        String newPass = body.get("newPassword");
        String confirm = body.get("confirmPassword");
        if (newPass != null && !newPass.isEmpty()) {
            if (newPass.length() < 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
            }
            if (confirm != null && !newPass.equals(confirm)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
            }
            String current = body.get("currentPassword");
            if (current == null || !passwordEncoder.matches(current, a.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
            }
            a.setPassword(passwordEncoder.encode(newPass));
        }
        adminRepository.save(a);
        return Map.of("success", true, "message", "Profile updated successfully.");
    }

    private Map<String, Object> itemMap(OrderItem it) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", it.getId());
        m.put("productId", it.getProduct() != null ? it.getProduct().getId() : null);
        m.put("productSlug", it.getProduct() != null ? it.getProduct().getSlug() : null);
        m.put("productName", it.getProductName());
        m.put("productImage", it.getProductImage());
        m.put("price", it.getPrice());
        m.put("quantity", it.getQuantity());
        m.put("total", it.getTotal());
        return m;
    }

    private Map<String, Object> orderMap(Order o) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", o.getId());
        m.put("orderNumber", o.getOrderNumber());
        m.put("userId", o.getUser() != null ? o.getUser().getId() : null);
        m.put("customerName", o.getShippingName() != null ? o.getShippingName() : (o.getUser() != null ? o.getUser().getName() : ""));
        m.put("customerEmail", o.getShippingEmail() != null ? o.getShippingEmail() : (o.getUser() != null ? o.getUser().getEmail() : ""));
        m.put("itemCount", orderItemRepository.findByOrderId(o.getId()).size());
        m.put("couponCode", o.getCoupon() != null ? o.getCoupon().getCode() : null);
        m.put("subtotal", o.getSubtotal());
        m.put("discount", o.getDiscount());
        m.put("shipping", o.getShipping());
        m.put("tax", o.getTax());
        m.put("total", o.getTotal());
        m.put("paymentMethod", o.getPaymentMethod());
        m.put("paymentStatus", o.getPaymentStatus());
        m.put("orderStatus", o.getOrderStatus());
        m.put("shippingName", o.getShippingName());
        m.put("shippingEmail", o.getShippingEmail());
        m.put("shippingPhone", o.getShippingPhone());
        m.put("shippingAddress", o.getShippingAddress());
        m.put("shippingCity", o.getShippingCity());
        m.put("shippingState", o.getShippingState());
        m.put("shippingZip", o.getShippingZip());
        m.put("shippingCountry", o.getShippingCountry());
        m.put("createdAt", o.getCreatedAt());
        return m;
    }
}
