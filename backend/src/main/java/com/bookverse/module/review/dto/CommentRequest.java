package com.bookverse.module.review.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(
    @NotBlank(message = "Comment text is required")
    String commentText
) {}
