package com.bunique.app.controller;

import com.bunique.app.model.*;
import com.bunique.app.repository.*;
import com.bunique.app.security.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private SettingRepository settingRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private CurrentUser currentUser;

    @PostMapping("/orders")
    @Transactional
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> body) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        User user = userRepository.findById(uid).orElseThrow();
        List<Cart> carts = cartRepository.findByUserId(uid);
        if (carts.isEmpty()) return Map.of("success", false, "message", "Your cart is empty.");

        String name = str(body.get("shipName"));
        String phone = str(body.get("shipPhone"));
        String email = str(body.get("shipEmail"));
        if (name.isEmpty() || phone.isEmpty() || email.isEmpty()) {
            return Map.of("success", false, "message", "Please fill in all contact details.");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (Cart c : carts) {
            subtotal = subtotal.add(c.getProduct().getPrice().multiply(BigDecimal.valueOf(c.getQuantity())));
        }

        BigDecimal discount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        Object couponIdObj = body.get("couponId");
        if (couponIdObj != null) {
            appliedCoupon = couponRepository.findById(Long.valueOf(String.valueOf(couponIdObj))).orElse(null);
            if (appliedCoupon != null) {
                if (appliedCoupon.getDiscountType() == Coupon.DiscountType.percent) {
                    discount = subtotal.multiply(appliedCoupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    if (appliedCoupon.getMaxDiscount() != null) discount = discount.min(appliedCoupon.getMaxDiscount());
                } else {
                    discount = appliedCoupon.getDiscountValue().min(subtotal);
                }
            }
        }

        BigDecimal taxPercent = new BigDecimal(settingRepository.findBySettingKey("tax_percent").map(Setting::getSettingValue).orElse("0"));
        BigDecimal tax = subtotal.subtract(discount).multiply(taxPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.subtract(discount).add(tax).setScale(2, RoundingMode.HALF_UP);

        for (Cart c : carts) {
            if (c.getQuantity() > c.getProduct().getStock()) {
                return Map.of("success", false, "message", "Sorry, \"" + c.getProduct().getName() + "\" does not have enough stock.");
            }
        }

        String paymentMethod = str(body.get("paymentMethod")).isEmpty() ? "upi" : str(body.get("paymentMethod"));
        if (!List.of("upi", "cod").contains(paymentMethod)) paymentMethod = "upi";

        String orderNumber = "BU" + System.currentTimeMillis() + (int) (Math.random() * 900 + 100);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .coupon(appliedCoupon)
                .subtotal(subtotal)
                .discount(discount)
                .shipping(BigDecimal.ZERO)
                .tax(tax)
                .total(total)
                .paymentMethod(paymentMethod)
                .paymentStatus(Order.PaymentStatus.paid)
                .orderStatus(Order.OrderStatus.pending)
                .shippingName(name)
                .shippingEmail(email)
                .shippingPhone(phone)
                .shippingAddress(str(body.get("shipAddress")))
                .shippingCity(str(body.get("shipCity")))
                .shippingState(str(body.get("shipState")))
                .shippingZip(str(body.get("shipZip")))
                .shippingCountry(str(body.get("shipCountry")).isEmpty() ? "India" : str(body.get("shipCountry")))
                .reviewToken(UUID.randomUUID().toString().replace("-", ""))
                .ratingEmailSent(false)
                .build();
        orderRepository.save(order);

        for (Cart c : carts) {
            Product p = c.getProduct();
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .productName(p.getName())
                    .productImage(p.getImage())
                    .price(p.getPrice())
                    .quantity(c.getQuantity())
                    .total(p.getPrice().multiply(BigDecimal.valueOf(c.getQuantity())))
                    .build();
            orderItemRepository.save(item);
            p.setStock(p.getStock() - c.getQuantity());
            productRepository.save(p);
        }

        paymentRepository.save(Payment.builder()
                .order(order).userId(uid).amount(total).paymentMethod(paymentMethod)
                .transactionId("TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase())
                .status(Payment.Status.success).build());

        if (appliedCoupon != null) {
            appliedCoupon.setUsedCount(appliedCoupon.getUsedCount() + 1);
            couponRepository.save(appliedCoupon);
        }

        cartRepository.deleteAll(carts);
        return Map.of("success", true, "message", "Order placed successfully.", "orderNumber", orderNumber, "orderId", order.getId());
    }

    @GetMapping("/orders")
    public Map<String, Object> myOrders() {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("orders", List.of());
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(uid);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Order o : orders) {
            list.add(orderSummary(o));
        }
        return Map.of("orders", list);
    }

    @GetMapping("/orders/{orderNumber}")
    public Map<String, Object> orderDetails(@PathVariable String orderNumber) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("error", "Please login to continue.");
        Optional<Order> opt = orderRepository.findByOrderNumber(orderNumber);
        if (opt.isEmpty()) return Map.of("error", "Order not found");
        Order o = opt.get();
        if (!uid.equals(o.getUser().getId()) && !currentUser.isAdmin()) {
            return Map.of("error", "Unauthorized");
        }
        Map<String, Object> res = new HashMap<>();
        res.put("order", orderSummary(o));
        res.put("items", orderItemRepository.findByOrderId(o.getId()).stream().map(this::itemMap).toList());
        return res;
    }

    @GetMapping("/orders/id/{id}")
    public Map<String, Object> orderDetailsById(@PathVariable Long id) {
        Long uid = currentUser.id();
        if (uid == null) return Map.of("error", "Please login to continue.");
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return Map.of("error", "Order not found");
        Order o = opt.get();
        if (!uid.equals(o.getUser().getId()) && !currentUser.isAdmin()) {
            return Map.of("error", "Unauthorized");
        }
        Map<String, Object> res = new HashMap<>();
        res.put("order", orderSummary(o));
        res.put("items", orderItemRepository.findByOrderId(o.getId()).stream().map(this::itemMap).toList());
        return res;
    }

    @PostMapping("/orders/{orderNumber}/cancel")
    @Transactional
    public Map<String, Object> cancel(@PathVariable String orderNumber) {
        Long uid = currentUser.id();
        Optional<Order> opt = orderRepository.findByOrderNumber(orderNumber);
        if (opt.isEmpty()) return Map.of("success", false, "message", "Order not found.");
        Order o = opt.get();
        if (uid == null || (!uid.equals(o.getUser().getId()) && !currentUser.isAdmin())) {
            return Map.of("success", false, "message", "Unauthorized.");
        }
        if (o.getOrderStatus() == Order.OrderStatus.cancelled) {
            return Map.of("success", false, "message", "Order is already cancelled.");
        }
        for (OrderItem item : orderItemRepository.findByOrderId(o.getId())) {
            if (item.getProduct() != null) {
                Product p = item.getProduct();
                p.setStock(p.getStock() + item.getQuantity());
                productRepository.save(p);
            }
        }
        o.setOrderStatus(Order.OrderStatus.cancelled);
        o.setPaymentStatus(Order.PaymentStatus.refunded);
        orderRepository.save(o);
        return Map.of("success", true, "message", "Order cancelled successfully.");
    }

    @GetMapping("/orders/track")
    public Map<String, Object> track(@RequestParam String orderNumber) {
        Optional<Order> opt = orderRepository.findByOrderNumber(orderNumber);
        if (opt.isEmpty()) return Map.of("success", false, "message", "Order not found.");
        Order o = opt.get();
        return Map.of("success", true, "order", orderSummary(o), "items",
                orderItemRepository.findByOrderId(o.getId()).stream().map(this::itemMap).toList());
    }

    @GetMapping("/rate")
    public Map<String, Object> rateContext(@RequestParam String token, @RequestParam Long product) {
        Order order = orderRepository.findAll().stream()
                .filter(o -> token.equals(o.getReviewToken())).findFirst().orElse(null);
        if (order == null) return Map.of("success", false, "message", "This rating link is invalid or has expired.");
        Product p = productRepository.findById(product).orElse(null);
        if (p == null) return Map.of("success", false, "message", "Product not found.");
        boolean inOrder = orderItemRepository.findByOrderId(order.getId()).stream()
                .anyMatch(i -> i.getProduct() != null && i.getProduct().getId().equals(product));
        if (!inOrder) return Map.of("success", false, "message", "This product is not part of your order.");
        Review existing = reviewRepository.findAll().stream()
                .filter(r -> r.getProduct().getId().equals(product) && r.getUser().getId().equals(order.getUser().getId()))
                .findFirst().orElse(null);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("order", orderSummary(order));
        res.put("product", p);
        res.put("existing", existing);
        return res;
    }

    @PostMapping("/reviews")
    public Map<String, Object> addReview(@RequestBody Map<String, Object> body) {        Long uid = currentUser.id();
        if (uid == null) return Map.of("success", false, "message", "Please login to continue.");
        Long productId = Long.valueOf(String.valueOf(body.get("productId")));
        Review review = Review.builder()
                .product(productRepository.getReferenceById(productId))
                .user(userRepository.getReferenceById(uid))
                .rating(Integer.parseInt(String.valueOf(body.getOrDefault("rating", 5))))
                .title(str(body.get("title")))
                .comment(str(body.get("comment")))
                .status(Review.Status.pending)
                .build();
        reviewRepository.save(review);
        return Map.of("success", true, "message", "Thank you! Your review is awaiting approval.");
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

    private Map<String, Object> orderSummary(Order o) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", o.getId());
        m.put("orderNumber", o.getOrderNumber());
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

    private String str(Object o) {
        return o == null ? "" : String.valueOf(o).trim();
    }
}
