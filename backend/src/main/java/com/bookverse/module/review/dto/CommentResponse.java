package com.bookverse.module.review.dto;

import java.time.OffsetDateTime;

public record CommentResponse(
    Long id,
    String username,
    String commentText,
    OffsetDateTime createdAt
) {}
