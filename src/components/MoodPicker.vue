<script setup>
// «Добавь настроение на сегодня» — поле быстрого ввода: смайл + комментарий,
// «+» в шапке добавляет запись. После добавления поле сбрасывается,
// так что за день можно оставить несколько записей.
import { ref } from 'vue'
import { MOODS } from '../moods.js'
import MoodFace from './MoodFace.vue'

defineProps({
  dateLabel: { type: String, default: 'сегодня' },
})

const emit = defineEmits(['save'])

const mood = ref(null)
const comment = ref('')

function save() {
  if (!mood.value) return
  emit('save', { mood: mood.value, comment: comment.value.trim() })
  mood.value = null
  comment.value = ''
}
</script>

<template>
  <section class="card">
    <div class="head">
      <h2 class="section-title">Добавь настроение на {{ dateLabel }}</h2>
      <button
        class="add-btn"
        :class="{ 'add-btn--disabled': !mood }"
        :title="mood ? 'Добавить запись' : 'Сначала выбери настроение'"
        @click="save"
      >
        +
      </button>
    </div>

    <div class="picker">
      <button
        v-for="m in MOODS"
        :key="m.value"
        class="picker__btn"
        :class="{ 'picker__btn--active': mood === m.value }"
        :style="{ '--mood-color': m.color }"
        :title="m.label"
        @click="mood = m.value"
      >
        <span class="picker__emoji">
          <MoodFace :mood="m.value" :size="38" />
        </span>
        <span class="picker__label">{{ m.label }}</span>
      </button>
    </div>

    <textarea
      v-model="comment"
      rows="2"
      class="picker__comment"
      placeholder="Комментарий на день…"
    />
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  transition: transform 0.12s, opacity 0.12s;
}

.add-btn:hover {
  transform: scale(1.08);
}

.add-btn--disabled {
  opacity: 0.35;
  cursor: default;
}

.add-btn--disabled:hover {
  transform: none;
}

.picker {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.picker__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: transform 0.12s, border-color 0.12s, background 0.12s;
}

.picker__btn:hover {
  transform: translateY(-3px);
  background: color-mix(in srgb, var(--mood-color) 12%, white);
}

.picker__btn--active {
  border-color: var(--mood-color);
  background: color-mix(in srgb, var(--mood-color) 14%, white);
}

.picker__emoji {
  font-size: 36px;
  line-height: 1;
  display: grid;
  place-items: center;
  min-height: 38px;
}

.picker__label {
  font-size: 11px;
  color: var(--text-muted);
}

.picker__btn--active .picker__label {
  color: var(--text);
  font-weight: 600;
}

.picker__comment {
  font-family: inherit;
  font-size: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #ffffff;
  resize: vertical;
  color: var(--text);
  margin-top: 14px;
  width: 100%;
}

.picker__comment:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
