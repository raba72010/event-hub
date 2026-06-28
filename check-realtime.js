const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const supabaseKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Subscribing to realtime messages channel...");
  
  const channel = supabase.channel('system_test_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      console.log('✅ Realtime Event Received via WebSockets!', payload);
    })
    .subscribe((status) => {
      console.log('WebSocket Subscription Status:', status);
    });

  setTimeout(async () => {
    // Insert a dummy message using admin override if we had the service key, 
    // but here we just check if it subscribes successfully (SUBSCRIBED).
    console.log("Waiting 3 more seconds for events...");
  }, 2000);

  setTimeout(() => {
    console.log("Check complete.");
    process.exit(0);
  }, 5000);
}

check();
