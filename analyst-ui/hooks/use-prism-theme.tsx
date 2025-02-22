"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export const usePrismTheme = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Dynamically import theme based on current theme
    if (theme === "dark") {
      // @ts-expect-error - this is a css file
      import("prismjs/themes/prism-tomorrow.css");
    } else {
      // @ts-expect-error - this is a css file
      import("prismjs/themes/prism.css");
    }
  }, [theme]);
};
