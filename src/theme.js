// Загрузка пользовательской темы из /custom/theme.json (папка public/custom).
// Всё необязательно: нет файла или поля — используются значения по умолчанию.
import { reactive } from 'vue'

export const theme = reactive({
  moods: {}, // { Awful: { color, image }, ... } — переопределения из theme.json
  background: null, // '/custom/background.jpg' или null
})

const COLOR_VARS = {
  bg: '--bg',
  card: '--card',
  text: '--text',
  textMuted: '--text-muted',
  accent: '--accent',
  accentStrong: '--accent-strong',
  accentSoft: '--accent-soft',
  border: '--border',
  danger: '--danger',
}

export async function loadTheme() {
  try {
    const res = await fetch('/custom/theme.json', { cache: 'no-cache' })
    if (!res.ok) return
    const data = await res.json()

    const root = document.documentElement
    for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
      if (data.colors?.[key]) root.style.setProperty(cssVar, data.colors[key])
    }

    theme.background = data.background ? `/custom/${data.background}` : null
    theme.moods = data.emotions ?? {}
  } catch (e) {
    // нет файла или сломанный json — тихо остаёмся на дефолте
    console.warn('Оформление из /custom/theme.json не загружено, используются настройки по умолчанию', e)
  }
}
