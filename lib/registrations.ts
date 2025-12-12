import { supabase } from "@/lib/supabase"

/**
 * Check if a user is registered for an event
 */
export async function isEventRegistered(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected
    console.error("Error checking registration:", error)
    return false
  }

  return !!data
}

/**
 * Toggle registration status for an event
 * Returns the new registration state (true if registered, false if unregistered)
 */
export async function toggleRegistration(eventId: string, userId: string): Promise<boolean> {
  // Check if already registered
  const isRegistered = await isEventRegistered(eventId, userId)

  if (isRegistered) {
    // Remove registration
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error removing registration:", error)
      throw error
    }

    return false
  } else {
    // Add registration
    const { error } = await supabase.from("registrations").insert({
      event_id: eventId,
      user_id: userId,
    })

    if (error) {
      console.error("Error adding registration:", error)
      throw error
    }

    return true
  }
}

/**
 * Get all registered event IDs for a user
 */
export async function getRegisteredEventIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching registrations:", error)
    return []
  }

  return data.map((row) => row.event_id.toString())
}

