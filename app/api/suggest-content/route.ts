import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Interface for pre-approved assets
interface PreApprovedAsset {
  id: string
  content: string
  issuer: string
  product: string
  createdAt: string
}

// Mock database of pre-approved assets (this would normally come from a real database)
// We're keeping this in sync with what's in the PreApprovedAssetsManager component
const preApprovedAssets: { [key: string]: { [key: string]: PreApprovedAsset[] } } = {
  "american-express": {
    "amex-gold": [
      {
        id: "1",
        content:
          "Earn 4X Membership Rewards points at restaurants worldwide and at U.S. supermarkets (on up to $25,000 per year in purchases, then 1X).",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        content: "No Foreign Transaction Fees when you use your Card for purchases made outside the United States.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-10",
      },
      {
        id: "3",
        content:
          "Get up to $120 in statement credits annually when you use your Gold Card for eligible purchases at Grubhub, Seamless, The Cheesecake Factory, Ruth's Chris Steak House, Boxed and participating Shake Shack locations.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-08",
      },
      {
        id: "4",
        content: "Earn 3X points on dining and 1X points on all other purchases with your Gold Card.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-05",
      },
      {
        id: "5",
        content: "Access to exclusive events, presales, and experiences through American Express Entertainment.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-03",
      },
    ],
  },
  headlines: [
    {
      id: "6",
      content: "The Gold Standard of Rewards",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-20",
    },
    {
      id: "7",
      content: "Earn More on Dining & Groceries",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-18",
    },
    {
      id: "8",
      content: "Unlock Premium Dining Experiences",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-16",
    },
    {
      id: "9",
      content: "Your Gateway to Exceptional Rewards",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-14",
    },
    {
      id: "10",
      content: "Elevate Every Purchase",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-12",
    },
  ],
  linkDescriptions: [
    {
      id: "11",
      content: "Get $84 Back Every Year at Dunkin'",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-25",
    },
    {
      id: "12",
      content: "Earn Credits Automatically at Dunkin'",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-24",
    },
    {
      id: "13",
      content: "Unlock Premium Card Benefits",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-23",
    },
    {
      id: "14",
      content: "Start Earning Rewards Today",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-22",
    },
    {
      id: "15",
      content: "Get More from Every Purchase",
      issuer: "american-express",
      product: "amex-gold",
      createdAt: "2024-01-21",
    },
  ],
}

// Fallback suggestions if OpenAI fails
const fallbackSuggestions = {
  headlines: [
    "Unlock Premium Card Benefits",
    "Elevate Your Rewards Experience",
    "Premium Rewards, Premium Service",
    "Earn More with Every Purchase",
    "The Card That Rewards You More",
  ],
  primaryText: [
    "Experience premium benefits with this exceptional card. Earn rewards on everyday purchases and enjoy exclusive perks designed for your lifestyle. Terms apply.",
    "Elevate your spending with rewards that matter. This premium card offers benefits tailored to your needs and lifestyle preferences. Terms apply.",
    "Unlock a world of possibilities with this premium card. Earn points on purchases and redeem for travel, merchandise, and more. Terms apply.",
    "Designed for those who demand more from their credit card. Enjoy premium benefits, exceptional service, and rewards on everyday spending. Terms apply.",
  ],
  linkDescriptions: [
    "Get Rewards on Every Purchase",
    "Earn More with Premium Benefits",
    "Unlock Exclusive Card Perks",
    "Start Earning Today",
    "Get More from Your Spending",
  ],
}

// Function to get relevant pre-approved assets based on type, issuer, and product
function getRelevantPreApprovedAssets(type: string, issuer?: string, product?: string): string[] {
  // Map the type from the request to the key in our preApprovedAssets object
  const assetType = type === "headline" ? "headlines" : type === "linkDescription" ? "linkDescriptions" : "primary-text"

  // Get all assets of the requested type
  const assets =
    preApprovedAssets[issuer] && preApprovedAssets[issuer][product]
      ? preApprovedAssets[issuer][product]
      : preApprovedAssets[assetType] || []

  // Filter by issuer and product if provided, but also include some general examples
  const filteredAssets = assets.filter((asset) => {
    const issuerMatch = !issuer || asset.issuer === issuer
    const productMatch = !product || asset.product === product
    return issuerMatch && productMatch
  })

  // If we don't have enough specific examples, add some general ones
  const allAssets = filteredAssets.length >= 3 ? filteredAssets : [...filteredAssets, ...assets.slice(0, 5)]

  // Return just the content strings, limited to 5 examples
  return allAssets.slice(0, 5).map((asset) => asset.content)
}

