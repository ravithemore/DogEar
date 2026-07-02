'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Sparkles, BookMarked, Loader2, ArrowLeft, Plus, LogOut, Star, Quote, Edit3 } from 'lucide-react';
import { getUserShelf, UserBookDto } from '@/services/books';
import { getUserTimeline, ReviewResponse } from '@/services/reviews';
import { getUserProfile, updateUserProfile, toggleFollowUser, UserProfileDto } from '@/services/users';

export default function Profile() {
  const router = useRouter();
  const routeParams = useParams();
  const profileUsername = routeParams?.username as string;

  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  
  // Profile Stats
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioText, setEditBioText] = useState('');
  const [submittingBio, setSubmittingBio] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Shelf/Timeline
  const [shelfItems, setShelfItems] = useState<UserBookDto[]>([]);
  const [timelineItems, setTimelineItems] = useState<ReviewResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'READING' | 'COMPLETED' | 'WANT_TO_READ'>('READING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = loggedInUser?.toLowerCase() === profileUsername?.toLowerCase();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoggedInUser(localStorage.getItem('username'));
    }
  }, []);

  useEffect(() => {
    if (profileUsername) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUsername, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch User details (followers, following, bio)
      const prof = await getUserProfile(profileUsername);
      setProfile(prof);
      setEditBioText(prof.bio || '');

      // 2. Fetch Shelf or timeline depending on active tab
      if (activeTab === 'COMPLETED') {
        const reviews = await getUserTimeline(profileUsername);
        setTimelineItems(reviews);
      } else {
        const data = await getUserShelf(activeTab, profileUsername);
        setShelfItems(data);
      }
    } catch (err) {
      setError('Failed to fetch shelf items.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!loggedInUser) {
      router.push('/login');
      return;
    }
    setFollowLoading(true);
    try {
      const res = await toggleFollowUser(profileUsername);
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          following: res.following,
          followersCount: res.following ? prev.followersCount + 1 : prev.followersCount - 1,
        };
      });
    } catch (err) {
      console.error('Failed to toggle follow status', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBio(true);
    try {
      const data = await updateUserProfile(editBioText, profile?.profilePicture);
      setProfile(data);
      setIsEditingBio(false);
    } catch (err) {
      console.error('Failed to update bio', err);
    } finally {
      setSubmittingBio(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setLoggedInUser(null);
    router.push('/');
  };

  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case 'READING': return 'Currently Reading';
      case 'COMPLETED': return 'Completed (Journal)';
      case 'WANT_TO_READ': return 'Want to Read';
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F3] text-stone-900 selection:bg-emerald-950 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Dogear Logo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-serif text-2xl font-bold tracking-tight text-emerald-950">Dogear</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
          {loggedInUser ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${loggedInUser}`} className="text-sm font-medium text-stone-750 flex items-center gap-2 hover:text-emerald-950 transition-colors">
                <Sparkles className="h-4 w-4 text-amber-500 fill-current animate-pulse" />
                Hi, <span className="font-bold text-emerald-900">{loggedInUser}</span>
                <div className="w-7 h-7 rounded-full border border-emerald-800 overflow-hidden flex-shrink-0 flex items-center justify-center bg-emerald-50 shadow-sm hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${loggedInUser}`} alt={loggedInUser} className="w-full h-full object-cover" />
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

      {/* Profile Header Details */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1 min-w-0">
            <div className="w-20 h-20 rounded-full border-2 border-emerald-900 overflow-hidden flex-shrink-0 flex items-center justify-center bg-emerald-50 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile?.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileUsername}`} alt={profileUsername} className="w-full h-full object-cover" />
            </div>
            
            <div className="text-center md:text-left flex-1 min-w-0">
              <h2 className="font-serif text-3xl font-bold text-stone-900 flex items-center justify-center md:justify-start gap-2">
                {profileUsername}
                {isOwnProfile && (
                  <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full font-sans">
                    You
                  </span>
                )}
              </h2>
              
              {/* Followers / Following counts */}
              <div className="mt-2 flex gap-4 justify-center md:justify-start text-xs font-semibold text-stone-500">
                <div>
                  <span className="text-stone-900 font-bold">{profile?.followersCount ?? 0}</span> followers
                </div>
                <div>
                  <span className="text-stone-900 font-bold">{profile?.followingCount ?? 0}</span> following
                </div>
              </div>

              {/* Bio block */}
              <div className="mt-4">
                {isEditingBio ? (
                  <form onSubmit={handleBioSubmit} className="max-w-md mt-2 mx-auto md:mx-0">
                    <textarea
                      required
                      value={editBioText}
                      onChange={(e) => setEditBioText(e.target.value)}
                      className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800 bg-stone-50"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2 justify-center md:justify-start">
                      <button type="submit" disabled={submittingBio} className="px-3.5 py-1.5 bg-[#1E3F20] text-white text-[11px] font-bold rounded-lg hover:bg-[#152e17] transition-all">
                        {submittingBio ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setIsEditingBio(false)} className="px-3.5 py-1.5 bg-stone-100 text-stone-700 text-[11px] font-semibold rounded-lg hover:bg-stone-200 transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {profile?.bio ? (
                      <p className="text-sm text-stone-650 italic leading-relaxed">"{profile.bio}"</p>
                    ) : (
                      <p className="text-sm text-stone-400 italic">No bio written yet.</p>
                    )}
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="mt-2.5 text-xs font-bold text-emerald-805 hover:text-emerald-950 underline decoration-dotted flex items-center justify-center md:justify-start gap-1"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Bio
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2">
                <div className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-[10px] font-extrabold">
                  📚 {activeTab === 'COMPLETED' ? timelineItems.length : '—'} Finished
                </div>
                <div className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-[10px] font-extrabold">
                  🔥 21 Day Streak
                </div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10px] font-extrabold">
                  🏆 Goal: 24 / 50 Books
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {isOwnProfile ? (
              <Link
                href="/discover"
                className="px-5 py-3 text-sm font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-xl shadow-md flex items-center gap-1.5 hover-lift active-bounce transition-all"
              >
                <Plus className="h-4 w-4" /> Add Books to Shelf
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-6 py-3 text-sm font-bold rounded-xl shadow-md transition-all active-bounce hover-lift ${
                  profile?.following
                    ? 'bg-white border border-stone-250 text-stone-700 hover:bg-stone-50'
                    : 'bg-[#1E3F20] text-white hover:bg-[#152e17]'
                }`}
              >
                {followLoading ? '...' : profile?.following ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Shelf Tabs */}
        <div className="border-b border-stone-200 flex gap-6 mb-8 overflow-x-auto">
          {(['READING', 'COMPLETED', 'WANT_TO_READ'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold tracking-wide border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'border-emerald-800 text-emerald-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-800 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-md mx-auto rounded-lg bg-red-50 p-4 text-center text-sm text-red-800 border border-red-100">
            {error}
          </div>
        )}

        {/* Dynamic Shelf Results */}
        {!loading && !error && (
          <>
            {activeTab === 'COMPLETED' ? (
              // Timeline Reading Journal Layout
              timelineItems.length > 0 ? (
                <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-stone-200/80">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="relative flex gap-6 items-start group">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-800 border-2 border-white shadow group-hover:scale-125 transition-transform" />

                      {/* Content Card */}
                      <div className="flex-1 ml-8 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover-lift animate-fade-in-up flex flex-col md:flex-row gap-6">
                        {/* Cover image */}
                        <div className="w-20 h-28 bg-stone-100 rounded border border-stone-150 flex-shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                          {item.bookCover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.bookCover} alt={item.bookTitle} className="h-full object-contain rounded shadow-sm animate-fade-in-up" />
                          ) : (
                            <BookOpen className="h-8 w-8 text-stone-300" />
                          )}
                        </div>

                        {/* Journal Reflection Details */}
                        <div className="flex-1">
                          <span className="text-xs text-stone-400 font-medium">
                            Shelved on {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug mt-1">
                            {item.bookTitle}
                          </h3>
                          
                          {/* Stars */}
                          <div className="flex gap-0.5 my-1.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.round(item.rating) ? 'fill-current' : 'text-stone-200'}`} />
                            ))}
                          </div>

                          {/* Review Text */}
                          {item.reviewText && (
                            <p className="text-sm text-stone-700 leading-relaxed mt-2">{item.reviewText}</p>
                          )}

                          {/* Favorite Quote Box */}
                          {item.favoriteQuote && (
                            <div className="mt-4 bg-stone-50 border-l-2 border-emerald-800 rounded-r-xl p-3 flex gap-2 items-start text-xs text-stone-600 italic">
                              <Quote className="h-4 w-4 text-emerald-850 opacity-40 rotate-180 flex-shrink-0" />
                              <p className="leading-relaxed">"{item.favoriteQuote}"</p>
                            </div>
                          )}

                          {/* Takeaway reflection */}
                          {item.whatChanged && (
                            <div className="mt-4 pt-4 border-t border-stone-100">
                              <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-900 mb-1">
                                What changed after reading
                              </span>
                              <p className="text-xs text-stone-650 leading-relaxed font-serif italic border-l border-emerald-500/20 pl-3.5">
                                "{item.whatChanged}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-stone-400 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                  <BookOpen className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="font-semibold text-stone-500 font-serif">Reading Journal is empty.</p>
                  {isOwnProfile && (
                    <Link href="/discover" className="mt-4 inline-flex px-4 py-2 text-xs font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-lg shadow transition-colors">
                      Write your first review
                    </Link>
                  )}
                </div>
              )
            ) : (
              // Standard Grid for WANT_TO_READ & READING shelves
              shelfItems.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {shelfItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col shadow-sm hover-lift animate-fade-in-up transition-all">
                      {/* Cover */}
                      <div className="h-56 bg-stone-100 flex items-center justify-center p-4 border-b border-stone-100">
                        {item.book.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.book.coverImage} alt={item.book.title} className="h-full object-contain shadow-md rounded" />
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
                          <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-2 leading-tight" title={item.book.title}>
                            {item.book.title}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-1">by {item.book.authors}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <BookMarked className="h-3.5 w-3.5 text-emerald-800" />
                            {item.status === 'READING' ? 'Reading' : 'Want to Read'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-stone-400 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                  <BookOpen className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="font-semibold text-stone-500 font-serif">Your "{getTabLabel(activeTab)}" shelf is currently empty.</p>
                  {isOwnProfile && (
                    <Link href="/discover" className="mt-4 inline-flex px-4 py-2 text-xs font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] rounded-lg shadow transition-colors">
                      Search and add books
                    </Link>
                  )}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}
