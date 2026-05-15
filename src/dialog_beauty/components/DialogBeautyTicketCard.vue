<template>
  <article class="ellia-ticket-card" :class="[`is-${variant ?? 'skill1'}`, { 'is-active': active }]">
    <div class="ellia-ticket-card__frame"></div>
    <div class="ellia-ticket-card__corners">
      <span class="corner top-left"></span>
      <span class="corner top-right"></span>
      <span class="corner bottom-left"></span>
      <span class="corner bottom-right"></span>
    </div>

    <svg v-if="variant === 'skill2'" class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="tarot-mark">
        <path class="line-path" d="M38 96 L82 96 L76 112 L44 112 Z" stroke-width="0.8" />
        <path class="line-path" d="M60 22 L82 40 L74 78 L46 78 L38 40 Z" stroke-width="1.1" />
        <path class="line-path" d="M60 22 L60 78 M38 40 L82 40 M46 78 L74 78" stroke-width="0.6" opacity="0.58" />
        <path class="line-path" d="M42 42 C50 24 70 24 78 42" stroke-width="0.9" />
        <path class="line-path" d="M48 57 C55 66 65 66 72 57" stroke-width="0.8" />
      </g>
      <g class="nodes">
        <circle class="star-node" cx="60" cy="22" r="2.5" />
        <circle class="star-node" cx="38" cy="40" r="2" />
        <circle class="star-node" cx="82" cy="40" r="2" />
        <circle class="star-node" cx="46" cy="78" r="2" />
        <circle class="star-node" cx="74" cy="78" r="2" />
        <path class="star-node" d="M60 48 L62 53 L67 55 L62 57 L60 62 L58 57 L53 55 L58 53 Z" />
      </g>
    </svg>

    <svg v-else-if="variant === 'world'" class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="flower-mark">
        <path class="line-path" d="M60 52 C45 28 25 37 34 58 C16 63 22 84 47 76 C44 98 69 103 70 77 C92 86 104 65 82 57 C95 36 72 27 60 52 Z" stroke-width="1.1" />
        <path class="line-path" d="M60 52 L60 98 M60 62 C50 78 44 91 34 105 M60 62 C70 78 76 91 86 105" stroke-width="0.75" />
        <path class="line-path" d="M35 106 L85 106" stroke-width="0.8" />
      </g>
      <g class="nodes">
        <circle class="star-node" cx="60" cy="52" r="2.8" />
        <circle class="star-node" cx="34" cy="58" r="1.8" />
        <circle class="star-node" cx="47" cy="76" r="1.8" />
        <circle class="star-node" cx="70" cy="77" r="1.8" />
        <circle class="star-node" cx="82" cy="57" r="1.8" />
        <circle class="star-node" cx="60" cy="98" r="1.8" />
      </g>
    </svg>

    <svg v-else-if="variant === 'beauty'" class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="oracle-mark">
        <path class="line-path" d="M60 18 L103 96 L17 96 Z" stroke-width="1.2" />
        <path class="line-path" d="M60 38 L83 84 L37 84 Z" stroke-width="0.8" opacity="0.64" />
        <path class="line-path" d="M45 104 L75 104 L88 114 L32 114 Z" stroke-width="0.8" />
        <path class="line-path" d="M60 18 L60 84 M37 84 L103 96 M83 84 L17 96" stroke-width="0.55" opacity="0.52" />
      </g>
      <g class="nodes">
        <circle class="star-node" cx="60" cy="18" r="2.4" />
        <circle class="star-node" cx="17" cy="96" r="1.8" />
        <circle class="star-node" cx="103" cy="96" r="1.8" />
        <circle class="star-node" cx="60" cy="62" r="3.2" />
        <circle class="star-node" cx="45" cy="104" r="1.4" />
        <circle class="star-node" cx="75" cy="104" r="1.4" />
      </g>
    </svg>

    <svg v-else class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="base-lines">
        <path class="line-path" d="M40 105 L80 105 L95 115 L25 115 Z" stroke-width="0.8" />
        <path class="line-path" d="M40 105 L50 95 M80 105 L70 95" stroke-width="0.6" />
        <path class="line-path" d="M30 115 L60 95 L90 115" stroke-width="0.5" opacity="0.4" />
      </g>

      <g class="sphere-lines">
        <path class="line-path" d="M60 15 A40 40 0 1 1 59.9 15" stroke-width="1.2" />
        <path class="line-path" d="M60 15 L60 95" stroke-width="0.7" />
        <path class="line-path" d="M20 55 L100 55" stroke-width="0.7" />
        <path class="line-path" d="M31.7 30 L88.3 80" stroke-width="0.5" stroke-dasharray="2 2" />
        <path class="line-path" d="M88.3 30 L31.7 80" stroke-width="0.5" stroke-dasharray="2 2" />
        <path class="line-path" d="M60 15 L88.3 30 L100 55 L88.3 80 L60 95 L31.7 80 L20 55 L31.7 30 Z" stroke-width="0.9" />
        <path class="line-path" d="M31.7 30 L60 55 L88.3 30 M20 55 L60 55 L100 55 M31.7 80 L60 55 L88.3 80" stroke-width="0.6" opacity="0.6" />
      </g>

      <ellipse class="line-path" cx="60" cy="55" rx="55" ry="15" transform="rotate(-15, 60, 55)" stroke-width="0.8" stroke-dasharray="5 3" />

      <g class="nodes">
        <path class="star-node" d="M60 48 L62 53 L67 55 L62 57 L60 62 L58 57 L53 55 L58 53 Z" />
        <circle class="star-node" cx="60" cy="15" r="2.5" />
        <circle class="star-node" cx="60" cy="95" r="2.5" />
        <circle class="star-node" cx="20" cy="55" r="2.5" />
        <circle class="star-node" cx="100" cy="55" r="2.5" />
        <circle class="star-node" cx="88.3" cy="30" r="1.5" />
        <circle class="star-node" cx="31.7" cy="30" r="1.5" />
        <circle class="star-node" cx="88.3" cy="80" r="1.5" />
        <circle class="star-node" cx="31.7" cy="80" r="1.5" />
        <circle class="star-node" cx="40" cy="105" r="1.2" />
        <circle class="star-node" cx="80" cy="105" r="1.2" />
        <circle class="star-node" cx="95" cy="115" r="1.2" />
        <circle class="star-node" cx="25" cy="115" r="1.2" />
      </g>
    </svg>

    <div class="ellia-ticket-card__copy">
      <div v-if="eyebrow" class="ellia-ticket-card__eyebrow">{{ eyebrow }}</div>
      <div class="ellia-ticket-card__title-cn">{{ title }}</div>
      <div class="ellia-ticket-card__title-en">{{ subtitle }}</div>
      <div class="ellia-ticket-card__summary">{{ summary }}</div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  variant?: 'skill1' | 'skill2' | 'world' | 'beauty';
  title: string;
  subtitle: string;
  summary: string;
  active?: boolean;
}>();
</script>

