import React from "react";
import { twMerge } from "tailwind-merge";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        "animate-pulse rounded-xl bg-surface-container-high/60",
        className
      )}
      {...props}
    />
  );
}
