import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optimized Database Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          username: string
          full_name: string | null
          profile_image_url: string | null
          is_creator: boolean
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          total_earnings_cents: bigint
          total_sales_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          username: string
          full_name?: string | null
          profile_image_url?: string | null
          is_creator?: boolean
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          total_earnings_cents?: bigint
          total_sales_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          username?: string
          full_name?: string | null
          profile_image_url?: string | null
          is_creator?: boolean
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          total_earnings_cents?: bigint
          total_sales_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          creator_id: string
          collection_id: string | null
          slug: string
          title: string
          description: string | null
          file_name: string
          file_url: string
          file_size_bytes: bigint | null
          content_type: string | null
          price_cents: number
          currency: string
          stripe_product_id: string | null
          stripe_price_id: string | null
          expires_at: string | null
          max_downloads: number | null
          download_count: number
          view_count: number
          purchase_count: number
          total_revenue_cents: bigint
          screenshot_protection: boolean
          watermark_enabled: boolean
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          collection_id?: string | null
          slug?: string
          title: string
          description?: string | null
          file_name: string
          file_url: string
          file_size_bytes?: bigint | null
          content_type?: string | null
          price_cents?: number
          currency?: string
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          expires_at?: string | null
          max_downloads?: number | null
          download_count?: number
          view_count?: number
          purchase_count?: number
          total_revenue_cents?: bigint
          screenshot_protection?: boolean
          watermark_enabled?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          collection_id?: string | null
          slug?: string
          title?: string
          description?: string | null
          file_name?: string
          file_url?: string
          file_size_bytes?: bigint | null
          content_type?: string | null
          price_cents?: number
          currency?: string
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          expires_at?: string | null
          max_downloads?: number | null
          download_count?: number
          view_count?: number
          purchase_count?: number
          total_revenue_cents?: bigint
          screenshot_protection?: boolean
          watermark_enabled?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          transaction_number: string
          file_id: string
          buyer_id: string | null
          seller_id: string
          buyer_email: string
          buyer_country: string | null
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          amount_cents: number
          currency: string
          platform_fee_cents: number
          seller_earnings_cents: number
          status: string
          payment_method: string | null
          access_expires_at: string | null
          download_limit: number | null
          downloads_used: number
          expires_at: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          transaction_number?: string
          file_id: string
          buyer_id?: string | null
          seller_id: string
          buyer_email: string
          buyer_country?: string | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          amount_cents: number
          currency?: string
          platform_fee_cents?: number
          seller_earnings_cents: number
          status?: string
          payment_method?: string | null
          access_expires_at?: string | null
          download_limit?: number | null
          downloads_used?: number
          expires_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          transaction_number?: string
          file_id?: string
          buyer_id?: string | null
          seller_id?: string
          buyer_email?: string
          buyer_country?: string | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          amount_cents?: number
          currency?: string
          platform_fee_cents?: number
          seller_earnings_cents?: number
          status?: string
          payment_method?: string | null
          access_expires_at?: string | null
          download_limit?: number | null
          downloads_used?: number
          expires_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      file_collections: {
        Row: {
          id: string
          creator_id: string
          slug: string
          title: string
          description: string | null
          cover_image_url: string | null
          price_cents: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          slug?: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          price_cents?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          slug?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          price_cents?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      file_downloads: {
        Row: {
          id: string
          file_id: string
          transaction_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          downloaded_at: string
        }
        Insert: {
          id?: string
          file_id: string
          transaction_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          transaction_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
      }
      additional_files: {
        Row: {
          id: string
          parent_file_id: string
          file_name: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_file_id: string
          file_name: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_file_id?: string
          file_name?: string
          file_url?: string
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          file_id: string | null
          user_id: string | null
          session_id: string | null
          metadata: Record<string, any>
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          file_id?: string | null
          user_id?: string | null
          session_id?: string | null
          metadata?: Record<string, any>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          file_id?: string | null
          user_id?: string | null
          session_id?: string | null
          metadata?: Record<string, any>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      file_details: {
        Row: {
          id: string
          creator_id: string
          slug: string
          title: string
          description: string | null
          file_name: string
          file_url: string
          file_size_bytes: bigint | null
          content_type: string | null
          price_cents: number
          currency: string
          stripe_product_id: string | null
          stripe_price_id: string | null
          expires_at: string | null
          max_downloads: number | null
          download_count: number
          view_count: number
          purchase_count: number
          total_revenue_cents: bigint
          screenshot_protection: boolean
          watermark_enabled: boolean
          collection_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          creator_username: string | null
          creator_avatar: string | null
          sales_count: number
          revenue_cents: bigint
        }
      }
      transaction_details: {
        Row: {
          id: string
          transaction_number: string
          file_id: string
          buyer_id: string | null
          seller_id: string
          buyer_email: string
          buyer_country: string | null
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          amount_cents: number
          currency: string
          platform_fee_cents: number
          seller_earnings_cents: number
          status: string
          payment_method: string | null
          access_expires_at: string | null
          download_limit: number | null
          downloads_used: number
          expires_at: string | null
          created_at: string
          completed_at: string | null
          file_title: string | null
          file_slug: string | null
          seller_username: string | null
          buyer_username: string | null
        }
      }
    }
    Functions: {
      generate_transaction_number: {
        Args: {}
        Returns: string
      }
      generate_file_slug: {
        Args: { title: string }
        Returns: string
      }
    }
  }
}

// Type helpers
export type Profile = Database['public']['Tables']['profiles']['Row']
export type File = Database['public']['Tables']['files']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type FileCollection = Database['public']['Tables']['file_collections']['Row']
export type FileDownload = Database['public']['Tables']['file_downloads']['Row']
export type AdditionalFile = Database['public']['Tables']['additional_files']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type FileDetails = Database['public']['Views']['file_details']['Row']
export type TransactionDetails = Database['public']['Views']['transaction_details']['Row']

// Database service class for optimized queries
export class DatabaseService {
  private client = supabase

  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no rows found, return null instead of throwing error
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // File operations with optimized queries
  async getFileBySlug(slug: string): Promise<FileDetails | null> {
    const { data, error } = await this.client
      .from('file_details')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }

  async getCreatorFiles(creatorId: string, limit = 20, offset = 0): Promise<FileDetails[]> {
    const { data, error } = await this.client
      .from('file_details')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async createFile(fileData: Database['public']['Tables']['files']['Insert']): Promise<File> {
    const { data, error } = await this.client
      .from('files')
      .insert(fileData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Transaction operations
  async getUserPurchases(userId: string): Promise<TransactionDetails[]> {
    const { data, error } = await this.client
      .from('transaction_details')
      .select('*')
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getCreatorSales(creatorId: string): Promise<TransactionDetails[]> {
    const { data, error } = await this.client
      .from('transaction_details')
      .select('*')
      .eq('seller_id', creatorId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createTransaction(transactionData: Database['public']['Tables']['transactions']['Insert']): Promise<Transaction> {
    const { data, error } = await this.client
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Analytics operations
  async trackEvent(eventType: string, fileId?: string, metadata?: Record<string, any>) {
    const { error } = await this.client
      .from('analytics_events')
      .insert({
        event_type: eventType,
        file_id: fileId,
        metadata: metadata || {},
        ip_address: null, // Will be set by RLS policy
        user_agent: navigator.userAgent
      })

    if (error) console.warn('Analytics tracking failed:', error)
  }

  // Search and discovery
  async searchFiles(query: string, limit = 20): Promise<FileDetails[]> {
    const { data, error } = await this.client
      .from('file_details')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getPopularFiles(limit = 20): Promise<FileDetails[]> {
    const { data, error } = await this.client
      .from('file_details')
      .select('*')
      .eq('is_active', true)
      .order('sales_count', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getRecentFiles(limit = 20): Promise<FileDetails[]> {
    const { data, error } = await this.client
      .from('file_details')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// Export singleton instance
export const db = new DatabaseService()