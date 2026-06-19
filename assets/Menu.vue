<script setup>
defineProps({
  modelValue: Boolean,
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "click"]);
</script>

<template>
  <div class="menu">
    <Transition name="fade">
      <div
        v-show="modelValue"
        class="menu-modal"
        @click="emit('update:modelValue', false)"
      ></div>
    </Transition>
    <div v-show="modelValue" class="menu-content">
      <ul>
        <li
          v-for="(item, index) in items"
          :key="index"
          @click="
            emit('update:modelValue', false);
            emit('click', item.text);
          "
        >
          <span v-text="item.text"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.menu-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.menu-content {
  position: absolute;
  background: color-mix(in oklch, var(--bg-primary) 85%, transparent);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 2;
  border-radius: var(--radius-md);
  right: -100%;
  min-width: 140px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  animation: menu-in 0.15s var(--ease-out) both;
}

@keyframes menu-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.menu-content li {
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.88rem;
  color: var(--text-primary);
}

.menu-content li:hover {
  background: var(--accent-subtle);
  color: var(--accent);
}
</style>
