"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"

interface AddPartnerScreenProps {
  onConnect: (partnerName: string, partnerCode: string) => Promise<void>
  onBack: () => void
  language: "ja" | "en"
}

export function AddPartnerScreen({ onConnect, onBack, language }: AddPartnerScreenProps) {
  const [partnerName, setPartnerName] = useState("")
  const [partnerCode, setPartnerCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConnect = async () => {
    if (!partnerName.trim() || !partnerCode.trim()) return

    setLoading(true)
    setError("")

    try {
      await onConnect(partnerName, partnerCode.replace("-", "").toUpperCase())
    } catch (err: any) {
      setError(err.message || "Connection failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase()
    if (clean.length <= 6) {
      setPartnerCode(clean)
    }
  }

  const text = {
    ja: {
      title: "パートナーを追加",
      partnerName: "パートナーの名前",
      partnerCode: "パートナーのコード",
      codePlaceholder: "ABC-123",
      connect: "接続",
      back: "戻る",
      invalidCode: "コードが見つかりません",
    },
    en: {
      title: "Add Partner",
      partnerName: "Partner's Name",
      partnerCode: "Partner's Code",
      codePlaceholder: "ABC-123",
      connect: "Connect",
      back: "Back",
      invalidCode: "Invalid code",
    },
  }

  const t = text[language]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{t.title}</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-name">{t.partnerName}</Label>
            <Input
              id="partner-name"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner-code">{t.partnerCode}</Label>
            <Input
              id="partner-code"
              type="text"
              value={partnerCode.length > 3 ? `${partnerCode.slice(0, 3)}-${partnerCode.slice(3)}` : partnerCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={t.codePlaceholder}
              className="h-12 text-center text-2xl font-mono tracking-widest"
              maxLength={7}
            />
          </div>

          {error && <p className="text-sm text-destructive">{t.invalidCode}</p>}

          <Button
            size="lg"
            onClick={handleConnect}
            disabled={!partnerName.trim() || partnerCode.length !== 6 || loading}
            className="h-14 w-full text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.connect}
              </>
            ) : (
              t.connect
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
