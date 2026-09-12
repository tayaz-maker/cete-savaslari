/** Beginner guide for Kayıp Telefon. */
export const HELP_SECTIONS = [
  {
    h: ["Amaç", "The goal"],
    p: [
      [
        "Bulduğun bir telefonun içindesin. Amacın sahibi hakkında öğrendiklerinle dosyayı ne zaman kapatacağına karar vermek.",
        "You are inside a phone you found. Your goal is to decide when to close the file, based on what you learn about its owner.",
      ],
      [
        "Doğru tek bir cevap yok. Ne kadar ileri gittiğin de sonucun parçası.",
        "There is no single right answer. How far you went is part of the outcome too.",
      ],
    ],
  },
  {
    h: ["Ekranda ne görüyorum?", "What you see on screen"],
    list: [
      [
        "Uygulamalar: açık olanların içindeki öğelere dokunabilirsin.",
        "Apps: you can tap the items inside the ones that are unlocked.",
      ],
      [
        "MAHREMİYET göstergesi: sahibinin özeline ne kadar girdiğini gösterir.",
        "The privacy meter: how far into the owner's private life you have gone.",
      ],
      [
        "BULGULAR paneli: topladığın ipuçları ve birbirleriyle ilişkileri.",
        "The findings panel: the clues you collected and how they relate.",
      ],
    ],
  },
  {
    h: ["Nasıl ilerlerim?", "How you make progress"],
    list: [
      [
        "Açık uygulamalardaki öğelere dokunarak ipucu topla.",
        "Tap items inside unlocked apps to collect clues.",
      ],
      [
        "Her yeni öğe bir bulgu bırakır ve MAHREMİYET göstergesini yükseltir.",
        "Each new item leaves a finding and raises the privacy meter.",
      ],
      ["Bazı öğeler yeni bir uygulamanın kilidini açar.", "Some items unlock another app."],
      [
        "Kilitli bir öğeyi okumak için önce onunla ilişkili başka bir ipucunu bulmuş olman gerekir.",
        "To read a locked item you must first have found another clue connected to it.",
      ],
    ],
  },
  {
    h: ["Bulguları okumak", "Reading the findings"],
    p: [
      [
        "BULGULAR panelinde ipuçlarının birbirini doğruladığını (✓) veya çeliştiğini (!) görürsün. Hikâyeyi oyun senin yerine kurmaz; çelişkileri kendin tartarsın.",
        "In the findings panel you can see where clues confirm each other (✓) or contradict each other (!). The game does not assemble the story for you; weighing the contradictions is your job.",
      ],
    ],
  },
  {
    h: ["Nasıl biter?", "How it ends"],
    p: [
      [
        "TELEFONU İADE ET dosyayı kapatan, geri dönüşü olmayan bir karardır ve onay ister. O ana kadar ne bulduğun ve mahremiyeti ne kadar zorladığın sonucu belirler. Telefonu istediğin an iade edebilirsin — erken kapatmak da geçerli bir seçimdir.",
        "RETURN THE PHONE closes the file for good and asks for confirmation. What you found by then, and how hard you pushed on privacy, decide the outcome. You may return it at any time; closing early is a valid choice.",
      ],
    ],
  },
  {
    h: ["Sık yapılan hatalar", "Common mistakes"],
    list: [
      [
        "Her öğeye dokunmak: mahremiyet bedeli sonucun içine yazılır.",
        "Tapping everything — the privacy cost is written into your ending.",
      ],
      [
        "Kilitli bir öğeyi zorlamak; önce ilişkili ipucunu bulmak gerekir.",
        "Trying to force a locked item; you need its related clue first.",
      ],
      [
        "Çelişen iki bulgudan yalnız birine bakıp dosyayı kapatmak.",
        "Closing the file after reading only one side of a contradiction.",
      ],
    ],
  },
];
