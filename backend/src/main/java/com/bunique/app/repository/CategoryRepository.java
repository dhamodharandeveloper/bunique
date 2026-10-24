package com.bunique.app.repository;

import com.bunique.app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStatusOrderBySortOrderAscNameAsc(Integer status);
    Optional<Category> findBySlug(String slug);
}
