export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string | null
          admin_password: string
          admin_username: string
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo: string | null
          name: string
          notification_duration: number | null
          notification_sound: string | null
          payment_methods: Json | null
          permissions: Json | null
          phone: string | null
          phone_prefix: string | null
          services: Json | null
          short_id: number
          status: string
          subscription: string | null
          total_orders: number | null
          total_revenue: number | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_password: string
          admin_username: string
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          notification_duration?: number | null
          notification_sound?: string | null
          payment_methods?: Json | null
          permissions?: Json | null
          phone?: string | null
          phone_prefix?: string | null
          services?: Json | null
          short_id?: number
          status?: string
          subscription?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_password?: string
          admin_username?: string
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          notification_duration?: number | null
          notification_sound?: string | null
          payment_methods?: Json | null
          permissions?: Json | null
          phone?: string | null
          phone_prefix?: string | null
          services?: Json | null
          short_id?: number
          status?: string
          subscription?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          business_id: string
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          loyalty_points: number | null
          name: string
          phone: string | null
          registered_at: string
          short_id: number
          total_orders: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number | null
          name: string
          phone?: string | null
          registered_at?: string
          short_id?: number
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number | null
          name?: string
          phone?: string | null
          registered_at?: string
          short_id?: number
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_bookings: {
        Row: {
          business_id: string
          check_in: string
          check_out: string
          checked_in_at: string | null
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_nationality: string | null
          guest_phone: string | null
          id: string
          id_number: string | null
          nights: number | null
          room_id: string
          special_requests: string | null
          status: string | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          check_in: string
          check_out: string
          checked_in_at?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_nationality?: string | null
          guest_phone?: string | null
          id?: string
          id_number?: string | null
          nights?: number | null
          room_id: string
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          check_in?: string
          check_out?: string
          checked_in_at?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_nationality?: string | null
          guest_phone?: string | null
          id?: string
          id_number?: string | null
          nights?: number | null
          room_id?: string
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_rooms: {
        Row: {
          amenities: Json | null
          business_id: string
          created_at: string
          floor: number | null
          id: string
          image: string | null
          max_guests: number | null
          price_per_night: number | null
          room_number: string
          status: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          business_id: string
          created_at?: string
          floor?: number | null
          id?: string
          image?: string | null
          max_guests?: number | null
          price_per_night?: number | null
          room_number: string
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          business_id?: string
          created_at?: string
          floor?: number | null
          id?: string
          image?: string | null
          max_guests?: number | null
          price_per_night?: number | null
          room_number?: string
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rooms_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_levels: {
        Row: {
          business_id: string
          color: string | null
          created_at: string
          icon: string | null
          id: string
          max_points: number | null
          min_points: number | null
          name: string
          reward: string | null
          sort_order: number | null
        }
        Insert: {
          business_id: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          max_points?: number | null
          min_points?: number | null
          name: string
          reward?: string | null
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          max_points?: number | null
          min_points?: number | null
          name?: string
          reward?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_levels_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean | null
          business_id: string
          category_id: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
          rating: number | null
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          business_id: string
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price?: number
          rating?: number | null
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          business_id?: string
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          cashier_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          items: Json
          ordered_by: string | null
          paid_at: string | null
          payment_method: string | null
          status: string | null
          table_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          business_id: string
          cashier_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          items?: Json
          ordered_by?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          table_id?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          cashier_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          items?: Json
          ordered_by?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          table_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      password_logs: {
        Row: {
          business_id: string
          changed_at: string
          id: string
          new_password: string
        }
        Insert: {
          business_id: string
          changed_at?: string
          id?: string
          new_password: string
        }
        Update: {
          business_id?: string
          changed_at?: string
          id?: string
          new_password?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          business_id: string
          created_at: string
          id: string
          seats: number | null
          status: string | null
          table_number: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          seats?: number | null
          status?: string | null
          table_number: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          seats?: number | null
          status?: string | null
          table_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          business_id: string
          created_at: string
          custom_job_title: string | null
          end_time: string | null
          id: string
          job_title: string
          name: string
          nationality: string | null
          password: string | null
          phone: string | null
          shifts: string | null
          start_time: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          custom_job_title?: string | null
          end_time?: string | null
          id?: string
          job_title: string
          name: string
          nationality?: string | null
          password?: string | null
          phone?: string | null
          shifts?: string | null
          start_time?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          custom_job_title?: string | null
          end_time?: string | null
          id?: string
          job_title?: string
          name?: string
          nationality?: string | null
          password?: string | null
          phone?: string | null
          shifts?: string | null
          start_time?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
