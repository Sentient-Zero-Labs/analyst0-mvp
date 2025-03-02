"use client";

import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Button } from "./button";
import Image from "next/image";

interface CarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
}

export function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const previousImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9]">
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            className="object-contain"
          />
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70"
          onClick={previousImage}
        >
          <LuChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70"
          onClick={nextImage}
        >
          <LuChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-primary scale-100" 
                : "bg-muted-foreground/30 scale-90 hover:scale-95 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
} 