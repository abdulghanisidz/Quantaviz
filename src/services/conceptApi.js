import { buildLanguageDirective } from './languageProfile'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-20b'
const UNSAFE_KEYWORDS = {
  violence: ['kill', 'murder', 'stab', 'shoot', 'assassinate', 'attack'],
  adult: ['porn', 'sex video', 'nude', 'xxx', 'explicit sex'],
  illegal: ['hack account', 'make drugs', 'counterfeit', 'steal', 'fraud'],
  self_harm: ['suicide', 'self harm', 'cut myself', 'how to die'],
  hate: ['hate speech', 'racial slur', 'genocide'],
  dangerous: ['bomb', 'weapon', 'explosive', 'poison', 'how to make a gun'],
}
const UNSAFE_PATTERNS = [
  { category: 'self_harm', pattern: /\b(can|should|want to|how to|ways to)?\s*(i|me|myself)\s*(kill|hurt|harm|cut|poison)\s*(myself)?\b/i },
  { category: 'self_harm', pattern: /\b(suicide|self[\s-]?harm|end my life|want to die|how to die)\b/i },
  { category: 'violence', pattern: /\b(can|how do|how to|should|want to)?\s*(i|we)\s*(kill|hurt|harm|attack|stab|shoot|poison)\s*(him|her|them|someone|my friend|my brother|my sister|my wife|my husband|people)\b/i },
  { category: 'violence', pattern: /\b(kill|hurt|harm|attack|stab|shoot|poison)\s*(my friend|someone|a person|people|him|her|them)\b/i },
  { category: 'dangerous', pattern: /\b(how to make|make|build|create)\s*(a|an)?\s*(bomb|explosive|weapon|gun|poison)\b/i },
  { category: 'illegal', pattern: /\b(how to|ways to|can i)\s*(hack|steal|fraud|counterfeit|bypass security)\b/i },
  { category: 'adult', pattern: /\b(child porn|rape|sexual assault|forced sex)\b/i },
  { category: 'hate', pattern: /\b(genocide|ethnic cleansing|racial slur|hate speech)\b/i },
]

function buildRejectedPayload() {
  return {
    status: 'rejected',
    reason: 'unsafe_query',
    message: 'Sorry, I cannot help with this topic. Please try a safe educational concept.',
    domain: 'default',
    explanation: '',
    flowchart: '',
    visual_type: 'none',
    visual_data: {},
    quiz: [],
  }
}

function buildErrorPayload() {
  return {
    status: 'error',
    message: 'Unable to generate safe educational content. Please try again.',
    domain: 'default',
    explanation: '',
    flowchart: '',
    visual_type: 'none',
    visual_data: {},
    quiz: [],
  }
}

function detectUnsafeQuery(query) {
  const lowered = String(query || '').toLowerCase()
  const normalized = lowered.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  for (const { category, pattern } of UNSAFE_PATTERNS) {
    if (pattern.test(normalized)) return category
  }
  for (const [category, keywords] of Object.entries(UNSAFE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return category
  }
  return ''
}

function normalizeAnswerText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function buildPrompt(topic) {
  const languageDirective = buildLanguageDirective(topic)
  return `Explain this topic simply for a student.
Language rule:
- ${languageDirective}
Format rules for "explanation":
- Write at least 2 substantial paragraphs.
- Each paragraph should be roughly 5-6 lines in length.
- After the paragraphs, add exactly 3 bullet points using "- " prefix.
- Keep language clear, practical, and beginner-friendly.

Also generate:

1. A flowchart in Mermaid.js format (if applicable)
2. Visual instructions:
   - If diagram: provide useful labels/steps.
   - If animation: provide a concise animation description.
   - If simulation: provide a simulation keyword for lookup.
3. 3 quiz questions with answers and explanations:
   - Every quiz question must be specifically about "${topic}"
   - Do not ask generic study-skill questions
   - Each question should mention the topic directly or a core term from it
   - Prefer one definition question, one mechanism/working question, and one application/example question
   - question
   - options (4)
   - answer
   - explanation

Return STRICT JSON:
{
  "domain": "medical | biology | chemistry | quantum | mechanical | civil | electrical | data_structures | mathematics | environmental | tech | default",
  "explanation": "",
  "flowchart": "",
  "visual_type": "diagram | animation | simulation | none",
  "visual_data": {
    "title": "",
    "description": "",
    "labels": [],
    "steps": [],
    "simulation_query": ""
  },
  "quiz": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "answer": "",
      "explanation": ""
    }
  ]
}

Topic: ${topic}`
}

function fallbackPayload(topic) {
  const safeTopic = topic || 'this topic'
  const fallbackExplanation = `${safeTopic} is easier to understand when you break it into what it is, how it behaves, and why it matters in real problems. Start with the core idea first, then connect it to a simple mental model so each detail has a place. As you read, focus on cause-and-effect relationships and not just definitions, because that makes the concept easier to apply later. When examples are tied to everyday intuition, abstract terms become concrete and easier to remember. This approach gives you a stable foundation before you move into diagrams, formulas, and simulations.

Once the basic picture is clear, you can deepen understanding by comparing different scenarios and asking what changes when one variable shifts. That habit turns passive reading into active reasoning, which is where real learning happens. Practice works best when you alternate between explanation, visualization, and short self-checks, because each mode reinforces the others. If something feels confusing, return to the big idea and rebuild step by step instead of memorizing isolated facts. Over time, this loop improves both conceptual clarity and long-term recall.
- Start with the big idea before details.
- Use visuals to connect terms with behavior.
- Test understanding with short, frequent quizzes.`
  return {
    status: 'success',
    domain: 'default',
    explanation: fallbackExplanation,
    flowchart: '',
    visual_type: 'none',
    visual_data: {
      title: safeTopic,
      description: '',
      labels: [],
      steps: [],
      simulation_query: '',
    },
    quiz: buildTopicSpecificQuiz(safeTopic, fallbackExplanation),
  }
}

function splitSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function cleanSentence(sentence) {
  return String(sentence || '')
    .replace(/^[-*]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]+$/, '')
}

