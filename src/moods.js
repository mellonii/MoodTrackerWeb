// Значения совпадают с enum Mood на бэкенде (Awful..Great),
// сериализуется enum как строка. Цвет и картинку можно переопределить
// в public/custom/theme.json (см. theme.js).
import { theme } from './theme.js'

export const MOODS = [
  { value: 'Awful',   emoji: '😞', color: '#c25b6e', label: 'Ужасно' },
  { value: 'Bad',     emoji: '🙁', color: '#c68a6b', label: 'Плохо' },
  { value: 'Neutral', emoji: '😐', color: '#c4ad72', label: 'Нормально' },
  { value: 'Good',    emoji: '🙂', color: '#9cb37e', label: 'Хорошо' },
  { value: 'Great',   emoji: '😄', color: '#6fb392', label: 'Отлично' },
]

/** базовое описание + переопределения из theme.json (цвет/картинка) */
export function moodInfo(value) {
  const base = MOODS.find((m) => m.value === value)
  if (!base) return null
  const custom = theme.moods[value]
  return {
    ...base,
    color: custom?.color || base.color,
    image: custom?.image ? `/custom/${custom.image}` : null,
  }
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const v = h.length === 3
    ? [...h].map((c) => c + c).join('')
    : h
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16))
}

/** смешивание двух HEX-цветов: t=0 → a, t=1 → b */
export function mixHex(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const mixed = ca.map((v, i) => Math.round(v + (cb[i] - v) * t))
  return '#' + mixed.map((v) => v.toString(16).padStart(2, '0')).join('')
}

/**
 * Средний оттенок настроений за день: усредняем позицию настроения
 * по шкале Ужасно..Отлично и смешиваем цвета соседних уровней.
 */
export function averageMoodColor(values) {
  if (!values?.length) return null
  const indices = values
    .map((v) => MOODS.findIndex((m) => m.value === v))
    .filter((i) => i >= 0)
  if (!indices.length) return null

  const avg = indices.reduce((a, b) => a + b, 0) / indices.length
  const lo = Math.max(0, Math.min(MOODS.length - 1, Math.floor(avg)))
  const hi = Math.min(lo + 1, MOODS.length - 1)
  const frac = avg - lo

  const colorLo = moodInfo(MOODS[lo].value).color
  const colorHi = moodInfo(MOODS[hi].value).color
  return frac <= 0 || hi === lo ? colorLo : mixHex(colorLo, colorHi, frac)
}
