import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";

interface ClickRippleProps {
  x: number;
  y: number;
  startFrame: number;
  durationFrames?: number;
  color?: string;
}

export const ClickRipple: React.FC<ClickRippleProps> = ({
  x,
  y,
  startFrame,
  durationFrames = 15,
  color = "rgba(59, 130, 246, 0.5)",
}) => {
  const frame = useCurrentFrame();
  const progress = frame - startFrame;

  if (progress < 0 || progress > durationFrames) {
    return null;
  }

  const normalizedProgress = progress / durationFrames;

  const scale = interpolate(normalizedProgress, [0, 1], [0.5, 2.5], {
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(normalizedProgress, [0, 0.3, 1], [0.8, 0.5, 0], {
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};
