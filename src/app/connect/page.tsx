"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChatBubbleIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  Cross2Icon,
  PlusIcon,
  TriangleUpIcon,
} from "@radix-ui/react-icons";

type Category = "Work Opportunities" | "Editing & Tools" | "Creative Ideas" | "Equipment & Gear" | "Growth & Marketing" | "General Chat" | "Share Your Wins";

type SortType = "Hot" | "Newest";

type Post = {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  replyCount: number;
  category: Category;
  createdAt: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: "up" | "down";
  content?: string;
};

const categories: { label: Category; icon: typeof ChatBubbleIcon }[] = [
  { label: "Work Opportunities", icon: ChatBubbleIcon },
  { label: "Editing & Tools", icon: ChatBubbleIcon },
  { label: "Creative Ideas", icon: ChatBubbleIcon },
  { label: "Equipment & Gear", icon: ChatBubbleIcon },
  { label: "Growth & Marketing", icon: ChatBubbleIcon },
  { label: "General Chat", icon: ChatBubbleIcon },
  { label: "Share Your Wins", icon: ChatBubbleIcon },
];

const initialPosts: Post[] = [
  {
    id: "1",
    title: "Looking for a fashion UGC creator for a paid campaign",
    author: "@janeDoe",
    timeAgo: "2 hours ago",
    replyCount: 45,
    category: "Work Opportunities",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    upvotes: 12,
    downvotes: 0,
    content: "Looking for a fashion UGC creator for a paid campaign. Must have experience with lifestyle and fashion content. Budget is £500-£800 per post.",
  },
  {
    id: "2",
    title: "How to get your first brand deal",
    author: "@videoVic",
    timeAgo: "6 hours ago",
    replyCount: 32,
    category: "Work Opportunities",
    createdAt: Date.now() - 6 * 60 * 60 * 1000,
    upvotes: 28,
    downvotes: 2,
    content: "I've been creating content for 6 months now and have 5K followers. What's the best way to approach brands for my first collaboration?",
  },
  {
    id: "3",
    title: "Pitching to small brands",
    author: "@creativeCarrie",
    timeAgo: "1 day ago",
    replyCount: 24,
    category: "Work Opportunities",
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    upvotes: 15,
    downvotes: 1,
    content: "Has anyone had success pitching to smaller, indie brands? Looking for advice on how to structure my pitch email.",
  },
  {
    id: "4",
    title: "What's the best way to approach a brand?",
    author: "@shotbySam",
    timeAgo: "2 days ago",
    replyCount: 15,
    category: "Work Opportunities",
    createdAt: Date.now() - 48 * 60 * 60 * 1000,
    upvotes: 8,
    downvotes: 0,
    content: "Should I reach out via email, Instagram DM, or through their website contact form? What's worked best for you?",
  },
  {
    id: "5",
    title: "Best editing software for beginners?",
    author: "@editEmma",
    timeAgo: "3 hours ago",
    replyCount: 18,
    category: "Editing & Tools",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    upvotes: 5,
    downvotes: 0,
    content: "I'm just starting out and looking for editing software recommendations. What's user-friendly but still has good features?",
  },
  {
    id: "6",
    title: "Content ideas for lifestyle creators",
    author: "@lifestyleLiz",
    timeAgo: "5 hours ago",
    replyCount: 12,
    category: "Creative Ideas",
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    upvotes: 3,
    downvotes: 0,
    content: "Running out of content ideas! What are some lifestyle content themes that perform well?",
  },
];

type ThreadReply = {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  postId: string;
};