<style scoped lang="scss">
.ellia-ticket-card {
  --ticket-gold: #caa45d;
  --ticket-gold-soft: #f3e6b5;
  --ticket-gold-dim: rgba(202, 164, 93, 0.32);
  --ticket-bg: radial-gradient(circle at 50% 28%, rgba(33, 24, 56, 0.96), rgba(11, 8, 21, 0.98));
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, 186px);
  height: 292px;
  margin: 0 auto 0.9rem;
  padding: 16px 14px 18px;
  border: 1px solid var(--ticket-gold-dim);
  border-radius: 4px;
  background: var(--ticket-bg);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.42),
    inset 0 0 24px rgba(202, 164, 93, 0.05);
  overflow: hidden;
  transition:
    transform 0.34s cubic-bezier(0.2, 1, 0.3, 1),
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.ellia-ticket-card:hover,
.ellia-ticket-card.is-active {
  border-color: rgba(243, 230, 181, 0.56);
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.5),
    0 0 22px rgba(83, 184, 255, 0.34),
    inset 0 0 24px rgba(202, 164, 93, 0.08);
  transform: translateY(-0.55rem) scale(1.04);
}

.ellia-ticket-card__frame {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(202, 164, 93, 0.12);
  pointer-events: none;
}

.ellia-ticket-card__corners .corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: rgba(202, 164, 93, 0.45);
  border-style: solid;
  pointer-events: none;
}

.ellia-ticket-card__corners .top-left {
  top: 14px;
  left: 14px;
  border-width: 1px 0 0 1px;
}

.ellia-ticket-card__corners .top-right {
  top: 14px;
  right: 14px;
  border-width: 1px 1px 0 0;
}

.ellia-ticket-card__corners .bottom-left {
  bottom: 14px;
  left: 14px;
  border-width: 0 0 1px 1px;
}

.ellia-ticket-card__corners .bottom-right {
  right: 14px;
  bottom: 14px;
  border-width: 0 1px 1px 0;
}

.ellia-ticket-card__orb {
  display: block;
  width: 112px;
  height: 112px;
  margin: 12px auto 12px;
  filter: drop-shadow(0 0 10px rgba(202, 164, 93, 0.18));
}

.line-path {
  fill: none;
  stroke: var(--ticket-gold);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 400;
  stroke-dashoffset: 0;
  opacity: 0.88;
  transition:
    stroke-dashoffset 0s,
    opacity 0.3s;
}

.star-node {
  fill: var(--ticket-gold-soft);
  opacity: 1;
  transform-origin: center;
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.ellia-ticket-card:hover .line-path,
.ellia-ticket-card.is-active .line-path {
  animation: ticket-redraw 1.5s ease-out forwards;
}

.ellia-ticket-card:hover .star-node,
.ellia-ticket-card.is-active .star-node {
  animation: ticket-star-pop 0.6s cubic-bezier(0.17, 0.89, 0.32, 1.49) both;
}

.ellia-ticket-card__copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  text-align: center;
}

.ellia-ticket-card__eyebrow {
  margin-bottom: 0.35rem;
  color: rgba(243, 230, 181, 0.68);
  font-size: 0.7rem;
  letter-spacing: 0.24em;
}

.ellia-ticket-card__title-cn {
  color: var(--ticket-gold);
  font-size: 1.08rem;
  line-height: 1.32;
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px rgba(202, 164, 93, 0.2);
}

.ellia-ticket-card__title-en {
  margin-top: 0.45rem;
  color: rgba(248, 236, 203, 0.88);
  font-size: 0.56rem;
  letter-spacing: 0.18em;
}

.ellia-ticket-card__summary {
  margin-top: 0.48rem;
  color: rgba(233, 217, 180, 0.5);
  font-size: 0.68rem;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

@keyframes ticket-redraw {
  0% {
    stroke-dashoffset: 400;
    opacity: 0.3;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.92;
  }
}

@keyframes ticket-star-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .ellia-ticket-card {
    width: min(100%, 244px);
    height: 350px;
    padding: 16px 16px 20px;
  }

  .ellia-ticket-card__orb {
    width: 150px;
    height: 150px;
    margin-top: 16px;
    margin-bottom: 18px;
  }

  .ellia-ticket-card__title-cn {
    font-size: 1.6rem;
  }
}
</style>
