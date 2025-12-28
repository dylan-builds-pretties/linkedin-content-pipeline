import { cn } from "@/lib/utils";
import { ThumbsUp, MessageCircle, Repeat2, Send } from "lucide-react";

interface LinkedInPreviewProps {
  content: string;
  authorName?: string;
  authorTitle?: string;
  className?: string;
}

export function LinkedInPreview({
  content,
  authorName = "Your Name",
  authorTitle = "Your Title",
  className,
}: LinkedInPreviewProps) {
  const formatContent = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm max-w-xl",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
            {authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
            <p className="text-xs text-gray-500 truncate">{authorTitle}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-500">Just now</span>
              <span className="text-gray-400">-</span>
              <svg
                className="w-3 h-3 text-gray-500"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm0-9.5a.5.5 0 0 1 .5.5v3.793l2.354 2.353a.5.5 0 0 1-.708.708l-2.5-2.5A.5.5 0 0 1 7.5 9V5a.5.5 0 0 1 .5-.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
          {content ? formatContent(content) : (
            <span className="text-gray-400 italic">
              Start typing to see your post preview...
            </span>
          )}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
              </svg>
            </div>
          </div>
          <span>0</span>
        </div>
        <span>0 comments</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-1 flex items-center justify-around border-t border-gray-200">
        <button className="flex items-center gap-2 py-3 px-4 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <ThumbsUp className="w-5 h-5" />
          <span className="text-sm font-medium">Like</span>
        </button>
        <button className="flex items-center gap-2 py-3 px-4 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button className="flex items-center gap-2 py-3 px-4 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <Repeat2 className="w-5 h-5" />
          <span className="text-sm font-medium">Repost</span>
        </button>
        <button className="flex items-center gap-2 py-3 px-4 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <Send className="w-5 h-5" />
          <span className="text-sm font-medium">Send</span>
        </button>
      </div>
    </div>
  );
}
