package com.bookverse.module.auth.dto;

public record AuthResponse(
    String token,
    String username,
    String email
) {}
