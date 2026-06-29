package com.bookverse.module.auth;

import com.bookverse.module.auth.dto.*;
import com.bookverse.module.user.User;
import com.bookverse.module.user.UserRepository;
import com.bookverse.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(
            UserRepository userRepository,
            OtpVerificationRepository otpRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .verified(false)
                .build();

        userRepository.save(user);

        // Generate 6-digit OTP code
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        OtpVerification verification = OtpVerification.builder()
                .user(user)
                .code(otpCode)
                .expiresAt(OffsetDateTime.now().plusMinutes(10))
                .build();

        // Delete any existing OTP for this user
        otpRepository.deleteByUser(user);
        otpRepository.save(verification);

        emailService.sendVerificationOtp(user.getEmail(), otpCode);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("No user found with email: " + request.email()));

        if (user.isVerified()) {
            throw new IllegalArgumentException("Account is already verified");
        }

        OtpVerification verification = otpRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("No active verification code found"));

        if (verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            otpRepository.delete(verification);
            throw new IllegalArgumentException("Verification code has expired");
        }

        if (!verification.getCode().equals(request.code())) {
            throw new IllegalArgumentException("Incorrect verification code");
        }

        user.setVerified(true);
        userRepository.save(user);
        otpRepository.delete(verification);

        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }
}
