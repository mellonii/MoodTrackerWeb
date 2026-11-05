<script setup>
// Лицо настроения: своя картинка из /custom/emotions, если она есть
// (и загрузилась), иначе стандартный эмодзи.
import { computed, ref, watch } from 'vue'
import { moodInfo } from '../moods.js'

const props = defineProps({
  mood: { type: String, required: true },
  size: { type: Number, default: 36 },
})

const failed = ref(false)
watch(() => props.mood, () => (failed.value = false))

const info = computed(() => moodInfo(props.mood))
</script>

<template>
  <img
    v-if="info?.image && !failed"
    class="face face--img"
    :src="info.image"
    :width="size"
    :height="size"
    alt=""
    @error="failed = true"
  >
  <span v-else-if="info" class="face" :style="{ fontSize: size + 'px' }">{{ info.emoji }}</span>
</template>

<style scoped>
.face {
  line-height: 1;
  display: inline-block;
}

.face--img {
  object-fit: contain;
}
</style>
