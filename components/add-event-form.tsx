"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface AddEventFormProps {
  onAdd: (title: string, startDate: string) => void
  onCancel: () => void
}

export function AddEventForm({ onAdd, onCancel }: AddEventFormProps) {
  const [step, setStep] = useState<"capture" | "name">("capture")
  const [capturedTime, setCapturedTime] = useState<string>("")
  const [title, setTitle] = useState("")

  const handleCaptureTime = () => {
    const now = new Date().toISOString()
    setCapturedTime(now)
    setStep("name")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && capturedTime) {
      onAdd(title, capturedTime)
      setTitle("")
      setCapturedTime("")
      setStep("capture")
    }
  }

  const handleBack = () => {
    setStep("capture")
    setCapturedTime("")
  }

  return (
    <div className="pt-6">
      <Card className="p-6 bg-card border-border shadow-md">
      {step === "capture" && (
        <div className="text-center space-y-6">
          <h3 className="text-xl font-semibold text-foreground">新しいイベントを記録</h3>
          <p className="text-muted-foreground text-sm">大切な瞬間をタップして記録してください</p>

          <button
            onClick={handleCaptureTime}
            className="w-full aspect-square max-w-[280px] mx-auto rounded-full bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center group"
          >
            <Clock className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
          </button>

          <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
            キャンセル
          </Button>
        </div>
      )}

      {step === "name" && (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">イベントに名前をつける</h3>
          <p className="text-sm text-muted-foreground mb-4">
            記録時刻: {new Date(capturedTime).toLocaleString("ja-JP")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-foreground">
                タイトル
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：婚約、第一子誕生"
                required
                className="mt-1"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                戻る
              </Button>
              <Button type="submit" className="flex-1">
                保存
              </Button>
            </div>
          </form>
        </div>
      )}
      </Card>
    </div>
  )
}
