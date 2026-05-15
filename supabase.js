import { createClient } from '@supabase/supabase-js'

// Use the URL from your settings and the key you just sent me
const SUPABASE_URL = 'https://wtinhuogjpquskzidwzp.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_jSJNS6w665HsE-jy8lPUhg_yYKqDhQA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)