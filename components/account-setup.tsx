"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccountSetupProps {
  onSetup: (userId: string, userName: string, partnerId?: string, partnerName?: string) => void
  onLogin: (userId: string, userName: string) => boolean
  existingAccount: boolean
}

export function AccountSetup({ onSetup, onLogin, existingAccount }: AccountSetupProps) {
  const [mode, setMode] = useState<"login" | "signup">(existingAccount ? "login" : "signup")
  const [step, setStep] = useState<"name" | "code" | "pair">("name")
  const [myName, setMyName] = useState("")
  const [myCode, setMyCode] = useState("")
  const [partnerCode, setPartnerCode] = useState("")
  const [partnerName, setPartnerName] = useState("")
  const [loginName, setLoginName] = useState("")
  const [loginCode, setLoginCode] = useState("")
  const [loginError, setLoginError] = useState(false)

  const handleLoginSubmit = () => {
    if (loginName.trim() && loginCode.trim()) {
      const success = onLogin(loginCode, loginName)
      if (!success) {
        setLoginError(true)
      }
    }
  }

  const handleNameSubmit = () => {
    if (myName.trim()) {
      const userId = Math.random().toString(36).substring(2, 10).toUpperCase()
      setMyCode(userId)
      setStep("code")
    }
  }

  const handleContinueToPairing = () => {
    setStep("pair")
  }

  const handleSkipPairing = () => {
    onSetup(myCode, myName)
  }

  const handlePairWithPartner = () => {
    if (partnerCode && partnerName) {
      onSetup(myCode, myName, partnerCode, partnerName)
    }
  }

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Pulse</h1>
            <p className="text-muted-foreground">大切な時間を記録する</p>
          </div>

          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">ログイン</h2>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>名前またはコードが間違っています</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="loginName" className="text-foreground">
                  あなたの名前
                </Label>
                <Input
                  id="loginName"
                  value={loginName}
                  onChange={(e) => {
                    setLoginName(e.target.value)
                    setLoginError(false)
                  }}
                  placeholder="例: たろう"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="loginCode" className="text-foreground">
                  あなたのコード
                </Label>
                <Input
                  id="loginCode"
                  value={loginCode}
                  onChange={(e) => {
                    setLoginCode(e.target.value.toUpperCase())
                    setLoginError(false)
                  }}
                  placeholder="8文字のコード"
                  maxLength={8}
                  className="mt-1 uppercase font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && loginName.trim() && loginCode.trim()) {
                      handleLoginSubmit()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleLoginSubmit}
                className="w-full"
                size="lg"
                disabled={!loginName.trim() || !loginCode.trim()}
              >
                ログイン
              </Button>
              <Button onClick={() => setMode("signup")} variant="ghost" className="w-full">
                新規アカウント作成
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Pulse</h1>
          <p className="text-muted-foreground">大切な時間を記録する</p>
        </div>

        {step === "name" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">はじめまして</h2>
            <p className="text-sm text-muted-foreground mb-6">あなたの名前を教えてください</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="myName" className="text-foreground">
                  あなたの名前
                </Label>
                <Input
                  id="myName"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="例: たろう"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && myName.trim()) {
                      handleNameSubmit()
                    }
                  }}
                />
              </div>
              <Button onClick={handleNameSubmit} className="w-full" size="lg" disabled={!myName.trim()}>
                次へ
              </Button>
              {existingAccount && (
                <Button onClick={() => setMode("login")} variant="ghost" className="w-full">
                  既にアカウントをお持ちの方
                </Button>
              )}
            </div>
          </Card>
        )}

        {step === "code" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">あなたのコード</h2>
            <Alert className="mb-4 bg-primary/10 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-foreground">
                <strong>重要:</strong> この名前とコードは再ログイン時に必要です。必ずメモしてください。
              </AlertDescription>
            </Alert>
            <div className="bg-card border-2 border-primary/30 p-4 rounded-lg mb-2">
              <p className="text-xs text-muted-foreground mb-1">あなたの名前</p>
              <p className="text-lg font-semibold text-foreground mb-3">{myName}</p>
              <p className="text-xs text-muted-foreground mb-1">あなたのコード</p>
              <p className="text-3xl font-bold text-primary tracking-wider font-mono">{myCode}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              このコードをパートナーに共有してください。パートナーと繋がることで、イベントを共有できます。
            </p>
            <div className="space-y-3">
              <Button onClick={handleContinueToPairing} className="w-full" size="lg">
                パートナーと繋がる
              </Button>
              <Button onClick={handleSkipPairing} variant="ghost" className="w-full">
                今はスキップ
              </Button>
            </div>
          </Card>
        )}

        {step === "pair" && (
          <>
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">あなたのコード</h2>
              <div className="bg-primary/10 p-4 rounded-lg text-center mb-4">
                <p className="text-3xl font-bold text-primary tracking-wider">{myCode}</p>
              </div>
              <p className="text-xs text-muted-foreground">このコードをパートナーに共有してください</p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">パートナーと繋がる</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="partnerName" className="text-foreground">
                    パートナーの名前
                  </Label>
                  <Input
                    id="partnerName"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="例: あいこ"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerCode" className="text-foreground">
                    パートナーのコード
                  </Label>
                  <Input
                    id="partnerCode"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                    placeholder="8文字のコード"
                    maxLength={8}
                    className="mt-1 uppercase"
                  />
                </div>
                <Button
                  onClick={handlePairWithPartner}
                  disabled={!partnerCode || !partnerName || partnerCode.length !== 8}
                  className="w-full"
                >
                  ペアリングする
                </Button>
              </div>
            </Card>

            <Button onClick={handleSkipPairing} variant="ghost" className="w-full">
              今はスキップ
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
