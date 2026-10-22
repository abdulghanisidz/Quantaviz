const SCRIPT_PATTERNS = [
  { id: 'hi', label: 'Hindi', pattern: /[\u0900-\u097F]/, sttLang: 'hi-IN', ttsLang: 'hi-IN' },
  { id: 'bn', label: 'Bengali', pattern: /[\u0980-\u09FF]/, sttLang: 'bn-IN', ttsLang: 'bn-IN' },
  { id: 'ta', label: 'Tamil', pattern: /[\u0B80-\u0BFF]/, sttLang: 'ta-IN', ttsLang: 'ta-IN' },
  { id: 'te', label: 'Telugu', pattern: /[\u0C00-\u0C7F]/, sttLang: 'te-IN', ttsLang: 'te-IN' },
  { id: 'ur', label: 'Urdu', pattern: /[\u0600-\u06FF]/, sttLang: 'ur-PK', ttsLang: 'ur-PK' },
]

const ROMAN_ENGLISH_HINTS = [
  'kya', 'kaise', 'kyun', 'mera', 'meri', 'mujhe', 'tum', 'samjhao', 'samjha', 'batao', 'matlab',
  'ka', 'ki', 'ke', 'aur', 'isme', 'iska', 'hota', 'karna', 'english me', 'roman', 'hinglish',
]

const ENGLISH_HINTS = [
  'what', 'why', 'how', 'explain', 'define', 'difference', 'between', 'topic', 'learn', 'concept',
]

function normalizeText(value) {
  return String(value || '').trim()
}

export function detectLanguageProfile(input) {
  const text = normalizeText(input)
  const lower = text.toLowerCase()

  for (const script of SCRIPT_PATTERNS) {
    if (script.pattern.test(text)) {
      return {
        id: script.id,
        label: script.label,
        inputMode: 'native-script',
        promptInstruction: `Respond in ${script.label}, using the same script as the user's query.`,
        sttLang: script.sttLang,
        ttsLang: script.ttsLang,
      }
    }
  }

  const romanScore = ROMAN_ENGLISH_HINTS.reduce(
    (score, hint) => score + (lower.includes(hint) ? 1 : 0),
    0,
  )
  const englishScore = ENGLISH_HINTS.reduce(
    (score, hint) => score + (lower.includes(hint) ? 1 : 0),
    0,
  )

  if (romanScore >= 2 && romanScore >= englishScore) {
    return {
      id: 'roman-en',
      label: 'Roman English',
      inputMode: 'romanized',
      promptInstruction:
        "Respond in Roman English or Hinglish style using only Latin script. Do not switch to Hindi script.",
      sttLang: 'hi-IN',
      ttsLang: 'hi-IN',
    }
  }

  return {
    id: 'en',
    label: 'English',
    inputMode: 'latin',
    promptInstruction: 'Respond in clear English.',
    sttLang: 'en-US',
    ttsLang: 'en-US',
  }
}

export function buildLanguageDirective(input) {
  return detectLanguageProfile(input).promptInstruction
}
