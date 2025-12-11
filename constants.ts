import { DictionaryEntry } from './types';

export const MOCK_DATA: DictionaryEntry[] = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    headword: "apple",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ˈap(ə)l/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "Fruit",
        definition: "စားလုံး၊ ပန်းသီး။",
        examples: [
          {
            src: "I ate an apple for breakfast.",
            tgt: "မနက်စာအတွက် ကျွန်တော် ပန်းသီးတစ်လုံး စားခဲ့တယ်။",
            tgt_roman: "ma-net-sar a-twet kya-naw pan-thee ta-lone sar khe del"
          }
        ],
        tags: ["food", "botany"]
      }
    ],
    community_stats: { upvotes: 42, downvotes: 1 }
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    headword: "run",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/rʌn/",
    senses: [
      {
        sense_id: "s1",
        pos: "verb",
        gloss: "Move quickly",
        definition: "ပြေးသည်။",
        examples: [
          {
            src: "He runs every morning.",
            tgt: "သူ မနက်တိုင်း ပြေးတယ်။",
            tgt_roman: "thu ma-net taing pyay del"
          }
        ],
        tags: ["action", "physical"]
      },
      {
        sense_id: "s2",
        pos: "verb",
        gloss: "Manage/Operate",
        definition: "လုပ်ငန်းလည်ပတ်သည်။ စီမံခန့်ခွဲသည်။",
        examples: [
          {
            src: "She runs a small business.",
            tgt: "သူမ စီးပွားရေးလုပ်ငန်း အသေးစားလေးတစ်ခု လုပ်ကိုင်နေတယ်။"
          }
        ],
        tags: ["business"]
      }
    ],
    community_stats: { upvotes: 15, downvotes: 0 }
  },
  {
    id: "a1b2c3d4-e5f6-4a5b-9c8d-1234567890ab",
    headword: "beautiful",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ˈbjuːtɪf(ə)l/",
    senses: [
      {
        sense_id: "s1",
        pos: "adjective",
        gloss: "Aesthetically pleasing",
        definition: "လှပသော။ ချောမောသော။",
        examples: [
          {
            src: "The sunset is beautiful.",
            tgt: "နေဝင်ချိန်က လှပလိုက်တာ။"
          }
        ],
        tags: ["description"]
      }
    ]
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-2345678901bc",
    headword: "democracy",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/dɪˈmɒkrəsi/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "System of government",
        definition: "ဒီမိုကရေစီစနစ်။ ပြည်သူ့အုပ်ချုပ်ရေးစနစ်။",
        examples: [
          {
            src: "Democracy allows people to vote.",
            tgt: "ဒီမိုကရေစီက ပြည်သူတွေကို မဲပေးခွင့်ပြုတယ်။"
          }
        ],
        tags: ["politics", "government"]
      }
    ]
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-3456789012cd",
    headword: "algorithm",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ˈalɡərɪð(ə)m/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "Computational process",
        definition: "အယ်လဂိုရီသမ်။ တွက်ချက်မှုဆိုင်ရာ လုပ်ထုံးလုပ်နည်းအဆင့်ဆင့်။",
        examples: [
          {
            src: "The search algorithm was updated.",
            tgt: "ရှာဖွေမှု အယ်လဂိုရီသမ်ကို မွမ်းမံထားတယ်။"
          }
        ],
        tags: ["technology", "computing"]
      }
    ],
    community_stats: { upvotes: 89, downvotes: 2 }
  },
  {
    id: "d4e5f6a7-b8c9-4d0e-1f23-4567890123de",
    headword: "serendipity",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ˌsɛr(ə)nˈdɪpɪti/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "Happy accident",
        definition: "မမျှော်လင့်ဘဲ ကောင်းသောအရာကို တွေ့ရှိခြင်း။ ကံကောင်းခြင်း။",
        examples: [
          {
            src: "Finding this book was pure serendipity.",
            tgt: "ဒီစာအုပ်ကို တွေ့လိုက်ရတာ တကယ့်ကို မမျှော်လင့်ထားတဲ့ ကံကောင်းမှုပဲ။"
          }
        ],
        tags: ["literary", "abstract"]
      }
    ],
    community_stats: { upvotes: 120, downvotes: 5 }
  },
  {
    id: "e5f6a7b8-c9d0-4e1f-2345-5678901234ef",
    headword: "artificial intelligence",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ˌɑːtɪˈfɪʃ(ə)l ɪnˈtɛlɪdʒ(ə)ns/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "AI",
        definition: "ဉာဏ်ရည်တု။ ကွန်ပျူတာဖြင့် ဖန်တီးထားသော လူသားဆန်သည့် ဉာဏ်ရည်။",
        examples: [
          {
            src: "Artificial intelligence is changing the world.",
            tgt: "ဉာဏ်ရည်တုနည်းပညာက ကမ္ဘာကြီးကို ပြောင်းလဲနေတယ်။"
          }
        ],
        tags: ["technology", "science"]
      }
    ]
  },
  {
    id: "f6a7b8c9-d0e1-4f23-4567-6789012345fg",
    headword: "resilience",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/rɪˈzɪlɪəns/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "Ability to recover",
        definition: "ကြံ့ကြံ့ခံနိုင်စွမ်း။ ဒဏ်ခံနိုင်စွမ်း။",
        examples: [
          {
            src: "She showed great resilience during hard times.",
            tgt: "ခက်ခဲတဲ့အချိန်တွေမှာ သူမက ကြီးမားတဲ့ ကြံ့ကြံ့ခံနိုင်စွမ်းကို ပြသခဲ့တယ်။"
          }
        ],
        tags: ["psychology", "character"]
      }
    ]
  },
  {
    id: "g7a8b9c0-d1e2-4f34-5678-7890123456gh",
    headword: "ephemeral",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ɪˈfɛm(ə)r(ə)l/",
    senses: [
      {
        sense_id: "s1",
        pos: "adjective",
        gloss: "Short-lived",
        definition: "ခဏတာသာခံသော။ တဒင်္ဂမျှသာဖြစ်သော။",
        examples: [
          {
            src: "Fashions are ephemeral.",
            tgt: "ဖက်ရှင်ရေစီးကြောင်းတွေက ခဏတာပါပဲ။"
          }
        ],
        tags: ["literary", "time"]
      }
    ]
  },
  {
    id: "h8a9b0c1-d2e3-4f45-6789-8901234567hi",
    headword: "zeitgeist",
    source_lang: "en",
    target_lang: "my",
    phonetic_ipa: "/ˈzʌɪtɡʌɪst/",
    senses: [
      {
        sense_id: "s1",
        pos: "noun",
        gloss: "Spirit of the times",
        definition: "ခေတ်ရေစီးကြောင်း စိတ်ဓာတ်။ တစ်ခေတ်တာ၏ ယေဘုယျ သဘောထားအမြင်။",
        examples: [
          {
            src: "The novel captures the zeitgeist of the 1920s.",
            tgt: "ဒီဝတ္ထုက ၁၉၂၀ ပြည့်လွန်နှစ်တွေရဲ့ ခေတ်ရေစီးကြောင်းကို ပုံဖော်ထားတယ်။"
          }
        ],
        tags: ["sociology", "borrowed"]
      }
    ]
  }
];