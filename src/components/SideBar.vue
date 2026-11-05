<script setup>
// Слева переход между функциями: 🌸 — трекер (главная), 📊 — статистика (скоро),
// 📔 — все записи. 👤 внизу — профиль (скоро).
defineProps({
  active: { type: String, default: 'mood' }, // 'mood' | 'stats' | 'all'
})

const emit = defineEmits(['select'])

const items = [
  { key: 'mood', icon: '🌸', title: 'Трекер настроения' },
  { key: 'stats', icon: '📊', title: 'Статистика (скоро)', disabled: true },
  { key: 'all', icon: '📔', title: 'Все записи' },
]
</script>

<template>
  <aside class="sidebar card">
    <button
      v-for="item in items"
      :key="item.key"
      class="sidebar__item"
      :class="{
        'sidebar__item--active': active === item.key,
        'sidebar__item--disabled': item.disabled,
      }"
      :title="item.title"
      @click="!item.disabled && emit('select', item)"
    >
      <span class="sidebar__icon">{{ item.icon }}</span>
    </button>

    <div class="sidebar__spacer" />
    <button class="sidebar__item" title="Профиль (скоро)">
      <span class="sidebar__icon">👤</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  position: sticky;
  top: 26px;
}

.sidebar__item {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  transition: background 0.15s;
}

.sidebar__item:hover {
  background: var(--accent-soft);
}

.sidebar__item--active {
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 2px var(--accent);
}

.sidebar__item--disabled {
  opacity: 0.35;
  cursor: default;
}

.sidebar__item--disabled:hover {
  background: none;
}

.sidebar__icon {
  font-size: 22px;
}

.sidebar__spacer {
  flex: 1;
}
</style>
