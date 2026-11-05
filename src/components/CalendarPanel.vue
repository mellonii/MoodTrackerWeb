<script setup>
// Календарь справа: три уровня — дни → месяцы → годы.
// Клик по месяцу/году в заголовке открывает выбор, стрелки листают текущий уровень.
import { computed, ref, watch } from 'vue'
import { isSameDay, monthGrid, WEEKDAYS, MONTHS } from '../utils/date.js'
import { averageMoodColor } from '../moods.js'

const props = defineProps({
  selected: { type: Date, required: true },
  entries: { type: Array, required: true },
})

const emit = defineEmits(['select'])

const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const view = ref('days') // 'days' | 'months' | 'years'
const viewMonth = ref(new Date(props.selected.getFullYear(), props.selected.getMonth(), 1))
const yearPageStart = ref(viewMonth.value.getFullYear() - 5)

const today = new Date()

const grid = computed(() =>
  monthGrid(viewMonth.value.getFullYear(), viewMonth.value.getMonth()),
)

const years = computed(() =>
  Array.from({ length: 16 }, (_, i) => yearPageStart.value + i),
)

// держим отображаемый месяц в синхронизации с выбранным днём
watch(
  () => props.selected,
  (d) => {
    if (view.value === 'days') {
      viewMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
    }
  },
)

// все настроения дня → точка под числом красится средним оттенком за день
const moodsByDay = computed(() => {
  const map = new Map()
  for (const entry of props.entries) {
    const d = new Date(entry.moodAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(entry.mood)
  }
  return map
})

function dayDotColor(date) {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  return averageMoodColor(moodsByDay.value.get(key))
}

/** стрелки: в днях — месяц, в месяцах — год, в годах — страница из 16 лет */
function shift(delta) {
  const y = viewMonth.value.getFullYear()
  const m = viewMonth.value.getMonth()
  if (view.value === 'days') {
    viewMonth.value = new Date(y, m + delta, 1)
  } else if (view.value === 'months') {
    viewMonth.value = new Date(y + delta, m, 1)
  } else {
    yearPageStart.value += delta * 16
  }
}

function openYears() {
  yearPageStart.value = viewMonth.value.getFullYear() - 5
  view.value = 'years'
}

function pickMonth(m) {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), m, 1)
  view.value = 'days'
}

function pickYear(y) {
  viewMonth.value = new Date(y, viewMonth.value.getMonth(), 1)
  view.value = 'months'
}
</script>

<template>
  <aside class="calendar-panel card">
    <div class="cal-head">
      <button class="cal-nav" @click="shift(-1)">←</button>

      <div v-if="view === 'days'" class="cal-title">
        <button class="cal-title__part" title="Выбрать месяц" @click="view = 'months'">
          {{ MONTHS[viewMonth.getMonth()] }}
        </button>
        <button class="cal-title__part" title="Выбрать год" @click="openYears">
          {{ viewMonth.getFullYear() }}
        </button>
      </div>
      <div v-else-if="view === 'months'" class="cal-title">
        <button class="cal-title__part" title="Выбрать год" @click="openYears">
          {{ viewMonth.getFullYear() }}
        </button>
      </div>
      <div v-else class="cal-title">
        <span class="cal-title__range">{{ yearPageStart }} – {{ yearPageStart + 15 }}</span>
      </div>

      <button class="cal-nav" @click="shift(1)">→</button>
    </div>

    <!-- дни -->
    <template v-if="view === 'days'">
      <div class="cal-grid cal-weekdays">
        <span v-for="wd in WEEKDAYS" :key="wd">{{ wd }}</span>
      </div>

      <div class="cal-grid">
        <template v-for="(cell, i) in grid" :key="i">
          <span v-if="!cell" class="cal-cell cal-cell--empty" />
          <button
            v-else
            class="cal-cell"
            :class="{
              'cal-cell--selected': isSameDay(cell, selected),
              'cal-cell--today': isSameDay(cell, today),
            }"
            @click="emit('select', cell)"
          >
            {{ cell.getDate() }}
            <span
              v-if="dayDotColor(cell)"
              class="cal-dot"
              :style="{ background: dayDotColor(cell) }"
            />
          </button>
        </template>
      </div>
    </template>

    <!-- месяцы -->
    <div v-else-if="view === 'months'" class="cal-grid cal-grid--3">
      <button
        v-for="(name, m) in MONTHS_SHORT"
        :key="m"
        class="cal-big"
        :class="{ 'cal-big--cur': m === viewMonth.getMonth() }"
        @click="pickMonth(m)"
      >
        {{ name }}
      </button>
    </div>

    <!-- годы -->
    <div v-else class="cal-grid cal-grid--4">
      <button
        v-for="y in years"
        :key="y"
        class="cal-big"
        :class="{ 'cal-big--cur': y === viewMonth.getFullYear() }"
        @click="pickYear(y)"
      >
        {{ y }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.calendar-panel {
  position: sticky;
  top: 26px;
}

.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.cal-title {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.cal-title__part {
  font-weight: 600;
  font-size: 16px;
}

.cal-title__part:hover {
  color: var(--accent);
  text-decoration: underline;
}

.cal-title__range {
  font-weight: 600;
  font-size: 15px;
}

.cal-nav {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 16px;
}

.cal-nav:hover {
  background: var(--accent-soft);
  color: var(--text);
}

.cal-grid {
  display: grid;
  gap: 4px;
}

.cal-grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

.cal-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

.cal-weekdays {
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.cal-grid:not(.cal-weekdays) {
  grid-template-columns: repeat(7, 1fr);
}

.cal-cell {
  position: relative;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 13px;
}

button.cal-cell:hover {
  background: var(--accent-soft);
}

/* сегодняшний день — заливка оттенком */
.cal-cell--today {
  background: color-mix(in srgb, var(--accent) 32%, transparent);
  font-weight: 700;
  color: var(--text);
}

/* выбранный день — только обводка */
.cal-cell--selected {
  box-shadow: inset 0 0 0 2px var(--accent);
}

.cal-cell--empty {
  pointer-events: none;
}

.cal-dot {
  position: absolute;
  bottom: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* крупные ячейки для месяцев и годов */
.cal-big {
  height: 48px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-muted);
}

.cal-big:hover {
  background: var(--accent-soft);
  color: var(--text);
}

.cal-big--cur {
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 2px var(--accent);
  color: var(--text);
  font-weight: 700;
}
</style>
