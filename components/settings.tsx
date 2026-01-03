"use client";

import type { Event, Account } from "@/app/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Languages, Edit, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatPairingCode } from "@/lib/pairing-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsProps {
  events: Event[];
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (id: string, title: string) => void;
  account: Account;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  language: "ja" | "en";
  onLanguageChange: (lang: "ja" | "en") => void;
  onLogout: () => void;
  onPairPartner: (partnerId: string, partnerName: string) => Promise<boolean>;
}

const themes = [
  {
    id: "blue",
    name: "Blue",
    primary: "oklch(0.55 0.18 240)",
    accent: "oklch(0.65 0.15 220)",
  },
  {
    id: "green",
    name: "Green",
    primary: "oklch(0.55 0.18 160)",
    accent: "oklch(0.65 0.15 140)",
  },
  {
    id: "purple",
    name: "Purple",
    primary: "oklch(0.55 0.18 280)",
    accent: "oklch(0.65 0.15 300)",
  },
  {
    id: "orange",
    name: "Orange",
    primary: "oklch(0.60 0.18 40)",
    accent: "oklch(0.70 0.15 60)",
  },
];

export function Settings({
  events,
  onDeleteEvent,
  onUpdateEvent,
  account,
  selectedTheme,
  onThemeChange,
  language,
  onLanguageChange,
  onLogout,
  onPairPartner,
}: SettingsProps) {
  const [showEditSection, setShowEditSection] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showPairingForm, setShowPairingForm] = useState(false);
  const [pairPartnerName, setPairPartnerName] = useState("");
  const [pairPartnerCode, setPairPartnerCode] = useState("");
  const [copied, setCopied] = useState(false);

  const t = {
    accountInfo: language === "en" ? "Account Information" : "アカウント情報",
    yourName: language === "en" ? "Your Name" : "あなたの名前",
    yourCode: language === "en" ? "Your Code" : "あなたのコード",
    partner: language === "en" ? "Partner" : "パートナー",
    partnerCode: language === "en" ? "Partner Code" : "パートナーのコード",
    pairWithPartner:
      language === "en" ? "Pair with Partner" : "パートナーと繋がる",
    partnerName: language === "en" ? "Partner Name" : "パートナーの名前",
    pair: language === "en" ? "Pair" : "ペアリングする",
    logout: language === "en" ? "Logout" : "ログアウト",
    colorTheme: language === "en" ? "Color Theme" : "カラーテーマ",
    language: language === "en" ? "Language" : "言語",
    eventManagement: language === "en" ? "Event Management" : "イベントの管理",
    editEvents: language === "en" ? "Edit Events" : "イベントを編集する",
    selectEvent:
      language === "en"
        ? "Select an event to edit"
        : "編集するイベントを選択してください",
    noEvents:
      language === "en" ? "No events to edit" : "編集するイベントがありません",
    cancel: language === "en" ? "Cancel" : "キャンセル",
    editEventTitle: language === "en" ? "Edit Event" : "イベントを編集",
    eventName: language === "en" ? "Event Name" : "イベント名",
    save: language === "en" ? "Save" : "保存",
    delete: language === "en" ? "Delete" : "削除",
    confirmDelete:
      language === "en"
        ? "Are you sure you want to delete?"
        : "本当に削除しますか？",
    confirmDeleteDesc:
      language === "en"
        ? "All messages associated with this event will be deleted. This action cannot be undone."
        : "この操作は取り消せません。",
    copyButton: language === "en" ? "Copy" : "コピー",
    copiedButton: language === "en" ? "Copied" : "コピーしました",
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(account.pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = (event: Event) => {
    setEditingEvent({ id: event.id, title: event.title });
    setEditTitle(event.title);
  };

  const handleSaveEdit = () => {
    if (editingEvent && editTitle.trim()) {
      onUpdateEvent(editingEvent.id, editTitle.trim());
      setEditingEvent(null);
      setEditTitle("");
    }
  };

  const handlePairSubmit = () => {
    if (
      pairPartnerName.trim() &&
      pairPartnerCode.trim() &&
      pairPartnerCode.length === 6
    ) {
      const success = onPairPartner(pairPartnerCode, pairPartnerName);
      if (success) {
        setShowPairingForm(false);
        setPairPartnerName("");
        setPairPartnerCode("");
      }
    }
  };

  const handleCodeChange = (value: string) => {
    const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (clean.length <= 6) {
      setPairPartnerCode(clean);
    }
  };

  return (
    <div
      className="space-y-6 pb-4 pt-6 overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 152px)" }}
    >
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          {t.accountInfo}
        </h2>
        <Card className="p-4 bg-card border-border">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t.yourName}</span>
              <span className="font-semibold text-foreground">
                {account.userName}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">{t.yourCode}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-primary text-lg tracking-wide">
                  {formatPairingCode(account.pairingCode)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-7 px-2"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            {account.partnerId ? (
              <>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">{t.partner}</span>
                  <span className="font-semibold text-foreground">
                    {account.partnerName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.partnerCode}</span>
                  <span className="font-mono font-semibold text-primary text-lg tracking-wide">
                    {account.partnerPairingCode ? formatPairingCode(account.partnerPairingCode) : "未取得"}
                  </span>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t">
                {!showPairingForm ? (
                  <Button
                    onClick={() => setShowPairingForm(true)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    {t.pairWithPartner}
                  </Button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="pairPartnerName" className="text-xs">
                        {t.partnerName}
                      </Label>
                      <Input
                        id="pairPartnerName"
                        value={pairPartnerName}
                        onChange={(e) => setPairPartnerName(e.target.value)}
                        placeholder="例: あいこ"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pairPartnerCode" className="text-xs">
                        {t.partnerCode}
                      </Label>
                      <Input
                        id="pairPartnerCode"
                        value={
                          pairPartnerCode.length > 3
                            ? `${pairPartnerCode.slice(
                                0,
                                3
                              )}-${pairPartnerCode.slice(3)}`
                            : pairPartnerCode
                        }
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="ABC-123"
                        className="mt-1 font-mono text-center tracking-wide"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePairSubmit}
                        disabled={
                          !pairPartnerName.trim() ||
                          pairPartnerCode.length !== 6
                        }
                        size="sm"
                        className="flex-1"
                      >
                        {t.pair}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowPairingForm(false);
                          setPairPartnerName("");
                          setPairPartnerCode("");
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
            >
              {t.logout}
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5" />
          {t.colorTheme}
        </h2>
        <Card className="p-4 bg-card border-border">
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTheme === theme.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-transparent hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {theme.name}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
          <Languages className="w-5 h-5" />
          {t.language}
        </h2>
        <Card className="p-4 bg-card border-border">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onLanguageChange("ja")}
              className={`p-4 rounded-lg border-2 transition-all ${
                language === "ja"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-transparent hover:border-primary/50"
              }`}
            >
              <p className="text-sm font-medium text-foreground">日本語</p>
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`p-4 rounded-lg border-2 transition-all ${
                language === "en"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-transparent hover:border-primary/50"
              }`}
            >
              <p className="text-sm font-medium text-foreground">English</p>
            </button>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          {t.eventManagement}
        </h2>
        <Card className="p-4 bg-card border-border">
          {!showEditSection ? (
            <Button
              onClick={() => setShowEditSection(true)}
              variant="outline"
              className="w-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t.editEvents}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                {t.selectEvent}
              </p>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.noEvents}
                </p>
              ) : (
                <>
                  {events.map((event) => (
                    <div key={event.id}>
                      {editingEvent?.id === event.id ? (
                        <Card className="p-4 bg-muted/50 border-primary">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">
                                {t.eventName}
                              </label>
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveEdit}
                                disabled={!editTitle.trim()}
                                className="flex-1"
                              >
                                {t.save}
                              </Button>
                              <Button
                                onClick={() => setEditingEvent(null)}
                                variant="outline"
                                className="flex-1"
                              >
                                {t.cancel}
                              </Button>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                >
                                  {t.delete}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t.confirmDelete}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    「{event.title}」{t.confirmDeleteDesc}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t.cancel}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      onDeleteEvent(event.id);
                                      setEditingEvent(null);
                                      if (events.length === 1) {
                                        setShowEditSection(false);
                                      }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t.delete}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </Card>
                      ) : (
                        <Button
                          onClick={() => handleStartEdit(event)}
                          variant="outline"
                          className="w-full justify-between text-left bg-transparent"
                        >
                          <span className="truncate">{event.title}</span>
                          <Edit className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditSection(false)}
                    className="w-full mt-2"
                  >
                    {t.cancel}
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
