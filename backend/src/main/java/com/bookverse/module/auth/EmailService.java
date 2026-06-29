package com.bookverse.module.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendVerificationOtp(String email, String otpCode) {
        logger.info("\n" +
                "========================================================\n" +
                "EMAIL SENT TO: {}\n" +
                "SUBJECT: Verification OTP for Dogear\n" +
                "CONTENT: Your 6-digit verification code is: {}\n" +
                "This code will expire in 10 minutes.\n" +
                "========================================================", 
                email, otpCode);
    }
}
