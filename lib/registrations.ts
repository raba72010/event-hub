import { supabase } from "./supabase"

export async function isEventRegistered(eventId: string, userId: string) {
  const { data } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single()
  
  return !!data
}

export async function toggleRegistration(eventId: string, userId: string) {
  // 1. Check if already registered
  const isRegistered = await isEventRegistered(eventId, userId)

  if (isRegistered) {
    // Unregister (Delete)
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId)
    
    if (error) throw error
    return false // New state: Not Registered
  } else {
    // Register (Insert)
    const { error } = await supabase
      .from("registrations")
      .insert({ event_id: eventId, user_id: userId })

    if (error) throw error
    return true // New state: Registered
  }
}