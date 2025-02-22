"use client";

import { motion, useInView, EasingDefinition } from "framer-motion";
import { useRef } from "react";

interface PanAnimationProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  duration?: number;
  ease?: EasingDefinition; // More specific type for ease
  distance?: number; // Add customizable distance
  className?: string; // Allow custom className
}

export default function PanAnimation({
  children,
  direction = "left",
  duration = 0.8,
  ease = "easeOut",
  distance = 50,
  className = "w-full",
}: PanAnimationProps) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -50px 0px", // Trigger animation slightly before element is in view
  });

  const initialX = direction === "left" ? -distance : distance;

  return (
    <motion.div
      ref={ref}
      initial={{ x: initialX, opacity: 0 }}
      animate={isInView ? { x: 0, opacity: 1 } : { x: initialX, opacity: 0 }}
      transition={{ duration, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
