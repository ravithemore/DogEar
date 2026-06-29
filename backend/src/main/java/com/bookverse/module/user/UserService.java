package com.bookverse.module.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public UserService(UserRepository userRepository, FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String targetUsername, String viewerUsername) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + targetUsername));

        long followers = followRepository.countByFollowing(target);
        long following = followRepository.countByFollower(target);

        boolean isFollowing = false;
        if (viewerUsername != null && !viewerUsername.equalsIgnoreCase(targetUsername)) {
            Optional<User> viewer = userRepository.findByUsername(viewerUsername);
            if (viewer.isPresent()) {
                isFollowing = followRepository.existsByFollowerAndFollowing(viewer.get(), target);
            }
        }

        String avatar = target.getProfilePicture();
        if (avatar == null || avatar.trim().isEmpty()) {
            avatar = "https://api.dicebear.com/7.x/adventurer/svg?seed=" + target.getUsername();
        }

        return new UserProfileResponse(
                target.getUsername(),
                target.getBio(),
                avatar,
                followers,
                following,
                isFollowing
        );
    }

    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        user.setBio(request.getBio());
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        User saved = userRepository.save(user);

        return getUserProfile(saved.getUsername(), username);
    }

    @Transactional
    public boolean toggleFollow(String targetUsername, String viewerUsername) {
        if (targetUsername.equalsIgnoreCase(viewerUsername)) {
            throw new IllegalArgumentException("You cannot follow yourself.");
        }

        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + targetUsername));
        User viewer = userRepository.findByUsername(viewerUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + viewerUsername));

        Optional<Follow> existing = followRepository.findByFollowerAndFollowing(viewer, target);
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return false; // Unfollowed
        } else {
            Follow follow = Follow.builder()
                    .follower(viewer)
                    .following(target)
                    .build();
            followRepository.save(follow);
            return true; // Followed
        }
    }
}
