import type { CSSProperties } from "react";
import type { MediaTransform } from "../types";

export const ABOUT_PORTRAIT_ASPECT_RATIO = "4 / 5";

export const defaultMediaTransform: MediaTransform = {
  cropZoom: 100,
  focalX: 50,
  focalY: 50,
  aspectRatio: "4 / 3",
  displayWidth: null,
  displayHeight: null,
};

export function mediaFrameStyle(value: MediaTransform): CSSProperties {
  return {
    aspectRatio: value.aspectRatio === "auto" ? undefined : value.aspectRatio,
    maxWidth: value.displayWidth ? `${value.displayWidth}px` : undefined,
    height: value.displayHeight ? `${value.displayHeight}px` : undefined,
  };
}

export function mediaImageStyle(value: MediaTransform): CSSProperties {
  return {
    objectPosition: `${value.focalX}% ${value.focalY}%`,
    transform: `scale(${value.cropZoom / 100})`,
  };
}
