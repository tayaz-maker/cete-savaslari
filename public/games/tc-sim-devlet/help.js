/** Beginner guide for TC SIM: DEVLET. */
export const HELP_SECTIONS = [
  {
    h: ["Amaç", "The goal"],
    p: [
      [
        "Devleti bir masadan yönetiyorsun. Kurumlar senin yerine çalışır; sen ne istediğine karar verir, sonucu raporlardan okursun.",
        "You run the state from one desk. The institutions do the work; you decide what you want and read the result in the reports.",
      ],
      [
        "Verdiğin karar ile sahada olan şey aynı olmayabilir. Oyunun asıl konusu bu fark.",
        "What you decide and what actually happens on the ground are not always the same. That gap is the real subject of the game.",
      ],
    ],
  },
  {
    h: ["Bir ay nasıl işler?", "How a month works"],
    list: [
      ["Gündemi oku.", "Read the agenda."],
      ["En fazla iki farklı karar seç.", "Choose up to two different decisions."],
      ["Ayı ilerlet.", "Advance the month."],
      ["Uygulamayı ve yeni raporları incele.", "Review delivery and the new reports."],
    ],
    p: [
      [
        "Karar seçmek ayı ilerletmez; ay yalnız sen ilerletince işler. Kullanılmayan haklar sonraki aya devretmez.",
        "Selecting a decision does not advance time; the month moves only when you advance it. Unused decisions do not carry over.",
      ],
    ],
  },
  {
    h: ["Raporlara nasıl bakmalıyım?", "How to read the reports"],
    p: [
      [
        "Raporlar kesin saha gerçeği değildir. Her raporun bir güven değeri vardır ve bu değer belirsizliği anlatır. Güvenilirliği düşük raporlara temkinli yaklaş; onlara dayanarak alınan karar yanlış yere gidebilir.",
        "Reports are not exact ground truth. Each carries a confidence value that describes its uncertainty. Treat low-confidence reports cautiously: a decision built on one can land in the wrong place.",
      ],
    ],
  },
  {
    h: ["Açık dosyalar ve yıl dosyası", "Open dossiers and the year file"],
    list: [
      [
        "Açık dosyalar gecikmiş meseleleri tutar; bazıları sen kapatmadan tekrar gündeme gelir.",
        "Open dossiers hold delayed issues; some return to the agenda until you deal with them.",
      ],
      [
        "Yıl dosyası kurumların ve toplumun yıllık kaydını tutar.",
        "The year file keeps the annual record of the institutions and of society.",
      ],
    ],
  },
  {
    h: ["Sık yapılan hatalar", "Common mistakes"],
    list: [
      [
        "Kararı seçip ayı ilerletmeyi unutmak.",
        "Choosing a decision and forgetting to advance the month.",
      ],
      [
        "Düşük güvenli bir raporu kesin bilgi sayıp üzerine karar kurmak.",
        "Treating a low-confidence report as fact and building a decision on it.",
      ],
      [
        "Açık dosyaları biriktirmek; gecikmiş meseleler geri döner.",
        "Letting open dossiers pile up — delayed issues come back.",
      ],
    ],
  },
];
