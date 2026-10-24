package com.bunique.app.controller;

import com.bunique.app.model.Category;
import com.bunique.app.repository.CategoryRepository;
import com.bunique.app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;

    @GetMapping
    public Object list() {
        List<Map<String, Object>> categories = new ArrayList<>();
        for (Category c : categoryRepository.findByStatusOrderBySortOrderAscNameAsc(1)) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("slug", c.getSlug());
            map.put("image", c.getImage());
            map.put("description", c.getDescription());
            map.put("sortOrder", c.getSortOrder());
            map.put("status", c.getStatus());
            map.put("productCount", productRepository.countByCategory_IdAndStatus(c.getId(), 1));
            categories.add(map);
        }
        return categories;
    }
}
