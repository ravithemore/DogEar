package com.bookverse.module.book;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ShelfUpdateRequest(
    @NotBlank(message = "Google Book ID is required")
    String googleBookId,

    @NotNull(message = "Shelf status is required")
    BookShelfStatus status
) {}
