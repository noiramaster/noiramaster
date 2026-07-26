// NOIRA — Supabase SQL executor via Management API
// Uso: node supabase/exec.js "SELECT * FROM usuarios_selfservice"
// Requires SUPABASE_ACCESS_TOKEN in env or .env.supabase

const https = require('https')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'twsrfhjjvustbcocrdob'

function getToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN
  const envFile = path.join(__dirname, '..', '.env.supabase')
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) return line.split('=')[1].trim()
    }
  }
  console.error('SUPABASE_ACCESS_TOKEN not found. Set it in env or .env.supabase')
  process.exit(1)
}

const sql = process.argv[2]
if (!sql) {
  console.error('Usage: node supabase/exec.js "SQL QUERY"')
  console.error('  Or:  node supabase/exec.js supabase/migration.sql')
  process.exit(1)
}

let query = sql
if (fs.existsSync(sql)) {
  query = fs.readFileSync(sql, 'utf8')
}

const data = JSON.stringify({ query })
const token = getToken()

const req = https.request(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let body = ''
  res.on('data', d => body += d)
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      try { console.log(JSON.stringify(JSON.parse(body), null, 2)) } catch { console.log(body) }
    } else {
      console.error(`Error ${res.statusCode}: ${body}`)
      process.exit(1)
    }
  })
})
req.on('error', e => { console.error('Request failed:', e.message); process.exit(1) })
req.write(data)
req.end()
