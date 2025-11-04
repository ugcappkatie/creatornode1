"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.04)] border border-[#efefef]",
        padded && "p-5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[15px] font-semibold tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}


