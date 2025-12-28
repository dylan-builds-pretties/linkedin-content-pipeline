import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import type { Box } from "../lib/types";

interface CalloutProps {
  box: Box;
  label: string;
  startFrame: number;
  durationFrames?: number;
}

export const Callout: React.FC<CalloutProps> = ({
  box,
  label,
  startFrame,
  durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const progress = frame - startFrame;

  if (progress < 0 || progress > durationFrames) {
    return null;
  }

  const normalizedProgress = progress / durationFrames;

  // Animate in
  const slideIn = interpolate(normalizedProgress, [0, 0.1], [20, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  // Animate out
  const fadeOut = interpolate(normalizedProgress, [0.8, 1], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
  });

  // Highlight box
  const highlightOpacity = interpolate(
    normalizedProgress,
    [0, 0.1, 0.9, 1],
    [0, 0.3, 0.3, 0],
    {
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <>
      {/* Highlight overlay */}
      <div
        style={{
          position: "absolute",
          left: box.x - 4,
          top: box.y - 4,
          width: box.w + 8,
          height: box.h + 8,
          border: "3px solid rgba(59, 130, 246, 0.8)",
          borderRadius: 8,
          backgroundColor: `rgba(59, 130, 246, ${highlightOpacity})`,
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          left: box.x + box.w + 12,
          top: box.y + box.h / 2,
          transform: `translateY(-50%) translateX(${slideIn}px)`,
          opacity: fadeOut,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          color: "white",
          padding: "8px 16px",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 500,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {label}
      </div>
    </>
  );
};
