// Клиент REST API MoodTracker.
// В dev-режиме Vite проксирует /api/* на http://localhost:5000 (см. vite.config.js),
// поэтому здесь CORS не возникает.

const BASE = '/api/mood'

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`Запрос не удался: ${response.status} ${response.statusText}`)
  }
  // 204 No Content (PUT/DELETE) — тела нет
  if (response.status === 204) return null
  return response.json()
}

export const moodApi = {
  /** GET /mood — все записи */
  getAll: () => request(''),

  /** GET /mood/{id} — одна запись */
  get: (id) => request(`/${id}`),

  /** POST /mood — создать запись */
  create: (entry) =>
    request('', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  /** PUT /mood/{id} — отредактировать запись */
  update: (id, entry) =>
    request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...entry }),
    }),

  /** DELETE /mood/{id} — удалить запись по id */
  remove: (id) => request(`/${id}`, { method: 'DELETE' }),
}
