<script setup>
// «Записи в дневнике»: карточки за выбранный день, клик — открыть/редактировать,
// «+» — новая запись.
import { moodInfo } from '../moods.js'
import { toLocalDate, formatTime } from '../utils/date.js'
import MoodFace from './MoodFace.vue'

defineProps({
  entries: { type: Array, required: true },
})

defineEmits(['open', 'add'])
</script>

<template>
  <section class="card">
    <div class="head">
      <h2 class="section-title">Записи в дневнике</h2>
      <button class="add-btn" title="Новая запись" @click="$emit('add')">+</button>
    </div>

    <p v-if="!entries.length" class="empty">
      Пока нет записей за этот день. Нажми «+», чтобы добавить.
    </p>

    <ul class="list">
      <li v-for="entry in entries" :key="entry.id">
        <button class="entry" @click="$emit('open', entry)">
          <span
            v-if="moodInfo(entry.mood)"
            class="entry__emoji"
            :style="{ background: moodInfo(entry.mood).color + '26' }"
          >
            <MoodFace :mood="entry.mood" :size="24" />
          </span>
          <span class="entry__body">
            <span
              class="entry__comment"
              :class="{ 'entry__comment--muted': !entry.comment }"
            >
              {{ entry.comment || moodInfo(entry.mood)?.label }}
            </span>
            <span class="entry__time">{{ formatTime(toLocalDate(entry.moodAt)) }}</span>
          </span>
          <span class="entry__chevron">›</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.head .section-title {
  margin-bottom: 0;
}

.add-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  line-height: 1;
  font-size: 24px;
  font-weight: 600;
  color: var(--bg);
  background: var(--accent-strong);
  transition: transform 0.12s;
}

.add-btn:hover {
  transform: scale(1.08);
}

.empty {
  color: var(--text-muted);
  font-size: 14px;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.entry {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fbfaff;
  transition: border-color 0.12s, background 0.12s;
}

.entry:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.entry__emoji {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 22px;
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

.entry__comment--muted {
  color: var(--text-muted);
  font-style: italic;
}

.entry__time {
  font-size: 12px;
  color: var(--text-muted);
}

.entry__chevron {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 20px;
}
</style>
