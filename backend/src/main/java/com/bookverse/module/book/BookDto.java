package com.bookverse.module.book;

public record BookDto(
    String googleBookId,
    String title,
    String authors,
    String coverImage,
    String description,
    Integer pageCount,
    String publishedDate
) {}
