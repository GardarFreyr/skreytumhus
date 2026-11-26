/**
 * Sýnileikastillingar. Ekkert er eytt – breyttu gildi í `true` til að birta aftur.
 */
export const features = {
  /**
   * „AUGLÝSING“ og nafn auglýsanda fyrir ofan hvern borða (Húsgagnahöllin, Dorma, Slippfélagið).
   * Falið að ósk eiganda. Auglýsingar eru samt merktar: rel="sponsored", alt-texti með nafni
   * auglýsanda og aðgengilegur texti „(auglýsing, opnast í nýjum flipa)“, svæðið heitir „Auglýsingar“, og á minni skjám er
   * fyrirsögnin „Auglýsingar“ yfir auglýsingahólfinu.
   */
  adLabels: false,
  /** „Um mig“-hlutinn á forsíðu (mynd, kynning og hnappar). Síðan /um-mig er óbreytt. */
  homeAbout: false,
} as const
