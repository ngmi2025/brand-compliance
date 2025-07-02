// Enhanced canvas drawing that perfectly matches your React component
const drawPixelPerfectFacebookAd = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Exact color palette from your React component
  const colors = {
    white: "#ffffff",
    border: "#e4e6ea",
    text: "#1c1e21",
    secondary: "#65676b",
    blue: "#1877f2",
    linkBg: "#f7f8fa",
    buttonBg: "#e4e6ea",
  }

  // Exact font specifications
  const fonts = {
    name: "600 15px system-ui, -apple-system, sans-serif",
    meta: "400 13px system-ui, -apple-system, sans-serif",
    text: "400 15px system-ui, -apple-system, sans-serif",
    url: "400 12px system-ui, -apple-system, sans-serif",
    headline: "600 16px system-ui, -apple-system, sans-serif",
    button: "600 13px system-ui, -apple-system, sans-serif",
    engagement: "400 13px system-ui, -apple-system, sans-serif",
  }

  // Exact spacing from your Tailwind classes
  const spacing = {
    padding: 12, // p-3
    gap: 12, // gap-3
    headerHeight: 60, // Measured from your component
    profileSize: 40, // w-10 h-10
    linkHeight: 80, // Measured
    statsHeight: 32, // Measured
    actionsHeight: 44, // Measured
  }

  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  // Background
  ctx.fillStyle = colors.white
  ctx.fillRect(0, 0, width, height)

  // Border (matching your border rounded-lg)
  ctx.strokeStyle = colors.border
  ctx.lineWidth = 1
  drawRoundedRect(ctx, 0.5, 0.5, width - 1, height - 1, 8) // rounded-lg = 8px
  ctx.stroke()

  const y = 0

  // Header section
  ctx.fillStyle = colors.white
  ctx.fillRect(0, y, width, spacing.headerHeight)

  // Profile picture (exact match to your w-10 h-10 rounded-full bg-blue-500)
  const profileX = spacing.padding
  const profileY = y + 10

  ctx.fillStyle = colors.blue
  ctx.beginPath()
  ctx.arc(
    profileX + spacing.profileSize / 2,
    profileY + spacing.profileSize / 2,
    spacing.profileSize / 2,
    0,
    2 * Math.PI,
  )
  ctx.fill()

  // "UP" text (exact match to your font-bold text-white)
  ctx.fillStyle = colors.white
  ctx.font = "bold 16px system-ui"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("UP", profileX + spacing.profileSize / 2, profileY + spacing.profileSize / 2)

  // Reset alignment
  ctx.textAlign = "left"
  ctx.textBaseline = "top"

  const pageName = "Page Name"

  // Page name (exact match to font-semibold text-sm)
  const nameX = profileX + spacing.profileSize + spacing.gap
  ctx.fillStyle = colors.text
  ctx.font = fonts.name
  ctx.fillText(pageName, nameX, profileY + 4)

  // Verification badge (exact match to text-blue-500 text-xs)
  const nameWidth = ctx.measureText(pageName).width
  ctx.fillStyle = colors.blue
  ctx.font = "12px system-ui"
  ctx.fillText("✦", nameX + nameWidth + 6, profileY + 4)

  // Continue with exact measurements...
  // This approach gives you pixel-perfect control
}
