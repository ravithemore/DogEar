package com.bookverse.module.review;

import com.bookverse.module.review.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(userDetails.getUsername(), request));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Boolean>> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean liked = reviewService.toggleLike(userDetails.getUsername(), id);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addComment(userDetails.getUsername(), id, request));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getComments(id));
    }

    @GetMapping("/book/{googleBookId}")
    public ResponseEntity<List<ReviewResponse>> getBookReviews(
            @PathVariable String googleBookId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(reviewService.getBookReviews(googleBookId, username));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<ReviewResponse>> getFeed(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(reviewService.getTimelineFeed(username));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<ReviewResponse>> getUserTimeline(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String currentUsername = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(reviewService.getUserTimeline(username, currentUsername));
    }
}
