/**
 * Framsetning efnisorðaskrárinnar. Hér eru aðeins lyklar (termKey) raunverulegra
 * flokka/merkja í WordPress; lykill sem finnst ekki í gögnunum birtist einfaldlega ekki.
 * Engin grein er færð á milli flokka — þetta er bara röðun í hópa til að auðvelda leit.
 */

/** Vinsæl efni, eftir óskum Soffíu (sjá upprunalega merkjaskýið á skreytumhus.is) */
export const POPULAR_TERM_KEYS = [
  'diy', 'eldhus', 'stofa', 'svefnherbergi', 'barnaherbergi', 'fyrir-eftir', 'skreytingar',
  'blom', 'jol', 'paskar', 'innblastur', 'innlit', 'husgagnahollin', 'dorma', 'slippfelagid',
]

export const TERM_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: 'Herbergi og rými',
    keys: ['stofa', 'stofur', 'eldhus', 'bordstofa', 'svefnherbergi', 'hjonaherbergi', 'barnaherbergi', 'stelpuherbergi', 'strakaherbergi', 'unglingaherbergi', 'forstofa', 'badherbergi', 'bad', 'skrifstofa', 'thvottahus', 'gangur', 'pallur', 'gardur', 'uti', 'kofi', 'sumarbustadur'],
  },
  {
    title: 'Breytingar og innlit',
    keys: ['fyrir-eftir', 'fyrir-og-eftir', 'breytingar', 'eldhus-breytingar', 'innlit', 'mitt-heimili', 'heimili', 'lesendainnlit', 'fra-lesendum', 'innblastur', 'hugmyndir', 'moodboard', 'mood-board'],
  },
  {
    title: 'Skreytingar og DIY',
    keys: ['diy', 'skreytingar', 'skreyting', 'bordskreytingar', 'upprodun', 'bakkar', 'kerti', 'or-project', 'endurvinnslan', 'endurvinnsla', 'malning', 'kalkmalning', 'spreyjad', 'fondur', 'fondra', 'innpokkun'],
  },
  {
    title: 'Blóm, árstíðir og hátíðir',
    keys: ['blom', 'kransar', 'adventukransar', 'jol', 'paskar', 'haust', 'vetur', 'sumar', 'vorskraut', 'aramot', 'ferming', 'afmaeli', 'veislur', 'brudkaup'],
  },
  {
    title: 'Verslanir og samstarf',
    keys: ['husgagnahollin', 'dorma', 'slippfelagid', 'rumfo', 'rumfatalagerinn', 'jysk', 'ikea', 'byko', 'bauhaus', 'blomaval', 'sostrene-grene', 'pottery-barn', 'myrkstore', 'husasmidjan', 'bm-valla', 'vav', 'samstarf'],
  },
  {
    title: 'Lífið',
    keys: ['fjolskyldan', 'born', 'ferdir', 'ferdalog', 'paelingar', 'kokur', 'matur', 'uppskrift', 'skreytumhustv'],
  },
]
