#!/usr/bin/env node
/*
  Usage:
    node scripts/sync-university.js <id> <admissions_email>
  Example:
    node scripts/sync-university.js adee2314-8cc7-40f6-a244-e09b60079fdc admissions@technical-varna.edu
*/
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://lkjhkabfxsqbejnecctr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_FkLNf6vS5JrS2EN_e2xtPQ_KQoetmq4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const id = process.argv[2] || 'adee2314-8cc7-40f6-a244-e09b60079fdc'
const admissions_email = process.argv[3] || 'admissions@technical-varna.edu'

(async () => {
  try {
    console.log(`Upserting university id=${id} admissions_email=${admissions_email}`)
    const { data, error } = await supabase
      .from('universities')
      .upsert({ id, admissions_email }, { onConflict: 'id' })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      process.exit(1)
    }

    console.log('Success:', data)
    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
})()
