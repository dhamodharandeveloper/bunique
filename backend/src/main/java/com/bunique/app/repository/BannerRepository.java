package com.bunique.app.repository;

import com.bunique.app.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByStatusAndPositionOrderBySortOrderAscIdAsc(Integer status, String position);
}
