"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Event } from "@/app/page";
import { EventCard } from "./event-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface EventListProps {
  events: Event[];
  onDelete: (id: string) => void;
  onAddMessage: (
    eventId: string,
    text: string,
    author: "me" | "partner"
  ) => void;
  language: "ja" | "en";
}

export function EventList({
  events,
  onDelete,
  onAddMessage,
  language,
}: EventListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-6">
      <div className="relative w-full px-2 sm:px-4 overflow-hidden flex-1 flex items-center justify-center">
        {events.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </>
        )}

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <EventCard
              event={events[currentIndex]}
              onDelete={onDelete}
              onAddMessage={onAddMessage}
              language={language}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {events.length > 1 && (
        <div className="flex gap-2 mt-3 flex-shrink-0">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-6 h-2"
                  : "bg-primary/30 w-2 h-2"
              }`}
              aria-label={`Go to event ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
