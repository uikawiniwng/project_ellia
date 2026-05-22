<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  eyebrow?: string;
  variant?: 'skill1' | 'skill2' | 'world' | 'beauty';
  title: string;
  subtitle: string;
  summary: string;
  active?: boolean;
}>();

const isSkill2 = computed(() => props.variant === 'skill2');
const isWorld = computed(() => props.variant === 'world');
const isBeauty = computed(() => props.variant === 'beauty');
</script>

<template>
  <article class="ellia-ticket-card" :class="[`is-${variant ?? 'skill1'}`, { 'is-active': active }]">
    <div class="ellia-ticket-card__frame"></div>
    <div class="ellia-ticket-card__corners">
      <span class="corner top-left"></span>
      <span class="corner top-right"></span>
      <span class="corner bottom-left"></span>
      <span class="corner bottom-right"></span>
    </div>

    <svg v-if="isSkill2" class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="card-outline">
        <path class="line-path" d="M25 10 L95 10 L105 110 L15 110 Z" stroke-width="1.2"></path>
        <path class="line-path" d="M30 18 L90 18 L98 102 L22 102 Z" stroke-width="0.6" opacity="0.4"></path>
      </g>
      <g class="card-symbol">
        <path class="line-path" d="M25 10 L60 60 L95 10 M105 110 L60 60 L15 110" stroke-width="0.5" stroke-dasharray="4 2"></path>
        <path class="line-path" d="M60 25 L85 60 L60 95 L35 60 Z" stroke-width="1"></path>
        <path class="line-path" d="M35 60 L85 60 M60 25 L60 95" stroke-width="0.6" opacity="0.6"></path>
        <path class="line-path" d="M30 18 L60 25 L90 18 M98 102 L60 95 L22 102" stroke-width="0.5" opacity="0.3"></path>
      </g>
      <g class="nodes">
        <circle class="star-node" cx="25" cy="10" r="2.2"></circle>
        <circle class="star-node" cx="95" cy="10" r="2.2"></circle>
        <circle class="star-node" cx="105" cy="110" r="2.2"></circle>
        <circle class="star-node" cx="15" cy="110" r="2.2"></circle>
        <circle class="star-node" cx="60" cy="25" r="1.8"></circle>
        <circle class="star-node" cx="85" cy="60" r="1.8"></circle>
        <circle class="star-node" cx="60" cy="95" r="1.8"></circle>
        <circle class="star-node" cx="35" cy="60" r="1.8"></circle>
        <path class="star-node" d="M60 52 L62 58 L68 60 L62 62 L60 68 L58 62 L52 60 L58 58 Z"></path>
      </g>
    </svg>

    <svg v-else-if="isWorld" class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        r="45"
        fill="none"
        stroke="var(--ticket-gold)"
        stroke-width="0.3"
        stroke-dasharray="2 6"
        opacity="0.1"
      ></circle>
      <g>
        <path class="petal-path p1" d="M60 60 L48 45 L52 25 L60 35 L68 25 L72 45 Z"></path>
        <circle class="star-node n1-sl" cx="48" cy="45" r="1.2"></circle>
        <circle class="star-node n1-tl" cx="52" cy="25" r="1.8"></circle>
        <circle class="star-node n1-nt" cx="60" cy="35" r="1.8"></circle>
        <circle class="star-node n1-tr" cx="68" cy="25" r="1.8"></circle>
        <circle class="star-node n1-sr" cx="72" cy="45" r="1.2"></circle>
      </g>
      <g transform="rotate(72, 60, 60)">
        <path class="petal-path p2" d="M60 60 L48 45 L52 25 L60 35 L68 25 L72 45 Z"></path>
        <circle class="star-node n2-sl" cx="48" cy="45" r="1.2"></circle>
        <circle class="star-node n2-tl" cx="52" cy="25" r="1.8"></circle>
        <circle class="star-node n2-nt" cx="60" cy="35" r="1.8"></circle>
        <circle class="star-node n2-tr" cx="68" cy="25" r="1.8"></circle>
        <circle class="star-node n2-sr" cx="72" cy="45" r="1.2"></circle>
      </g>
      <g transform="rotate(144, 60, 60)">
        <path class="petal-path p3" d="M60 60 L48 45 L52 25 L60 35 L68 25 L72 45 Z"></path>
        <circle class="star-node n3-sl" cx="48" cy="45" r="1.2"></circle>
        <circle class="star-node n3-tl" cx="52" cy="25" r="1.8"></circle>
        <circle class="star-node n3-nt" cx="60" cy="35" r="1.8"></circle>
        <circle class="star-node n3-tr" cx="68" cy="25" r="1.8"></circle>
        <circle class="star-node n3-sr" cx="72" cy="45" r="1.2"></circle>
      </g>
      <g transform="rotate(216, 60, 60)">
        <path class="petal-path p4" d="M60 60 L48 45 L52 25 L60 35 L68 25 L72 45 Z"></path>
        <circle class="star-node n4-sl" cx="48" cy="45" r="1.2"></circle>
        <circle class="star-node n4-tl" cx="52" cy="25" r="1.8"></circle>
        <circle class="star-node n4-nt" cx="60" cy="35" r="1.8"></circle>
        <circle class="star-node n4-tr" cx="68" cy="25" r="1.8"></circle>
        <circle class="star-node n4-sr" cx="72" cy="45" r="1.2"></circle>
      </g>
      <g transform="rotate(288, 60, 60)">
        <path class="petal-path p5" d="M60 60 L48 45 L52 25 L60 35 L68 25 L72 45 Z"></path>
        <circle class="star-node n5-sl" cx="48" cy="45" r="1.2"></circle>
        <circle class="star-node n5-tl" cx="52" cy="25" r="1.8"></circle>
        <circle class="star-node n5-nt" cx="60" cy="35" r="1.8"></circle>
        <circle class="star-node n5-tr" cx="68" cy="25" r="1.8"></circle>
        <circle class="star-node n5-sr" cx="72" cy="45" r="1.2"></circle>
      </g>
      <circle class="star-node nc" cx="60" cy="60" r="2.2"></circle>
    </svg>

    <svg v-else-if="isBeauty" class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="astrolabe-matrix">
        <circle class="line-path" cx="60" cy="58" r="54" stroke-width="0.8"></circle>
        <circle class="line-path" cx="60" cy="58" r="48" stroke-width="0.5" stroke-dasharray="3 4" opacity="0.5"></circle>
        <circle class="line-path" cx="60" cy="58" r="40" stroke-width="0.6"></circle>
        <circle class="line-path" cx="60" cy="58" r="18" stroke-width="0.5" stroke-dasharray="1 3" opacity="0.7"></circle>
      </g>
      <g class="star-chains">
        <path class="line-path" stroke-width="0.6" d="M18 35 L32 24 L48 18 L60 16 L72 18 L88 24 L102 35"></path>
        <path class="line-path" stroke-width="0.5" stroke-dasharray="2 2" d="M22 80 L40 96 L60 102 L80 96 L98 80"></path>
        <path class="line-path" stroke-width="0.4" opacity="0.4" d="M60 16 L60 102 M12 58 L108 58"></path>
      </g>
      <g class="hand-constellation-left">
        <path class="line-path" stroke-width="1.0" d="M12 70 L25 58 L42 50 L30 55 M25 58 L45 57 L28 61 M25 58 L43 65 L28 67 M12 70 L36 74 L24 64"></path>
      </g>
      <g class="hand-constellation-right">
        <path class="line-path" stroke-width="1.0" d="M108 70 L95 58 L78 50 L90 55 M95 58 L75 57 L92 61 M95 58 L77 65 L92 67 M108 70 L84 74 L96 64"></path>
      </g>
      <g class="central-planchette">
        <path class="line-path" stroke-width="1.4" d="M60 34 L78 66 L60 76 L42 66 Z"></path>
        <circle class="line-path" stroke-width="0.9" cx="60" cy="54" r="6"></circle>
        <path class="line-path" stroke-width="0.5" opacity="0.6" d="M60 34 L60 48 M42 66 L54 59 M78 66 L66 59"></path>
      </g>
      <g class="star-nodes-matrix">
        <path class="star-node" d="M60 47 L62 52 L67 54 L62 56 L60 61 L58 56 L53 54 L58 52 Z"></path>
        <circle class="star-node" cx="60" cy="34" r="2.2"></circle>
        <circle class="star-node" cx="42" cy="66" r="2.2"></circle>
        <circle class="star-node" cx="78" cy="66" r="2.2"></circle>
        <circle class="star-node" cx="60" cy="76" r="1.8"></circle>
        <circle class="star-node" cx="12" cy="70" r="1.5"></circle>
        <circle class="star-node" cx="25" cy="58" r="1.8"></circle>
        <circle class="star-node" cx="42" cy="50" r="1.2"></circle>
        <circle class="star-node" cx="45" cy="57" r="1.2"></circle>
        <circle class="star-node" cx="43" cy="65" r="1.2"></circle>
        <circle class="star-node" cx="36" cy="74" r="1.2"></circle>
        <circle class="star-node" cx="108" cy="70" r="1.5"></circle>
        <circle class="star-node" cx="95" cy="58" r="1.8"></circle>
        <circle class="star-node" cx="78" cy="50" r="1.2"></circle>
        <circle class="star-node" cx="75" cy="57" r="1.2"></circle>
        <circle class="star-node" cx="77" cy="65" r="1.2"></circle>
        <circle class="star-node" cx="84" cy="74" r="1.2"></circle>
        <circle class="star-node" cx="18" cy="35" r="1.2"></circle>
        <circle class="star-node" cx="32" cy="24" r="1.5"></circle>
        <circle class="star-node" cx="48" cy="18" r="1.2"></circle>
        <circle class="star-node" cx="60" cy="16" r="1.8"></circle>
        <circle class="star-node" cx="72" cy="18" r="1.2"></circle>
        <circle class="star-node" cx="88" cy="24" r="1.5"></circle>
        <circle class="star-node" cx="102" cy="35" r="1.2"></circle>
        <circle class="star-node" cx="22" cy="80" r="1.2"></circle>
        <circle class="star-node" cx="40" cy="96" r="1.5"></circle>
        <circle class="star-node" cx="60" cy="102" r="1.8"></circle>
        <circle class="star-node" cx="80" cy="96" r="1.5"></circle>
        <circle class="star-node" cx="98" cy="80" r="1.2"></circle>
      </g>
    </svg>

    <svg v-else class="ellia-ticket-card__orb" viewBox="0 0 120 120" aria-hidden="true">
      <g class="base-lines">
        <path class="line-path" d="M40 105 L80 105 L95 115 L25 115 Z" stroke-width="0.8"></path>
        <path class="line-path" d="M40 105 L50 95 M80 105 L70 95" stroke-width="0.6"></path>
        <path class="line-path" d="M30 115 L60 95 L90 115" stroke-width="0.5" opacity="0.4"></path>
      </g>
      <g class="sphere-lines">
        <path class="line-path" d="M60 15 A40 40 0 1 1 59.9 15" stroke-width="1.2"></path>
        <path class="line-path" d="M60 15 L60 95" stroke-width="0.7"></path>
        <path class="line-path" d="M20 55 L100 55" stroke-width="0.7"></path>
        <path class="line-path" d="M31.7 30 L88.3 80" stroke-width="0.5" stroke-dasharray="2 2"></path>
        <path class="line-path" d="M88.3 30 L31.7 80" stroke-width="0.5" stroke-dasharray="2 2"></path>
        <path class="line-path" d="M60 15 L88.3 30 L100 55 L88.3 80 L60 95 L31.7 80 L20 55 L31.7 30 Z" stroke-width="0.9"></path>
        <path class="line-path" d="M31.7 30 L60 55 L88.3 30 M20 55 L60 55 L100 55 M31.7 80 L60 55 L88.3 80" stroke-width="0.6" opacity="0.6"></path>
      </g>
      <ellipse class="line-path" cx="60" cy="55" rx="55" ry="15" transform="rotate(-15, 60, 55)" stroke-width="0.8" stroke-dasharray="5 3"></ellipse>
      <g class="nodes">
        <path class="star-node" d="M60 48 L62 53 L67 55 L62 57 L60 62 L58 57 L53 55 L58 53 Z"></path>
        <circle class="star-node" cx="60" cy="15" r="2.5"></circle>
        <circle class="star-node" cx="60" cy="95" r="2.5"></circle>
        <circle class="star-node" cx="20" cy="55" r="2.5"></circle>
        <circle class="star-node" cx="100" cy="55" r="2.5"></circle>
        <circle class="star-node" cx="88.3" cy="30" r="1.5"></circle>
        <circle class="star-node" cx="31.7" cy="30" r="1.5"></circle>
        <circle class="star-node" cx="88.3" cy="80" r="1.5"></circle>
        <circle class="star-node" cx="31.7" cy="80" r="1.5"></circle>
        <circle class="star-node" cx="60" cy="55" r="1.8"></circle>
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
  box-sizing: border-box;
  max-width: calc(100% - 28px);
  width: 112px;
  height: 112px;
  margin: 12px auto 0;
  filter: drop-shadow(0 0 10px rgba(202, 164, 93, 0.18));
}

