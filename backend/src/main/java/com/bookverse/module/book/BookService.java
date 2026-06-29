package com.bookverse.module.book;

import com.bookverse.module.user.User;
import com.bookverse.module.user.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserBookRepository userBookRepository;
    private final UserRepository userRepository;
    private final GoogleBooksService googleBooksService;

    public BookService(
            BookRepository bookRepository,
            UserBookRepository userBookRepository,
            UserRepository userRepository,
            GoogleBooksService googleBooksService
    ) {
        this.bookRepository = bookRepository;
        this.userBookRepository = userBookRepository;
        this.userRepository = userRepository;
        this.googleBooksService = googleBooksService;
    }

    @Transactional(readOnly = true)
    public List<BookDto> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) {
            List<Book> localBooks = bookRepository.findAll();
            return localBooks.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        List<BookDto> results = googleBooksService.searchBooks(query);
        if (results.isEmpty()) {
            List<Book> localBooks = bookRepository.findByTitleContainingIgnoreCaseOrAuthorsContainingIgnoreCase(query, query);
            return localBooks.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return results;
    }

    @Transactional
    public BookDto getBookDetails(String googleBookId) {
        Optional<Book> localBook = bookRepository.findByGoogleBookId(googleBookId);
        if (localBook.isPresent()) {
            return mapToDto(localBook.get());
        }

        BookDto apiBook = googleBooksService.getBookDetails(googleBookId);
        if (apiBook == null) {
            throw new IllegalArgumentException("Book not found on Google Books API: " + googleBookId);
        }
        return apiBook;
    }

    @Transactional
    public UserBookDto updateShelfStatus(String username, ShelfUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Get local cached book or fetch from Google Books API and cache it
        Book book = bookRepository.findByGoogleBookId(request.googleBookId())
                .orElseGet(() -> {
                    BookDto dto = googleBooksService.getBookDetails(request.googleBookId());
                    if (dto == null) {
                        throw new IllegalArgumentException("Book not found: " + request.googleBookId());
                    }
                    Book newBook = Book.builder()
                            .googleBookId(dto.googleBookId())
                            .title(dto.title())
                            .authors(dto.authors())
                            .coverImage(dto.coverImage())
                            .description(dto.description())
                            .pageCount(dto.pageCount())
                            .publishedDate(dto.publishedDate())
                            .build();
                    return bookRepository.save(newBook);
                });

        Optional<UserBook> existingUserBook = userBookRepository.findByUserAndBook(user, book);
        UserBook userBook;

        if (existingUserBook.isPresent()) {
            userBook = existingUserBook.get();
            userBook.setStatus(request.status());
            if (request.status() == BookShelfStatus.COMPLETED) {
                userBook.setCompletedAt(OffsetDateTime.now());
                userBook.setCurrentPage(book.getPageCount() != null ? book.getPageCount() : 0);
            } else if (request.status() == BookShelfStatus.READING) {
                userBook.setStartedAt(OffsetDateTime.now());
                userBook.setCompletedAt(null);
            } else {
                userBook.setStartedAt(null);
                userBook.setCompletedAt(null);
                userBook.setCurrentPage(0);
            }
        } else {
            userBook = UserBook.builder()
                    .user(user)
                    .book(book)
                    .status(request.status())
                    .currentPage(0)
                    .build();

            if (request.status() == BookShelfStatus.READING) {
                userBook.setStartedAt(OffsetDateTime.now());
            } else if (request.status() == BookShelfStatus.COMPLETED) {
                userBook.setCompletedAt(OffsetDateTime.now());
                userBook.setCurrentPage(book.getPageCount() != null ? book.getPageCount() : 0);
            }
        }

        UserBook saved = userBookRepository.save(userBook);
        return mapToUserBookDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserBookDto> getUserShelf(String username, BookShelfStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<UserBook> list = (status != null) 
                ? userBookRepository.findByUserAndStatus(user, status)
                : userBookRepository.findByUser(user);

        return list.stream()
                .map(this::mapToUserBookDto)
                .collect(Collectors.toList());
    }

    private BookDto mapToDto(Book book) {
        return new BookDto(
                book.getGoogleBookId(),
                book.getTitle(),
                book.getAuthors(),
                book.getCoverImage(),
                book.getDescription(),
                book.getPageCount(),
                book.getPublishedDate()
        );
    }

    private UserBookDto mapToUserBookDto(UserBook userBook) {
        return new UserBookDto(
                userBook.getId(),
                mapToDto(userBook.getBook()),
                userBook.getStatus(),
                userBook.getCurrentPage(),
                userBook.getStartedAt(),
                userBook.getCompletedAt()
        );
    }
}
