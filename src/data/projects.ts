/**
 * Herbergisbreytingar.
 * `archiveProjectIds` eru færslurnar sem Soffía raðaði sjálf á síðuna „Herbergisbreytingar“
 * (WordPress-síða 3648), í sömu röð. Nýrri verkefni eru sótt lifandi úr flokknum Fyrir/eftir.
 */
export const archiveProjectIds = [
  43126, 39228, 38804, 38234, 37340, 37170, 36115, 34320, 31023, 30302, 23277, 19586, 17228,
  16913, 14643, 13833, 13483, 2841, 2719, 2670, 2630, 2627, 2624, 2593, 2862, 2833,
]

/**
 * Staðfest fyrir/eftir-par: báðar myndirnar eru úr færslunni „Kózý – fyrir og eftir…“
 * (93421, 4.10.2025), úr kaflanum „ætla raða hérna saman nokkrum fyrir og eftir…“,
 * sama sjónarhorn á setustofuna. Dagsetningar í skráarnöfnum: 28.8.2025 (fyrir), 8.9.2025 (eftir).
 */
export const featuredTransformation = {
  postId: 93421,
  title: 'Kózý – fyrir og eftir…',
  place: 'Matsalur og setustofa starfsmanna',
  before: {
    src: 'https://www.skreytumhus.is/wp-content/uploads/2025/10/2025-08-28-11.30.30.jpg',
    alt: 'Setustofan fyrir breytingu: auður veggur, stakur hvítur stóll og lítið borð',
  },
  after: {
    src: 'https://www.skreytumhus.is/wp-content/uploads/2025/10/2025-09-08-15.59.46.jpg',
    alt: 'Setustofan eftir breytingu: koníakslitaður sófi, stór mynd á vegg, mottur, plöntur og vegghillur',
  },
  /** Orð Soffíu úr færslunni */
  quote: 'ég hef alltaf jafn gaman að því hvað það þarf oft lítið til að breyta miklu',
}
