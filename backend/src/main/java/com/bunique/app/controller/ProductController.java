package com.bunique.app.controller;

import com.bunique.app.model.Product;
import com.bunique.app.model.ProductImage;
import com.bunique.app.model.Review;
import com.bunique.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.Predicate;
import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductImageRepository productImageRepository;
    @Autowired private ReviewRepository reviewRepository;

    @GetMapping
    public Map<String, Object> getProducts(
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<Product> productPage;
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equals(sort)) sortObj = Sort.by(Sort.Direction.ASC, "price");
        else if ("price_desc".equals(sort)) sortObj = Sort.by(Sort.Direction.DESC, "price");
        else if ("popular".equals(sort) || "best".equals(sort)) sortObj = Sort.by(Sort.Direction.DESC, "views");
        else if ("name".equals(sort)) sortObj = Sort.by(Sort.Direction.ASC, "name");

        final String term = (search == null || search.isBlank()) ? null : search.trim().toLowerCase();
        final String activeFilter = filter == null ? "" : filter;
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), 1));
            if (category != null) {
                predicates.add(cb.equal(root.get("category").get("id"), category));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (term != null) {
                String like = "%" + term + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("shortDescription"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("sku"), "")), like)
                ));
            }
            switch (activeFilter) {
                case "featured" -> predicates.add(cb.isTrue(root.get("featured")));
                case "newest", "new" -> predicates.add(cb.isTrue(root.get("isNew")));
                case "best" -> predicates.add(cb.isTrue(root.get("isBestSeller")));
                case "sale" -> predicates.add(cb.and(
                        cb.isNotNull(root.get("oldPrice")),
                        cb.greaterThan(root.get("oldPrice"), root.get("price"))));
                case "handcrafted" -> predicates.add(cb.isNull(root.get("oldPrice")));
                default -> { }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        productPage = productRepository.findAll(spec, PageRequest.of(page, size, sortObj));
        productPage.getContent().forEach(ProductController::initializeCategory);
        Map<String, Object> result = new HashMap<>();
        result.put("products", productPage.getContent());
        result.put("totalPages", productPage.getTotalPages());
        result.put("totalElements", productPage.getTotalElements());
        result.put("page", page);
        List<Map<String, Object>> categories = new ArrayList<>();
        for (com.bunique.app.model.Category c : categoryRepository.findByStatusOrderBySortOrderAscNameAsc(1)) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("name", c.getName());
            cm.put("slug", c.getSlug());
            cm.put("image", c.getImage());
            cm.put("productCount", productRepository.countByCategory_IdAndStatus(c.getId(), 1));
            categories.add(cm);
        }
        result.put("categories", categories);
        return result;
    }

    @GetMapping("/{slug}")
    public Map<String, Object> getProduct(@PathVariable String slug) {
        Optional<Product> opt = productRepository.findBySlug(slug);
        if (opt.isEmpty()) return Map.of("error", "Product not found");
        Product product = opt.get();
        product.setViews(product.getViews() + 1);
        productRepository.save(product);
        initializeCategory(product);

        List<Review> reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(product.getId(), Review.Status.approved);
        List<Map<String, Object>> reviewDtos = new ArrayList<>();
        double ratingSum = 0;
        for (Review review : reviews) {
            Map<String, Object> rm = new HashMap<>();
            rm.put("id", review.getId());
            rm.put("rating", review.getRating());
            rm.put("title", review.getTitle());
            rm.put("comment", review.getComment());
            rm.put("createdAt", review.getCreatedAt());
            rm.put("userName", review.getUser() != null ? review.getUser().getName() : "Customer");
            reviewDtos.add(rm);
            ratingSum += review.getRating() == null ? 0 : review.getRating();
        }

        List<Product> related = new ArrayList<>(productRepository
                .findByCategory_IdAndStatus(product.getCategory().getId(), 1, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "views")))
                .getContent());
        related.removeIf(p -> p.getId().equals(product.getId()));
        if (related.isEmpty()) {
            related = new ArrayList<>(productRepository
                    .findByStatus(1, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "views")))
                    .getContent());
            related.removeIf(p -> p.getId().equals(product.getId()));
        }
        related.forEach(ProductController::initializeCategory);

        Map<String, Object> result = new HashMap<>();
        result.put("product", product);
        result.put("images", productImageRepository.findByProductId(product.getId()));
        result.put("reviews", reviewDtos);
        result.put("reviewCount", reviewDtos.size());
        result.put("avgRating", reviews.isEmpty() ? 0.0 : Math.round((ratingSum / reviews.size()) * 10.0) / 10.0);
        result.put("related", related);
        return result;
    }

    /**
     * Hibernate proxies serialize as an object containing only the identifier.
     * Touching the lazy association while the session is open lets Jackson
     * serialize the full category (name, slug, ...), which the UI needs.
     */
    private static void initializeCategory(Product product) {
        if (product.getCategory() != null) {
            product.getCategory().getName();
        }
    }

}
