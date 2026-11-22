/**
 * Áætluð keyrsla (á klukkustundar fresti): sækir nýjustu færslur @skreytum_hus og
 * endurnýjar aðgangslykilinn þegar þarf, svo straumurinn uppfærist þó enginn heimsæki vefinn
 * og lykillinn renni aldrei út. Mistök skilja síðasta góða straum eftir óbreyttan.
 */
import { getStore } from '@netlify/blobs'
import { updateFeed, type Store } from '../lib/instagram.mts'

export default async () => {
  const store = getStore('instagram') as unknown as Store
  try {
    const feed = await updateFeed(store, process.env.INSTAGRAM_ACCESS_TOKEN)
    console.log(`Instagram: ${feed.posts.length} færslur uppfærðar`)
  } catch (e) {
    console.log(`Instagram: ekki uppfært (${(e as Error).message})`)
  }
}

export const config = { schedule: '@hourly' }