export default function ConnectPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Work Opportunities");
  const [sortType, setSortType] = useState<SortType>("Hot");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedThread, setSelectedThread] = useState<Post | null>(null);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [replyText, setReplyText] = useState("");

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((p) => p.category === selectedCategory);

    if (sortType === "Hot") {
      // Hot: prioritize recent posts (last 72 hours) with high engagement
      const now = Date.now();
      const seventyTwoHoursAgo = now - 72 * 60 * 60 * 1000;
      
      filtered = filtered.sort((a, b) => {
        const aRecent = a.createdAt >= seventyTwoHoursAgo;
        const bRecent = b.createdAt >= seventyTwoHoursAgo;
        const aScore = (a.upvotes || 0) - (a.downvotes || 0) + a.replyCount;
        const bScore = (b.upvotes || 0) - (b.downvotes || 0) + b.replyCount;
        
        if (aRecent && !bRecent) return -1;
        if (!aRecent && bRecent) return 1;
        return bScore - aScore;
      });
    } else if (sortType === "Newest") {
      filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    return filtered;
  }, [posts, selectedCategory, sortType]);

  const handleVote = (postId: string, voteType: "up" | "down") => {
    const updatedPosts = posts.map(post => {
      if (post.id !== postId) return post;
      
      const currentVote = post.userVote;
      let newUpvotes = post.upvotes || 0;
      let newDownvotes = post.downvotes || 0;
      let newUserVote: "up" | "down" | undefined = voteType;

      if (currentVote === voteType) {
        newUserVote = undefined;
        if (voteType === "up") newUpvotes = Math.max(0, newUpvotes - 1);
        else newDownvotes = Math.max(0, newDownvotes - 1);
      } else {
        if (currentVote === "up") newUpvotes = Math.max(0, newUpvotes - 1);
        else if (currentVote === "down") newDownvotes = Math.max(0, newDownvotes - 1);
        
        if (voteType === "up") newUpvotes += 1;
        else newDownvotes += 1;
      }

      return {
        ...post,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: newUserVote,
      };
    });
    
    setPosts(updatedPosts);
    
    if (selectedThread?.id === postId) {
      const updatedPost = updatedPosts.find(p => p.id === postId);
      if (updatedPost) {
        setSelectedThread(updatedPost);
      }
    }
  };

  const handleAddPost = (title: string, content: string, category: Category) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      title,
      author: "@you",
      timeAgo: "just now",
      replyCount: 0,
      category,
      createdAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
      content,
    };
    setPosts([newPost, ...posts]);
    setIsAddPostOpen(false);
  };

  const threadReplies = useMemo(() => {
    if (!selectedThread) return [];
    const postReplies = replies.filter(r => r.postId === selectedThread.id);
    
    if (postReplies.length === 0 && selectedThread.id && !selectedThread.id.startsWith("post_")) {
      return [
        {
          id: `r1_${selectedThread.id}`,
          author: "@creator1",
          timeAgo: "1 hour ago",
          content: "Great question! I found that reaching out directly via email works best.",
          postId: selectedThread.id,
        },
        {
          id: `r2_${selectedThread.id}`,
          author: "@creator2",
          timeAgo: "45 minutes ago",
          content: "I agree, but also consider using LinkedIn for more professional outreach.",
          postId: selectedThread.id,
        },
        {
          id: `r3_${selectedThread.id}`,
          author: "@creator3",
          timeAgo: "30 minutes ago",
          content: "Don't forget to include your portfolio link in the first message!",
          postId: selectedThread.id,
        },
      ];
    }
    return postReplies;
  }, [selectedThread, replies]);

  useEffect(() => {
    initialPosts.forEach(post => {
      if (!replies.find(r => r.postId === post.id)) {
        const mockReplies: ThreadReply[] = [
          {
            id: `r1_${post.id}`,
            author: "@creator1",
            timeAgo: "1 hour ago",
            content: "Great question! I found that reaching out directly via email works best.",
            postId: post.id,
          },
          {
            id: `r2_${post.id}`,
            author: "@creator2",
            timeAgo: "45 minutes ago",
            content: "I agree, but also consider using LinkedIn for more professional outreach.",
            postId: post.id,
          },
          {
            id: `r3_${post.id}`,
            author: "@creator3",
            timeAgo: "30 minutes ago",
            content: "Don't forget to include your portfolio link in the first message!",
            postId: post.id,
          },
        ];
        setReplies(prev => {
          const existing = prev.filter(r => r.postId === post.id);
          if (existing.length === 0) {
            return [...prev, ...mockReplies];
          }
          return prev;
        });
      }
    });
  }, []);

  const handlePostReply = () => {
    if (!selectedThread || !replyText.trim()) return;
    
    const newReply: ThreadReply = {
      id: `reply_${Date.now()}`,
      author: "@you",
      timeAgo: "just now",
      content: replyText.trim(),
      postId: selectedThread.id,
    };
    
    setReplies([...replies, newReply]);
    setReplyText("");
    
    setPosts(posts.map(p => 
      p.id === selectedThread.id 
        ? { ...p, replyCount: p.replyCount + 1 }
        : p
    ));
    
    if (selectedThread) {
      setSelectedThread({
        ...selectedThread,
        replyCount: selectedThread.replyCount + 1,
      });
    }
  };

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[36px] font-semibold leading-tight">Community</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="pl-10 pr-4 py-2 rounded-full border border-[#e5e5e5] bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 flex-1 min-w-0">
            {/* Main Content */}
            <div className="flex-[3] min-w-0 flex">
              <Card padded={false} className="h-full flex flex-col w-full">
                <div className="flex h-full">
                  {/* Categories Sidebar - Inside Card */}
                  <aside className="shrink-0 border-r border-[#efefef] bg-white min-w-fit rounded-l-[16px]">
                    <nav className="flex flex-col gap-1 p-4">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.label}
                            onClick={() => setSelectedCategory(cat.label)}
                            className={cn(
                              "flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-left transition-colors whitespace-nowrap w-full",
                              selectedCategory === cat.label
                                ? "bg-[#E5CCF7] text-black font-medium"
                                : "text-neutral-700 hover:bg-neutral-100"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </aside>

                  {/* Posts Content */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="px-6 pt-6 pb-4 border-b border-[#efefef] flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {(["Hot", "Newest"] as SortType[]).map((sort) => (
                          <button
                            key={sort}
                            onClick={() => setSortType(sort)}
                            className={cn(
                              "px-4 py-2 text-sm font-medium transition-colors",
                              sortType === sort
                                ? "text-black border-b-2 border-black"
                                : "text-neutral-500 hover:text-neutral-700"
                            )}
                          >
                            {sort}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsAddPostOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Post
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          isSelected={selectedThread?.id === post.id}
                          onSelect={() => setSelectedThread(post)}
                          onProfileClick={(author) => setViewingProfile(author)}
                          onVote={(voteType) => handleVote(post.id, voteType)}
                          replyCount={replies.filter(r => r.postId === post.id).length || post.replyCount}
                        />
                      ))}
                      {filteredPosts.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                          No posts in this category yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Thread View */}
            {selectedThread && (
              <div className="flex-[2] min-w-0 flex">
                <Card padded={false} className="h-full flex flex-col w-full">
                    <div className="px-4 py-3 border-b border-[#efefef] flex items-center justify-between">
                      <h2 className="text-base font-semibold">Thread</h2>
                      <button
                        onClick={() => setSelectedThread(null)}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <Cross2Icon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="px-4 pt-4 pb-3 border-b border-[#efefef]">
                      <h3 className="text-base font-semibold text-black mb-3">{selectedThread.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-300 transition-colors shrink-0"
                          onClick={() => setViewingProfile(selectedThread.author)}
                        >
                          <PersonIcon className="h-3 w-3 text-neutral-600" />
                        </div>
                        <button
                          onClick={() => setViewingProfile(selectedThread.author)}
                          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                          {selectedThread.author}
                        </button>
                        <span className="text-sm text-neutral-400">·</span>
                        <span className="text-sm text-neutral-500">{selectedThread.timeAgo}</span>
                      </div>
                      <p className="text-sm text-neutral-700 mb-3 break-words min-w-0">
                        {selectedThread.content || "This is the original post content. Users can discuss and share their thoughts here."}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-neutral-50">
                          <button
                            onClick={() => handleVote(selectedThread.id, "up")}
                            className={cn(
                              "p-0.5 rounded hover:bg-neutral-100 transition-colors",
                              selectedThread.userVote === "up" && "text-green-600"
                            )}
                          >
                            <TriangleUpIcon className="h-3.5 w-3.5 text-neutral-500" />
                          </button>
                          <span className="text-xs font-medium text-neutral-500 min-w-[20px] text-center">
                            {(selectedThread.upvotes || 0) - (selectedThread.downvotes || 0)}
                          </span>
                          <button
                            onClick={() => handleVote(selectedThread.id, "down")}
                            className={cn(
                              "p-0.5 rounded hover:bg-neutral-100 transition-colors",
                              selectedThread.userVote === "down" && "text-red-600"
                            )}
                          >
                            <TriangleUpIcon className="h-3.5 w-3.5 rotate-180 text-neutral-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 px-2 py-1 rounded-lg bg-neutral-50">
                          <ChatBubbleIcon className="h-3.5 w-3.5" />
                          <span>{threadReplies.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-w-0">
                      <div className="text-xs font-medium text-neutral-600 mb-2">
                        {threadReplies.length} {threadReplies.length === 1 ? "Reply" : "Replies"}
                      </div>
                      {threadReplies.map((reply) => (
                        <div key={reply.id} className="pb-3 border-b border-[#efefef] last:border-0 break-words min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="h-5 w-5 rounded-full bg-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-300 transition-colors shrink-0"
                              onClick={() => setViewingProfile(reply.author)}
                            >
                              <PersonIcon className="h-2.5 w-2.5 text-neutral-600" />
                            </div>
                            <button
                              onClick={() => setViewingProfile(reply.author)}
                              className="text-xs font-medium text-black hover:text-neutral-700 transition-colors"
                            >
                              {reply.author}
                            </button>
                            <span className="text-xs text-neutral-400 shrink-0">·</span>
                            <span className="text-xs text-neutral-500 shrink-0">{reply.timeAgo}</span>
                          </div>
                          <p className="text-xs text-neutral-700 break-words min-w-0">{reply.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-[#efefef]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handlePostReply();
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <button
                          onClick={handlePostReply}
                          disabled={!replyText.trim()}
                          className="px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
            )}
          </div>

          {isAddPostOpen && (
            <AddPostModal
              category={selectedCategory}
              onClose={() => setIsAddPostOpen(false)}
              onCreate={(title, content, category) => {
                handleAddPost(title, content, category);
              }}
            />
          )}

          {viewingProfile && (
            <UserProfileModal
              username={viewingProfile}
              onClose={() => setViewingProfile(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function PostCard({ post, isSelected, onSelect, onProfileClick, onVote, replyCount }: { post: Post; isSelected: boolean; onSelect: () => void; onProfileClick: (author: string) => void; onVote: (voteType: "up" | "down") => void; replyCount: number }) {
  const displayContent = post.content || "";

  return (
    <div
      className={cn(
        "p-4 rounded-lg border border-[#efefef] bg-white hover:bg-neutral-50 transition-colors cursor-pointer",
        isSelected && "ring-2 ring-black"
      )}
      onClick={onSelect}
    >
      <h3 className="text-base font-semibold text-black mb-2 cursor-pointer hover:text-neutral-700 truncate">
        {post.title}
      </h3>
      {displayContent && (
        <div className="mb-2">
          <p className="text-sm text-neutral-600 break-words min-w-0 line-clamp-2">
            {displayContent}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-300 transition-colors shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick(post.author);
            }}
          >
            <PersonIcon className="h-3 w-3 text-neutral-600" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick(post.author);
            }}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors truncate"
          >
            {post.author}
          </button>
          <span className="text-sm text-neutral-400 shrink-0">·</span>
          <span className="text-sm text-neutral-500 shrink-0">{post.timeAgo}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-neutral-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote("up");
              }}
              className={cn(
                "p-0.5 rounded hover:bg-neutral-100 transition-colors",
                post.userVote === "up" && "text-green-600"
              )}
            >
              <TriangleUpIcon className="h-3.5 w-3.5 text-neutral-500" />
            </button>
            <span className="text-xs font-medium text-neutral-500 min-w-[20px] text-center">
              {(post.upvotes || 0) - (post.downvotes || 0)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote("down");
              }}
              className={cn(
                "p-0.5 rounded hover:bg-neutral-100 transition-colors",
                post.userVote === "down" && "text-red-600"
              )}
            >
              <TriangleUpIcon className="h-3.5 w-3.5 rotate-180 text-neutral-500" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-500 px-2 py-1 rounded-lg bg-neutral-50">
            <ChatBubbleIcon className="h-3.5 w-3.5" />
            <span>{replyCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfileModal({ username, onClose }: { username: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[500px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[16px] font-semibold">User Profile</div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <Cross2Icon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-neutral-200 flex items-center justify-center">
              <PersonIcon className="h-8 w-8 text-neutral-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{username}</h2>
              <p className="text-sm text-neutral-500">Content Creator</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#efefef]">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-black">12</div>
                <div className="text-xs text-neutral-500">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">1.2K</div>
                <div className="text-xs text-neutral-500">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">856</div>
                <div className="text-xs text-neutral-500">Following</div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#efefef]">
            <p className="text-sm text-neutral-600">
              Creator passionate about fashion and lifestyle content. Always open to collaborations!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AddPostModal({
  category,
  onClose,
  onCreate,
}: {
  category: Category;
  onClose: () => void;
  onCreate: (title: string, content: string, category: Category) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[520px]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Add Post</div>
          <div className="text-xs text-neutral-500">Create a new post</div>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              onCreate(title, content, selectedCategory);
            }
          }}
        >
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Category</label>
            <select
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
            >
              {categories.map((cat) => (
                <option key={cat.label} value={cat.label}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Title</label>
            <input
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              required
            />
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Content</label>
            <textarea
              className="w-full h-32 rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
              Cancel
            </button>
            <button type="submit" className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">
              Post
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

