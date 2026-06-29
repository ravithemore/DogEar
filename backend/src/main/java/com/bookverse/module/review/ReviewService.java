package com.bookverse.module.review;

import com.bookverse.module.user.User;
import com.bookverse.module.user.UserRepository;
import com.bookverse.module.book.*;
import com.bookverse.module.review.dto.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final UserBookRepository userBookRepository;
    private final GoogleBooksService googleBooksService;

    public ReviewService(
            ReviewRepository reviewRepository,
            LikeRepository likeRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            UserBookRepository userBookRepository,
            GoogleBooksService googleBooksService
    ) {
        this.reviewRepository = reviewRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.userBookRepository = userBookRepository;
        this.googleBooksService = googleBooksService;
    }

    @Transactional
    public ReviewResponse createReview(String username, ReviewRequest request) {
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

        Optional<Review> existingReview = reviewRepository.findByUserAndBook(user, book);
        Review review;

        if (existingReview.isPresent()) {
            review = existingReview.get();
            review.setRating(request.rating());
            review.setReviewText(request.reviewText());
            review.setFavoriteQuote(request.favoriteQuote());
            review.setWhatChanged(request.whatChanged());
            review.setSpoiler(request.isSpoiler());
        } else {
            review = Review.builder()
                    .user(user)
                    .book(book)
                    .rating(request.rating())
                    .reviewText(request.reviewText())
                    .favoriteQuote(request.favoriteQuote())
                    .whatChanged(request.whatChanged())
                    .spoiler(request.isSpoiler())
                    .build();
        }

        Review savedReview = reviewRepository.save(review);

        // Auto-complete shelf status if not already COMPLETED
        Optional<UserBook> shelfItem = userBookRepository.findByUserAndBook(user, book);
        if (shelfItem.isPresent()) {
            UserBook userBook = shelfItem.get();
            if (userBook.getStatus() != BookShelfStatus.COMPLETED) {
                userBook.setStatus(BookShelfStatus.COMPLETED);
                userBook.setCompletedAt(OffsetDateTime.now());
                userBook.setCurrentPage(book.getPageCount() != null ? book.getPageCount() : 0);
                userBookRepository.save(userBook);
            }
        } else {
            UserBook userBook = UserBook.builder()
                    .user(user)
                    .book(book)
                    .status(BookShelfStatus.COMPLETED)
                    .currentPage(book.getPageCount() != null ? book.getPageCount() : 0)
                    .completedAt(OffsetDateTime.now())
                    .build();
            userBookRepository.save(userBook);
        }

        return mapToResponse(savedReview, user.getUsername());
    }

    @Transactional
    public boolean toggleLike(String username, Long reviewId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        Optional<Like> existingLike = likeRepository.findByUserAndReview(user, review);
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false; // unliked
        } else {
            Like like = Like.builder()
                    .user(user)
                    .review(review)
                    .build();
            likeRepository.save(like);
            return true; // liked
        }
    }

    @Transactional
    public CommentResponse addComment(String username, Long reviewId, CommentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        Comment comment = Comment.builder()
                .user(user)
                .review(review)
                .commentText(request.commentText())
                .build();

        Comment saved = commentRepository.save(comment);
        return new CommentResponse(saved.getId(), saved.getUser().getUsername(), saved.getCommentText(), saved.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long reviewId) {
        return commentRepository.findByReviewIdOrderByCreatedAtAsc(reviewId)
                .stream()
                .map(c -> new CommentResponse(c.getId(), c.getUser().getUsername(), c.getCommentText(), c.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getBookReviews(String googleBookId, String username) {
        List<Review> list = reviewRepository.findByBookGoogleBookId(googleBookId);
        return list.stream()
                .map(r -> mapToResponse(r, username))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getTimelineFeed(String username) {
        List<Review> list = reviewRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .map(r -> mapToResponse(r, username))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserTimeline(String profileUsername, String currentUsername) {
        List<Review> list = reviewRepository.findByUserUsernameOrderByCreatedAtDesc(profileUsername);
        return list.stream()
                .map(r -> mapToResponse(r, currentUsername))
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review r, String currentUsername) {
        long likesCount = likeRepository.countByReviewId(r.getId());
        long commentsCount = commentRepository.countByReviewId(r.getId());
        
        boolean hasLiked = false;
        if (currentUsername != null) {
            Optional<User> currentUser = userRepository.findByUsername(currentUsername);
            if (currentUser.isPresent()) {
                hasLiked = likeRepository.existsByUserAndReview(currentUser.get(), r);
            }
        }

        String avatar = r.getUser().getProfilePicture();
        if (avatar == null || avatar.trim().isEmpty()) {
            avatar = "https://api.dicebear.com/7.x/adventurer/svg?seed=" + r.getUser().getUsername();
        }

        return new ReviewResponse(
                r.getId(),
                r.getUser().getUsername(),
                avatar,
                r.getBook().getGoogleBookId(),
                r.getBook().getTitle(),
                r.getBook().getCoverImage(),
                r.getRating(),
                r.getReviewText(),
                r.getFavoriteQuote(),
                r.getWhatChanged(),
                r.isSpoiler(),
                likesCount,
                commentsCount,
                hasLiked,
                r.getCreatedAt()
        );
    }
}
