<script setup>
import { computed, nextTick, onMounted, ref, watchEffect } from 'vue'
import { moodApi } from './api/moodApi.js'
import { isSameDay, dateTimeInDay, dateKey, MONTHS_GEN } from './utils/date.js'
import { theme } from './theme.js'
import SideBar from './components/SideBar.vue'
import MoodPicker from './components/MoodPicker.vue'
import DiaryList from './components/DiaryList.vue'
import CalendarPanel from './components/CalendarPanel.vue'
import AllEntries from './components/AllEntries.vue'
import EntryModal from './components/EntryModal.vue'

const entries = ref([])
const loading = ref(false)
const error = ref('')
const selectedDate = ref(startOfDay(new Date()))
const mode = ref('today') // 'today' | 'all'
const allEntriesRef = ref(null)

// модалка дневника: null | { mode: 'create' } | { mode: 'edit', entry }
const modal = ref(null)

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

async function loadEntries() {
  loading.value = true
  error.value = ''
  try {
    entries.value = await moodApi.getAll()
  } catch (e) {
    error.value = 'Не удалось загрузить записи. Проверь, что бэкенд запущен на http://localhost:5000'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadEntries)

// фон из /custom/theme.json: картинка + полупрозрачная подложка цвета фона,
// чтобы карточки и текст оставались читаемыми
watchEffect(() => {
  if (theme.background) {
    const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim()
    const tint = bg.startsWith('#') && bg.length === 7 ? bg + 'd9' : bg
    document.body.style.backgroundImage = `linear-gradient(${tint}, ${tint}), url(${theme.background})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
    document.body.style.backgroundAttachment = 'fixed'
  } else {
    document.body.style.removeProperty('background-image')
    document.body.style.removeProperty('background-size')
    document.body.style.removeProperty('background-position')
    document.body.style.removeProperty('background-attachment')
  }
})

// записи выбранного дня (по локальной дате moodAt)
const dayEntries = computed(() =>
  entries.value
    .filter((e) => isSameDay(new Date(e.moodAt), selectedDate.value))
    .sort((a, b) => new Date(a.moodAt) - new Date(b.moodAt)),
)

// запись с настроением дня — последняя запись дня
const dayMoodEntry = computed(() =>
  dayEntries.value.length ? dayEntries.value[dayEntries.value.length - 1] : null,
)

const dayMood = computed(() => dayMoodEntry.value?.mood ?? null)

// записи дневника — все записи дня, включая записи только с настроением
const diaryEntries = computed(() => dayEntries.value)

// «сегодня» или «4 ноября» для заголовков карточки настроения
const dateLabel = computed(() => {
  const d = selectedDate.value
  if (isSameDay(d, new Date())) return 'сегодня'
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
})

/** «+» в карточке настроения: быстрый ввод — всегда создаём новую запись */
async function saveDayMood({ mood, comment }) {
  error.value = ''
  try {
    await moodApi.create({
      mood,
      comment,
      moodAt: dateTimeInDay(selectedDate.value).toISOString(),
    })
    await loadEntries()
  } catch (e) {
    error.value = e.message
  }
}

async function saveEntry({ id, mood, comment, moodAt }) {
  error.value = ''
  try {
    if (id) {
      const existing = entries.value.find((e) => e.id === id)
      await moodApi.update(id, { ...existing, mood, comment, moodAt })
    } else {
      await moodApi.create({ mood, comment, moodAt })
    }
    modal.value = null
    await loadEntries()
  } catch (e) {
    error.value = e.message
  }
}

async function deleteEntry(id) {
  error.value = ''
  try {
    await moodApi.remove(id)
    modal.value = null
    await loadEntries()
  } catch (e) {
    error.value = e.message
  }
}

function selectDate(date) {
  selectedDate.value = startOfDay(date)
}

/** клик по дню в календаре: выбираем день; в режиме «Все записи» ещё и прокручиваем список */
function onCalendarSelect(date) {
  selectDate(date)
  if (mode.value === 'all') {
    nextTick(() => allEntriesRef.value?.scrollToDay(dateKey(date)))
  }
}

/** выбор раздела в сайдбаре */
function onSidebarSelect(item) {
  if (item.key === 'mood') {
    mode.value = 'today'
  } else if (item.key === 'all') {
    mode.value = 'all'
    nextTick(() => allEntriesRef.value?.scrollToDay(dateKey(selectedDate.value)))
  }
}
</script>

<template>
  <div class="layout">
    <SideBar :active="mode === 'all' ? 'all' : 'mood'" @select="onSidebarSelect" />

    <main class="content">
      <template v-if="mode === 'today'">
        <div class="content-inner">
          <p v-if="loading" class="status">Загрузка…</p>
          <p v-else-if="error" class="status status--error">{{ error }}</p>

          <MoodPicker :date-label="dateLabel" @save="saveDayMood" />

          <DiaryList
            :entries="diaryEntries"
            @open="(entry) => (modal = { mode: 'edit', entry })"
            @add="modal = { mode: 'create' }"
          />
        </div>
      </template>

      <AllEntries
        v-else
        ref="allEntriesRef"
        :entries="entries"
        @open="(entry) => (modal = { mode: 'edit', entry })"
        @back="mode = 'today'"
      />
    </main>

    <CalendarPanel
      :selected="selectedDate"
      :entries="entries"
      @select="onCalendarSelect"
    />

    <EntryModal
      v-if="modal"
      :mode="modal.mode"
      :entry="modal.entry"
      :default-mood="dayMood"
      :date="selectedDate"
      @close="modal = null"
      @save="saveEntry"
      @delete="deleteEntry"
    />
  </div>
</template>

<style scoped>
/* три колонки фиксированной ширины вплотную друг к другу,
   вся группа центрируется на странице */
.layout {
  display: grid;
  grid-template-columns: 76px 560px 320px;
  gap: 18px;
  justify-content: center;
  padding: 26px;
  min-height: 100vh;
  align-items: start;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}

/* узкая центральная колонка, чтобы смайлы стояли по центру без пустых полей */
.content-inner {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.status {
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--text-muted);
}

.status--error {
  background: #f7dee3;
  color: var(--danger);
}

@media (max-width: 1040px) {
  .layout {
    grid-template-columns: 64px 1fr;
  }
  .calendar-panel {
    grid-column: 1 / -1;
  }
}
</style>
