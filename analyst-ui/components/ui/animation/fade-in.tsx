"use client";

import { motion, useInView, EasingDefinition } from "framer-motion";
import { useRef } from "react";

interface FadeAnimationProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "none";
  duration?: number;
  ease?: EasingDefinition;
  distance?: number;
  delay?: number;
  className?: string;
}

export default function FadeAnimation({
  children,
  direction = "none",
  duration = 0.8,
  ease = "easeOut",
  distance = 50,
  delay = 0,
  className = "w-full",
}: FadeAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -50px 0px",
  });

  const getInitialY = () => {
    switch (direction) {
      case "up":
        return distance;
      case "down":
        return -distance;
      default:
        return 0;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        y: getInitialY(),
        opacity: 0,
      }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: getInitialY(), opacity: 0 }}
      transition={{
        duration,
        ease,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
