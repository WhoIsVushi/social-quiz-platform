import type { QuizDraft, QuizSettings } from "@/lib/validation/quiz";
type QuestionSeed = { text: string; options: string[] };
const friends: QuestionSeed[] = [
  {
    text: "Birlikte bir günümüz olsa ilk ne yapmak isterim?",
    options: [
      "Kahve içip sohbet etmek",
      "Yeni bir yer keşfetmek",
      "Evde film izlemek",
      "Plansızca dolaşmak",
    ],
  },
  { text: "En sevdiğim mevsim hangisi?", options: ["İlkbahar", "Yaz", "Sonbahar", "Kış"] },
  {
    text: "Moralim bozukken beni en çok ne mutlu eder?",
    options: ["Uzun bir sohbet", "Küçük bir sürpriz", "Biraz yalnız kalmak", "Birlikte gülmek"],
  },
  {
    text: "Hayalimdeki tatil nerede?",
    options: [
      "Deniz kenarında",
      "Dağların arasında",
      "Kalabalık bir şehirde",
      "Yolun götürdüğü yerde",
    ],
  },
  {
    text: "Bir kafede genelde ne sipariş ederim?",
    options: ["Türk kahvesi", "Latte", "Çay", "Soğuk bir içecek"],
  },
  {
    text: "Boş zamanımda en çok ne yaparım?",
    options: ["Müzik dinlerim", "Oyun oynarım", "Kitap okurum", "Dışarı çıkarım"],
  },
  {
    text: "Beni en iyi anlatan özellik hangisi?",
    options: ["Meraklı", "Sakin", "Enerjik", "Duygusal"],
  },
  {
    text: "Telefonumda en çok hangi tür fotoğraf var?",
    options: ["Arkadaşlarım", "Yemekler", "Manzaralar", "Komik ekran görüntüleri"],
  },
  {
    text: "Hangisi beni daha çok heyecanlandırır?",
    options: ["Bir konser", "Yeni bir kitap", "Bir yolculuk", "Sürpriz bir buluşma"],
  },
  {
    text: "Arkadaşlıkta en çok neye önem veririm?",
    options: ["Güvene", "Birlikte eğlenmeye", "Dürüstlüğe", "Birbirini anlamaya"],
  },
];
const relationships: QuestionSeed[] = [
  {
    text: "Birlikte geçireceğimiz ideal akşam nasıl olur?",
    options: [
      "Evde film gecesi",
      "Dışarıda güzel bir yemek",
      "Sahil yürüyüşü",
      "Yeni bir etkinlik",
    ],
  },
  {
    text: "Sevgimi en çok nasıl gösteririm?",
    options: ["Küçük hediyelerle", "Birlikte zaman geçirerek", "Güzel sözlerle", "Destek olarak"],
  },
  {
    text: "Bana alınabilecek en güzel hediye ne?",
    options: ["El yazısıyla bir mektup", "Bir deneyim", "Sevdiğim bir kitap", "Sürpriz bir gezi"],
  },
  {
    text: "Tartışma sonrası en çok neye ihtiyaç duyarım?",
    options: ["Sakinleşmek için zamana", "Konuşmaya", "Sarılmaya", "Anlaşıldığımı hissetmeye"],
  },
  {
    text: "Birlikte hangi anıyı tekrar yaşamak isterim?",
    options: [
      "İlk buluşmamızı",
      "Bir yolculuğumuzu",
      "Bir kutlamamızı",
      "Sıradan ama güzel bir günü",
    ],
  },
  ...friends.slice(1, 6),
];
const family: QuestionSeed[] = [
  {
    text: "Çocukken en sevdiğim aktivite neydi?",
    options: ["Sokakta oynamak", "Resim yapmak", "Çizgi film izlemek", "Kitap okumak"],
  },
  {
    text: "Aile soframızda en sevdiğim yemek hangisi?",
    options: ["Mantı", "Dolma", "Makarna", "Ev yapımı çorba"],
  },
  {
    text: "Evde en çok hangi işi üstlenirim?",
    options: ["Yemek yapmak", "Sofrayı hazırlamak", "Toparlamak", "Alışveriş yapmak"],
  },
  {
    text: "Bir aile buluşmasında beni nerede bulursun?",
    options: [
      "Sohbetin tam ortasında",
      "Mutfakta yardım ederken",
      "Çocuklarla oynarken",
      "Sessizce dinlerken",
    ],
  },
  { text: "Çocukluk hayalim ne olmaktı?", options: ["Doktor", "Öğretmen", "Sanatçı", "Sporcu"] },
  ...friends.slice(1, 6),
];
const fun: QuestionSeed[] = [
  {
    text: "Bir süper gücüm olsa hangisini seçerdim?",
    options: ["Işınlanmak", "Zamanı durdurmak", "Uçmak", "Zihin okumak"],
  },
  {
    text: "Bir yarışmaya katılsam hangisinde şansım daha yüksek?",
    options: ["Bilgi yarışması", "Yemek yarışması", "Yetenek yarışması", "Hayatta kalma yarışması"],
  },
  {
    text: "Bir günlüğüne hangi hayvan olmak isterdim?",
    options: ["Kedi", "Kartal", "Yunus", "Panda"],
  },
  {
    text: "Pizzamın üstünde hangisi kesinlikle olmalı?",
    options: ["Bol peynir", "Mantar", "Zeytin", "Ananas"],
  },
  {
    text: "Arkadaş grubunda benim rolüm hangisi?",
    options: ["Plan yapan", "Herkesi güldüren", "Sakinleştiren", "Maceraya sürükleyen"],
  },
  ...friends.slice(3, 8),
];
const entries = [
  [
    "arkadaslarin-seni-ne-kadar-taniyor",
    "Arkadaşların seni ne kadar tanıyor?",
    "friends",
    "✌️",
    "violet",
    "Küçük detaylar, büyük dostluklar. Bakalım seni kim ezbere biliyor?",
  ],
  [
    "en-yakin-arkadas",
    "En yakın arkadaş testi",
    "friends",
    "🫶",
    "pink",
    "Sırdaşın hakkında bildiklerini eğlenceli bir meydan okumaya dönüştür.",
  ],
  [
    "gercek-dostluk",
    "Gerçek dostluk testi",
    "friends",
    "🤝",
    "mint",
    "Ortak anılarınızı ve sizi siz yapan detayları keşfedin.",
  ],
  [
    "cocukluk-arkadasligi",
    "Çocukluk arkadaşlığı testi",
    "friends",
    "🛝",
    "peach",
    "Eski günleri hatırla, çocukluk dostlarını küçük bir yolculuğa çıkar.",
  ],
  [
    "sevgilin-seni-ne-kadar-taniyor",
    "Sevgilin seni ne kadar tanıyor?",
    "relationships",
    "💌",
    "pink",
    "En sevdiğin insana, seninle ilgili tatlı bir meydan okuma.",
  ],
  [
    "iliski-uyum",
    "İlişki uyum testi",
    "relationships",
    "💞",
    "violet",
    "Tercihlerinizi keşfetmek için keyifli bir sohbet başlangıcı.",
  ],
  [
    "birbirinizi-ne-kadar-taniyorsunuz",
    "Birbirinizi ne kadar tanıyorsunuz?",
    "relationships",
    "🥰",
    "peach",
    "Her cevap yeni bir sohbetin başlangıcı olsun.",
  ],
  [
    "eglenceli-cift",
    "Eğlenceli çift testi",
    "relationships",
    "🍒",
    "pink",
    "Biraz kahkaha, biraz sürpriz, bolca siz.",
  ],
  [
    "ailen-seni-ne-kadar-taniyor",
    "Ailen seni ne kadar tanıyor?",
    "family",
    "🏡",
    "mint",
    "Aile grubuna gönder. Seni en iyi kim tanıyor, birlikte görün.",
  ],
  [
    "kardes-testi",
    "Kardeş testi",
    "family",
    "🧩",
    "peach",
    "Aynı evde büyümek her şeyi bilmek demek mi?",
  ],
  [
    "kuzen-testi",
    "Kuzen testi",
    "family",
    "🌻",
    "mint",
    "Kuzen grubunun en iddialı ismi belli olsun.",
  ],
  [
    "hakkimda-10-soru",
    "Benim hakkımda 10 soru",
    "fun",
    "⚡",
    "peach",
    "On soru, bol sürpriz. Kendini anlatmanın en eğlenceli yolu.",
  ],
  [
    "beni-kim-daha-iyi-taniyor",
    "Beni kim daha iyi tanıyor?",
    "fun",
    "👑",
    "violet",
    "Tatlı bir rekabet için arkadaş grubuna meydan oku.",
  ],
  [
    "zor-sorular",
    "Zor sorular challenge",
    "fun",
    "🔥",
    "pink",
    "Detayları gerçekten hatırlayanlar için bir meydan okuma.",
  ],
  [
    "en-komik-arkadas",
    "En komik arkadaş testi",
    "fun",
    "🪩",
    "peach",
    "İçinizdeki esprileri ve komik tercihleri oyuna taşıyın.",
  ],
] as const;
export const templateCatalog = entries.map(
  ([slug, name, category, emoji, color, description], i) => ({
    slug,
    name,
    category,
    emoji,
    color,
    description,
    isFeatured: [0, 4, 8, 11].includes(i),
    content:
      category === "relationships"
        ? relationships
        : category === "family"
          ? family
          : category === "fun"
            ? fun
            : friends,
  }),
);
export function draftFromTemplate(
  template: {
    name: string;
    category: QuizDraft["category"];
    color: QuizSettings["theme"];
    emoji: string;
    content: QuestionSeed[];
  },
  name: string,
): QuizDraft {
  return {
    title: `${name || "Ben"}: ${template.name}`,
    description: "Bakalım beni ne kadar iyi tanıyorsun? ✨",
    creatorName: name,
    category: template.category,
    visibility: "UNLISTED" as const,
    settings: {
      theme: template.color,
      emoji: template.emoji,
      shuffle: false,
      showScore: true,
      showAnswers: true,
      leaderboard: true,
      allowReplay: true,
      maskNicknames: false,
    },
    questions: template.content.map((q) => ({
      id: crypto.randomUUID(),
      text: q.text,
      explanation: "",
      correctOptionId: null,
      options: q.options.map((text) => ({ id: crypto.randomUUID(), text })),
    })),
  };
}