.ellia-ticket-card.is-skill1 .ellia-ticket-card__orb {
  width: 136px;
  height: 136px;
  margin: 8px auto 0;
  filter: drop-shadow(0 0 10px rgba(202, 164, 93, 0.24));
}

.ellia-ticket-card.is-skill2 .ellia-ticket-card__orb {
  width: 132px;
  height: 132px;
  margin: 8px auto 0;
  filter: drop-shadow(0 0 8px rgba(202, 164, 93, 0.3));
}

.ellia-ticket-card.is-world .ellia-ticket-card__orb {
  width: 148px;
  height: 148px;
  margin: 8px auto 0;
  filter: drop-shadow(0 0 12px rgba(202, 164, 93, 0.3));
}

.ellia-ticket-card.is-beauty .ellia-ticket-card__orb {
  width: 138px;
  height: 138px;
  margin: 10px auto 0;
  filter: drop-shadow(0 0 8px rgba(202, 164, 93, 0.32));
}

.line-path {
  fill: none;
  stroke: var(--ticket-gold);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 400;
  stroke-dashoffset: 0;
  opacity: 0.88;
  transition: stroke-dashoffset 0s, opacity 0.3s;
}

.ellia-ticket-card.is-skill2 .line-path {
  stroke-dasharray: 800;
  opacity: 0.8;
}

