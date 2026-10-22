import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { addLocalQuizProgress } from '../../services/activityStore'
import { logQuizProgress } from '../../services/firestoreService'
import GlassCard from '../ui/GlassCard'

function normalizeAnswer(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export default function QuizPanel({ topic, questions }) {
  const { user } = useAuth()
  const [picked, setPicked] = useState({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setPicked({})
    setShowFeedback(false)
    setSubmitted(false)
  }, [questions, topic])

  const allAnswered = questions.every((question, index) => picked[question.id || `q-${index}`] !== undefined)
  const score = useMemo(() => {
    return questions.reduce((total, question, index) => {
      const questionId = question.id || `q-${index}`
      const selected = picked[questionId]
      const correctIndex = question.options.findIndex(
        (option) => normalizeAnswer(option) === normalizeAnswer(question.correct_answer),
      )
      return total + (selected === correctIndex ? 1 : 0)
    }, 0)
  }, [picked, questions])

  const submitAnswers = async () => {
    setShowFeedback(true)
    if (submitted) return
    setSubmitted(true)
    const payload = {
      topic,
      totalQuestions: questions.length,
      correctAnswers: score,
      accuracy: questions.length ? Math.round((score / questions.length) * 100) : 0,
    }

    addLocalQuizProgress(payload)
    if (user?.uid) {
      try {
        await logQuizProgress(user.uid, payload)
      } catch {}
    }
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Quick quiz
          </h3>
          <span className="text-xs text-slate-500">3 questions with instant feedback</span>
        </div>
        {showFeedback ? (
          <span className="rounded-full bg-[var(--qv-accent-soft)] px-3 py-1 text-xs font-semibold text-white">
            Score {score}/{questions.length}
          </span>
        ) : null}
      </div>

      <div className="space-y-5">
        {questions.map((question, index) => {
          const questionId = question.id || `q-${index}`
          const selected = picked[questionId]
          const correctIndex = question.options.findIndex(
            (option) => normalizeAnswer(option) === normalizeAnswer(question.correct_answer),
          )
          const isCorrect = selected === correctIndex

          return (
            <div key={questionId} className="qv-panel-subtle rounded-xl border border-white/10 p-4">
              <p className="mb-3 text-sm font-medium text-slate-200">
                {index + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex
                  const showCorrectGlow = showFeedback && optionIndex === correctIndex
                  const showWrongGlow = showFeedback && isSelected && optionIndex !== correctIndex

                  return (
                    <button
                      key={`${questionId}-${optionIndex}`}
                      type="button"
                      onClick={() => setPicked((current) => ({ ...current, [questionId]: optionIndex }))}
                      className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? 'border-[var(--qv-accent)]/50 bg-[var(--qv-accent-soft)] text-white'
                          : 'border-white/10 bg-transparent text-slate-300 hover:border-white/20'
                      } ${
                        showCorrectGlow
                          ? 'ring-1 ring-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.45)]'
                          : ''
                      } ${
                        showWrongGlow
                          ? 'ring-1 ring-rose-400/75 shadow-[0_0_18px_rgba(244,63,94,0.45)]'
                          : ''
                      }`}
                    >
                      <span className="mt-0.5 font-mono text-xs text-slate-500">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>
              <AnimatePresence>
                {showFeedback && selected !== undefined ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 space-y-1"
                  >
                    <p className={`text-xs font-medium ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCorrect ? 'Correct.' : `Correct answer: ${question.correct_answer}`}
                    </p>
                    {question.explanation ? (
                      <p className="text-xs text-slate-400">{question.explanation}</p>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submitAnswers}
          disabled={!allAnswered}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)`,
          }}
        >
          Check answers
        </motion.button>
        <button
          type="button"
          onClick={() => {
            setPicked({})
            setShowFeedback(false)
            setSubmitted(false)
          }}
          className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
        >
          Reset
        </button>
      </div>
    </GlassCard>
  )
}
