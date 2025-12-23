"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface WelcomeScreenProps {
  onComplete: (name: string, mode: "create" | "join") => void
  language: "ja" | "en"
}

export function WelcomeScreen({ onComplete, language }: WelcomeScreenProps) {
  const [name, setName] = useState("")
  const [step, setStep] = useState<"name" | "mode">("name")

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep("mode")
    }
  }

  const text = {
    ja: {
      title: "Pulse",
      subtitle: "大切な瞬間を記録しましょう",
      namePlaceholder: "名前を入力",
      getStarted: "はじめる",
      createNew: "新しく作成",
      joinPartner: "パートナーと接続",
      note: "※ 認証情報（名前とコード）は必ずメモしてください",
    },
    en: {
      title: "Pulse",
      subtitle: "Track your special moments",
      namePlaceholder: "Enter your name",
      getStarted: "Get Started",
      createNew: "Create New",
      joinPartner: "Join Partner",
      note: "※ Please save your credentials (name and code)",
    },
  }

  const t = text[language]

  if (step === "mode") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-center text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">{name}さん、ようこそ</p>

          <Button size="lg" onClick={() => onComplete(name, "create")} className="h-14 text-lg">
            {t.createNew}
          </Button>

          <Button size="lg" variant="outline" onClick={() => onComplete(name, "join")} className="h-14 text-lg">
            {t.joinPartner}
          </Button>

          <p className="text-center text-xs text-yellow-600 dark:text-yellow-400">{t.note}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2">
        <Clock className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <p className="text-center text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.namePlaceholder}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            className="h-12 text-lg"
          />
        </div>

        <Button size="lg" onClick={handleNameSubmit} disabled={!name.trim()} className="h-14 w-full text-lg">
          {t.getStarted}
        </Button>
      </div>
    </div>
  )
}
