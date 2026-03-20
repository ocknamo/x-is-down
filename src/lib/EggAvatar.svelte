<script lang="ts">
  interface Props {
    pubkey: string
    size?: number
  }

  const { pubkey, size = 40 }: Props = $props()

  const EGG_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#10b981', // emerald
    '#14b8a6', // teal
    '#a855f7', // violet
  ]

  const color = $derived(EGG_COLORS[Number.parseInt(pubkey.slice(0, 2), 16) % EGG_COLORS.length])
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 40 40"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <!-- Background circle (white) -->
  <rect width="40" height="40" rx="20" fill="#f4f4f5" />
  <!-- Egg shape: scaled to 70% from center -->
  <g transform="translate(20,20) scale(0.80) translate(-20,-22)">
    <path
      d="M20,7 C27,7 33,14 33,23 C33,31 27.5,37 20,37 C12.5,37 7,31 7,23 C7,14 13,7 20,7 Z"
      fill={color}
    />
    <!-- Highlight -->
    <ellipse cx="15" cy="17" rx="4" ry="5" fill="white" opacity="0.25" />
  </g>
</svg>
