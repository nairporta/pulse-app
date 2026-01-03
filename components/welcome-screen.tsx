"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface WelcomeScreenProps {
  onComplete: (name: string, mode: "create" | "join") => void
  onLogin: (name: string, code: string) => void
  language: "ja" | "en"
}

export function WelcomeScreen({ onComplete, onLogin, language }: WelcomeScreenProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"welcome" | "name" | "mode" | "login">("welcome")

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
      loginExisting: "既存アカウントでログイン",
      codePlaceholder: "ペアリングコードを入力",
      login: "ログイン",
      back: "戻る",
      note: "※ 認証情報（名前とコード）は必ずメモしてください",
      welcomeMessage: "アカウントをお持ちですか？",
      haveAccount: "既存アカウントでログイン", 
      newAccount: "新しいアカウントを作成",
    },
    en: {
      title: "Pulse",
      subtitle: "Track your special moments",
      namePlaceholder: "Enter your name",
      getStarted: "Get Started",
      createNew: "Create New",
      joinPartner: "Join Partner",
      loginExisting: "Login with existing account",
      codePlaceholder: "Enter your pairing code",
      login: "Login",
      back: "Back",
      note: "※ Please save your credentials (name and code)",
      welcomeMessage: "Do you have an account?",
      haveAccount: "Login with existing account",
      newAccount: "Create new account",
    },
  }

  const t = text[language]

  if (step === "welcome") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-center text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">{t.welcomeMessage}</p>
          
          <Button 
            size="lg" 
            onClick={() => setStep("login")} 
            className="h-14 text-lg"
          >
            {t.haveAccount}
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setStep("name")} 
            className="h-14 text-lg"
          >
            {t.newAccount}
          </Button>
        </div>
      </div>
    )
  }

  if (step === "login") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-center text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginName">{t.namePlaceholder}</Label>
            <Input
              id="loginName"
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loginCode">{t.codePlaceholder}</Label>
            <Input
              id="loginCode"
              type="text"
              placeholder={t.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && code.trim() && onLogin(name, code)}
              className="h-12 text-lg"
            />
          </div>

          <Button 
            size="lg" 
            onClick={() => onLogin(name, code)} 
            disabled={!name.trim() || !code.trim()} 
            className="h-14 w-full text-lg"
          >
            {t.login}
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setStep("welcome")} 
            className="h-14 w-full text-lg"
          >
            {t.back}
          </Button>
        </div>
      </div>
    )
  }

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
          
          <Button size="lg" variant="secondary" onClick={() => setStep("welcome")} className="h-14 text-lg">
            {t.back}
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
