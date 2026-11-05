<script setup>
// «Все записи»: полный список, сгруппированный по датам (свежие сверху).
// Клик по дню в календаре прокручивает список к этой дате (scrollToDay).
import { computed, ref } from 'vue'
import { moodInfo } from '../moods.js'
import { toLocalDate, formatTime, dateKey, dayLabel } from '../utils/date.js'
import MoodFace from './MoodFace.vue'

const props = defineProps({
  entries: { type: Array, required: true },
})

defineEmits(['open', 'back'])

const listEl = ref(null)

const groups = computed(() => {
  const map = new Map()
  for (const entry of props.entries) {
    const d = toLocalDate(entry.moodAt)
    const key = dateKey(d)
    if (!map.has(key)) map.set(key, { key, date: d, items: [] })
    map.get(key).items.push(entry)
  }
  return [...map.values()]
    .sort((a, b) => b.date - a.date)
    .map((g) => ({ ...g, items: [...g.items].sort((a, b) => new Date(a.moodAt) - new Date(b.moodAt)) }))
})

function scrollToDay(key) {
  const el = listEl.value?.querySelector(`[data-date="${key}"]`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ scrollToDay })
</script>

<template>
  <section class="card all">
    <div class="all__head">
      <button class="back-btn" title="К трекеру" @click="$emit('back')">←</button>
      <h2 class="section-title">Все записи</h2>
    </div>

    <p v-if="!groups.length" class="all__empty">Записей пока нет.</p>

    <div ref="listEl" class="all__list">
      <section
        v-for="group in groups"
        :key="group.key"
        :data-date="group.key"
        class="all__group"
      >
        <h3 class="all__date">{{ dayLabel(group.date) }}</h3>
        <ul class="all__items">
          <li v-for="entry in group.items" :key="entry.id">
            <button class="entry" @click="$emit('open', entry)">
              <span
                v-if="moodInfo(entry.mood)"
                class="entry__emoji"
                :style="{ background: moodInfo(entry.mood).color + '26' }"
              >
                <MoodFace :mood="entry.mood" :size="24" />
              </span>
              <span class="entry__body">
                <span class="entry__comment">{{ entry.comment || moodInfo(entry.mood)?.label }}</span>
                <span v-if="entry.comment" class="entry__time">{{ moodInfo(entry.mood)?.label }}</span>
              </span>
              <span class="entry__time entry__time--right">{{ formatTime(toLocalDate(entry.moodAt)) }}</span>
              <span class="entry__chevron">›</span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.all {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.all__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-soft);
  font-size: 16px;
  display: grid;
  place-items: center;
  line-height: 1;
}

.back-btn:hover {
  background: var(--accent);
  color: var(--card);
}

.all__empty {
  color: var(--text-muted);
  font-size: 14px;
}

.all__list {
  overflow-y: auto;
  max-height: calc(100vh - 170px);
  padding-right: 4px;
}

.all__group {
  scroll-margin-top: 6px;
}

.all__date {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--card);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  padding: 10px 2px 8px;
  border-bottom: 1px solid var(--border);
  text-transform: capitalize;
}

.all__items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0 14px;
}

.entry {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--accent-soft);
  transition: border-color 0.12s, background 0.12s;
}

.entry:hover {
  border-color: var(--accent);
  background: var(--bg);
}

.entry__emoji {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 21px;
  flex-shrink: 0;
}

.entry__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.entry__comment {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry__time {
  font-size: 12px;
  color: var(--text-muted);
}

.entry__time--right {
  margin-left: auto;
  white-space: nowrap;
}

.entry__chevron {
  color: var(--text-muted);
  font-size: 20px;
}
</style>
