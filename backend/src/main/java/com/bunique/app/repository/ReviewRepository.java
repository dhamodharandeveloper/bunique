package com.bunique.app.repository;

import com.bunique.app.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, Review.Status status);
}
