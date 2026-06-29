package com.bookverse.module.book;

import java.time.OffsetDateTime;

public record UserBookDto(
    Long id,
    BookDto book,
    BookShelfStatus status,
    Integer currentPage,
    OffsetDateTime startedAt,
    OffsetDateTime completedAt
) {}
