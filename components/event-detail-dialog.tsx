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

    const msPerSecond = 1000
    const msPerMinute = msPerSecond * 60
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30.44 // Average month length
    const msPerYear = msPerDay * 365.25 // Account for leap years

    return {
      years: (totalMs / msPerYear).toFixed(1),
      months: (totalMs / msPerMonth).toFixed(1),
      days: (totalMs / msPerDay).toFixed(1),
      hours: (totalMs / msPerHour).toFixed(1),
      minutes: (totalMs / msPerMinute).toFixed(1),
      seconds: (totalMs / msPerSecond).toFixed(0),
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
