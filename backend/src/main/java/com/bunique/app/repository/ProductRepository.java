package com.bunique.app.repository;

import com.bunique.app.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    Page<Product> findByStatus(Integer status, Pageable pageable);
    List<Product> findTop4ByStatusAndIsNewTrueOrderByCreatedAtDesc(Integer status);
    List<Product> findTop4ByStatusAndIsBestSellerTrueOrderByViewsDesc(Integer status);
    List<Product> findTop4ByStatusAndFeaturedTrueOrderByViewsDesc(Integer status);
    List<Product> findTop4ByStatusOrderByCreatedAtDesc(Integer status);
    Page<Product> findByCategory_IdAndStatus(Long categoryId, Integer status, Pageable pageable);
    long countByCategory_IdAndStatus(Long categoryId, Integer status);
}