export async function POST(request: Request) {
  console.log("Suggest content API route hit. Processing request...")

  try {
    // Parse the request body
    const body = await request.json()
    const type = body.type || "primaryText"
    const existingContent = body.existingContent || []
    const cardInfo = body.cardInfo || { issuer: "american-express", cardProduct: "Credit Card" }

    // Map the type to the correct format for our assets
    const contentType =
      type === "headline" ? "headline" : type === "linkDescription" ? "linkDescription" : "primaryText"

    // Get relevant pre-approved assets as reference examples
    const preApprovedExamples = getRelevantPreApprovedAssets(
      contentType,
      cardInfo.issuer?.toLowerCase().replace(/\s+/g, "-"),
      cardInfo.cardProduct?.toLowerCase().replace(/\s+/g, "-"),
    )

    // Check if we have existing content to work with
    if (!existingContent || existingContent.length === 0) {
      console.warn("No existing content provided for variation generation")

      // Return a fallback suggestion
      const fallbacks =
        contentType === "headline"
          ? fallbackSuggestions.headlines
          : contentType === "linkDescription"
            ? fallbackSuggestions.linkDescriptions
            : fallbackSuggestions.primaryText
      const suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)]

      return NextResponse.json({
        suggestion,
        source: "fallback",
        reason: "No existing content provided to create variations from",
      })
    }

    // Check if we have a valid OpenAI API key
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith("sk-")) {
      console.warn("OpenAI API key not configured or invalid. Using fallback suggestions.")

      // Return a fallback suggestion
      const fallbacks =
        contentType === "headline"
          ? fallbackSuggestions.headlines
          : contentType === "linkDescription"
            ? fallbackSuggestions.linkDescriptions
            : fallbackSuggestions.primaryText
      const suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)]

      return NextResponse.json({
        suggestion,
        source: "fallback",
        reason: "OpenAI API key not configured",
      })
    }

    // Build a prompt for OpenAI based on the content type and existing content
    const prompt = buildVariationPrompt(contentType, existingContent, preApprovedExamples, cardInfo)

    // Call OpenAI to generate a suggestion
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    })

    console.log("OpenAI response received:", text)

    // Extract the suggestion from the response
    const suggestion = extractSuggestion(text)

    // Return the suggestion
    return NextResponse.json({
      suggestion,
      source: "openai",
    })
  } catch (error) {
    console.error("Error in suggest-content API route:", error)

    // Determine content type for fallback
    let contentType = "primaryText"
    try {
      const body = await request.json()
      if (body && body.type === "headline") {
        contentType = "headline"
      } else if (body && body.type === "linkDescription") {
        contentType = "linkDescription"
      }
    } catch (parseError) {
      console.warn("Could not parse request body for fallback, using default type.")
    }

    // Get a fallback suggestion
    const fallbacks =
      contentType === "headline"
        ? fallbackSuggestions.headlines
        : contentType === "linkDescription"
          ? fallbackSuggestions.linkDescriptions
          : fallbackSuggestions.primaryText
    const suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)]

    return NextResponse.json({
      suggestion,
      source: "fallback",
      reason: "Error processing request: " + (error instanceof Error ? error.message : "Unknown error"),
    })
  }
}

