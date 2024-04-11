import { WhatsAppBusinessAccount } from "./whatsappBusinessAccountsTypes"

export interface PhoneNumber {
  created_at: string | null
  name: string | null
  number: string
  phone_number_id: number
  quality_rating: string | null
  wa_id: string | null
  waba_id: number | null
  whatsapp_business_accounts: WhatsAppBusinessAccount
}