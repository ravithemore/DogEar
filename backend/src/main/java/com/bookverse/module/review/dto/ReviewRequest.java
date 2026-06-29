package com.bookverse.module.review.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ReviewRequest(
    @NotBlank(message = "Google Book ID is required")
    String googleBookId,

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    BigDecimal rating,

    String reviewText,
    String favoriteQuote,
    String whatChanged,
    boolean isSpoiler
) {}
