package com.bunique.app.repository;

import com.bunique.app.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByTokenAndEmail(String token, String email);
    void deleteByEmail(String email);
}
