import { css } from 'lit'

export const tokens = css`
  :host {
    --ht-fg: var(--primary-text-color, #e6e6e6);
    --ht-muted: var(--secondary-text-color, #a8a8a8);
    --ht-accent: var(--primary-color, #03a9f4);
    --ht-on-accent: var(--text-primary-color, #ffffff);
    --ht-divider: var(--divider-color, rgba(255, 255, 255, 0.12));
    --ht-surface: var(--card-background-color, var(--ha-card-background, #1c1c1c));
    --ht-surface-alt: var(--secondary-background-color, #282828);
    --ht-danger: var(--error-color, #db4437);
    --ht-success: var(--success-color, #43a047);
    --ht-warning: var(--warning-color, #ffa600);
    --ht-radius: var(--ha-card-border-radius, 12px);
    --ht-corner: superellipse(1.6);
    --ht-touch: 56px;
    --ht-gap: 12px;
    color: var(--ht-fg);
  }
`

export const controls = css`
  .ht-btn {
    appearance: none;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid var(--ht-divider);
    border-radius: var(--ht-radius);
    corner-shape: var(--ht-corner);
    background: transparent;
    color: var(--ht-fg);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 120ms ease,
      opacity 120ms ease;
  }

  .ht-btn:active {
    transform: scale(0.97);
  }

  .ht-btn:focus-visible,
  .ht-input:focus-visible {
    outline: 2px solid var(--ht-accent);
    outline-offset: 1px;
  }

  .ht-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .ht-btn-primary {
    border-color: transparent;
    background: var(--ht-accent);
    color: var(--ht-on-accent);
  }

  .ht-btn-danger {
    border-color: var(--ht-danger);
    color: var(--ht-danger);
  }

  .ht-input {
    box-sizing: border-box;
    width: 100%;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--ht-divider);
    border-radius: calc(var(--ht-radius) / 1.5);
    corner-shape: var(--ht-corner);
    background: var(--ht-surface-alt);
    color: var(--ht-fg);
    font: inherit;
    color-scheme: dark light;
  }

  .ht-label {
    display: grid;
    gap: 4px;
    color: var(--ht-muted);
    font-size: 0.875rem;
  }
`

export const sceneStyles = css`
  .ht-scene {
    display: block;
    width: 100%;
    height: 100%;
    contain: layout paint;
    user-select: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    .ht-animated .ht-a-rumble {
      animation: ht-rumble 0.4s steps(1) infinite;
    }
    .ht-animated .ht-a-spin {
      animation: ht-spin 1.8s steps(18) infinite;
    }
    .ht-animated .ht-a-slosh {
      animation: ht-slosh 1.2s steps(10) infinite alternate;
    }
    .ht-animated .ht-a-rise {
      animation: ht-rise 2.8s steps(24) infinite;
    }
    .ht-animated .ht-a-flicker {
      animation: ht-flicker 0.5s steps(1) infinite;
    }
    .ht-animated .ht-a-waft {
      animation: ht-waft 2.6s steps(16) infinite;
    }
    .ht-animated .ht-a-buzz {
      animation: ht-buzz 1.8s steps(6) infinite;
    }
    .ht-animated .ht-a-drip {
      animation: ht-drip 1.8s ease-in infinite;
    }
    .ht-animated .ht-a-fall {
      animation: ht-fall 1.6s ease-in infinite;
    }
    .ht-animated .ht-a-drift {
      animation: ht-drift 5s steps(30) infinite alternate;
    }
    .ht-animated .ht-a-pulse {
      animation: ht-pulse 1.6s steps(12) infinite;
    }
    .ht-animated .ht-a-throb {
      animation: ht-throb 1.6s steps(12) infinite;
    }
    .ht-animated .ht-a-bob {
      animation: ht-bob 2.2s steps(14) infinite alternate;
    }
    .ht-animated .ht-a-wobble {
      animation: ht-wobble 1.3s steps(10) infinite alternate;
    }
    .ht-animated .ht-a-sway {
      animation: ht-sway 3.2s steps(20) infinite alternate;
    }
    .ht-animated .ht-a-twinkle {
      animation: ht-twinkle 2.2s steps(14) infinite;
    }
    .ht-animated .ht-a-tide {
      animation: ht-tide 4.4s steps(44) infinite;
    }
    .ht-animated .ht-a-tide-back {
      animation: ht-tide-back 6.6s steps(44) infinite;
    }
    .ht-animated .ht-d1 {
      animation-delay: -0.35s;
    }
    .ht-animated .ht-d2 {
      animation-delay: -1.05s;
    }
    .ht-animated .ht-d3 {
      animation-delay: -1.6s;
    }
    .ht-animated .ht-d4 {
      animation-delay: -2.1s;
    }
    .ht-animated .ht-d5 {
      animation-delay: -2.55s;
    }
  }

  @keyframes ht-rumble {
    0% {
      transform: translate(-1.4px, 0.5px) rotate(-0.5deg);
    }
    25% {
      transform: translate(1.2px, -0.6px) rotate(0.4deg);
    }
    50% {
      transform: translate(-0.9px, -0.4px) rotate(0.5deg);
    }
    75% {
      transform: translate(1.5px, 0.6px) rotate(-0.4deg);
    }
  }

  @keyframes ht-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ht-slosh {
    from {
      transform: rotate(-7deg);
    }
    to {
      transform: rotate(7deg);
    }
  }

  @keyframes ht-rise {
    0% {
      opacity: 0;
      transform: translateY(14px) scale(0.6);
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-26px) scale(1.15);
    }
  }

  @keyframes ht-flicker {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  @keyframes ht-waft {
    0% {
      opacity: 0.25;
      transform: translateY(8px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.25;
      transform: translateY(-8px);
    }
  }

  @keyframes ht-buzz {
    0%,
    100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(9px, -6px);
    }
    50% {
      transform: translate(14px, 3px);
    }
    75% {
      transform: translate(3px, 7px);
    }
  }

  @keyframes ht-drip {
    0% {
      opacity: 0;
      transform: translateY(-6px);
    }
    25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  @keyframes ht-fall {
    0% {
      opacity: 0;
      transform: translateY(-16px);
    }
    25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(26px);
    }
  }

  @keyframes ht-drift {
    from {
      transform: translateX(-6px);
    }
    to {
      transform: translateX(6px);
    }
  }

  @keyframes ht-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.72;
      transform: scale(1.1);
    }
  }

  @keyframes ht-throb {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @keyframes ht-bob {
    from {
      transform: translateY(-3px);
    }
    to {
      transform: translateY(3px);
    }
  }

  @keyframes ht-wobble {
    from {
      transform: rotate(-9deg);
    }
    to {
      transform: rotate(9deg);
    }
  }

  @keyframes ht-sway {
    from {
      transform: rotate(-3deg);
    }
    to {
      transform: rotate(3deg);
    }
  }

  @keyframes ht-twinkle {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.6);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  @keyframes ht-tide {
    from {
      transform: translateX(-66px);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes ht-tide-back {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-66px);
    }
  }
`
