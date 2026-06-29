package com.bookverse.module.book;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class GoogleBooksService {
    private static final Logger logger = LoggerFactory.getLogger(GoogleBooksService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_URL = "https://www.googleapis.com/books/v1/volumes";

    // Fallback list of popular books for local testing when API limits are exceeded
    private static final List<BookDto> MOCK_BOOKS = List.of(
        new BookDto(
            "dune-id-123", 
            "Dune", 
            "Frank Herbert", 
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg", 
            "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad'Dib.", 
            604, 
            "1965"
        ),
        new BookDto(
            "atomic-habits-id", 
            "Atomic Habits", 
            "James Clear", 
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988390i/40121378.jpg", 
            "Atomic Habits offers a proven framework for improving—every day. James Clear is one of the world's leading experts on habit formation.", 
            320, 
            "2018"
        ),
        new BookDto(
            "deep-work-id", 
            "Deep Work", 
            "Cal Newport", 
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957904i/25744928.jpg", 
            "Rules for Focused Success in a Distracted World. Cal Newport explains how focusing without distraction allows you to master complicated information.", 
            304, 
            "2016"
        ),
        new BookDto(
            "harry-potter-id", 
            "Harry Potter and the Sorcerer's Stone", 
            "J.K. Rowling", 
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg", 
            "Harry Potter has no idea how famous he is. He is forced to live with his Dursley uncle and aunt, until he receives an invitation to Hogwarts.", 
            309, 
            "1997"
        ),
        new BookDto(
            "the-hobbit-id", 
            "The Hobbit", 
            "J.R.R. Tolkien", 
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1372847507i/136251.jpg", 
            "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and a oozy smell...", 
            310, 
            "1937"
        )
    );

    @SuppressWarnings("unchecked")
    public List<BookDto> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        String url = API_URL + "?q=" + query + "&maxResults=10";
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("items")) {
                return Collections.emptyList();
            }
            
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            List<BookDto> results = new ArrayList<>();
            
            for (Map<String, Object> item : items) {
                results.add(parseVolume(item));
            }
            return results;
        } catch (Exception e) {
            logger.warn("Google Books API quota exceeded or connection failed. Falling back to mock book results. Error: {}", e.getMessage());
            return getMockFallbackBooks(query);
        }
    }

    @SuppressWarnings("unchecked")
    public BookDto getBookDetails(String googleBookId) {
        String url = API_URL + "/" + googleBookId;
        try {
            Map<String, Object> item = restTemplate.getForObject(url, Map.class);
            if (item == null) {
                return null;
            }
            return parseVolume(item);
        } catch (Exception e) {
            logger.warn("Google Books API quota exceeded or connection failed for details. Falling back to mock data. Error: {}", e.getMessage());
            return getMockFallbackBookDetails(googleBookId);
        }
    }

    @SuppressWarnings("unchecked")
    private BookDto parseVolume(Map<String, Object> item) {
        String id = (String) item.get("id");
        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");
        
        String title = (String) volumeInfo.get("title");
        
        List<String> authorsList = (List<String>) volumeInfo.get("authors");
        String authors = authorsList != null ? String.join(", ", authorsList) : "Unknown Author";
        
        String description = (String) volumeInfo.get("description");
        Integer pageCount = (Integer) volumeInfo.get("pageCount");
        String publishedDate = (String) volumeInfo.get("publishedDate");
        
        String coverImage = null;
        if (volumeInfo.containsKey("imageLinks")) {
            Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
            coverImage = imageLinks.get("thumbnail");
            if (coverImage != null) {
                coverImage = coverImage.replace("http://", "https://");
            }
        }
        
        return new BookDto(id, title, authors, coverImage, description, pageCount, publishedDate);
    }

    private List<BookDto> getMockFallbackBooks(String query) {
        String lowerQuery = query.toLowerCase();
        return MOCK_BOOKS.stream()
                .filter(b -> b.title().toLowerCase().contains(lowerQuery) || b.authors().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
    }

    private BookDto getMockFallbackBookDetails(String googleBookId) {
        return MOCK_BOOKS.stream()
                .filter(b -> b.googleBookId().equals(googleBookId))
                .findFirst()
                .orElse(null);
    }
}