.petal-path {
  fill: none;
  stroke: var(--ticket-gold);
  stroke-width: 1.2;
  stroke-dasharray: 115;
  stroke-dashoffset: 0;
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

.ellia-ticket-card.is-skill2:hover .line-path,
.ellia-ticket-card.is-skill2.is-active .line-path {
  animation: ticket-redraw-flow 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.ellia-ticket-card.is-world:hover .petal-path,
.ellia-ticket-card.is-world.is-active .petal-path {
  stroke-dashoffset: 115;
  animation: constellation-trace 0.4s linear forwards;
}

.ellia-ticket-card:hover .star-node,
.ellia-ticket-card.is-active .star-node {
  animation: ticket-star-pop 0.6s cubic-bezier(0.17, 0.89, 0.32, 1.49) both;
}

.ellia-ticket-card.is-skill2:hover .star-node,
.ellia-ticket-card.is-skill2.is-active .star-node {
  animation: ticket-star-subtle-pop 0.6s cubic-bezier(0.2, 0.8, 0.4, 1.1) both;
}

.ellia-ticket-card.is-world:hover .star-node,
.ellia-ticket-card.is-world.is-active .star-node {
  opacity: 0;
  transform: scale(0);
  animation: star-soft-grow 0.18s ease forwards;
}

.p1 { animation-delay: 0s !important; }
.p2 { animation-delay: 0.4s !important; }
.p3 { animation-delay: 0.8s !important; }
.p4 { animation-delay: 1.2s !important; }
.p5 { animation-delay: 1.6s !important; }
.nc { animation-delay: 0s !important; }

.n1-sl { animation-delay: 0.06s !important; }
.n1-tl { animation-delay: 0.15s !important; }
.n1-nt { animation-delay: 0.22s !important; }
.n1-tr { animation-delay: 0.3s !important; }
.n1-sr { animation-delay: 0.37s !important; }

.n2-sl { animation-delay: 0.46s !important; }
.n2-tl { animation-delay: 0.55s !important; }
.n2-nt { animation-delay: 0.62s !important; }
.n2-tr { animation-delay: 0.7s !important; }
.n2-sr { animation-delay: 0.77s !important; }

.n3-sl { animation-delay: 0.86s !important; }
.n3-tl { animation-delay: 0.95s !important; }
.n3-nt { animation-delay: 1.02s !important; }
.n3-tr { animation-delay: 1.1s !important; }
.n3-sr { animation-delay: 1.17s !important; }

.n4-sl { animation-delay: 1.26s !important; }
.n4-tl { animation-delay: 1.35s !important; }
.n4-nt { animation-delay: 1.42s !important; }
.n4-tr { animation-delay: 1.5s !important; }
.n4-sr { animation-delay: 1.57s !important; }

.n5-sl { animation-delay: 1.66s !important; }
.n5-tl { animation-delay: 1.75s !important; }
.n5-nt { animation-delay: 1.82s !important; }
.n5-tr { animation-delay: 1.9s !important; }
.n5-sr { animation-delay: 1.97s !important; }

.ellia-ticket-card__copy {
  position: relative;
  z-index: 1;
  display: grid;
  grid-auto-rows: max-content;
  row-gap: 0.42rem;
  flex: 1 1 auto;
  width: 100%;
  padding-top: 10px;
  text-align: center;
  align-content: start;
  justify-items: center;
}

.ellia-ticket-card__eyebrow {
  margin: 0;
  color: rgba(243, 230, 181, 0.68);
  font-size: 0.7rem;
  letter-spacing: 0.24em;
}

.ellia-ticket-card__title-cn {
  margin: 0;
  width: 100%;
  color: var(--ticket-gold);
  font-size: 1.08rem;
  line-height: 1.32;
  letter-spacing: 0.08em;
  text-align: center;
  text-shadow: 0 0 10px rgba(202, 164, 93, 0.2);
}

.ellia-ticket-card__title-en {
  margin: 0;
  width: 100%;
  color: rgba(248, 236, 203, 0.88);
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  text-align: center;
}

.ellia-ticket-card__summary {
  margin: 0;
  width: 100%;
  color: rgba(233, 217, 180, 0.5);
  font-size: 0.68rem;
  line-height: 1.45;
  white-space: pre-line;
  text-align: center;
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

@keyframes ticket-redraw-flow {
  0% {
    stroke-dashoffset: 800;
    opacity: 0.2;
  }
  30% {
    opacity: 0.8;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes ticket-star-subtle-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes constellation-trace {
  0% { stroke-dashoffset: 115; }
  15% { stroke-dashoffset: 96; }
  20% { stroke-dashoffset: 96; }
  38% { stroke-dashoffset: 76; }
  43% { stroke-dashoffset: 76; }
  56% { stroke-dashoffset: 63; }
  61% { stroke-dashoffset: 63; }
  76% { stroke-dashoffset: 50; }
  81% { stroke-dashoffset: 50; }
  93% { stroke-dashoffset: 30; }
  100% { stroke-dashoffset: 0; }
}

@keyframes star-soft-grow {
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
    margin-bottom: 0;
  }

  .ellia-ticket-card.is-skill2 .ellia-ticket-card__orb {
    width: 164px;
    height: 164px;
    margin-top: 10px;
    margin-bottom: 0;
  }

  .ellia-ticket-card.is-world .ellia-ticket-card__orb {
    width: 172px;
    height: 172px;
    margin-top: 10px;
    margin-bottom: 0;
  }

  .ellia-ticket-card.is-beauty .ellia-ticket-card__orb {
    width: 160px;
    height: 160px;
    margin-top: 10px;
    margin-bottom: 0;
  }

  .ellia-ticket-card__copy {
    padding-top: 12px;
    row-gap: 0.5rem;
  }

  .ellia-ticket-card__title-cn {
    font-size: 1.6rem;
  }
}
</style>
