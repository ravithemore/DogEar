package com.bookverse.module.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String bio;
    private String profilePicture;
    private long followersCount;
    private long followingCount;
    private boolean following;
}
