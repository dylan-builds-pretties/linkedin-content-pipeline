"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { PublishedPost } from "@/lib/types";
import { formatDate, truncate } from "@/lib/utils";
import { ExternalLink, ThumbsUp, MessageCircle, Share2, Eye } from "lucide-react";

export default function PublishedPage() {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/published");
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch published posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  if (loading) {
    return (
      <div className="p-6">
        <Header title="Published" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header title="Published" />

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No published posts yet.</p>
            <p className="text-sm text-muted-foreground">
              Posts will appear here after they've been published.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{post.title || truncate(post.content, 50)}</h3>
                      {post.linkedinUrl && (
                        <a
                          href={post.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {truncate(post.content, 200)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Published {formatDate(post.publishedAt)}</span>
                    </div>
                  </div>

                  {post.metrics && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1" title="Likes">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.metrics.likes}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Comments">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.metrics.comments}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Shares">
                        <Share2 className="h-4 w-4" />
                        <span>{post.metrics.shares}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Impressions">
                        <Eye className="h-4 w-4" />
                        <span>{post.metrics.impressions}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
