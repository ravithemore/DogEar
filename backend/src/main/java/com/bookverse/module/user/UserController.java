package com.bookverse.module.user;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String viewer = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(userService.getUserProfile(username, viewer));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Map<String, Boolean>> toggleFollow(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean followed = userService.toggleFollow(username, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("following", followed));
    }
}
