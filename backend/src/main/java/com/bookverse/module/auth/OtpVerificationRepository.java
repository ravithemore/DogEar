package com.bookverse.module.auth;

import com.bookverse.module.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByUser(User user);
    Optional<OtpVerification> findByUserEmail(String email);
    void deleteByUser(User user);
}
