<script setup>
// Колёсико выбора (как на макете): вертикальный скролл со scroll-snap,
// выбранная позиция подсвечивается рамкой в центре.
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
  modelValue: { type: [String, Number], required: true },
  optionHeight: { type: Number, default: 34 },
  visibleCount: { type: Number, default: 5 },
})

const emit = defineEmits(['update:modelValue'])

const listEl = ref(null)
const height = props.optionHeight * props.visibleCount
const pad = (height - props.optionHeight) / 2

let scrollTimer = null

function indexOfValue() {
  const i = props.options.findIndex((o) => o.value === props.modelValue)
  return i < 0 ? 0 : i
}

function scrollToIndex(i, instant = false) {
  listEl.value?.scrollTo({ top: i * props.optionHeight, behavior: instant ? 'auto' : 'smooth' })
}

onMounted(() => scrollToIndex(indexOfValue(), true))

// синхронизация, если значение поменяли снаружи
watch(
  () => props.modelValue,
  () => {
    const i = indexOfValue()
    if (listEl.value && Math.abs(listEl.value.scrollTop - i * props.optionHeight) > 2) {
      scrollToIndex(i, true)
    }
  },
)

function onScroll() {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const i = Math.round(listEl.value.scrollTop / props.optionHeight)
    const opt = props.options[i]
    if (opt && opt.value !== props.modelValue) emit('update:modelValue', opt.value)
  }, 120)
}
</script>

<template>
  <div class="wheel" :style="{ height: height + 'px' }">
    <div
      class="wheel__band"
      :style="{ top: pad + 'px', height: optionHeight + 'px' }"
    />
    <div ref="listEl" class="wheel__list" @scroll="onScroll">
      <div :style="{ height: pad + 'px' }" />
      <div
        v-for="opt in options"
        :key="opt.value"
        class="wheel__opt"
        :class="{ 'wheel__opt--active': opt.value === modelValue }"
        :style="{ height: optionHeight + 'px' }"
        @click="scrollToIndex(options.indexOf(opt))"
      >
        {{ opt.label }}
      </div>
      <div :style="{ height: pad + 'px' }" />
    </div>
  </div>
</template>

<style scoped>
.wheel {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: var(--accent-soft);
}

.wheel__band {
  position: absolute;
  left: 4px;
  right: 4px;
  border: 2px solid var(--accent);
  border-radius: 10px;
  pointer-events: none;
  z-index: 1;
}

.wheel__list {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}

.wheel__list::-webkit-scrollbar {
  display: none;
}

.wheel__opt {
  display: grid;
  place-items: center;
  scroll-snap-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.wheel__opt--active {
  color: var(--text);
  font-weight: 700;
}
</style>