function topicKeywords(topic) {
  const stopwords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'into', 'is',
    'it', 'of', 'on', 'or', 'the', 'to', 'what', 'when', 'where', 'which', 'why', 'with', 'your',
  ])
  return Array.from(
    new Set(
      String(topic || '')
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu)?.filter((word) => word.length > 1 && !stopwords.has(word)) || [],
    ),
  )
}

function countKeywordHits(text, keywords) {
  const haystack = String(text || '').toLowerCase()
  return keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0)
}

function buildTopicSpecificQuiz(topic, explanation) {
  const t = topic || 'this topic'
  const sentences = splitSentences(explanation)
    .map(cleanSentence)
    .filter(Boolean)
  const primary = sentences[0] || `${t} is best understood by focusing on what it is and how it behaves`
  const secondary = sentences[1] || `${t} becomes clearer when you connect its key parts and their effects`
  const tertiary = sentences[2] || `${t} is easier to remember when linked to examples and practical reasoning`

  return [
    {
      question: `Which statement best describes ${t}?`,
      options: [
        primary,
        `${t} is only a memorization trick with no real mechanism`,
        `${t} has no relation to how systems behave`,
        `${t} can only be understood without any conceptual model`,
      ],
      correct_answer: primary,
      explanation: primary,
    },
    {
      question: `According to the explanation, what is most important when understanding ${t}?`,
      options: [
        secondary,
        `Avoid linking causes and effects in ${t}`,
        `Treat ${t} as isolated facts with no relationships`,
        `Ignore the main idea behind ${t} and focus only on jargon`,
      ],
      correct_answer: secondary,
      explanation: secondary,
    },
    {
      question: `Which statement is most consistent with how ${t} should be applied or interpreted?`,
      options: [
        tertiary,
        `${t} should never be connected to examples or real situations`,
        `${t} becomes stronger when you remove all reasoning and context`,
        `${t} is unrelated to changes in variables or conditions`,
      ],
      correct_answer: tertiary,
      explanation: tertiary,
    },
  ]
}

function isTopicRelevantQuizItem(item, topic) {
  const keywords = topicKeywords(topic)
  const joined = [
    item?.question,
    item?.correct_answer,
    item?.explanation,
    ...(Array.isArray(item?.options) ? item.options : []),
  ].join(' ')
  const normalizedQuestion = String(item?.question || '').toLowerCase()
  const genericPatterns = [
    'best first step when learning',
    'why use visuals',
    'what improves learning most',
    'study skill',
    'learning most',
  ]

  if (genericPatterns.some((pattern) => normalizedQuestion.includes(pattern))) {
    return false
  }

  if (String(topic || '').trim() && joined.toLowerCase().includes(String(topic).toLowerCase())) {
    return true
  }

  return countKeywordHits(joined, keywords) >= Math.max(1, Math.min(2, keywords.length))
}

