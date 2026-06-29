package com.bookverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BookVerseApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookVerseApplication.class, args);
    }
}
