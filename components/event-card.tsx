"use client";

import { useState, useEffect } from "react";
import type { Event } from "@/app/page";
import { Card } from "@/components/ui/card";

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onAddMessage: (
    eventId: string,
    text: string,
    author: "me" | "partner"
  ) => void;
  language: "ja" | "en";
}

interface TimeElapsed {
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function EventCard({ event, language }: EventCardProps) {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(event.startDate);
      const now = new Date();

      const totalMs = now.getTime() - start.getTime();
      const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));

      let hours = now.getHours() - start.getHours();
      let minutes = now.getMinutes() - start.getMinutes();
      let seconds = now.getSeconds() - start.getSeconds();

      if (seconds < 0) {
        seconds += 60;
        minutes--;
      }
      if (minutes < 0) {
        minutes += 60;
        hours--;
      }
      if (hours < 0) {
        hours += 24;
      }

      setTimeElapsed({ totalDays, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event.startDate]);

  if (!timeElapsed) return null;

  const calculateDetailedTime = () => {
    const start = new Date(event.startDate);
    const now = new Date();
    const totalMs = now.getTime() - start.getTime();

    // Calendar-based year calculation with fractional progress
    let completedYears = now.getFullYear() - start.getFullYear();
    const thisYearAnniversary = new Date(start);
    thisYearAnniversary.setFullYear(now.getFullYear());
    if (thisYearAnniversary > now) {
      completedYears--;
    }
    // Calculate progress toward next year anniversary
    const lastYearAnniversary = new Date(start);
    lastYearAnniversary.setFullYear(start.getFullYear() + completedYears);
    const nextYearAnniversary = new Date(start);
    nextYearAnniversary.setFullYear(start.getFullYear() + completedYears + 1);
    const yearProgress =
      (now.getTime() - lastYearAnniversary.getTime()) /
      (nextYearAnniversary.getTime() - lastYearAnniversary.getTime());
    const totalYears = completedYears + yearProgress;

    // Calendar-based month calculation with fractional progress
    let completedMonths =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    const thisMonthAnniversary = new Date(start);
    thisMonthAnniversary.setMonth(start.getMonth() + completedMonths);
    if (thisMonthAnniversary > now) {
      completedMonths--;
    }
    // Calculate progress toward next month anniversary
    const lastMonthAnniversary = new Date(start);
    lastMonthAnniversary.setMonth(start.getMonth() + completedMonths);
    const nextMonthAnniversary = new Date(start);
    nextMonthAnniversary.setMonth(start.getMonth() + completedMonths + 1);
    const monthProgress =
      (now.getTime() - lastMonthAnniversary.getTime()) /
      (nextMonthAnniversary.getTime() - lastMonthAnniversary.getTime());
    const totalMonths = completedMonths + monthProgress;

    // Keep original calculations for days, hours, minutes, seconds
    const totalSeconds = totalMs / 1000;
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;

    const floorToOneDecimal = (n: number) => Math.floor(n * 10) / 10;

    return {
      years: floorToOneDecimal(totalYears).toFixed(1),
      months: floorToOneDecimal(totalMonths).toFixed(1),
      days: floorToOneDecimal(totalDays).toFixed(1),
      hours: floorToOneDecimal(totalHours).toFixed(1),
      minutes: floorToOneDecimal(totalMinutes).toFixed(1),
      seconds: Math.floor(totalSeconds),
    };
  };

  const detailedTime = calculateDetailedTime();

  const formatDateWithSince = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    const SS = String(date.getSeconds()).padStart(2, "0");

    if (language === "en") {
      return `Since ${yyyy}/${mm}/${dd} ${HH}:${MM}:${SS}`;
    }
    return `${yyyy}年${mm}月${dd}日 ${HH}:${MM}:${SS}から`;
  };

  const labels =
    language === "en"
      ? {
          days: "Days",
          hours: "Hours",
          minutes: "Minutes",
          seconds: "Seconds",
          since: "Since",
          elapsed: "Elapsed Time",
          years: "Years",
          months: "Months",
        }
      : {
          days: "日",
          hours: "時間",
          minutes: "分",
          seconds: "秒",
          since: "起点",
          elapsed: "経過時間",
          years: "年",
          months: "ヶ月",
        };

  return (
    <Card className="p-4 sm:p-5 md:p-6 border-2 shadow-lg flex flex-col h-full max-h-[calc(100vh-180px)] overflow-hidden">
      <div className="mb-3 sm:mb-4 pt-6 text-center flex-shrink-0">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
          {event.title}
        </h3>
        <div className="text-sm sm:text-base text-muted-foreground">
          <p>{formatDateWithSince(event.startDate)}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 sm:py-5 md:py-6 mb-1 sm:mb-2 border-y flex-shrink-0">
        <div className="text-center flex-shrink-0 min-w-0">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tabular-nums leading-none">
            {String(timeElapsed.totalDays).padStart(2, "0")}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground font-medium mt-1 sm:mt-1.5">
            {labels.days}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-muted-foreground/40 pb-3">
          :
        </div>

        <div className="text-center flex-shrink-0 min-w-0">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tabular-nums leading-none">
            {String(timeElapsed.hours).padStart(2, "0")}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground font-medium mt-1 sm:mt-1.5">
            {labels.hours}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-muted-foreground/40 pb-3">
          :
        </div>

        <div className="text-center flex-shrink-0 min-w-0">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tabular-nums leading-none">
            {String(timeElapsed.minutes).padStart(2, "0")}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground font-medium mt-1 sm:mt-1.5">
            {labels.minutes}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-muted-foreground/40 pb-3">
          :
        </div>

        <div className="text-center flex-shrink-0 min-w-0">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tabular-nums leading-none">
            {String(timeElapsed.seconds).padStart(2, "0")}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground font-medium mt-1 sm:mt-1.5">
            {labels.seconds}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 min-h-0 overflow-y-auto">
        <h4 className="text-sm sm:text-base font-semibold text-muted-foreground/70 text-center mb-1">
          {labels.elapsed}
        </h4>
        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 max-w-[260px] mx-auto">
          <div className="flex flex-col gap-2 sm:gap-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">
                {detailedTime.years}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">
                {labels.years}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">
                {detailedTime.months}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">
                {labels.months}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">
                {detailedTime.days}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">
                {labels.days}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">
                {detailedTime.hours}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">
                {labels.hours}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">
                {detailedTime.minutes}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">
                {labels.minutes}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">
                {detailedTime.seconds}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">
                {labels.seconds}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
