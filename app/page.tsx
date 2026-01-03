"use client";

import { useState, useEffect } from "react";
import { EventList } from "@/components/event-list";
import { AddEventForm } from "@/components/add-event-form";
import { Settings } from "@/components/settings";
import { WelcomeScreen } from "@/components/welcome-screen";
import { PairingCodeScreen } from "@/components/pairing-code-screen";
import { AddPartnerScreen } from "@/components/add-partner-screen";
import { Plus, Clock, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePairingCode } from "@/lib/pairing-utils";
import { db } from "@/lib/database";

export interface Event {
  id: string;
  title: string;
  startDate: string; // ISO string
  messages: EventMessage[];
}

export interface EventMessage {
  id: string;
  text: string;
  createdAt: string;
  author: "me" | "partner";
}

export interface Account {
  userId: string;
  userName: string;
  pairingCode?: string;
  partnerId?: string;
  partnerName?: string;
  partnerPairingCode?: string;
}

type View = "pulse" | "settings";
type AuthFlow = "welcome" | "code-display" | "add-partner" | "authenticated";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [currentView, setCurrentView] = useState<View>("pulse");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("blue");
  const [language, setLanguage] = useState<"ja" | "en">("ja");

  const [authFlow, setAuthFlow] = useState<AuthFlow>("welcome");
  const [tempUserData, setTempUserData] = useState<{
    name: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Try auto-login first (persistent session)
      const autoLoginAccount = await db.tryAutoLogin();
      if (autoLoginAccount) {
        setAccount(autoLoginAccount);
        setAuthFlow("authenticated");

        // Load events from database
        const dbEvents = await db.getEvents(autoLoginAccount.userId);
        setEvents(dbEvents);

        // Set up real-time subscription
        const subscription = db.subscribeToEvents(
          autoLoginAccount.userId,
          setEvents
        );
        return () => subscription.unsubscribe();
      } else {
        // Fallback: try legacy localStorage account
        const savedAccount = localStorage.getItem("pulseAccount");
        if (savedAccount) {
          try {
            const parsed = JSON.parse(savedAccount);
            
            // Check if pairingCode is missing (legacy account)
            if (!parsed.pairingCode) {
              console.warn("Legacy account missing pairingCode, clearing localStorage");
              localStorage.removeItem("pulseAccount");
              return;
            }
            
            setAccount(parsed);
            setAuthFlow("authenticated");

            // Load events from database
            const dbEvents = await db.getEvents(parsed.userId);
            setEvents(dbEvents);

            // Set up real-time subscription
            const subscription = db.subscribeToEvents(parsed.userId, setEvents);
            return () => subscription.unsubscribe();
          } catch (e) {
            console.error("Failed to parse legacy account:", e);
            localStorage.removeItem("pulseAccount");
          }
        }

        // Final fallback: load from localStorage events only
        const saved = localStorage.getItem("pulseEvents");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setEvents(parsed);
          } catch (e) {
            console.error("Failed to parse saved events");
            setEvents([]);
          }
        }
      }
    };

    initializeApp();

    const savedTheme = localStorage.getItem("pulseTheme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }

    const savedLanguage = localStorage.getItem("pulseLanguage");
    if (savedLanguage === "en" || savedLanguage === "ja") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pulseTheme", selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    localStorage.setItem("pulseLanguage", language);
  }, [language]);

  useEffect(() => {
    // Keep localStorage as offline backup
    if (events.length > 0) {
      localStorage.setItem("pulseEvents", JSON.stringify(events));
    }
  }, [events]);

  const handleWelcomeComplete = (name: string, mode: "create" | "join") => {
    const code = generatePairingCode();
    setTempUserData({ name, code });

    if (mode === "create") {
      setAuthFlow("code-display");
    } else {
      setAuthFlow("add-partner");
    }
  };

  const handleCodeContinue = async () => {
    if (tempUserData) {
      // Create user in database
      const newAccount = await db.createUser(
        tempUserData.name,
        tempUserData.code
      );
      if (newAccount) {
        setAccount(newAccount);
        localStorage.setItem("pulseAccount", JSON.stringify(newAccount));
        setAuthFlow("authenticated");

        // Set up real-time subscription
        const subscription = db.subscribeToEvents(newAccount.userId, setEvents);
      }
    }
  };

  const handleAddPartnerFromCode = () => {
    setAuthFlow("add-partner");
  };

  const handlePartnerConnect = async (
    partnerName: string,
    partnerCode: string
  ) => {
    if (tempUserData) {
      // Create user first
      const newAccount = await db.createUser(
        tempUserData.name,
        tempUserData.code
      );
      if (newAccount) {
        // Pair with partner
        const pairingSuccess = await db.pairUsers(
          newAccount.userId,
          partnerCode
        );
        if (pairingSuccess) {
          // Get complete updated account info
          const updatedAccount = await db.getCompleteAccount(newAccount.userId);
          if (updatedAccount) {
            setAccount(updatedAccount);
            localStorage.setItem(
              "pulseAccount",
              JSON.stringify(updatedAccount)
            );
            setAuthFlow("authenticated");

            // Set up real-time subscription
            const subscription = db.subscribeToEvents(
              updatedAccount.userId,
              setEvents
            );
          }
        }
      }
    }
  };

  const handleBackFromPartner = () => {
    setAuthFlow("code-display");
  };

  const handleLogin = async (name: string, code: string) => {
    const loginAccount = await db.loginUser(name, code);
    if (loginAccount) {
      setAccount(loginAccount);
      localStorage.setItem("pulseAccount", JSON.stringify(loginAccount));
      setAuthFlow("authenticated");

      // Load user's events
      const userEvents = await db.getEvents(loginAccount.userId);
      setEvents(userEvents);

      // Set up real-time subscription
      const subscription = db.subscribeToEvents(loginAccount.userId, setEvents);
    } else {
      alert("ログインに失敗しました。名前とコードを確認してください。");
    }
  };

  const handleLogout = () => {
    db.logout(); // Clear persistent session
    localStorage.removeItem("pulseAccount"); // Clear legacy account
    setAccount(null);
    setAuthFlow("welcome");
    setTempUserData(null);
    setEvents([]); // Clear events on logout
  };

  const handlePairPartner = async (partnerId: string, partnerName: string) => {
    if (account) {
      const success = await db.pairUsers(account.userId, partnerId);
      if (success) {
        // Get complete updated account info
        const updatedAccount = await db.getCompleteAccount(account.userId);
        if (updatedAccount) {
          setAccount(updatedAccount);
          localStorage.setItem("pulseAccount", JSON.stringify(updatedAccount));

          // Refresh events to include partner's events
          const events = await db.getEvents(account.userId);
          setEvents(events);
          return true;
        }
      }
    }
    return false;
  };

  const handleUpdateUserName = async (newName: string) => {
    if (account) {
      const success = await db.updateUserName(account.userId, newName);
      if (success) {
        // Update local account state
        const updatedAccount = { ...account, userName: newName };
        setAccount(updatedAccount);
        localStorage.setItem("pulseAccount", JSON.stringify(updatedAccount));
        
        // Update session storage
        const sessionData = { 
          id: account.userId, 
          name: newName, 
          pairingCode: account.pairingCode || "" 
        };
        localStorage.setItem('pulseUserSession', JSON.stringify(sessionData));
        
        return true;
      }
    }
    return false;
  };

  const handleAddEvent = async (title: string, startDate: string) => {
    if (account) {
      const newEvent = await db.createEvent(
        { title, startDate },
        account.userId
      );
      if (newEvent) {
        setEvents([...events, newEvent]);
      }
    }
    setShowAddForm(false);
  };

  const handleDeleteEvent = async (id: string) => {
    const success = await db.deleteEvent(id);
    if (success) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const handleUpdateEvent = async (id: string, title: string) => {
    const success = await db.updateEvent(id, title);
    if (success) {
      setEvents(events.map((e) => (e.id === id ? { ...e, title } : e)));
    }
  };

  const handleAddMessage = async (
    eventId: string,
    text: string,
    author: "me" | "partner"
  ) => {
    if (account) {
      const newMessage = await db.addMessage(
        eventId,
        text,
        author,
        account.userId
      );
      if (newMessage) {
        setEvents(
          events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  messages: [...e.messages, newMessage],
                }
              : e
          )
        );
      }
    }
  };

  if (authFlow === "welcome") {
    return (
      <WelcomeScreen
        onComplete={handleWelcomeComplete}
        onLogin={handleLogin}
        language={language}
      />
    );
  }

  if (authFlow === "code-display" && tempUserData) {
    return (
      <PairingCodeScreen
        code={tempUserData.code}
        onAddPartner={handleAddPartnerFromCode}
        onContinue={handleCodeContinue}
        language={language}
      />
    );
  }

  if (authFlow === "add-partner" && tempUserData) {
    return (
      <AddPartnerScreen
        onConnect={handlePartnerConnect}
        onBack={handleBackFromPartner}
        language={language}
      />
    );
  }

  const getPageTitle = () => {
    if (showAddForm) return language === "en" ? "Add Event" : "イベントを追加";
    return currentView === "pulse" ? "Pulse" : "Setting";
  };

  const t = {
    noEvents: language === "en" ? "No events yet" : "まだイベントがありません",
    addFirst:
      language === "en" ? "Add Your First Event" : "最初のイベントを追加",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-primary border-b border-primary-foreground/10 px-4 h-14 flex items-center justify-center relative">
        <h1 className="text-lg font-semibold text-primary-foreground">
          {getPageTitle()}
        </h1>
        {currentView === "pulse" && !showAddForm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAddForm(true)}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10 w-10 h-10 absolute right-4"
          >
            <Plus className="w-6 h-6" />
          </Button>
        )}
      </header>

      <main
        className="flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 152px)" }}
      >
        <div className="container mx-auto px-4 h-full max-w-2xl">
          {currentView === "pulse" && (
            <>
              {showAddForm && (
                <AddEventForm
                  onAdd={handleAddEvent}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {!showAddForm && (
                <>
                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-6">{t.noEvents}</p>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        size="lg"
                        className="w-full max-w-xs"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        {t.addFirst}
                      </Button>
                    </div>
                  ) : (
                    <EventList
                      events={events}
                      onDelete={handleDeleteEvent}
                      onAddMessage={handleAddMessage}
                      language={language}
                    />
                  )}
                </>
              )}
            </>
          )}

          {currentView === "settings" && account && (
            <Settings
              events={events}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEvent={handleUpdateEvent}
              account={account}
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
              language={language}
              onLanguageChange={setLanguage}
              onLogout={handleLogout}
              onPairPartner={handlePairPartner}
              onUpdateUserName={handleUpdateUserName}
            />
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-24 flex items-end pb-8 justify-around px-4">
        <button
          onClick={() => {
            setCurrentView("pulse");
            setShowAddForm(false);
          }}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            currentView === "pulse" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs font-medium">Pulse</span>
        </button>
        <button
          onClick={() => {
            setCurrentView("settings");
            setShowAddForm(false);
          }}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            currentView === "settings"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Setting</span>
        </button>
      </nav>
    </div>
  );
}
