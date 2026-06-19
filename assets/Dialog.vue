<script setup>
defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="dialog-mask"
      @click="emit('update:modelValue', false)"
    >
      <div class="dialog-container">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
  background: var(--backdrop);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dialog-container {
  background: color-mix(in oklch, var(--bg-secondary) 85%, transparent);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  box-shadow: var(--glass-shadow);
  min-width: 200px;
  animation: dialog-in 0.2s var(--ease-out) both;
}

@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>