// Function to build a variation-focused prompt for OpenAI
function buildVariationPrompt(
  contentType: string,
  existingContent: string[],
  preApprovedExamples: string[],
  cardInfo: { issuer: string; cardProduct: string },
): string {
  const { issuer, cardProduct } = cardInfo

  // Start with a base prompt focused on creating variations
  let prompt = ""

  if (contentType === "headline") {
    prompt = `Create a new headline variation for a ${issuer} ${cardProduct} advertisement.

YOUR TASK: Generate ONE alternative headline based on the user's existing headlines below.

USER'S EXISTING HEADLINES (create a variation of these):
${existingContent.map((content, index) => `${index + 1}. "${content}"`).join("\n")}

REFERENCE EXAMPLES (these have converted well in past campaigns):
${preApprovedExamples.map((example) => `- "${example}"`).join("\n")}

REQUIREMENTS:
- Create a NEW variation that captures the same message/benefit as the user's existing headlines
- Keep the same tone and style as the user's content
- Make it concise (typically 3-7 words)
- Focus on the same benefits/rewards mentioned in their existing headlines
- Use the reference examples to understand what language converts well
- Do NOT copy the user's existing headlines exactly
- Do NOT include quotation marks, asterisks, or disclaimers
- Adhere to standard publisher brand guidelines and advertising best practices
- Make it fresh but consistent with their campaign theme
- Use American English spelling and terminology
- Do NOT use em dashes (—) or other AI-typical punctuation
- Use natural, conversational language that sounds human-written

Generate ONE new headline variation:

HEADLINE:`
  } else if (contentType === "linkDescription") {
    prompt = `Create a new link description variation for a ${issuer} ${cardProduct} advertisement.

YOUR TASK: Generate ONE alternative link description based on the user's existing link descriptions below.

USER'S EXISTING LINK DESCRIPTIONS (create a variation of these):
${existingContent.map((content, index) => `${index + 1}. "${content}"`).join("\n")}

REFERENCE EXAMPLES (these have converted well in past campaigns):
${preApprovedExamples.map((example) => `- "${example}"`).join("\n")}

REQUIREMENTS:
- Create a NEW variation that captures the same message/benefit as the user's existing link descriptions
- MAXIMUM 60 characters (optimal for desktop ad display)
- Keep the same tone, style, and key benefits as the user's content
- Make it action-oriented and compelling (encourages clicks)
- Use similar language patterns and benefit focus as their existing descriptions
- Reference examples show what language converts well - use similar structure/style
- Do NOT copy the user's existing descriptions exactly
- Do NOT include quotation marks, asterisks, or legal symbols
- Focus on the primary benefit or call-to-action
- Make it fresh but consistent with their campaign message
- Prioritize the same benefits/features mentioned in their existing content
- Follow standard publisher brand guidelines and advertising compliance standards
- Use American English spelling and terminology
- Do NOT use em dashes (—) or other AI-typical punctuation
- Write in natural, conversational language that sounds human-written
- Avoid overly formal or AI-typical phrasing

Generate ONE new link description variation (under 60 characters):

LINK DESCRIPTION:`
  } else {
    prompt = `Create a new primary text variation for a ${issuer} ${cardProduct} advertisement.

YOUR TASK: Generate ONE alternative primary text based on the user's existing primary text below.

USER'S EXISTING PRIMARY TEXT (create a variation of these):
${existingContent.map((content, index) => `${index + 1}. "${content}"`).join("\n")}

REFERENCE EXAMPLES (these have converted well in past campaigns):
${preApprovedExamples.map((example) => `- "${example}"`).join("\n")}

REQUIREMENTS:
- Create a NEW variation that captures the same benefits/message as the user's existing primary text
- MAXIMUM 170 characters (hard limit for advertising compliance)
- Keep the same tone, style, and key benefits as the user's content
- Use similar language patterns and benefit focus as their existing text
- Reference examples show what language converts well - use similar structure/style
- Do NOT copy the user's existing text exactly
- Do NOT include quotation marks, asterisks, or legal symbols
- If appropriate, end with "Terms apply." for financial offers
- Make it fresh but consistent with their campaign message
- Prioritize the same benefits/features mentioned in their existing content
- Follow standard publisher brand guidelines and advertising compliance standards
- Use American English spelling and terminology  
- Do NOT use em dashes (—) or other AI-typical punctuation
- Write in natural, conversational language that sounds human-written
- Avoid overly formal or AI-typical phrasing

Generate ONE new primary text variation (under 170 characters):

PRIMARY TEXT:`
  }

  return prompt
}

// Function to extract the suggestion from the OpenAI response
function extractSuggestion(text: string): string {
  // Clean up the response
  let suggestion = text.trim()

  // Remove any quotation marks that might have been added
  suggestion = suggestion.replace(/^["']|["']$/g, "")

  return suggestion
}
