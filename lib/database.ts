import { supabase } from './supabase'
import type { Event, EventMessage, Account } from '@/app/page'

// RLS対応のセッション管理
class RLSSessionManager {
  private static STORAGE_KEY = 'pulseUserSession'
  private static currentUserId: string | null = null
  
  static saveSession(user: { id: string; name: string; pairingCode: string }) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    this.currentUserId = user.id
  }
  
  static getSession(): { id: string; name: string; pairingCode: string } | null {
    const saved = localStorage.getItem(this.STORAGE_KEY)
    if (saved) {
      try {
        const session = JSON.parse(saved)
        this.currentUserId = session.id
        return session
      } catch (e) {
        console.error('Failed to parse session:', e)
        this.clearSession()
      }
    }
    return null
  }
  
  static clearSession() {
    localStorage.removeItem(this.STORAGE_KEY)
    this.currentUserId = null
  }
  
  // RLSコンテキスト設定: Supabaseに現在のユーザーIDを伝える
  static async setRLSContext(userId: string) {
    console.log('Setting RLS context for userId:', userId)
    this.currentUserId = userId
    
    try {
      // 新しいセッション設定関数を使用
      const { data, error } = await supabase.rpc('set_pulse_user_context', {
        user_id: userId
      })
      
      console.log('RLS context set result:', { data, error })
      
      if (error) {
        console.warn('Failed to set RLS context:', error)
      }
    } catch (error) {
      console.warn('RLS context setting failed:', error)
    }
  }
  
  static getCurrentUserId(): string | null {
    return this.currentUserId
  }
  
  static async validateAndRefreshSession(): Promise<Account | null> {
    const session = this.getSession()
    console.log('validateAndRefreshSession: session from storage:', session)
    
    if (!session) {
      console.log('validateAndRefreshSession: no session found')
      return null
    }
    
    try {
      // セッション検証（まずログイン可能か確認）
      const db = new DatabaseService()
      console.log('validateAndRefreshSession: attempting login validation')
      
      const loginResult = await db.loginUser(session.name, session.pairingCode, false)
      console.log('validateAndRefreshSession: login result:', loginResult)
      
      if (!loginResult) {
        console.log('validateAndRefreshSession: login failed, clearing session')
        this.clearSession()
        return null
      }
      
      // 完全なアカウント情報を取得（パートナー情報含む）
      console.log('validateAndRefreshSession: getting complete account for:', session.id)
      const completeAccount = await db.getCompleteAccount(session.id)
      console.log('validateAndRefreshSession: complete account result:', completeAccount)
      
      if (!completeAccount) {
        console.log('validateAndRefreshSession: failed to get complete account, clearing session')
        this.clearSession()
        return null
      }
      
      // Update last_login
      await db.updateLastLogin(session.id)
      return completeAccount
    } catch (error) {
      console.error('Session validation failed:', error)
      this.clearSession()
      return null
    }
  }
}

function generateUserId(): string {
  return crypto.randomUUID()
}

export class DatabaseService {
  // User operations
  async createUser(name: string, pairingCode: string): Promise<Account | null> {
    try {
      const userId = generateUserId()
      
      // RLSコンテキスト設定
      await RLSSessionManager.setRLSContext(userId)
      
      const { data, error } = await supabase
        .from('users')
        .insert({ 
          id: userId,
          name, 
          pairing_code: pairingCode 
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        console.error('Error details:', error.details, error.hint)
        return null
      }

      // Save persistent session
      RLSSessionManager.saveSession({
        id: userId,
        name,
        pairingCode
      })

      return {
        userId: data.id,
        userName: data.name,
        pairingCode: data.pairing_code,
      }
    } catch (error) {
      console.error('User creation failed:', error)
      return null
    }
  }

  async getUserByPairingCode(pairingCode: string) {
    try {
      // RLSをバイパスする専用関数を使用
      const { data, error } = await supabase.rpc('find_partner_by_code', {
        search_code: pairingCode
      })

      if (error) {
        console.error('Error finding user:', error)
        return null
      }

      // 0件の場合はnullを返す
      if (!data || data.length === 0) {
        console.log('User not found with pairing code:', pairingCode)
        return null
      }

      // RPC結果を元のフォーマットに変換
      const userData = data[0]
      return {
        id: userData.user_id,
        name: userData.user_name,
        pairing_code: userData.user_pairing_code,
        partner_id: null // パートナー検索時は不要
      }
    } catch (error) {
      console.error('Failed to search partner:', error)
      return null
    }
  }

  async loginUser(name: string, pairingCode: string, saveSession: boolean = true): Promise<Account | null> {
    try {
      // 一旦RLSを回避して認証確認（service roleで実行される必要がある場合の対処）
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .eq('pairing_code', pairingCode)
        .limit(1)

      if (error) {
        console.error('Database error during login:', error)
        return null
      }

      if (!data || data.length === 0) {
        console.log('User not found with credentials:', { name, pairingCode })
        return null
      }

      const userData = data[0]

      // RLSコンテキスト設定
      await RLSSessionManager.setRLSContext(userData.id)

      // Save persistent session
      if (saveSession) {
        RLSSessionManager.saveSession({
          id: userData.id,
          name: userData.name,
          pairingCode: userData.pairing_code
        })
      }

      // 完全なユーザー情報を取得（パートナー情報含む）
      return await this.getCompleteAccount(userData.id)
    } catch (error) {
      console.error('Login failed:', error)
      return null
    }
  }

  async pairUsers(userId: string, partnerCode: string): Promise<boolean> {
    const partner = await this.getUserByPairingCode(partnerCode)
    if (!partner) return false

    // Update both users to be partners
    const { error: error1 } = await supabase
      .from('users')
      .update({ partner_id: partner.id })
      .eq('id', userId)

    const { error: error2 } = await supabase
      .from('users')
      .update({ partner_id: userId })
      .eq('id', partner.id)

    if (error1 || error2) {
      console.error('Error pairing users:', error1 || error2)
      return false
    }

    return true
  }

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, partner:users!partner_id(name, pairing_code)')
      .eq('id', userId)
      .limit(1)

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    return data[0]
  }

