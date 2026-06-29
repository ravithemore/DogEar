package com.bookverse.module.book;

import com.bookverse.module.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    Optional<UserBook> findByUserAndBook(User user, Book book);
    Optional<UserBook> findByUserAndBookGoogleBookId(User user, String googleBookId);
    List<UserBook> findByUser(User user);
    List<UserBook> findByUserAndStatus(User user, BookShelfStatus status);
}