function buildSentencePool(topic, baseText) {
  const t = topic || 'this topic'
  const defaults = [
    `${t} becomes easier when you connect definitions to how the system behaves in real situations.`,
    `Focus on relationships between variables so each detail has a clear purpose and context.`,
    `Use examples to test your intuition, then verify that intuition with structured reasoning.`,
    `When one factor changes, ask what else changes and why, because that builds deep understanding.`,
    `This concept is strongest when explained visually, practiced actively, and reviewed with short checks.`,
    `Try translating the idea into your own words and compare that with the formal explanation.`,
    `Think in cause-and-effect chains rather than isolated facts to improve recall and application.`,
    `A strong conceptual model helps you solve new problems even when the question format changes.`,
    `Pair theory with diagrams or simulation to convert abstract ideas into concrete mental pictures.`,
    `Repetition with variation is key: revisit the same idea in different scenarios until it feels natural.`,
  ]
  const fromText = splitSentences(baseText)
  return [...fromText, ...defaults]
}

function ensureParagraphs(topic, bodyText) {
  const cleaned = String(bodyText || '').trim()
  if (!cleaned) return []

  const rawParagraphs = cleaned
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  const sentencePool = buildSentencePool(topic, cleaned)
  let cursor = 0
  const takeSentences = (count) => {
    const picked = []
    while (picked.length < count && sentencePool.length) {
      picked.push(sentencePool[cursor % sentencePool.length])
      cursor += 1
    }
    return picked
  }

  const paragraphs = rawParagraphs.length ? rawParagraphs : [cleaned]
  const normalized = paragraphs
    .slice(0, 2)
    .map((p) => {
      const s = splitSentences(p)
      if (s.length >= 5) return s.slice(0, 6).join(' ')
      const fill = [...s, ...takeSentences(6 - s.length)]
      return fill.slice(0, 6).join(' ')
    })

  while (normalized.length < 2) {
    normalized.push(takeSentences(6).join(' '))
  }

  return normalized.slice(0, 2)
}

function ensureBullets(topic, bulletLines, sourceText) {
  const existing = bulletLines
    .map((line) => line.replace(/^[*•]\s+/, '- ').trim())
    .filter((line) => line.startsWith('- '))
    .slice(0, 3)

  if (existing.length === 3) return existing

  const t = topic || 'the topic'
  const sourceSentences = splitSentences(sourceText)
  const generated = [
    `- Start with the core idea of ${t} before diving into formulas or details.`,
    '- Use a diagram or simulation to connect terms with behavior.',
    '- Check understanding with short questions and scenario-based practice.',
  ]

  if (sourceSentences.length) {
    generated[0] = `- ${sourceSentences[0].replace(/[.!?]+$/, '')}.`
  }

  const merged = [...existing]
  for (const item of generated) {
    if (merged.length < 3) merged.push(item)
  }
  return merged.slice(0, 3)
}

function normalizeExplanation(value, topic) {
  const text = String(value || '').trim()
  if (!text) return fallbackPayload(topic).explanation

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  const bulletLines = lines.filter((line) => /^[-*•]\s+/.test(line))
  const bodyLines = lines.filter((line) => !/^[-*•]\s+/.test(line))
  const bodyText = bodyLines.join('\n').trim()

  const paragraphs = ensureParagraphs(topic, bodyText || text)
  const bullets = ensureBullets(topic, bulletLines, bodyText || text)

  if (!paragraphs.length) return fallbackPayload(topic).explanation
  return `${paragraphs[0]}\n\n${paragraphs[1]}\n${bullets.join('\n')}`
}

function normalizeVisualData(value, topic) {
  const fallback = {
    title: topic || '',
    description: '',
    labels: [],
    steps: [],
    simulation_query: '',
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const labels = Array.isArray(value.labels) ? value.labels.slice(0, 8).map((item) => String(item)) : []
    const steps = Array.isArray(value.steps) ? value.steps.slice(0, 8).map((item) => String(item)) : []
    return {
      title: String(value.title || fallback.title),
      description: String(value.description || ''),
      labels,
      steps,
      simulation_query: String(value.simulation_query || value.simulationQuery || ''),
    }
  }

  if (typeof value === 'string') {
    const text = value.trim()
    return {
      ...fallback,
      description: text,
      simulation_query: text,
    }
  }

  return fallback
}

