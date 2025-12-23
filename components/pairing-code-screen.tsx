"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { formatPairingCode } from "@/lib/pairing-utils"

interface PairingCodeScreenProps {
  code: string
  onAddPartner: () => void
  onContinue: () => void
  language: "ja" | "en"
}

export function PairingCodeScreen({ code, onAddPartner, onContinue, language }: PairingCodeScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const text = {
    ja: {
      title: "あなたのコード",
      subtitle: "このコードをパートナーに共有してください",
      copyButton: "コピー",
      copiedButton: "コピーしました",
      addPartner: "パートナーを追加",
      skip: "スキップ",
      note: "※ このコードは後で設定画面から確認できます",
    },
    en: {
      title: "Your Code",
      subtitle: "Share this code with your partner",
      copyButton: "Copy",
      copiedButton: "Copied",
      addPartner: "Add Partner Now",
      skip: "Skip",
      note: "※ You can find this code later in settings",
    },
  }

  const t = text[language]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-4 rounded-lg border-2 border-primary bg-primary/5 p-8">
          <div className="text-6xl font-bold tracking-widest text-primary">{formatPairingCode(code)}</div>

          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 bg-transparent">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                {t.copiedButton}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t.copyButton}
              </>
            )}
          </Button>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button size="lg" onClick={onAddPartner} className="h-14 text-lg">
            {t.addPartner}
          </Button>

          <Button size="lg" variant="ghost" onClick={onContinue} className="h-14 text-lg">
            {t.skip}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">{t.note}</p>
      </div>
    </div>
  )
}
