import { supabaseAdmin } from '../lib/supabase-admin'
import { fetchPage } from '../lib/fetchPage'
import { gemini } from '../lib/gemini'

async function extractRequirements(pageText: string, universityName: string) {
  const prompt = `
You are extracting university application requirements from a web page.
University: ${universityName}
Page content:
${pageText}

Extract all documents a student must submit to apply.
Return ONLY a JSON array. No explanation, no markdown, no code fences.
Each item must have exactly these fields:
- label: string (name of the document, e.g. "Official Transcript")
- required: boolean (true if mandatory, false if optional)
- format: string or null (e.g. "PDF", "Word", null if not specified)
- notes: string or null (any specific instructions, e.g. "Certified copy, sealed by institution")

If you cannot find any requirements, return an empty array: []
`

  try {
    const result = await gemini.generateContent(prompt)
    const raw = result.response.text().trim()

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed)) return null
    return parsed
  } catch (err) {
    console.error(`Gemini extraction failed for ${universityName}:`, err)
    return null
  }
}

async function seed() {
  const { data: universities, error } = await supabaseAdmin
    .from('universities')
    .select('id, name, website')

  if (error || !universities) {
    console.error('Could not fetch universities:', error?.message)
    process.exit(1)
  }

  console.log(`\nFound ${universities.length} universities\n`)

  let written = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < universities.length; i++) {
    const uni: any = universities[i]
    console.log(`[${i + 1}/${universities.length}] ${uni.name}`)

    const { data: existing } = await supabaseAdmin
      .from('application_requirements')
      .select('id')
      .eq('university_id', uni.id)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log('  → Already has requirements, skipping\n')
      skipped++
      continue
    }

    if (!uni.website) {
      console.log('  → No website URL, skipping\n')
      skipped++
      continue
    }

    const admissionsUrl = uni.website.replace(/\/?$/, '/admissions')
    let pageText = await fetchPage(admissionsUrl)

    if (!pageText || pageText.length < 200) {
      console.log('  → Admissions subpage failed, trying homepage')
      pageText = await fetchPage(uni.website)
    }

    if (!pageText || pageText.length < 200) {
      console.log('  → Could not fetch page content, skipping\n')
      failed++
      continue
    }

    const requirements = await extractRequirements(pageText, uni.name)

    if (!requirements || requirements.length === 0) {
      console.log('  → No requirements found\n')
      failed++
      continue
    }

    const rows = requirements.map((r: any) => ({
      university_id: uni.id,
      label: String(r.label),
      required: Boolean(r.required),
      format: r.format ?? null,
      notes: r.notes ?? null,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('application_requirements')
      .insert(rows)

    if (insertError) {
      console.error(`  → Insert failed: ${insertError.message}\n`)
      failed++
    } else {
      console.log(`  → Wrote ${rows.length} requirements\n`)
      written += rows.length
    }

    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('─────────────────────────────')
  console.log(`Requirements written : ${written}`)
  console.log(`Universities skipped : ${skipped}`)
  console.log(`Universities failed  : ${failed}`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
