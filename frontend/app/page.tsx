'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Users, Compass, Flame, ArrowRight, Star, Heart, 
  MessageSquare, LogOut, Sparkles, Send, Loader2, Quote, Eye, ChevronDown, X 
} from 'lucide-react';
import { getFeed, toggleLike, addComment, getComments, ReviewResponse, CommentResponse } from '@/services/reviews';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Feed States
  const [feed, setFeed] = useState<ReviewResponse[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Comments States
  const [activeCommentReviewId, setActiveCommentReviewId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, CommentResponse[]>>({});
  const [commentsLoadingMap, setCommentsLoadingMap] = useState<Record<number, boolean>>({});
  const [newCommentTexts, setNewCommentTexts] = useState<Record<number, string>>({});

  // Dynamic Quote States
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quotesList = [
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
    { text: "Fear is the mind-killer. Fear is the little-death that brings total obliteration.", author: "Frank Herbert" },
    { text: "All that is gold does not glitter, not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { text: "One of the most valuable skills in our economy is becoming increasingly rare. If you master it, you will produce extraordinary results.", author: "Cal Newport" },
    { text: "It is the possibility of having a dream come true that makes life interesting.", author: "Paulo Coelho" }
  ];

  // Dogear Modal Explainer
  const [showDogearModal, setShowDogearModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username'));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchFeed();
    }
  }, [mounted]);

  // Quote rotation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotesList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    setFeedLoading(true);
    try {
      const data = await getFeed();
      setFeed(data);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setFeedLoading(false);
    }
  };

  const handleLike = async (reviewId: number) => {
    if (!username) {
      window.location.href = '/login';
      return;
    }

    try {
      const { liked } = await toggleLike(reviewId);
      setFeed((prev) =>
        prev.map((item) => {
          if (item.id === reviewId) {
            return {
              ...item,
              hasLiked: liked,
              likesCount: liked ? item.likesCount + 1 : item.likesCount - 1,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Could not toggle like', err);
    }
  };

  const handleToggleComments = async (reviewId: number) => {
    if (activeCommentReviewId === reviewId) {
      setActiveCommentReviewId(null);
      return;
    }

    setActiveCommentReviewId(reviewId);
    if (!commentsMap[reviewId]) {
      setCommentsLoadingMap((prev) => ({ ...prev, [reviewId]: true }));
      try {
        const comments = await getComments(reviewId);
        setCommentsMap((prev) => ({ ...prev, [reviewId]: comments }));
      } catch (err) {
        console.error('Failed to fetch comments', err);
      } finally {
        setCommentsLoadingMap((prev) => ({ ...prev, [reviewId]: false }));
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent, reviewId: number) => {
    e.preventDefault();
    if (!username) {
      window.location.href = '/login';
      return;
    }

    const text = newCommentTexts[reviewId];
    if (!text || !text.trim()) return;

    try {
      const newComment = await addComment(reviewId, text);
      setCommentsMap((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), newComment],
      }));
      setNewCommentTexts((prev) => ({ ...prev, [reviewId]: '' }));
      setFeed((prev) =>
        prev.map((item) => {
          if (item.id === reviewId) {
            return {
              ...item,
              commentsCount: item.commentsCount + 1,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const revealSpoiler = (id: number) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: true }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    window.location.reload();
  };

  const trendingBooks = [
    {
      id: 'dune-id-123',
      title: 'Dune',
      author: 'Frank Herbert',
      tag: 'Sci-Fi',
      tagBg: 'bg-indigo-50 border-indigo-100 text-indigo-800',
      cover: 'https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg',
    },
    {
      id: 'atomic-habits-id',
      title: 'Atomic Habits',
      author: 'James Clear',
      tag: 'Self-Help',
      tagBg: 'bg-amber-50 border-amber-100 text-amber-800',
      cover: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
    },
    {
      id: 'deep-work-id',
      title: 'Deep Work',
      author: 'Cal Newport',
      tag: 'Productivity',
      tagBg: 'bg-teal-50 border-teal-100 text-teal-800',
      cover: 'https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg',
    },
  ];

  const topReaders = [
    { name: 'alice_reader', booksCount: 38 },
    { name: 'frank_herbert', booksCount: 12 },
    { name: 'james_clear', booksCount: 29 },
    { name: 'bookish_emma', booksCount: 47 },
    { name: 'olivia_reads', booksCount: 51 },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FCF9F3] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Dogear Logo" className="h-10 w-10 animate-pulse rounded-lg object-contain" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F3] text-stone-900 selection:bg-emerald-950 selection:text-white relative">
      
      {/* Floating Explainer Badge */}
      <div className="fixed bottom-6 right-6 z-40 animate-pulse">
        <button
          onClick={() => setShowDogearModal(true)}
          className="px-5 py-3 text-xs font-bold text-emerald-950 bg-amber-100 hover:bg-amber-200 border border-amber-200 shadow-xl rounded-full flex items-center gap-2 hover-lift active-bounce transition-all"
        >
          📖 What is a "Dogear"?
        </button>
      </div>

      {/* Top Navigation */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Dogear Logo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-serif text-2xl font-bold tracking-tight text-emerald-950">Dogear</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Discover
          </Link>
          {username ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${username}`} className="text-sm font-medium text-stone-700 flex items-center gap-2 hover:text-emerald-900 transition-colors">
                <Sparkles className="h-4 w-4 text-amber-500 fill-current animate-pulse" />
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
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-emerald-900 hover:text-emerald-950 transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-lg shadow-sm transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center border-b border-stone-200/50 relative overflow-hidden">
        
        {/* Floating Book Frames in Hero Background */}
        <div className="absolute top-8 left-8 w-20 h-28 bg-white border border-stone-200/80 rounded-xl shadow-lg p-1.5 hover:scale-110 transition-transform duration-300 pointer-events-none opacity-40 hover:opacity-90 animate-float hidden lg:block rotate-[-12deg]">
          <div className="w-full h-full bg-stone-100 rounded overflow-hidden flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg" alt="Dune" className="h-full object-contain rounded-sm shadow-xs" />
          </div>
        </div>

        <div className="absolute top-20 right-8 w-20 h-28 bg-white border border-stone-200/80 rounded-xl shadow-lg p-1.5 hover:scale-110 transition-transform duration-300 pointer-events-none opacity-40 hover:opacity-90 animate-float hidden lg:block rotate-[15deg]" style={{ animationDelay: '1.5s' }}>
          <div className="w-full h-full bg-stone-100 rounded overflow-hidden flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg" alt="Atomic Habits" className="h-full object-contain rounded-sm shadow-xs" />
          </div>
        </div>

        <div className="absolute bottom-6 left-12 w-20 h-28 bg-white border border-stone-200/80 rounded-xl shadow-lg p-1.5 hover:scale-110 transition-transform duration-300 pointer-events-none opacity-40 hover:opacity-90 animate-float hidden lg:block rotate-[-8deg]" style={{ animationDelay: '2.5s' }}>
          <div className="w-full h-full bg-stone-100 rounded overflow-hidden flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg" alt="Deep Work" className="h-full object-contain rounded-sm shadow-xs" />
          </div>
        </div>

        <div className="absolute bottom-20 right-16 w-20 h-28 bg-white border border-stone-200/80 rounded-xl shadow-lg p-1.5 hover:scale-110 transition-transform duration-300 pointer-events-none opacity-40 hover:opacity-90 animate-float hidden lg:block rotate-[10deg]" style={{ animationDelay: '0.8s' }}>
          <div className="w-full h-full bg-stone-100 rounded overflow-hidden flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://covers.openlibrary.org/b/isbn/9780590353427-M.jpg" alt="Harry Potter" className="h-full object-contain rounded-sm shadow-xs" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full mb-6">
          <Compass className="h-3.5 w-3.5" /> Discover books through people
        </span>
        
        {/* Hero Title */}
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-stone-900 max-w-4xl mx-auto leading-tight">
          Discover books through <span className="text-[#1E3F20] underline decoration-[#D4AF37] decoration-wavy">people</span>, not algorithms.
        </h1>
        
        {/* Dynamic Fading Thoughts Section */}
        <div className="h-20 flex items-center justify-center mt-6">
          <p className="text-base md:text-lg text-stone-650 max-w-2xl mx-auto font-serif italic select-none animate-fade-in-up" key={quoteIndex}>
            "{quotesList[quoteIndex].text}" — <span className="font-sans text-xs not-italic font-bold text-emerald-955 bg-emerald-50/70 border border-emerald-100/80 rounded-lg px-2.5 py-1 ml-1.5">{quotesList[quoteIndex].author}</span>
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          {username ? (
            <div className="flex flex-col items-center gap-4 animate-fade-in-up">
              <div className="flex gap-4">
                <Link href="/discover" className="px-6 py-3.5 text-base font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-xl shadow-md flex items-center gap-2 hover-lift active-bounce transition-all">
                  Search & Discover Books <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/profile/${username}`} className="px-6 py-3.5 text-base font-semibold text-[#1E3F20] bg-white border border-stone-200 hover:border-stone-300 rounded-xl shadow-sm hover-lift active-bounce transition-all">
                  Go to My Shelf
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Link href="/register" className="px-6 py-3.5 text-base font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-xl shadow-md flex items-center gap-2 group hover-lift active-bounce transition-all">
                Start Reading Journey <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/discover" className="px-6 py-3.5 text-base font-semibold text-[#1E3F20] bg-white border border-stone-200 hover:border-stone-300 rounded-xl shadow-sm hover-lift active-bounce transition-all">
                Explore Books
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Main Content Layout Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Feed Column (2 Cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 flex items-center gap-2 mb-2">
              Community Activity Feed <Sparkles className="h-5 w-5 text-amber-500 fill-current animate-pulse" />
            </h2>

            {feedLoading && (
              <div className="flex flex-col justify-center items-center py-20 gap-2 bg-white border border-stone-200 rounded-2xl">
                <Loader2 className="h-8 w-8 text-emerald-800 animate-spin" />
                <span className="text-sm text-stone-400 font-semibold animate-pulse">Syncing feed timeline...</span>
              </div>
            )}

            {!feedLoading && feed.length > 0 && (
              <div className="space-y-6">
                {feed.slice(0, visibleCount).map((item) => (
                  <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover-lift animate-fade-in-up flex flex-col gap-4">
                    {/* Header User details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-emerald-900 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center bg-emerald-50">
                        {item.userAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.userAvatar} alt={item.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-emerald-900 text-sm">{item.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-x-1.5">
                          <Link href={`/profile/${item.username}`} className="font-bold text-stone-900 text-sm hover:text-emerald-800 hover:underline transition-colors">
                            {item.username}
                          </Link>
                          <span className="text-stone-500 text-xs font-medium">completed</span>
                          <span className="font-bold text-emerald-955 text-xs line-clamp-1">{item.bookTitle}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Stars and Cover row */}
                    <div className="flex gap-4 items-start bg-[#FDFBF7] p-4 border border-stone-150 rounded-xl relative">
                      <div className="w-16 h-24 bg-stone-100 border border-stone-200 rounded shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                        {item.bookCover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.bookCover} alt={item.bookTitle} className="h-full object-contain rounded animate-fade-in-up" />
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 text-center">No cover</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-0.5 text-amber-400 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.round(item.rating) ? 'fill-current' : 'text-stone-250'}`} />
                          ))}
                        </div>
                        
                        {item.reviewText && (
                          <div className="mt-2 text-sm text-stone-700 leading-relaxed relative">
                            {item.isSpoiler && !revealedSpoilers[item.id] ? (
                              <div className="bg-stone-200/50 backdrop-blur-md rounded-lg p-3 text-center border border-stone-300/40 select-none">
                                <span className="text-xs text-red-955 font-semibold flex items-center justify-center gap-1.5 mb-1.5">
                                  <Eye className="h-4 w-4" /> Contains Spoilers
                                </span>
                                <button
                                  onClick={() => revealSpoiler(item.id)}
                                  className="px-3 py-1 bg-stone-900 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-stone-800 hover-lift active-bounce transition-colors"
                                >
                                  Reveal review
                                </button>
                              </div>
                            ) : (
                              <p className="line-clamp-4">{item.reviewText}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quote Box */}
                    {item.favoriteQuote && (
                      <div className="bg-[#FAF7F0] border-l-2 border-emerald-800 rounded-r-xl p-3 flex gap-2 items-start text-xs text-stone-600 italic">
                        <Quote className="h-4 w-4 text-emerald-850 opacity-40 rotate-180 flex-shrink-0" />
                        <p className="leading-relaxed">"{item.favoriteQuote}"</p>
                      </div>
                    )}

                    {/* Takeaway reflection */}
                    {item.whatChanged && (
                      <div className="pt-1">
                        <span className="block text-[9px] uppercase font-bold tracking-wider text-emerald-900 mb-0.5 font-sans">
                          What changed after reading
                        </span>
                        <p className="text-xs text-stone-600 leading-relaxed font-serif italic border-l-2 border-emerald-500/10 pl-3">
                          "{item.whatChanged}"
                        </p>
                      </div>
                    )}

                    {/* Footer Interactions */}
                    <div className="flex gap-4 border-t border-stone-100 pt-3 text-stone-500 text-xs font-semibold">
                      <button 
                        onClick={() => handleLike(item.id)}
                        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg active-bounce transition-colors ${
                          item.hasLiked ? 'text-red-500 bg-red-50' : 'hover:bg-stone-100 hover:text-stone-700'
                        }`}
                      >
                        <Heart className={`h-4.5 w-4.5 ${item.hasLiked ? 'fill-current' : ''}`} />
                        {item.likesCount} {item.likesCount === 1 ? 'like' : 'likes'}
                      </button>
                      <button 
                        onClick={() => handleToggleComments(item.id)}
                        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg active-bounce transition-colors ${
                          activeCommentReviewId === item.id ? 'text-emerald-855 bg-emerald-55' : 'hover:bg-stone-100 hover:text-stone-700'
                        }`}
                      >
                        <MessageSquare className="h-4.5 w-4.5" />
                        {item.commentsCount} {item.commentsCount === 1 ? 'comment' : 'comments'}
                      </button>
                    </div>

                    {/* Comments tray */}
                    {activeCommentReviewId === item.id && (
                      <div className="border-t border-stone-100 pt-4 mt-1 space-y-4 animate-fade-in-up">
                        <form onSubmit={(e) => handleAddComment(e, item.id)} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={newCommentTexts[item.id] || ''}
                            onChange={(e) => setNewCommentTexts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder={username ? "Write a comment..." : "Log in to post a comment..."}
                            disabled={!username}
                            className="flex-1 px-3 py-2.5 border border-stone-300 rounded-xl text-xs bg-stone-50 focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 disabled:opacity-60 transition-all"
                          />
                          <button
                            type="submit"
                            disabled={!username || !(newCommentTexts[item.id] || '').trim()}
                            className="p-2.5 bg-[#1E3F20] hover:bg-[#152e17] text-white rounded-xl shadow active-bounce disabled:opacity-50 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>

                        {commentsLoadingMap[item.id] ? (
                          <div className="flex justify-center items-center py-4">
                            <Loader2 className="h-5 w-5 text-stone-455 animate-spin" />
                          </div>
                        ) : (
                          commentsMap[item.id] && (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                              {commentsMap[item.id].length > 0 ? (
                                commentsMap[item.id].map((comment) => (
                                  <div key={comment.id} className="flex gap-2 items-start text-xs bg-stone-50/50 p-2.5 rounded-lg border border-stone-150 hover-lift transition-all">
                                    <Link href={`/profile/${comment.username}`} className="font-bold text-stone-850 hover:text-emerald-800 hover:underline">
                                      {comment.username}
                                    </Link>
                                    <span className="text-stone-600 flex-1">{comment.commentText}</span>
                                    <span className="text-[9px] text-stone-400">
                                      {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-stone-400 text-center py-2 font-medium">No comments yet.</p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Load More Button */}
                {visibleCount < feed.length && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 text-sm font-bold text-emerald-950 bg-white border border-stone-250 hover:bg-stone-50 rounded-xl shadow-xs flex items-center gap-1.5 hover-lift active-bounce transition-all"
                    >
                      Load More Reviews <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar Column */}
          <div className="space-y-8 sticky top-24">
            
            {/* Reading Challenge Widget */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <h3 className="font-serif text-lg font-bold text-[#1E3F20] flex items-center gap-1.5 mb-2">
                2026 Reading Goal 🎯
              </h3>
              <p className="text-xs text-stone-500 mb-4">Set and conquer your literary milestones.</p>
              
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-150">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-850 h-2.5 rounded-full transition-all duration-1000" style={{ width: '60%' }} />
              </div>
              
              <div className="flex justify-between items-center mt-3 text-xs font-bold text-stone-700">
                <span>12 / 20 Books</span>
                <span className="text-emerald-900 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-md">60% Done</span>
              </div>
            </div>

            {/* Trending Sidebar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#1E3F20] flex items-center gap-1.5 mb-5">
                Trending Right Now <Flame className="h-5 w-5 text-orange-500 fill-current animate-pulse" />
              </h3>
              
              <div className="space-y-4">
                {trendingBooks.map((tb) => (
                  <div key={tb.id} className="flex gap-3.5 items-start pb-4 border-b border-stone-100 last:border-b-0 last:pb-0 group">
                    <div className="w-11 h-16 bg-stone-100 border border-stone-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                      <img src={tb.cover} alt={tb.title} className="h-full object-contain shadow-xs rounded-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 border rounded-full ${tb.tagBg} mb-1`}>
                        {tb.tag}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-950 transition-colors">
                        {tb.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 line-clamp-1">by {tb.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Readers */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#1E3F20] flex items-center gap-1.5 mb-5">
                Top Readers <Users className="h-5 w-5 text-emerald-850" />
              </h3>

              <div className="space-y-3.5">
                {topReaders.map((tr) => (
                  <div key={tr.name} className="flex items-center justify-between py-1 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-emerald-900 overflow-hidden flex-shrink-0 flex items-center justify-center bg-emerald-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${tr.name}`} alt={tr.name} className="w-full h-full object-cover" />
                      </div>
                      <Link href={`/profile/${tr.name}`} className="text-xs font-bold text-stone-950 hover:text-emerald-805 hover:underline">
                        {tr.name}
                      </Link>
                    </div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 bg-stone-50 border border-stone-200 text-stone-600 rounded-lg">
                      📖 {tr.booksCount} books
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
          
        </div>
      </section>

      {/* Dogear Meaning Modal Explainer */}
      {showDogearModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <button
              onClick={() => setShowDogearModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-3xl">📖</span>
            <h3 className="font-serif text-2xl font-bold text-emerald-950 mt-4">What is a "Dogear"?</h3>
            <div className="mt-4 space-y-4 text-sm text-stone-600 leading-relaxed">
              <p>
                In print culture, a <strong>dog-ear</strong> is the act of folding down the corner of a book page to mark your progress or flag a quote that stays with you. 
              </p>
              <p>
                This website is a <strong>digital dog-ear</strong> for your thoughts. Instead of relying on cold, algorithmic feeds to suggest your next read, we discover books through real people. 
              </p>
              <p>
                Here, readers register quotes, rate their finished books, and write reflections detailing exactly how a book has changed their perspective, systems, or lifestyles.
              </p>
            </div>
            <button
              onClick={() => setShowDogearModal(false)}
              className="mt-6 w-full py-3 bg-[#1E3F20] hover:bg-[#152e17] text-white font-bold rounded-xl shadow-md active-bounce hover-lift transition-all"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Feature Value Props Grid */}
      <section className="bg-stone-100 border-y border-stone-200/80 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center text-stone-950 mb-12">
            Why Dogear beats Goodreads & StoryGraph
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-stone-250/50 shadow-sm hover-lift">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-800 mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Reader Timelines</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Transform finished books into dynamic journal entries documenting rating details, quotes, highlights, and emotional summaries.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-250/50 shadow-sm hover-lift">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 mb-6">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Streak Gamification</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Keep reading regularly with page check-ins, achievements, and customizable library themes to keep you engaged.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-250/50 shadow-sm hover-lift">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 mb-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Book Clubs & Events</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Organize read-alongs, set weekly milestones, comment on chapter threads, and join voice sessions with book enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-12 text-center text-stone-500 text-sm bg-white">
        <p>&copy; {new Date().getFullYear()} Dogear. Designed like a startup, built for readers.</p>
      </footer>
    </div>
  );
}
