/* eslint-disable no-console */
import { newsSourceService } from '../../app/core/news-source/news-source.service'
import { defaultNewsSources } from '../../app/core/news-source/news-source.model'

async function main() {
  // Ensure defaults exist
  await newsSourceService.initializeDefaultSources()

  const defaultNames = new Set(
    (defaultNewsSources || [])
      .map((s) => s.name)
      .filter((n): n is string => typeof n === 'string' && n.length > 0),
  )

  // Get current public sources
  const publicSources = await newsSourceService.getPublicNewsSources()

  // Re-enable and reset reliability for default sources
  for (const s of publicSources) {
    if (!defaultNames.has(s.name)) continue

    // Ensure active
    try {
      await newsSourceService.updateNewsSource(s.sourceId, { isActive: true })
    } catch (err) {
      console.warn(`Failed to enable ${s.name}:`, err)
    }

    // Reset reliability to 100 and clear per-item cache for the source
    try {
      await newsSourceService.markFetchSuccess(s.sourceId)
    } catch (err) {
      console.warn(`Failed to reset reliability for ${s.name}:`, err)
    }
  }

  // Re-fetch and print summary
  const refreshed = await newsSourceService.getPublicNewsSources()
  const status = refreshed
    .filter((s) => defaultNames.has(s.name))
    .map((s) => ({
      name: s.name,
      isActive: s.isActive,
      reliability: s.reliability?.score ?? null,
      lastSuccessfulFetch: s.reliability?.lastSuccessfulFetch ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(console as any).table?.(status) ?? console.log(status)
  console.log(`\nReset complete. Default sources ready: ${status.length}/8`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