function extractJsonBlock(text) {
  const cleanedText = String(text || '').trim()

  if (!cleanedText) {
    throw new Error('Empty AI response.')
  }

  let cleaned = cleanedText
  if (cleaned.startsWith('```')) {
    const lines = cleaned.split('\n')
    if (lines.length >= 3) {
      cleaned = lines.slice(1, -1).join('\n').trim()
    }
  }

  const start = cleaned.indexOf('{')
  if (start === -1) {
    throw new Error('No JSON object found in response.')
  }

  let depth = 0
  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i]
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return cleaned.slice(start, i + 1)
      }
    }
  }

  throw new Error('Incomplete JSON object in response.')
}

function normalizePayload(data, topic) {
  const base = fallbackPayload(topic)
  const normalizeDomain = (value) => {
    const normalized = String(value || 'default').trim().toLowerCase()
    return ['medical', 'biology', 'chemistry', 'quantum', 'mechanical', 'civil', 'electrical', 'data_structures', 'mathematics', 'environmental', 'tech', 'default'].includes(normalized)
      ? normalized
      : 'default'
  }

  const normalizeVisualType = (value) => {
    const normalized = String(value || 'none').trim().toLowerCase()
    if (normalized === '3d' || normalized === 'animation') return 'animation'
    if (normalized === 'diagram' || normalized === 'simulation' || normalized === 'none') return normalized
    return 'none'
  }

  const rawQuiz = Array.isArray(data?.quiz) ? data.quiz : []
  const normalizedQuiz = rawQuiz
    .slice(0, 3)
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const quizQuestion =
        item.question || item.Question || item.prompt || item.Prompt || ''
      const quizOptionsRaw = item.options || item.Options || []
      const quizAnswer = item.answer || item.Answer || item.correct_answer || item.correctAnswer || ''
      const quizExplanation = item.explanation || item.Explanation || ''

      const options = Array.isArray(quizOptionsRaw)
        ? quizOptionsRaw.slice(0, 4).map((option) => String(option))
        : []
      const normalizedAnswer = normalizeAnswerText(quizAnswer)
      const correctOptionIndex = options.findIndex((option) => normalizeAnswerText(option) === normalizedAnswer)
      if (quizAnswer && correctOptionIndex === -1) {
        if (options.length < 4) options.push(String(quizAnswer))
        else options[0] = String(quizAnswer)
      }
      while (options.length < 4) options.push('')

      return {
        question: String(quizQuestion),
        options,
        correct_answer: String(quizAnswer),
        explanation: String(quizExplanation),
      }
    })
  const fallbackQuiz = buildTopicSpecificQuiz(
    topic,
    data?.explanation || base.explanation,
  )
  const topicalQuiz = normalizedQuiz.filter((item) => isTopicRelevantQuizItem(item, topic))

  return {
    status: data?.status === 'rejected' ? 'rejected' : 'success',
    reason: data?.reason || '',
    message: data?.message || '',
    domain: normalizeDomain(data?.domain),
    explanation: normalizeExplanation(data?.explanation || base.explanation, topic),
    flowchart: String(data?.flowchart || ''),
    visual_type: normalizeVisualType(data?.visual_type),
    visual_data: normalizeVisualData(data?.visual_data, topic),
    quiz: topicalQuiz.length === 3 ? topicalQuiz : fallbackQuiz,
  }
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini error ${response.status}: ${text}`)
  }

  const body = await response.json()
  return body?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callGroq(prompt) {
  if (!GROQ_API_KEY) throw new Error('Missing VITE_GROQ_API_KEY')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Groq error ${response.status}: ${text}`)
  }

  const body = await response.json()
  return body?.choices?.[0]?.message?.content || ''
}

export async function getConcept(topic) {
  const cleanTopic = String(topic || '').trim()
  if (!cleanTopic) throw new Error('Topic is required')
  if (detectUnsafeQuery(cleanTopic)) return buildRejectedPayload()

  const prompt = buildPrompt(cleanTopic)
  const errors = []
  const providers = [
    { name: 'Gemini', call: callGemini },
    { name: 'Groq', call: callGroq },
  ]

  for (const provider of providers) {
    try {
      const raw = await provider.call(prompt)
      const jsonText = extractJsonBlock(raw)
      const parsed = JSON.parse(jsonText)
      return normalizePayload(parsed, cleanTopic)
    } catch (error) {
      errors.push(`${provider.name}: ${error?.message || 'Unknown error'}`)
    }
  }

  return buildErrorPayload()
}
