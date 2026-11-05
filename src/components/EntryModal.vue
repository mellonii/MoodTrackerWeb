<script setup>
// Экран редактирования записи (как на макете): слева — смайлы и «Заметка»
// (с подсказкой про фото на будущее), справа — «Выбери дату и время»
// с колёсиками: день / месяц / часы / минуты.
import { computed, ref, watch } from 'vue'
import { MOODS } from '../moods.js'
import { toLocalDate, formatTime, MONTHS } from '../utils/date.js'
import WheelPicker from './WheelPicker.vue'
import MoodFace from './MoodFace.vue'

const props = defineProps({
  mode: { type: String, required: true }, // 'create' | 'edit'
  entry: { type: Object, default: null },
  defaultMood: { type: String, default: 'Neutral' },
  date: { type: Date, required: true }, // выбранный день — база для новой записи
})

const emit = defineEmits(['close', 'save', 'delete'])

const isEdit = computed(() => props.mode === 'edit')

// исходная дата/время записи (или текущий момент для новой)
const initialDate = props.entry
  ? toLocalDate(props.entry.moodAt)
  : (() => {
      const now = new Date()
      const rounded = new Date(now)
      rounded.setMinutes(Math.round(now.getMinutes() / 5) * 5, 0, 0)
      return sameDay(now, props.date) ? rounded : noonOf(props.date)
    })()

function noonOf(day) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0)
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const mood = ref(props.entry?.mood ?? props.defaultMood)
const comment = ref(props.entry?.comment ?? '')

// год не листаем — берём из исходной даты; день/месяц/час/минуты — колёсиками
const year = initialDate.getFullYear()
const month = ref(initialDate.getMonth())
const day = ref(initialDate.getDate())
const hour = ref(initialDate.getHours())
const minute = ref((Math.round(initialDate.getMinutes() / 5) * 5) % 60)

const maxDay = computed(() => new Date(year, month.value + 1, 0).getDate())

// при смене месяца подтягиваем день (30 февраля не бывает)
watch(month, () => {
  if (day.value > maxDay.value) day.value = maxDay.value
})

const dayOptions = computed(() =>
  Array.from({ length: maxDay.value }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
)
const monthOptions = MONTHS.map((name, i) => ({ value: i, label: name }))
const hourOptions = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: String(h).padStart(2, '0'),
}))
const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i * 5,
  label: String(i * 5).padStart(2, '0'),
}))

const meta = computed(() =>
  props.entry
    ? `${toLocalDate(props.entry.moodAt).toLocaleDateString('ru-RU')} · ${formatTime(toLocalDate(props.entry.moodAt))}`
    : '',
)

