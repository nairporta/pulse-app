"use client"

import type { Event } from "@/app/page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock } from "lucide-react"

interface EventDetailDialogProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMessage: (eventId: string, text: string, author: "me" | "partner") => void
  language: "ja" | "en"
}

export function EventDetailDialog({ event, open, onOpenChange, language }: EventDetailDialogProps) {
  const calculateDetailedTime = () => {
    const start = new Date(event.startDate)
    const now = new Date()
    const totalMs = now.getTime() - start.getTime()

    // Calendar-based year calculation with fractional progress
    let completedYears = now.getFullYear() - start.getFullYear()
    const thisYearAnniversary = new Date(start)
    thisYearAnniversary.setFullYear(now.getFullYear())
    if (thisYearAnniversary > now) {
      completedYears--
    }
    // Calculate progress toward next year anniversary
    const lastYearAnniversary = new Date(start)
    lastYearAnniversary.setFullYear(start.getFullYear() + completedYears)
    const nextYearAnniversary = new Date(start)
    nextYearAnniversary.setFullYear(start.getFullYear() + completedYears + 1)
    const yearProgress =
      (now.getTime() - lastYearAnniversary.getTime()) /
      (nextYearAnniversary.getTime() - lastYearAnniversary.getTime())
    const totalYears = completedYears + yearProgress

    // Calendar-based month calculation with fractional progress
    let completedMonths =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth())
    const thisMonthAnniversary = new Date(start)
    thisMonthAnniversary.setMonth(start.getMonth() + completedMonths)
    if (thisMonthAnniversary > now) {
      completedMonths--
    }
    // Calculate progress toward next month anniversary
    const lastMonthAnniversary = new Date(start)
    lastMonthAnniversary.setMonth(start.getMonth() + completedMonths)
    const nextMonthAnniversary = new Date(start)
    nextMonthAnniversary.setMonth(start.getMonth() + completedMonths + 1)
    const monthProgress =
      (now.getTime() - lastMonthAnniversary.getTime()) /
      (nextMonthAnniversary.getTime() - lastMonthAnniversary.getTime())
    const totalMonths = completedMonths + monthProgress

    // Keep original calculations for days, hours, minutes, seconds
    const totalSeconds = totalMs / 1000
    const totalMinutes = totalSeconds / 60
    const totalHours = totalMinutes / 60
    const totalDays = totalHours / 24

    const floorToOneDecimal = (n: number) => Math.floor(n * 10) / 10

    return {
      years: floorToOneDecimal(totalYears).toFixed(1),
      months: floorToOneDecimal(totalMonths).toFixed(1),
      days: floorToOneDecimal(totalDays).toFixed(1),
      hours: floorToOneDecimal(totalHours).toFixed(1),
      minutes: floorToOneDecimal(totalMinutes).toFixed(1),
      seconds: Math.floor(totalSeconds),
    }
  }

  const formatStartDate = (dateString: string) => {
    const date = new Date(dateString)
    if (language === "en") {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    }
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const elapsed = calculateDetailedTime()

  const t = {
    startDate: language === "en" ? "Start Date" : "起点",
    elapsed: language === "en" ? "Time Elapsed" : "経過時間",
    years: language === "en" ? "Years" : "年",
    months: language === "en" ? "Months" : "ヶ月",
    days: language === "en" ? "Days" : "日",
    hours: language === "en" ? "Hours" : "時間",
    minutes: language === "en" ? "Minutes" : "分",
    seconds: language === "en" ? "Seconds" : "秒",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.startDate}
            </h3>
            <p className="text-base text-foreground bg-muted/50 rounded-lg p-3">{formatStartDate(event.startDate)}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t.elapsed}
            </h3>
            <div className="space-y-2">
              <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground tabular-nums">{elapsed.years}</span>
                <span className="text-sm text-muted-foreground">{t.years}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground tabular-nums">{elapsed.months}</span>
                <span className="text-sm text-muted-foreground">{t.months}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground tabular-nums">{elapsed.days}</span>
                <span className="text-sm text-muted-foreground">{t.days}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground tabular-nums">{elapsed.hours}</span>
                <span className="text-sm text-muted-foreground">{t.hours}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground tabular-nums">{elapsed.minutes}</span>
                <span className="text-sm text-muted-foreground">{t.minutes}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground tabular-nums">{elapsed.seconds}</span>
                <span className="text-sm text-muted-foreground">{t.seconds}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
