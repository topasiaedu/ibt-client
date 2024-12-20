export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          active: boolean | null
          created_at: string | null
          details: Json | null
          execution_order: number | null
          id: string
          project_id: number | null
          type: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          details?: Json | null
          execution_order?: number | null
          id: string
          project_id?: number | null
          type: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          details?: Json | null
          execution_order?: number | null
          id?: string
          project_id?: number | null
          type?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "actions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      business_manager: {
        Row: {
          access_token: string
          created_at: string
          id: string
          name: string
          wa_bm_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          name: string
          wa_bm_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          name?: string
          wa_bm_id?: string | null
        }
        Relationships: []
      }
      campaign_lists: {
        Row: {
          campaign_id: number | null
          contact_id: number | null
          contact_list_id: number | null
          created_at: string
          id: string
          type: string | null
        }
        Insert: {
          campaign_id?: number | null
          contact_id?: number | null
          contact_list_id?: number | null
          created_at?: string
          id?: string
          type?: string | null
        }
        Update: {
          campaign_id?: number | null
          contact_id?: number | null
          contact_list_id?: number | null
          created_at?: string
          id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_list_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["contact_list_id"]
          },
          {
            foreignKeyName: "campaign_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_lists_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      campaign_logs: {
        Row: {
          campaign_id: number
          contact_id: number
          created_at: string | null
          error: string | null
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: number
          contact_id: number
          created_at?: string | null
          error?: string | null
          id?: string
          sent_at?: string | null
          status: string
        }
        Update: {
          campaign_id?: number
          contact_id?: number
          created_at?: string | null
          error?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      campaign_phone_numbers: {
        Row: {
          campaign_id: number
          created_at: string
          id: string
          phone_number_id: number
        }
        Insert: {
          campaign_id: number
          created_at?: string
          id?: string
          phone_number_id: number
        }
        Update: {
          campaign_id?: number
          created_at?: string
          id?: string
          phone_number_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_phone_numbers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_phone_numbers_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
        ]
      }
      campaigns: {
        Row: {
          campaign_id: number
          contact_list_id: number | null
          created_at: string | null
          failed: number | null
          imageType: string | null
          name: string
          next_account: string | null
          personalizedImageId: string | null
          phone_number_id: number | null
          post_time: string
          project_id: number | null
          read: number
          sent: number
          status: string | null
          template_id: number
          template_payload: Json | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: number
          contact_list_id?: number | null
          created_at?: string | null
          failed?: number | null
          imageType?: string | null
          name: string
          next_account?: string | null
          personalizedImageId?: string | null
          phone_number_id?: number | null
          post_time: string
          project_id?: number | null
          read?: number
          sent?: number
          status?: string | null
          template_id: number
          template_payload?: Json | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: number
          contact_list_id?: number | null
          created_at?: string | null
          failed?: number | null
          imageType?: string | null
          name?: string
          next_account?: string | null
          personalizedImageId?: string | null
          phone_number_id?: number | null
          post_time?: string
          project_id?: number | null
          read?: number
          sent?: number
          status?: string | null
          template_id?: number
          template_payload?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["template_id"]
          },
          {
            foreignKeyName: "public_campaigns_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["contact_list_id"]
          },
          {
            foreignKeyName: "public_campaigns_next_account_fkey"
            columns: ["next_account"]
            isOneToOne: false
            referencedRelation: "whatsapp_business_accounts"
            referencedColumns: ["waba_id"]
          },
          {
            foreignKeyName: "public_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      contact_events: {
        Row: {
          amount: number | null
          contact_id: number
          created_at: string
          description: string | null
          id: string
          project_id: number
          tag: string | null
          tag_2: string | null
          type: string
        }
        Insert: {
          amount?: number | null
          contact_id: number
          created_at?: string
          description?: string | null
          id?: string
          project_id: number
          tag?: string | null
          tag_2?: string | null
          type: string
        }
        Update: {
          amount?: number | null
          contact_id?: number
          created_at?: string
          description?: string | null
          id?: string
          project_id?: number
          tag?: string | null
          tag_2?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "contact_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      contact_list_members: {
        Row: {
          contact_id: number
          contact_list_id: number
        }
        Insert: {
          contact_id: number
          contact_list_id: number
        }
        Update: {
          contact_id?: number
          contact_list_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "contact_list_members_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["contact_list_id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          contact_list_id: number
          created_at: string | null
          description: string | null
          name: string
          project_id: number | null
        }
        Insert: {
          contact_list_id?: number
          created_at?: string | null
          description?: string | null
          name: string
          project_id?: number | null
        }
        Update: {
          contact_list_id?: number
          created_at?: string | null
          description?: string | null
          name?: string
          project_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_contact_lists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_id: number
          created_at: string | null
          email: string | null
          last_contacted_by: number | null
          name: string
          phone: string | null
          project_id: number
          tsv_name_waid: unknown | null
          wa_id: string
        }
        Insert: {
          contact_id?: number
          created_at?: string | null
          email?: string | null
          last_contacted_by?: number | null
          name: string
          phone?: string | null
          project_id: number
          tsv_name_waid?: unknown | null
          wa_id: string
        }
        Update: {
          contact_id?: number
          created_at?: string | null
          email?: string | null
          last_contacted_by?: number | null
          name?: string
          phone?: string | null
          project_id?: number
          tsv_name_waid?: unknown | null
          wa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_contacts_last_contacted_by_fkey"
            columns: ["last_contacted_by"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
          {
            foreignKeyName: "public_contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          new_wa_conversation_id: string | null
          old_wa_conversation_id: string | null
          project_id: number
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          new_wa_conversation_id?: string | null
          old_wa_conversation_id?: string | null
          project_id: number
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          new_wa_conversation_id?: string | null
          old_wa_conversation_id?: string | null
          project_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      conversations: {
        Row: {
          close_at: string | null
          contact_id: number
          created_at: string
          id: string
          last_message_id: number | null
          phone_number_id: number
          project_id: number
          unread_messages: number
          updated_at: string | null
          wa_conversation_id: string | null
        }
        Insert: {
          close_at?: string | null
          contact_id: number
          created_at?: string
          id?: string
          last_message_id?: number | null
          phone_number_id: number
          project_id: number
          unread_messages?: number
          updated_at?: string | null
          wa_conversation_id?: string | null
        }
        Update: {
          close_at?: string | null
          contact_id?: number
          created_at?: string
          id?: string
          last_message_id?: number | null
          phone_number_id?: number
          project_id?: number
          unread_messages?: number
          updated_at?: string | null
          wa_conversation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "conversations_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          processed: boolean
          type: string
          udpated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          processed?: boolean
          type: string
          udpated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          processed?: boolean
          type?: string
          udpated_at?: string
        }
        Relationships: []
      }
      message_window: {
        Row: {
          close_at: string | null
          contact_id: number | null
          conversation_id: string | null
          created_at: string
          phone_number_id: number
          updated_at: string
          window_id: number
        }
        Insert: {
          close_at?: string | null
          contact_id?: number | null
          conversation_id?: string | null
          created_at?: string
          phone_number_id: number
          updated_at?: string
          window_id?: number
        }
        Update: {
          close_at?: string | null
          contact_id?: number | null
          conversation_id?: string | null
          created_at?: string
          phone_number_id?: number
          updated_at?: string
          window_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_window_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "public_message_window_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
        ]
      }
      messages: {
        Row: {
          campaign_id: number | null
          contact_id: number
          content: string | null
          context: number | null
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          error: Json | null
          media_url: string | null
          message_id: number
          message_type: string
          phone_number_id: number
          project_id: number
          status: string | null
          tsv_content: unknown | null
          wa_message_id: string | null
          workflow_id: string | null
        }
        Insert: {
          campaign_id?: number | null
          contact_id: number
          content?: string | null
          context?: number | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          error?: Json | null
          media_url?: string | null
          message_id?: number
          message_type: string
          phone_number_id: number
          project_id: number
          status?: string | null
          tsv_content?: unknown | null
          wa_message_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          campaign_id?: number | null
          contact_id?: number
          content?: string | null
          context?: number | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          error?: Json | null
          media_url?: string | null
          message_id?: number
          message_type?: string
          phone_number_id?: number
          project_id?: number
          status?: string | null
          tsv_content?: unknown | null
          wa_message_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "messages_context_fkey"
            columns: ["context"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "messages_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      pemni_vip_logs: {
        Row: {
          contact_id: number
          created_at: string
          id: string
          message_id: number | null
          password: string | null
          status: string
        }
        Insert: {
          contact_id: number
          created_at?: string
          id?: string
          message_id?: number | null
          password?: string | null
          status?: string
        }
        Update: {
          contact_id?: number
          created_at?: string
          id?: string
          message_id?: number | null
          password?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pemni_vip_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "pemni_vip_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["message_id"]
          },
        ]
      }
      personalized_images: {
        Row: {
          canvas_state: string
          created_at: string
          id: string
          media_url: string | null
          name: string
          project_id: number | null
        }
        Insert: {
          canvas_state: string
          created_at?: string
          id?: string
          media_url?: string | null
          name: string
          project_id?: number | null
        }
        Update: {
          canvas_state?: string
          created_at?: string
          id?: string
          media_url?: string | null
          name?: string
          project_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personalized_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          access_token: string | null
          created_at: string | null
          name: string | null
          number: string
          phone_number_id: number
          project_id: number | null
          quality_rating: string | null
          restricted: boolean | null
          throughput_level: string | null
          wa_id: string
          waba_id: number | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          name?: string | null
          number: string
          phone_number_id?: number
          project_id?: number | null
          quality_rating?: string | null
          restricted?: boolean | null
          throughput_level?: string | null
          wa_id: string
          waba_id?: number | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          name?: string | null
          number?: string
          phone_number_id?: number
          project_id?: number | null
          quality_rating?: string | null
          restricted?: boolean | null
          throughput_level?: string | null
          wa_id?: string
          waba_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "public_phone_numbers_waba_id_fkey"
            columns: ["waba_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_business_accounts"
            referencedColumns: ["account_id"]
          },
        ]
      }
      project: {
        Row: {
          access_token: string
          created_at: string
          description: string | null
          name: string
          project_id: number
        }
        Insert: {
          access_token: string
          created_at?: string
          description?: string | null
          name: string
          project_id?: number
        }
        Update: {
          access_token?: string
          created_at?: string
          description?: string | null
          name?: string
          project_id?: number
        }
        Relationships: []
      }
      project_permission: {
        Row: {
          created_at: string
          id: number
          project_id: number
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          project_id: number
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          project_id?: number
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_project_permission_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      templates: {
        Row: {
          account_id: number | null
          category: string
          components: Json
          created_at: string | null
          language: string
          name: string
          rejected_reason: string | null
          status: string
          template_id: number
          wa_template_id: string | null
        }
        Insert: {
          account_id?: number | null
          category?: string
          components: Json
          created_at?: string | null
          language: string
          name: string
          rejected_reason?: string | null
          status: string
          template_id?: number
          wa_template_id?: string | null
        }
        Update: {
          account_id?: number | null
          category?: string
          components?: Json
          created_at?: string | null
          language?: string
          name?: string
          rejected_reason?: string | null
          status?: string
          template_id?: number
          wa_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_business_accounts"
            referencedColumns: ["account_id"]
          },
        ]
      }
      triggers: {
        Row: {
          active: boolean | null
          created_at: string | null
          details: Json | null
          id: string
          project_id: number | null
          type: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          details?: Json | null
          id: string
          project_id?: number | null
          type: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          details?: Json | null
          id?: string
          project_id?: number | null
          type?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "triggers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "triggers_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_business_accounts: {
        Row: {
          account_id: number
          business_manager_id: string | null
          created_at: string | null
          currency: string | null
          message_template_namespace: string | null
          name: string | null
          project_id: number
          timezone_id: string | null
          updated_at: string | null
          waba_id: string
        }
        Insert: {
          account_id?: number
          business_manager_id?: string | null
          created_at?: string | null
          currency?: string | null
          message_template_namespace?: string | null
          name?: string | null
          project_id: number
          timezone_id?: string | null
          updated_at?: string | null
          waba_id: string
        }
        Update: {
          account_id?: number
          business_manager_id?: string | null
          created_at?: string | null
          currency?: string | null
          message_template_namespace?: string | null
          name?: string | null
          project_id?: number
          timezone_id?: string | null
          updated_at?: string | null
          waba_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_whatsapp_business_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "whatsapp_business_accounts_business_manager_id_fkey"
            columns: ["business_manager_id"]
            isOneToOne: false
            referencedRelation: "business_manager"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_logs: {
        Row: {
          action_id: string
          action_time: string
          created_at: string
          error: string | null
          id: string
          payload: Json
          status: string
          type: string | null
        }
        Insert: {
          action_id: string
          action_time: string
          created_at?: string
          error?: string | null
          id?: string
          payload: Json
          status?: string
          type?: string | null
        }
        Update: {
          action_id?: string
          action_time?: string
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          status?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_phone_numbers: {
        Row: {
          created_at: string
          id: string
          phone_number_id: number
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number_id: number
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phone_number_id?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_phone_number_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number_id"]
          },
          {
            foreignKeyName: "workflow_phone_numbers_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          canvas_state: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: number
          run: boolean
          updated_at: string
        }
        Insert: {
          canvas_state?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: number
          run?: boolean
          updated_at?: string
        }
        Update: {
          canvas_state?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: number
          run?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      zoom: {
        Row: {
          account_id: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          gen_token: string | null
          id: string
          project_id: number
        }
        Insert: {
          account_id?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          gen_token?: string | null
          id?: string
          project_id: number
        }
        Update: {
          account_id?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          gen_token?: string | null
          id?: string
          project_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zoom_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_contact_list_members: {
        Args: {
          contact_id: number
        }
        Returns: number
      }
      fetch_campaigns: {
        Args: {
          project_id_param: number
        }
        Returns: {
          campaign_id: number
          project_id: number
          name: string
          created_at: string
          read_count: number
          status: string
          template_id: number
          contact_list_id: number
          post_time: string
          sent: number
          failed: number
          total_contacts: number
        }[]
      }
      fetch_contacts_with_stats: {
        Args: {
          p_project_id: number
        }
        Returns: {
          contact_id: number
          created_at: string
          email: string
          last_contacted_by: number
          name: string
          phone: string
          project_id: number
          tsv_name_waid: unknown
          wa_id: string
          total_paid: number
          times_opted_in: number
        }[]
      }
      fetch_conversations: {
        Args: {
          project_id_param: number
        }
        Returns: {
          id: string
          messages: Json
          unread_messages: number
          last_message_time: string
          close_at: string
          contact: Json
          phone_number: Json
          whatsapp_business_account: Json
          last_message: Json
        }[]
      }
      fetch_conversations_with_unread_count: {
        Args: {
          p_project_id: number
          start: number
          p_end: number
        }
        Returns: {
          conversation_id: string
          contact: Json
          phone_number: Json
          last_message: Json
          unread_messages_count: number
        }[]
      }
      fetch_workflows: {
        Args: {
          project_id_param: number
          start_date: string
          end_date: string
        }
        Returns: {
          canvas_state: Json
          created_at: string
          description: string
          id: string
          name: string
          project_id: number
          run: boolean
          total_read: number
          total_sent: number
          total_failed: number
          total_unique_contacts: number
          trigger: Json
          actions: Json
          phone_numbers: Json
        }[]
      }
      get_conversation_counts:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              conversation_id: string
            }[]
          }
        | {
            Args: {
              start_date: string
              end_date: string
              interval_type: string
            }
            Returns: {
              time_interval: string
              conversation_count: number
              project_id: number
            }[]
          }
      get_triggers_with_details: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      search_contacts_with_stats: {
        Args: {
          search_pattern: string
          page: number
          page_size: number
        }
        Returns: {
          contact_id: number
          created_at: string
          email: string
          last_contacted_by: number
          name: string
          phone: string
          project_id: number
          tsv_name_waid: unknown
          wa_id: string
          total_paid: number
          times_opted_in: number
        }[]
      }
      search_conversations_and_messages:
        | {
            Args: {
              search_pattern: string
            }
            Returns: {
              result_type: string
              conversation_id: string
              contact: Json
              phone_number: Json
              last_message: Json
              message_id: number
              matched_message: Json
              message_created_at: string
            }[]
          }
        | {
            Args: {
              search_pattern: string
              p_project_id: number
            }
            Returns: {
              result_type: string
              conversation_id: string
              contact: Json
              phone_number: Json
              last_message: Json
              message_id: number
              matched_message: Json
              message_created_at: string
            }[]
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