  // 完全なアカウント情報を取得する統一関数
  async getCompleteAccount(userId: string): Promise<Account | null> {
    try {
      console.log('getCompleteAccount called for userId:', userId)
      
      await RLSSessionManager.setRLSContext(userId)
      
      // RLSをバイパスしてパートナー情報も含めて取得する専用関数を使用
      const { data, error } = await supabase.rpc('get_user_with_partner_info', {
        user_id_param: userId
      })

      console.log('getCompleteAccount RPC result:', { data, error })

      if (error) {
        console.error('Error getting complete account:', error)
        return null
      }

      if (!data || data.length === 0) {
        console.warn('No data found for userId:', userId)
        return null
      }

      const userData = data[0]
      console.log('Raw userData from RPC:', userData)
      
      const account = {
        userId: userData.id,
        userName: userData.name,
        pairingCode: userData.pairing_code,
        partnerId: userData.partner_id || undefined,
        partnerName: userData.partner_name || undefined,
        partnerPairingCode: userData.partner_pairing_code || undefined,
      }
      
      console.log('Final account object:', account)
      return account
    } catch (error) {
      console.error('Failed to get complete account:', error)
      return null
    }
  }

  // Event operations
  async createEvent(event: Omit<Event, 'id' | 'messages'>, userId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: event.title,
        start_date: event.startDate,
        user_id: userId,
        shared_with_partner: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      startDate: data.start_date,
      messages: [],
    }
  }

  async getEvents(userId: string): Promise<Event[]> {
    try {
      // Ensure RLS context is set
      await RLSSessionManager.setRLSContext(userId)
      
      // RLSポリシーが適切に動作するため、シンプルなクエリを使用
      // パートナーのイベントはRLSポリシーで自動的に含まれる
      const { data, error } = await supabase
        .from('events')
        .select('*, event_messages(*)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting events:', error)
        return []
      }

      if (!data) {
        return []
      }

      return data.map(event => ({
        id: event.id,
        title: event.title,
        startDate: event.start_date,
        messages: event.event_messages.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          createdAt: msg.created_at,
          author: msg.author,
        })),
      }))
    } catch (error) {
      console.error('Failed to get events:', error)
      return []
    }
  }

  async updateEvent(eventId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .update({ title })
      .eq('id', eventId)

    if (error) {
      console.error('Error updating event:', error)
      return false
    }

    return true
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    // Delete messages first
    await supabase
      .from('event_messages')
      .delete()
      .eq('event_id', eventId)

    // Delete event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      return false
    }

    return true
  }

  // Message operations
  async addMessage(
    eventId: string, 
    text: string, 
    author: 'me' | 'partner', 
    userId: string
  ): Promise<EventMessage | null> {
    const { data, error } = await supabase
      .from('event_messages')
      .insert({
        event_id: eventId,
        text,
        author,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding message:', error)
      return null
    }

    return {
      id: data.id,
      text: data.text,
      createdAt: data.created_at,
      author: data.author,
    }
  }

  // Real-time subscriptions
  async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
  }
  
  logout() {
    RLSSessionManager.clearSession()
  }
  
  async tryAutoLogin(): Promise<Account | null> {
    return await RLSSessionManager.validateAndRefreshSession()
  }

  subscribeToEvents(userId: string, callback: (events: Event[]) => void) {
    return supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          this.getEvents(userId).then(callback)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_messages',
        },
        () => {
          this.getEvents(userId).then(callback)
        }
      )
      .subscribe()
  }
}

export const db = new DatabaseService()