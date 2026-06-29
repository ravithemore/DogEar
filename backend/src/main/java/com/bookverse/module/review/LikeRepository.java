package com.bookverse.module.review;

import com.bookverse.module.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    long countByReviewId(Long reviewId);
    boolean existsByUserAndReview(User user, Review review);
    Optional<Like> findByUserAndReview(User user, Review review);
}
