
export const ACCENT_COLORS = {
  blue: { name: "Blue", value: "#3b82f6" },
  green: { name: "Green", value: "#10b981" },
  purple: { name: "Purple", value: "#8b5cf6" },
  red: { name: "Red", value: "#ef4444" },
  orange: { name: "Orange", value: "#f97316" },
  pink: { name: "Pink", value: "#ec4899" },
  indigo: { name: "Indigo", value: "#6366f1" },
  teal: { name: "Teal", value: "#14b8a6" }
} as const

export type AccentColorType = keyof typeof ACCENT_COLORS

export function applyAccentColor(color: AccentColorType) {
  const colorValue = ACCENT_COLORS[color]?.value || ACCENT_COLORS.blue.value
  
  // Convert hex to HSL
  const hex = colorValue.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  
  document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`)
  document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%')
}
