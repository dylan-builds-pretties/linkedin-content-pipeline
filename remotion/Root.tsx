import React from "react";
import { Composition } from "remotion";
import { DemoComposition } from "./compositions/DemoComposition";
import type { DemoTrack } from "./lib/types";

// Default event track for preview
const defaultEventTrack: DemoTrack = {
  meta: { width: 1920, height: 1080, fps: 30 },
  events: [],
};

interface DemoCompositionProps {
  videoSrc: string;
  eventTrack: DemoTrack;
  showCursor?: boolean;
  showRipples?: boolean;
  showCallouts?: boolean;
  enableZoom?: boolean;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoComposition as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "",
          eventTrack: defaultEventTrack,
          showCursor: true,
          showRipples: true,
          showCallouts: true,
          enableZoom: true,
        }}
      />
    </>
  );
};
