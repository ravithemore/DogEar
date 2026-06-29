package com.bookverse.config;

import com.bookverse.module.user.User;
import com.bookverse.module.user.UserRepository;
import com.bookverse.module.book.*;
import com.bookverse.module.review.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final UserBookRepository userBookRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            UserRepository userRepository,
            BookRepository bookRepository,
            ReviewRepository reviewRepository,
            LikeRepository likeRepository,
            CommentRepository commentRepository,
            UserBookRepository userBookRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.reviewRepository = reviewRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.userBookRepository = userBookRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if we are already seeded with OpenLibrary cover URLs
        boolean alreadySeeded = false;
        long bookCount = bookRepository.count();
        if (bookCount > 0) {
            List<Book> existing = bookRepository.findAll();
            if (!existing.isEmpty() && existing.get(0).getCoverImage() != null && existing.get(0).getCoverImage().contains("openlibrary.org")) {
                alreadySeeded = true;
            }
        }

        if (alreadySeeded) {
            return;
        }

        // Clean slate for social/library items (prevents constraints on re-run)
        likeRepository.deleteAllInBatch();
        commentRepository.deleteAllInBatch();
        reviewRepository.deleteAllInBatch();
        userBookRepository.deleteAllInBatch();
        bookRepository.deleteAllInBatch();

        Random random = new Random(42);

        // 1. Manage Seed Users (Create if missing, preserve personal users like ravi_test)
        List<String> usernames = List.of(
            "alice_reader", "frank_herbert", "james_clear", "bookish_emma", 
            "olivia_reads", "charlie_books", "ryan_reads", "sophia_pages", 
            "liam_library", "harper_literary", "noah_novels", "chloe_chapters", 
            "lucas_literature", "mia_manuscript", "ethan_epilogue"
        );

        List<User> savedUsers = new ArrayList<>();
        for (String uname : usernames) {
            Optional<User> existingUser = userRepository.findByUsername(uname);
            if (existingUser.isPresent()) {
                savedUsers.add(existingUser.get());
            } else {
                User user = User.builder()
                        .username(uname)
                        .email(uname + "@example.com")
                        .password(passwordEncoder.encode("password123"))
                        .verified(true)
                        .build();
                savedUsers.add(userRepository.save(user));
            }
        }

        // 2. Create Books
        List<Book> books = List.of(
            new Book(null, "dune-id-123", "Dune", "Frank Herbert", "https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg", "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides...", 604, "1965", null),
            new Book(null, "atomic-habits-id", "Atomic Habits", "James Clear", "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg", "Atomic Habits offers a proven framework for improving...", 320, "2018", null),
            new Book(null, "deep-work-id", "Deep Work", "Cal Newport", "https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg", "Rules for Focused Success in a Distracted World...", 304, "2016", null),
            new Book(null, "harry-potter-id", "Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "https://covers.openlibrary.org/b/isbn/9780590353427-M.jpg", "Harry Potter has no idea how famous he is...", 309, "1997", null),
            new Book(null, "the-hobbit-id", "The Hobbit", "J.R.R. Tolkien", "https://covers.openlibrary.org/b/isbn/9780261103344-M.jpg", "In a hole in the ground there lived a hobbit...", 310, "1937", null),
            new Book(null, "project-hail-mary", "Project Hail Mary", "Andy Weir", "https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg", "Ryland Grace is the sole survivor on a desperate, last-chance mission...", 476, "2021", null),
            new Book(null, "sapiens-id", "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg", "Earth is 4.5 billion years old. In just a fraction of that time, one species...", 512, "2011", null),
            new Book(null, "alchemist-id", "The Alchemist", "Paulo Coelho", "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg", "Paulo Coelho's masterpiece tells the mystical story of Santiago...", 163, "1988", null),
            new Book(null, "educated-id", "Educated", "Tara Westover", "https://covers.openlibrary.org/b/isbn/9780399590504-M.jpg", "An unforgettable memoir about a young girl who, kept out of school...", 352, "2018", null),
            new Book(null, "normal-people", "Normal People", "Sally Rooney", "https://covers.openlibrary.org/b/isbn/9781984822178-M.jpg", "Normal People is the story of mutual fascination, friendship and love...", 273, "2018", null),
            new Book(null, "tomorrow-tomorrow", "Tomorrow, and Tomorrow, and Tomorrow", "Gabrielle Zevin", "https://covers.openlibrary.org/b/isbn/9780593321201-M.jpg", "In this exhilarating novel, two friends—often in love, but never lovers...", 401, "2022", null),
            new Book(null, "midnight-library", "The Midnight Library", "Matt Haig", "https://covers.openlibrary.org/b/isbn/9780525559474-M.jpg", "Between life and death there is a library, and within that library...", 304, "2020", null),
            new Book(null, "babel-id", "Babel", "R.F. Kuang", "https://covers.openlibrary.org/b/isbn/9780063021426-M.jpg", "Traduttore, Traditore: An Act of Translation is the dominant tool of empire...", 545, "2022", null),
            new Book(null, "court-thorns", "A Court of Thorns and Roses", "Sarah J. Maas", "https://covers.openlibrary.org/b/isbn/9781619634442-M.jpg", "Feyre's survival rests upon her ability to hunt and kill...", 416, "2015", null),
            new Book(null, "stolen-focus", "Stolen Focus", "Johann Hari", "https://covers.openlibrary.org/b/isbn/9780593138519-M.jpg", "Why You Can't Pay Attention—and How to Think Deeply Again...", 349, "2022", null),
            new Book(null, "silent-patient", "The Silent Patient", "Alex Michaelides", "https://covers.openlibrary.org/b/isbn/9781250301697-M.jpg", "Alicia Berenson’s life is seemingly perfect. A famous painter married to...", 325, "2019", null),
            new Book(null, "great-gatsby", "The Great Gatsby", "F. Scott Fitzgerald", "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg", "The story of the fabulously wealthy Jay Gatsby and his love for Daisy...", 180, "1925", null),
            new Book(null, "1984-id", "1984", "George Orwell", "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg", "Among the seminal texts of the 20th century, 1984 is a rare work that...", 328, "1949", null),
            new Book(null, "to-kill-mockingbird", "To Kill a Mockingbird", "Harper Lee", "https://covers.openlibrary.org/b/isbn/9780060935467-M.jpg", "The unforgettable novel of a childhood in a sleepy Southern town and...", 324, "1960", null),
            new Book(null, "crying-hmart", "Crying in H Mart", "Michelle Zauner", "https://covers.openlibrary.org/b/isbn/9780525657744-M.jpg", "In this exquisite story of family, food, grief, and endurance, Michelle...", 256, "2021", null),
            new Book(null, "zero-to-one", "Zero to One", "Peter Thiel", "https://covers.openlibrary.org/b/isbn/9780804139298-M.jpg", "Notes on Startups, or How to Build the Future. Peter Thiel shows...", 195, "2014", null),
            new Book(null, "thinking-fast-slow", "Thinking, Fast and Slow", "Daniel Kahneman", "https://covers.openlibrary.org/b/isbn/9780374275631-M.jpg", "Daniel Kahneman, the renowned psychologist and winner of the Nobel...", 499, "2011", null),
            new Book(null, "psychology-money", "The Psychology of Money", "Morgan Housel", "https://covers.openlibrary.org/b/isbn/9780857197689-M.jpg", "Doing well with money isn’t necessarily about what you know. It’s about...", 252, "2020", null),
            new Book(null, "show-your-work", "Show Your Work!", "Austin Kleon", "https://covers.openlibrary.org/b/isbn/9780761178972-M.jpg", "Ten ways to share your creativity and get discovered. Austin Kleon...", 224, "2014", null),
            new Book(null, "make-time", "Make Time", "Jake Knapp", "https://covers.openlibrary.org/b/isbn/9780141988184-M.jpg", "How to Focus on What Matters Every Day. Jake Knapp and John Zeratsky...", 304, "2018", null),
            new Book(null, "quiet-id", "Quiet: The Power of Introverts", "Quiet: The Power of Introverts", "https://covers.openlibrary.org/b/isbn/9780307352156-M.jpg", "At least one-third of the people we know are introverts. They are the ones...", 368, "2012", null),
            new Book(null, "hyperion-id", "Hyperion", "Dan Simmons", "https://covers.openlibrary.org/b/isbn/9780553283686-M.jpg", "On the world called Hyperion, beyond the law of the Hegemony of Man...", 482, "1989", null),
            new Book(null, "neuromancer-id", "Neuromancer", "William Gibson", "https://covers.openlibrary.org/b/isbn/9780441569595-M.jpg", "Case was the sharpest data-thief in the matrix—until he crossed...", 271, "1984", null),
            new Book(null, "name-of-wind", "The Name of the Wind", "Patrick Rothfuss", "https://covers.openlibrary.org/b/isbn/9780756404741-M.jpg", "Told in Kvothe's own voice, this is the tale of the magically gifted young...", 662, "2007", null),
            new Book(null, "mistborn-id", "Mistborn: The Final Empire", "Brandon Sanderson", "https://covers.openlibrary.org/b/isbn/9780765311788-M.jpg", "For a thousand years the ash fell and no flowers bloomed...", 541, "2006", null)
        );
        List<Book> savedBooks = bookRepository.saveAll(books);

        // 3. Review Template Data
        List<String> reviewTextTemplates = List.of(
            "A stunning masterpiece that kept me hooked from the first page. The characters feel incredibly rich.",
            "Honestly, a bit slow in the middle, but the final third was absolute fire. The ending pays off everything.",
            "One of the most practical and eye-opening books I have read this year. Highly recommend it to everyone.",
            "A fascinating exploration of human nature, systems, and choice. It gave me a lot to think about.",
            "The prose is beautiful, almost poetic at times. The plot is tightly woven and satisfying.",
            "A quick read but packed with insights. It breaks down complex ideas into simple, actionable steps.",
            "I had high expectations and this exceeded all of them. A solid 5-star read.",
            "A bit overrated in my opinion, but still worth reading for the core message and ideas.",
            "A timeless classic. It holds up remarkably well and feels very relevant to today's world.",
            "An emotional rollercoaster. I was laughing, crying, and reflecting throughout the entire journey."
        );

        List<String> quoteTemplates = List.of(
            "Seek freedom and become captive of your desires. Seek discipline and find your liberty.",
            "You do not rise to the level of your goals. You fall to the level of your systems.",
            "Fear is the mind-killer. Fear is the little-death that brings total obliteration.",
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
            "All that is gold does not glitter, not all those who wander are lost.",
            "Real courage is when you know you're licked before you begin, but you begin anyway.",
            "Knowing yourself is the beginning of all wisdom.",
            "In the middle of difficulty lies opportunity.",
            "It is the possibility of having a dream come true that makes life interesting.",
            "The mystery of life isn't a problem to solve, but a reality to experience."
        );

        List<String> takeawayTemplates = List.of(
            "I started tracking my daily habits and focusing on small 1% improvements every single day.",
            "It completely changed how I think about focus, attention, and block scheduling deep work.",
            "I began journaling every night and capturing my favorite quotes from daily reading.",
            "I realized that the systems we build around us dictate our success far more than raw willpower.",
            "It prompted me to declutter my digital life and protect my focus from constant alerts.",
            "I started waking up 30 minutes earlier to read in a cozy, distraction-free environment.",
            "It made me realize the importance of consistency over intensity in building new skills.",
            "I reached out to old friends and started a small book club to discuss ideas in depth.",
            "I began taking regular walk breaks without my phone to let my mind wander and process ideas.",
            "It gave me the courage to start writing and sharing my creative work publicly."
        );

        // 4. Generate 110 reviews and shelves
        int maxReviews = 110;
        int reviewCount = 0;
        List<Review> savedReviews = new ArrayList<>();

        while (reviewCount < maxReviews) {
            User user = savedUsers.get(random.nextInt(savedUsers.size()));
            Book book = savedBooks.get(random.nextInt(savedBooks.size()));

            Optional<Review> existing = reviewRepository.findByUserAndBook(user, book);
            if (existing.isPresent()) {
                continue;
            }

            BigDecimal ratingVal = BigDecimal.valueOf(3.0 + random.nextDouble() * 2.0).setScale(1, java.math.RoundingMode.HALF_UP);
            String reviewText = reviewTextTemplates.get(random.nextInt(reviewTextTemplates.size()));
            String quote = random.nextDouble() > 0.3 ? quoteTemplates.get(random.nextInt(quoteTemplates.size())) : null;
            String takeaway = random.nextDouble() > 0.4 ? takeawayTemplates.get(random.nextInt(takeawayTemplates.size())) : null;
            boolean spoiler = random.nextDouble() > 0.85;

            Review review = Review.builder()
                    .user(user)
                    .book(book)
                    .rating(ratingVal)
                    .reviewText(reviewText)
                    .favoriteQuote(quote)
                    .whatChanged(takeaway)
                    .spoiler(spoiler)
                    .build();

            Review saved = reviewRepository.save(review);
            savedReviews.add(saved);

            UserBook userBook = UserBook.builder()
                    .user(user)
                    .book(book)
                    .status(BookShelfStatus.COMPLETED)
                    .currentPage(book.getPageCount() != null ? book.getPageCount() : 0)
                    .completedAt(OffsetDateTime.now().minusDays(random.nextInt(60)))
                    .build();
            userBookRepository.save(userBook);

            reviewCount++;
        }

        // 5. Generate 180 comments
        List<String> commentTemplates = List.of(
            "Loved this review! Spot on.",
            "Completely agree with your points here.",
            "Adding this book to my TBR list immediately!",
            "I had a slightly different take but respect this review.",
            "This has been on my shelf for ages, need to read it now.",
            "That quote is so powerful!",
            "Excellent write-up. Thanks for sharing.",
            "This book literally changed my life too!",
            "Great review! How long did it take you to read?",
            "Will check this out this weekend."
        );

        for (int i = 0; i < 180; i++) {
            User user = savedUsers.get(random.nextInt(savedUsers.size()));
            Review review = savedReviews.get(random.nextInt(savedReviews.size()));

            Comment comment = Comment.builder()
                    .user(user)
                    .review(review)
                    .commentText(commentTemplates.get(random.nextInt(commentTemplates.size())))
                    .build();
            commentRepository.save(comment);
        }

        // 6. Generate 220 likes
        int likesCreated = 0;
        while (likesCreated < 220) {
            User user = savedUsers.get(random.nextInt(savedUsers.size()));
            Review review = savedReviews.get(random.nextInt(savedReviews.size()));

            if (likeRepository.existsByUserAndReview(user, review)) {
                continue;
            }

            Like like = Like.builder()
                    .user(user)
                    .review(review)
                    .build();
            likeRepository.save(like);
            likesCreated++;
        }
    }
}
