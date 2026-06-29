package com.bookverse.module.review;

import com.bookverse.module.user.User;
import com.bookverse.module.book.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookGoogleBookId(String googleBookId);
    List<Review> findByUserUsernameOrderByCreatedAtDesc(String username);
    List<Review> findAllByOrderByCreatedAtDesc();
    Optional<Review> findByUserAndBook(User user, Book book);
}
