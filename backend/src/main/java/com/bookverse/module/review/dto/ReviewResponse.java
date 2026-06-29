package com.bookverse.module.review.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ReviewResponse(
    Long id,
    String username,
    String userAvatar,
    String googleBookId,
    String bookTitle,
    String bookCover,
    BigDecimal rating,
    String reviewText,
    String favoriteQuote,
    String whatChanged,
    boolean isSpoiler,
    long likesCount,
    long commentsCount,
    boolean hasLiked,
    OffsetDateTime createdAt
) {}
