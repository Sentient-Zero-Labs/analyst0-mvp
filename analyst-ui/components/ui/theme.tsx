"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa6";

import { Label } from "./label";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const onClick = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div onClick={onClick} className="cursor-pointer size-full px-2 py-1.5 flex items-center">
      {theme == "dark" ? (
        <button className="flex items-center gap-2">
          <FaSun className="size-9 rounded-md text-foreground/70" />
          <Label className="cursor-pointer font-normal">Toggle Dark Mode</Label>
        </button>
      ) : (
        <button className="flex items-center gap-2">
          <FaMoon onClick={() => setTheme("dark")} className="size-9 rounded-md text-foreground/70" />
          <Label className="cursor-pointer font-normal">Toggle Light Mode</Label>
        </button>
      )}
    </div>
  );
}

export { ThemeProvider, ThemeToggle };
