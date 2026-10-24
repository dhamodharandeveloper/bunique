package com.bunique.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "upi";

    @Column(name = "transaction_id", length = 150)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    private Status status = Status.pending;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Status {
        pending, success, failed
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
