/**
 * Placeholder responses until backend / OpenAI integration is wired.
 * Replace `fetchLearningBundle` with a real API call returning the same shape.
 */

/**
 * @param {string} topic
 * @param {boolean} broMode
 */
export function buildTheoryContent(topic, broMode) {
  const t = topic || 'your topic'
  if (broMode) {
    return {
      simple: `Alright — ${t} in bro terms: it's basically the universe (or engineers) flexing patterns. Picture it like a video game mechanic you can actually use IRL once you see the pattern.`,
      analogy: `Like when your friend explains a boss fight after you wiped ten times — same energy, but for ${t}.`,
      keyPoints: [
        'Big idea first, details when you need them',
        'Visuals beat walls of text',
        'You learn faster when it clicks emotionally + spatially',
      ],
    }
  }
  return {
    simple: `${t} is easier when you connect the idea to structure and motion. This panel is a preview: your production app will replace this text with model-generated explanations tailored to the learner and domain.`,
    analogy: `Think of ${t} like a map: the concept is the territory, and diagrams, 3D, and simulations are different zoom levels that help you navigate without getting lost in jargon.`,
    keyPoints: [
      'Core principle: separate “what it is” from “how it behaves.”',
      'Use visuals to anchor definitions and equations.',
      'Iterate with quizzes to lock in understanding.',
    ],
  }
}

/**
 * @param {string} topic
 */
export function buildMermaidSource(topic) {
  const safe = (topic || 'Concept').replace(/"/g, "'").slice(0, 40)
  return `flowchart LR
    A["${safe}"] --> B[Theory]
    A --> C[Diagram]
    A --> D[3D Model]
    C --> E[Simulation]
    D --> E
    E --> F[Quiz Mastery]`
}

/**
 * @param {string} topic
 */
export function buildStructuredRecap(standard) {
  return {
    simple: standard.keyPoints.join(' · '),
    analogy: 'Use this column as a tight recap before jumping back into visuals.',
    keyPoints: ['Skim once', 'Test yourself', 'Re-run the sim'],
  }
}

export function buildQuiz(topic) {
  const label = topic || 'this concept'
  return [
    {
      id: 'q1',
      question: `Which best describes a productive first step when learning ${label}?`,
      options: [
        'Memorize every term before seeing a picture',
        'Build intuition with a simple model, then add detail',
        'Skip practice problems entirely',
      ],
      correctIndex: 1,
    },
    {
      id: 'q2',
      question: 'Why combine diagrams with simulation?',
      options: [
        'Simulations are only for entertainment',
        'They let you test “what if” and build causal intuition',
        'Diagrams replace the need for any math',
      ],
      correctIndex: 1,
    },
    {
      id: 'q3',
      question: 'What is the role of spaced repetition and quizzes?',
      options: [
        'To make the UI look busy',
        'To strengthen recall and reveal gaps early',
        'To replace explanations completely',
      ],
      correctIndex: 1,
    },
  ]
}
