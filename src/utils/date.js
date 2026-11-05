// Помощники для работы с датами. Записи приходят как ISO-строки DateTimeOffset (UTC),
// для группировки по дням приводим их к локальному времени браузера.

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

// JS getDay(): 0=воскресенье..6=суббота
const WEEKDAYS_FULL = [
  'воскресенье', 'понедельник', 'вторник', 'среда',
  'четверг', 'пятница', 'суббота',
]

export function toLocalDate(iso) {
  return new Date(iso)
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function monthTitle(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

/** ключ дня для группировок/скролла: '2026-11-04' (локальная дата) */
export function dateKey(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

/** «4 ноября, вторник» — заголовок группы в списке всех записей */
export function dayLabel(date) {
  return `${date.getDate()} ${MONTHS_GEN[date.getMonth()]}, ${WEEKDAYS_FULL[date.getDay()]}`
}

/** «4 ноября» — подпись даты в колёсике и в заголовке карточки настроения */
export function shortDateLabel(date) {
  return `${date.getDate()} ${MONTHS_GEN[date.getMonth()]}`
}

/**
 * Сетка календаря на месяц: понедельник первым днём недели,
 * дополненная пустыми ячейками (null) до полного числа недель.
 */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  // getDay(): 0=вс..6=сб → сдвигаем к понедельнику
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/** Точка внутри выбранного дня: текущее время для сегодня, полдень для остальных */
export function dateTimeInDay(day) {
  const now = new Date()
  if (isSameDay(day, now)) return now
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0)
}

export { WEEKDAYS, MONTHS, MONTHS_GEN }