function save() {
  if (!comment.value.trim()) return
  const dt = new Date(year, month.value, day.value, hour.value, minute.value, 0)
  emit('save', {
    id: props.entry?.id,
    mood: mood.value,
    comment: comment.value.trim(),
    moodAt: dt.toISOString(),
  })
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal card">
      <div class="modal__head">
        <button class="back-btn" title="Назад" @click="emit('close')">←</button>
        <h3>{{ isEdit ? 'Редактирование' : 'Новая запись' }}</h3>
      </div>
      <p v-if="entry" class="modal__meta">создано: {{ meta }}</p>

      <div class="modal__body">
        <!-- левая колонка: настроение + заметка -->
        <div class="col">
          <span class="field__label">Настроение</span>
          <div class="moods">
            <button
              v-for="m in MOODS"
              :key="m.value"
              class="mood-chip"
              :class="{ 'mood-chip--active': mood === m.value }"
              :style="{ '--mood-color': m.color }"
              @click="mood = m.value"
            >
              <span class="mood-chip__emoji">
                <MoodFace :mood="m.value" :size="32" />
              </span>
              <span class="mood-chip__label">{{ m.label }}</span>
            </button>
          </div>

          <div class="note">
            <span class="field__label">Заметка</span>
            <textarea
              v-model="comment"
              rows="5"
              placeholder="Как прошёл день?"
              class="note__input"
            />
            <div class="note__bottom">
              <span class="note__hint">в будущем тут можно будет добавить фото</span>
              <button class="note__add" title="Фото — скоро" disabled>+</button>
            </div>
          </div>
        </div>

        <!-- правая колонка: дата и время колёсиками -->
        <div class="col col--time">
          <span class="field__label">Выбери дату и время</span>

          <div class="wheels-row">
            <div class="wheels-row__col wheels-row__col--day">
              <span class="wheel-cap">день</span>
              <WheelPicker v-model="day" :options="dayOptions" />
            </div>
            <div class="wheels-row__col wheels-row__col--month">
              <span class="wheel-cap">месяц</span>
              <WheelPicker v-model="month" :options="monthOptions" />
            </div>
          </div>

          <div class="wheels-row">
            <div class="wheels-row__col">
              <span class="wheel-cap">час</span>
              <WheelPicker v-model="hour" :options="hourOptions" />
            </div>
            <div class="wheels-row__col">
              <span class="wheel-cap">мин</span>
              <WheelPicker v-model="minute" :options="minuteOptions" />
            </div>
          </div>
        </div>
      </div>

      <div class="modal__actions">
        <button v-if="isEdit" class="btn btn--danger" @click="emit('delete', entry.id)">
          Удалить
        </button>
        <span class="modal__actions-spacer" />
        <button class="btn btn--ghost" @click="emit('close')">Отмена</button>
        <button class="btn btn--primary" :disabled="!comment.trim()" @click="save">
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 10;
}

.modal {
  width: 100%;
  max-width: 680px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.modal__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal__head h3 {
  font-size: 18px;
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

.modal__meta {
  font-size: 12px;
  color: var(--text-muted);
  margin: 6px 0 0 46px;
}

.modal__body {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 22px;
  margin-top: 18px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.col--time {
  gap: 12px;
}

.field__label {
  font-size: 12px;
  color: var(--text-muted);
}

/* смайлы — как на главной: крупные, равномерно на всю ширину полоски */
.moods {
  display: flex;
  gap: 6px;
}

.mood-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 2px 7px;
  border-radius: 14px;
  border: 2px solid transparent;
  transition: transform 0.12s, border-color 0.12s, background 0.12s;
}

.mood-chip:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--mood-color) 12%, white);
}

.mood-chip--active {
  border-color: var(--mood-color);
  background: color-mix(in srgb, var(--mood-color) 14%, white);
}

.mood-chip__emoji {
  font-size: 30px;
  line-height: 1;
  display: grid;
  place-items: center;
  min-height: 32px;
}

.mood-chip__label {
  font-size: 10px;
  color: var(--text-muted);
}

.mood-chip--active .mood-chip__label {
  color: var(--text);
  font-weight: 600;
}

.note {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.note__input {
  font-family: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #ffffff;
  resize: vertical;
  color: var(--text);
}

.note__input:focus {
  outline: none;
  border-color: var(--accent);
}

.note__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.note__hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.note__add {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--accent-soft);
  border: 1px dashed var(--accent);
  font-size: 18px;
  display: grid;
  place-items: center;
  line-height: 1;
  opacity: 0.7;
  cursor: default;
}

.wheels-row {
  display: flex;
  gap: 8px;
}

.wheels-row__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.wheels-row__col--day {
  flex: 0.7;
}

.wheels-row__col--month {
  flex: 1.6;
}

.wheel-cap {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.modal__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.modal__actions-spacer {
  flex: 1;
}

.btn {
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.12s, opacity 0.12s;
}

.btn:hover {
  transform: scale(1.04);
}

.btn:disabled {
  opacity: 0.45;
  cursor: default;
  transform: none;
}

.btn--primary {
  background: var(--accent-strong);
  color: var(--bg);
}

.btn--ghost {
  color: var(--text-muted);
}

.btn--ghost:hover {
  background: var(--accent-soft);
}

.btn--danger {
  color: var(--danger);
}

.btn--danger:hover {
  background: #f7dee3;
}

@media (max-width: 640px) {
  .modal__body {
    grid-template-columns: 1fr;
  }
}
</style>
