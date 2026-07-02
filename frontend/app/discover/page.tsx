'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Sparkles, BookMarked, Loader2, ArrowLeft, LogOut, Star, X, Check } from 'lucide-react';
import { searchBooks, updateShelfStatus, BookDto } from '@/services/books';
import { createReview } from '@/services/reviews';

export default function Discover() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [shelvedMap, setShelvedMap] = useState<Record<string, string>>({});
  const [shelvingId, setShelvingId] = useState<string | null>(null);

  // Review Modal State
  const [reviewBook, setReviewBook] = useState<BookDto | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username'));
    }
    loadSeededBooks();
  }, []);

  const loadSeededBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await searchBooks('');
      setBooks(data);
    } catch (err: any) {
      console.error('Failed to fetch seeded books', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const data = await searchBooks(query);
      setBooks(data);
    } catch (err: any) {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShelf = async (book: BookDto, status: 'WANT_TO_READ' | 'READING' | 'COMPLETED') => {
    if (!username) {
      router.push('/login');
      return;
    }

    if (status === 'COMPLETED') {
      // Open the review modal instead of direct shelving
      setReviewBook(book);
      return;
    }

    setShelvingId(book.googleBookId);
    try {
      await updateShelfStatus(book.googleBookId, status);
      setShelvedMap((prev) => ({ ...prev, [book.googleBookId]: status }));
    } catch (err) {
      alert('Could not update shelf. Please try again.');
    } finally {
      setShelvingId(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBook) return;

    setSubmittingReview(true);
    try {
      await createReview({
        googleBookId: reviewBook.googleBookId,
        rating: rating,
        reviewText: reviewText || undefined,
        favoriteQuote: favoriteQuote || undefined,
        whatChanged: whatChanged || undefined,
        isSpoiler: isSpoiler,
      });

      setShelvedMap((prev) => ({ ...prev, [reviewBook.googleBookId]: 'COMPLETED' }));
      closeReviewModal();
    } catch (err) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const closeReviewModal = () => {
    setReviewBook(null);
    setRating(5);
    setReviewText('');
    setFavoriteQuote('');
    setWhatChanged('');
    setIsSpoiler(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Dogear Logo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-serif text-2xl font-bold tracking-tight text-emerald-950">Dogear</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
          {username ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${username}`} className="text-sm font-medium text-stone-700 flex items-center gap-2 hover:text-emerald-900 transition-colors">
                <Sparkles className="h-4 w-4 text-amber-500 fill-current" />
                Hi, <span className="font-semibold text-emerald-950">{username}</span>
                <div className="w-7 h-7 rounded-full border border-emerald-800 overflow-hidden flex-shrink-0 flex items-center justify-center bg-emerald-50 shadow-sm hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`} alt={username} className="w-full h-full object-cover" />
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-lg shadow-sm transition-all">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Discover Search Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-emerald-950">Discover Books</h1>
          <p className="text-stone-600 mt-2">Search the Google Books database to shelf your next read</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Title, Author, or ISBN..."
              className="w-full pl-5 pr-14 py-4 border border-stone-300 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 p-2.5 bg-[#1E3F20] hover:bg-[#152e17] text-white rounded-xl shadow-sm active-bounce transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-emerald-800 animate-spin" />
            <p className="text-stone-500 text-sm font-medium animate-pulse">Retrieving volumes...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="max-w-md mx-auto rounded-lg bg-red-50 p-4 text-center text-sm text-red-800 border border-red-100">
            {error}
          </div>
        )}

        {!loading && books.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950">
              {hasSearched ? 'Search Results' : 'Featured Library Books'}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => {
              const currentStatus = shelvedMap[book.googleBookId];
              return (
                <div key={book.googleBookId} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col shadow-sm hover-lift animate-fade-in-up transition-all">
                  {/* Book Cover Container */}
                  <div className="h-56 bg-stone-100 flex items-center justify-center p-4 border-b border-stone-100 relative group">
                    {book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full object-contain shadow-md rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-stone-400 gap-1 text-center">
                        <BookOpen className="h-10 w-10 text-stone-300" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">No Cover</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-2 leading-tight" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                        by {book.authors}
                      </p>
                    </div>

                    {/* Shelf Selector Action */}
                    <div className="mt-4">
                      {currentStatus ? (
                        <div className="w-full text-center text-xs font-semibold py-2 px-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center justify-center gap-1">
                          <BookMarked className="h-3.5 w-3.5" />
                          {currentStatus === 'WANT_TO_READ' ? 'Want to Read' : currentStatus === 'READING' ? 'Reading' : 'Completed'}
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            disabled={shelvingId === book.googleBookId}
                            onChange={(e) => handleAddToShelf(book, e.target.value as any)}
                            defaultValue=""
                            className="w-full block pl-3 pr-8 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 cursor-pointer disabled:opacity-50 transition-all"
                          >
                            <option value="" disabled>Add to Shelf</option>
                            <option value="WANT_TO_READ">Want to Read</option>
                            <option value="READING">Currently Reading</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Empty placeholder */}
        {!loading && books.length === 0 && !error && (
          <div className="text-center py-20 text-stone-400">
            <BookOpen className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <p className="font-medium text-stone-500">Search for Dune, Harry Potter, Atomic Habits, or any book title!</p>
          </div>
        )}
      </main>

      {/* Review & Onboarding Journal Overlay Modal */}
      {reviewBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Add to Reading Journal</h3>
                <p className="text-xs text-stone-500 mt-1">Reviewing: <span className="font-semibold text-stone-700">{reviewBook.title}</span></p>
              </div>
              <button onClick={closeReviewModal} className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6 flex-1">
              {/* Star Rating Select */}
              <div>
                <span className="block text-sm font-semibold text-stone-700 mb-2">Rating stars</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-8 w-8 ${star <= rating ? 'text-amber-400 fill-current' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label htmlFor="reviewText" className="block text-sm font-semibold text-stone-700 mb-1">
                  Write your review
                </label>
                <textarea
                  id="reviewText"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think of the characters, the plot, or the concepts? (Optional)"
                  className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 bg-stone-50 focus:bg-white transition-all"
                />
              </div>

              {/* Favorite Quote */}
              <div>
                <label htmlFor="favoriteQuote" className="block text-sm font-semibold text-stone-700 mb-1">
                  Favorite Quote
                </label>
                <textarea
                  id="favoriteQuote"
                  rows={2}
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  placeholder="Capture a quote that stood out to you. (Optional)"
                  className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 bg-stone-50 focus:bg-white font-mono text-xs transition-all"
                />
              </div>

              {/* What Changed */}
              <div>
                <label htmlFor="whatChanged" className="block text-sm font-semibold text-stone-700 mb-1">
                  What changed after reading? (Journey Journal)
                </label>
                <textarea
                  id="whatChanged"
                  rows={2}
                  value={whatChanged}
                  onChange={(e) => setWhatChanged(e.target.value)}
                  placeholder="Did this book change your systems, perspective, or lifestyle? (Optional)"
                  className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 bg-stone-50 focus:bg-white transition-all"
                />
              </div>

              {/* Spoiler Toggle */}
              <div className="flex items-center gap-3">
                <input
                  id="isSpoiler"
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-800 cursor-pointer"
                />
                <label htmlFor="isSpoiler" className="text-sm font-medium text-stone-750 cursor-pointer selection:bg-transparent">
                  This review contains spoilers
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-stone-100 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {submittingReview ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4.5 w-4.5" /> Save to Journal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
