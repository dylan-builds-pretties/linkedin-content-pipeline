import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";

interface CursorProps {
  x: number;
  y: number;
  isClicking: boolean;
}

export const Cursor: React.FC<CursorProps> = ({ x, y, isClicking }) => {
  const frame = useCurrentFrame();

  // Cursor pulse animation when clicking
  const clickScale = isClicking
    ? interpolate(frame % 10, [0, 5, 10], [1, 1.2, 1], {
        easing: Easing.out(Easing.cubic),
      })
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${clickScale})`,
        pointerEvents: "none",
        zIndex: 10000,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M5 3l14 9-7 2-2 7-5-18z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
