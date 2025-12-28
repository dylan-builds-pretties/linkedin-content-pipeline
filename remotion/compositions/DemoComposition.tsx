import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Video,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { Cursor } from "./Cursor";
import { ClickRipple } from "./ClickRipple";
import { Callout } from "./Callout";
import { buildCameraTargets, getCameraTransform } from "../lib/camera";
import { buildCursorKeyframes, getCursorPosition } from "../lib/cursor";
import type { DemoTrack } from "../lib/types";

interface DemoCompositionProps {
  videoSrc: string;
  eventTrack: DemoTrack;
  showCursor?: boolean;
  showRipples?: boolean;
  showCallouts?: boolean;
  enableZoom?: boolean;
}

export const DemoComposition: React.FC<DemoCompositionProps> = ({
  videoSrc,
  eventTrack,
  showCursor = true,
  showRipples = true,
  showCallouts = true,
  enableZoom = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const t = frame / fps;

  // Build camera targets and cursor keyframes once
  const cameraTargets = useMemo(
    () => (enableZoom ? buildCameraTargets(eventTrack.events, eventTrack.meta) : []),
    [eventTrack, enableZoom]
  );

  const cursorKeyframes = useMemo(
    () => buildCursorKeyframes(eventTrack.events, fps),
    [eventTrack.events, fps]
  );

  // Get current camera transform
  const cameraTransform = getCameraTransform(frame, cameraTargets, eventTrack.meta);

  // Get current cursor position
  const cursorState = getCursorPosition(frame, cursorKeyframes);

  // Find active click events for ripples
  const activeClicks = useMemo(() => {
    return eventTrack.events
      .filter((e) => e.type === "click")
      .map((e) => ({
        point: (e as any).point,
        startFrame: Math.floor(e.t * fps),
      }))
      .filter(
        (click) => frame >= click.startFrame && frame <= click.startFrame + 20
      );
  }, [eventTrack.events, fps, frame]);

  // Find active callouts
  const activeCallouts = useMemo(() => {
    return eventTrack.events
      .filter((e) => e.type === "callout")
      .map((e) => ({
        box: (e as any).box,
        label: (e as any).label,
        startFrame: Math.floor(e.t * fps),
      }))
      .filter(
        (callout) =>
          frame >= callout.startFrame && frame <= callout.startFrame + 60
      );
  }, [eventTrack.events, fps, frame]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      {/* Camera container with zoom/pan */}
      <div
        style={{
          position: "absolute",
          width: eventTrack.meta.width,
          height: eventTrack.meta.height,
          transformOrigin: "center center",
          transform: `
            scale(${cameraTransform.zoom})
            translate(${cameraTransform.translateX / cameraTransform.zoom}px, ${cameraTransform.translateY / cameraTransform.zoom}px)
          `,
        }}
      >
        {/* Base video */}
        <OffthreadVideo
          src={videoSrc}
          style={{
            width: eventTrack.meta.width,
            height: eventTrack.meta.height,
          }}
        />

        {/* Click ripples */}
        {showRipples &&
          activeClicks.map((click, i) => (
            <ClickRipple
              key={`ripple-${click.startFrame}-${i}`}
              x={click.point.x}
              y={click.point.y}
              startFrame={click.startFrame}
            />
          ))}

        {/* Callouts */}
        {showCallouts &&
          activeCallouts.map((callout, i) => (
            <Callout
              key={`callout-${callout.startFrame}-${i}`}
              box={callout.box}
              label={callout.label}
              startFrame={callout.startFrame}
            />
          ))}

        {/* Cursor overlay */}
        {showCursor && (
          <Cursor
            x={cursorState.point.x}
            y={cursorState.point.y}
            isClicking={cursorState.isClicking}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
