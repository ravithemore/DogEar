package com.bookverse.module.book;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookDto>> searchBooks(@RequestParam String query) {
        return ResponseEntity.ok(bookService.searchBooks(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookDetails(@PathVariable String id) {
        return ResponseEntity.ok(bookService.getBookDetails(id));
    }

    @PostMapping("/shelf")
    public ResponseEntity<UserBookDto> updateShelfStatus(
            @Valid @RequestBody ShelfUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(bookService.updateShelfStatus(userDetails.getUsername(), request));
    }

    @GetMapping("/shelf")
    public ResponseEntity<List<UserBookDto>> getUserShelf(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) BookShelfStatus status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String targetUsername = (username != null && !username.trim().isEmpty()) ? username : (userDetails != null ? userDetails.getUsername() : null);
        if (targetUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(bookService.getUserShelf(targetUsername, status));
    }
}
