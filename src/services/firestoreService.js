import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * @param {object} data
 */
export async function submitContactMessage(data) {
  const ref = collection(db, 'contactMessages')
  return addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  })
}

/**
 * @param {string} uid
 * @param {{ topic: string, domain: string }} payload
 */
export async function logSearchHistory(uid, payload) {
  if (!uid) return
  const ref = collection(db, 'users', uid, 'searches')
  return addDoc(ref, {
    ...payload,
    createdAt: serverTimestamp(),
  })
}

export async function fetchSearchHistory(uid, maxItems = 20) {
  if (!uid) return []
  const ref = collection(db, 'users', uid, 'searches')
  const snapshot = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(maxItems)))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function logQuizProgress(uid, payload) {
  if (!uid) return
  const ref = collection(db, 'users', uid, 'quizProgress')
  return addDoc(ref, {
    ...payload,
    createdAt: serverTimestamp(),
  })
}

export async function fetchQuizProgress(uid, maxItems = 20) {
  if (!uid) return []
  const ref = collection(db, 'users', uid, 'quizProgress')
  const snapshot = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(maxItems)))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}
