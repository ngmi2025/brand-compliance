import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getBrandDocumentContent, getDocumentsForCompliance } from "./document-storage-service"

// Interface for compliance check results
export interface ComplianceCheckResult {
  id: string
  name: string
  status: "passed" | "warning" | "failed" | "not_applicable" | "pending" | "running"
  description: string
  details?: string
  category: string
  assessmentConfidence?: number // How confident AI is in its analysis (0-100)
  passConfidence?: number // How confident AI is this passes compliance (0-100)
  actionableSteps?: string[]
  brandDocumentsUsed?: number // Number of brand documents used in analysis
}

// Enhanced function to get brand document content for AI prompts
function enhanceAIPromptWithBrandDocuments(basePrompt: string, issuer = "american-express"): string {
  const brandDocuments = getDocumentsForCompliance(issuer)

  if (brandDocuments.length === 0) {
    return `${basePrompt}

NOTE: No brand documents are currently available for ${issuer}. Analysis will be based on general brand compliance best practices. For more accurate results, upload official brand guidelines, compliance rules, and legal requirements in the Admin panel.`
  }

  const documentContent = getBrandDocumentContent(issuer)

  return `${basePrompt}

OFFICIAL BRAND DOCUMENTS FOR REFERENCE:
${documentContent}

IMPORTANT: Use the above official brand documents as your PRIMARY reference for compliance analysis. These documents contain the authoritative guidelines that must be followed. Base your analysis on these specific requirements rather than general assumptions.

Brand Documents Available: ${brandDocuments.length}
- ${brandDocuments.map((doc) => `${doc.name} (${doc.type})`).join("\n- ")}
`
}

// Function to calculate confidence scores based on available documents
function calculateConfidenceScores(
  issuer: string,
  hasContent: boolean,
): {
  assessmentConfidence: number
  passConfidence: number
} {
  const brandDocuments = getDocumentsForCompliance(issuer)
  const documentCount = brandDocuments.length

  // Base confidence without documents
  let assessmentConfidence = hasContent ? 70 : 60
  let passConfidence = hasContent ? 65 : 50

  // Boost confidence with brand documents
  if (documentCount > 0) {
    assessmentConfidence = Math.min(95, assessmentConfidence + documentCount * 10)
    passConfidence = Math.min(90, passConfidence + documentCount * 8)
  }

  return { assessmentConfidence, passConfidence }
}

// Function to analyze image for logo compliance
export async function analyzeImageCompliance(imageUrl: string): Promise<ComplianceCheckResult[]> {
  const results: ComplianceCheckResult[] = []

  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-") === false) {
      throw new Error(
        "OpenAI API key is not configured or invalid. Please configure your API key to run compliance checks.",
      )
    }

    // Base prompt for logo analysis
    const baseLogoPrompt = `
      You are a brand compliance expert analyzing this image for American Express brand guidelines. 
      
      CRITICAL: You MUST provide a definitive assessment for each point. Do not use "inconclusive" or "unclear" responses.
      
      For each analysis, provide TWO confidence levels:
      1. ASSESSMENT CONFIDENCE: How confident are you in your ability to analyze this aspect (image quality, visibility, etc.)
      2. PASS CONFIDENCE: Based on your analysis, how confident are you this meets compliance requirements
      
      Analyze the following aspects and provide STRUCTURED responses:

      1. LOGO DETECTION:
         - Is an American Express logo visible in this image? (YES/NO)
         - If NO, state "No American Express logo detected"
         - If YES, continue with detailed analysis

      2. LOGO SIZE ANALYSIS:
         - Estimate the logo height in pixels (provide specific number)
         - Does it meet minimum 40px height requirement? (PASS/FAIL)
         - Assessment confidence (1-100%): How well can you measure the logo?
         - Pass confidence (1-100%): How confident are you it meets size requirements?

      3. CLEAR SPACE ANALYSIS:
         - Measure clear space around logo relative to logo height
         - Is there adequate clear space (minimum 1/3 logo height)? (PASS/WARNING/FAIL)
         - Specify which sides have insufficient space if any
         - Assessment confidence (1-100%): How well can you measure clear space?
         - Pass confidence (1-100%): How confident are you clear space is adequate?

      4. LOGO MODIFICATIONS:
         - Has the logo been stretched, skewed, or altered? (YES/NO)
         - Are proportions maintained? (YES/NO)
         - Overall assessment (PASS/FAIL)
         - Assessment confidence (1-100%): How well can you detect modifications?
         - Pass confidence (1-100%): How confident are you logo is unmodified?

      5. COLOR ACCURACY:
         - Is the logo using the correct American Express blue (#006FCF or #016FD0)? (YES/NO/CANNOT_DETERMINE)
         - Are colors vibrant and properly rendered? (YES/NO)
         - Overall color assessment (PASS/WARNING/FAIL)
         - Assessment confidence (1-100%): How well can you analyze colors?
         - Pass confidence (1-100%): How confident are you colors are correct?

      FORMAT YOUR RESPONSE EXACTLY AS:
      LOGO_DETECTED: [YES/NO]
      LOGO_SIZE: [specific pixel estimate] - [PASS/FAIL] - Assessment: [X]% - Pass: [X]%
      CLEAR_SPACE: [PASS/WARNING/FAIL] - [specific issues if any] - Assessment: [X]% - Pass: [X]%
      MODIFICATIONS: [PASS/FAIL] - [specific issues if any] - Assessment: [X]% - Pass: [X]%
      COLOR_USAGE: [PASS/WARNING/FAIL] - [specific color assessment] - Assessment: [X]% - Pass: [X]%
    `

    // Enhance prompt with brand documents
    const logoAnalysisPrompt = enhanceAIPromptWithBrandDocuments(baseLogoPrompt)

    const { text: logoAnalysis } = await generateText({
      model: openai("gpt-4o"),
      prompt: logoAnalysisPrompt,
      system: `You are a meticulous brand compliance expert with access to official American Express brand guidelines. Always provide definitive assessments with specific measurements and BOTH confidence levels. Assessment confidence = how well you can analyze. Pass confidence = how likely it meets requirements. Use the provided brand guidelines as your primary reference.`,
    })

    console.log("Logo Analysis Response:", logoAnalysis)

    // Parse structured response
    const logoDetected = logoAnalysis.includes("LOGO_DETECTED: YES")

    // Always add logo detection result first
    results.push({
      id: "logo-detection",
      name: "Logo Detection",
      status: logoDetected ? "passed" : "not_applicable",
      description: "American Express logo detection in provided images",
      details: logoDetected
        ? "American Express logo was successfully detected in the provided image."
        : "No American Express logo detected in the provided image. This is acceptable if American Express branding is not required for this content.",
      category: "logoUsage",
      assessmentConfidence: 95,
      passConfidence: logoDetected ? 100 : 100, // 100% pass if no logo needed
      actionableSteps: logoDetected
        ? ["Logo detected successfully - proceed with logo compliance checks"]
        : [
            "No American Express logo detected - this is acceptable if branding is not required",
            "If American Express branding is required, ensure the logo is clearly visible",
            "Verify that the content type requires American Express logo usage",
          ],
    })

    if (!logoDetected) {
      // When no logo is detected, mark other logo checks as "not applicable" instead of failed
      results.push(
        {
          id: "logo-size",
          name: "Logo Size Check",
          status: "not_applicable",
          description: "Verifies that the American Express logo meets minimum size requirements (40px height)",
          details:
            "Logo size check not applicable - no American Express logo detected in the provided image. This check only applies when American Express branding is present.",
          category: "logoUsage",
          assessmentConfidence: 100,
          passConfidence: 100,
          actionableSteps: [
            "No logo present - size requirements not applicable",
            "If adding American Express logo, ensure it meets minimum 40px height requirement",
          ],
        },
        {
          id: "logo-clear-space",
          name: "Logo Clear Space",
          status: "not_applicable",
          description:
            "Checks if proper clear space is maintained around the American Express logo (minimum 1/3 logo height)",
          details:
            "Clear space check not applicable - no American Express logo detected in the provided image. This check only applies when American Express branding is present.",
          category: "logoUsage",
          assessmentConfidence: 100,
          passConfidence: 100,
          actionableSteps: [
            "No logo present - clear space requirements not applicable",
            "If adding American Express logo, ensure minimum 1/3 logo height clear space on all sides",
          ],
        },
        {
          id: "logo-modifications",
          name: "Logo Modifications",
          status: "not_applicable",
          description: "Detects if the logo has been modified, stretched, or altered from original proportions",
          details:
            "Logo modification check not applicable - no American Express logo detected in the provided image. This check only applies when American Express branding is present.",
          category: "logoUsage",
          assessmentConfidence: 100,
          passConfidence: 100,
          actionableSteps: [
            "No logo present - modification restrictions not applicable",
            "If adding American Express logo, use only the original, unmodified version",
          ],
        },
        {
          id: "color-usage",
          name: "Brand Color Usage",
          status: "not_applicable",
          description: "Verifies correct usage of American Express blue (#006FCF or #016FD0) and color accuracy",
          details:
            "Brand color check not applicable - no American Express logo detected in the provided image. This check only applies when American Express branding is present.",
          category: "colorPalette",
          assessmentConfidence: 100,
          passConfidence: 100,
          actionableSteps: [
            "No logo present - brand color requirements not applicable",
            "If adding American Express logo, use the official American Express blue color (#006FCF or #016FD0)",
          ],
        },
      )

      return results
    }

    // Process each aspect with improved parsing when logo IS detected
    const logoSizeCheck = parseStructuredResponse(logoAnalysis, "LOGO_SIZE")
    const clearSpaceCheck = parseStructuredResponse(logoAnalysis, "CLEAR_SPACE")
    const modificationsCheck = parseStructuredResponse(logoAnalysis, "MODIFICATIONS")
    const colorCheck = parseStructuredResponse(logoAnalysis, "COLOR_USAGE")

    results.push({
      id: "logo-size",
      name: "Logo Size Check",
      status: logoSizeCheck.status,
      description: "Verifies that the American Express logo meets minimum size requirements (40px height)",
      details: logoSizeCheck.details,
      category: "logoUsage",
      assessmentConfidence: logoSizeCheck.assessmentConfidence,
      passConfidence: logoSizeCheck.passConfidence,
      actionableSteps: logoSizeCheck.actionableSteps,
    })

    results.push({
      id: "logo-clear-space",
      name: "Logo Clear Space",
      status: clearSpaceCheck.status,
      description:
        "Checks if proper clear space is maintained around the American Express logo (minimum 1/3 logo height)",
      details: clearSpaceCheck.details,
      category: "logoUsage",
      assessmentConfidence: clearSpaceCheck.assessmentConfidence,
      passConfidence: clearSpaceCheck.passConfidence,
      actionableSteps: clearSpaceCheck.actionableSteps,
    })

    results.push({
      id: "logo-modifications",
      name: "Logo Modifications",
      status: modificationsCheck.status,
      description: "Detects if the logo has been modified, stretched, or altered from original proportions",
      details: modificationsCheck.details,
      category: "logoUsage",
      assessmentConfidence: modificationsCheck.assessmentConfidence,
      passConfidence: modificationsCheck.passConfidence,
      actionableSteps: modificationsCheck.actionableSteps,
    })

    results.push({
      id: "color-usage",
      name: "Brand Color Usage",
      status: colorCheck.status,
      description: "Verifies correct usage of American Express blue (#006FCF or #016FD0) and color accuracy",
      details: colorCheck.details,
      category: "colorPalette",
      assessmentConfidence: colorCheck.assessmentConfidence,
      passConfidence: colorCheck.passConfidence,
      actionableSteps: colorCheck.actionableSteps,
    })
  } catch (error) {
    console.error("Error analyzing image compliance:", error)
    throw error
  }

  return results
}

// Function to analyze text content for compliance
export async function analyzeTextCompliance(text: string): Promise<ComplianceCheckResult[]> {
  const results: ComplianceCheckResult[] = []

  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-") === false) {
      throw new Error(
        "OpenAI API key is not configured or invalid. Please configure your API key to run compliance checks.",
      )
    }

    // Base prompt for text analysis
    const baseTextPrompt = `
  Analyze this text content for American Express brand compliance. Provide DEFINITIVE assessments only.

  For each analysis, provide TWO confidence levels:
  1. ASSESSMENT CONFIDENCE: How confident are you in your ability to analyze this text (clarity, completeness, etc.)
  2. PASS CONFIDENCE: Based on your analysis, how confident are you this meets compliance requirements

  TEXT TO ANALYZE:
  "${text}"

  ANALYZE THESE ASPECTS WITH STRUCTURED RESPONSES:

  1. TRADEMARK USAGE:
     - Count mentions of "American Express" in the text
     - Is ® symbol used on FIRST mention of "American Express"? (YES/NO)
     - Are subsequent mentions properly formatted? (YES/NO)
     - Overall trademark compliance (PASS/WARNING/FAIL)
     - Assessment confidence (1-100%): How well can you analyze trademark usage?
     - Pass confidence (1-100%): How confident are you trademark usage is correct?

  2. COPY GUIDELINES:
     - Is "American Express Card" written in full (not abbreviated)? (YES/NO/NOT_APPLICABLE)
     - Is "Card" capitalized when referring to American Express Card? (YES/NO/NOT_APPLICABLE)
     - Are preferred phrases used (e.g., "pay with" vs "charge to")? (YES/NO/NOT_APPLICABLE)
     - Overall copy compliance (PASS/WARNING/FAIL)
     - Assessment confidence (1-100%): How well can you analyze copy guidelines?
     - Pass confidence (1-100%): How confident are you copy follows guidelines?

  3. REGULATORY COMPLIANCE:
     - Are financial disclosures present where required? (YES/NO/NOT_REQUIRED)
     - Is content truthful and not misleading? (YES/NO)
     - Are any regulatory warnings needed? (YES/NO)
     - Overall regulatory compliance (PASS/WARNING/FAIL)
     - Assessment confidence (1-100%): How well can you analyze regulatory compliance?
     - Pass confidence (1-100%): How confident are you this meets regulatory requirements?

  4. TYPOGRAPHY STANDARDS:
     - Can you identify font families used in the text context? (YES/NO)
     - Does the text suggest proper typography hierarchy? (YES/NO/CANNOT_DETERMINE)
     - Are there any obvious typography violations mentioned? (YES/NO)
     - Overall typography assessment (PASS/WARNING/FAIL)
     - Assessment confidence (1-100%): How well can you assess typography from text?
     - Pass confidence (1-100%): How confident are you typography meets standards?

  5. ACCESSIBILITY STANDARDS:
     - Does the text include accessibility considerations? (YES/NO)
     - Are there mentions of alt text, contrast, or accessibility features? (YES/NO)
     - Does content suggest WCAG compliance awareness? (YES/NO/CANNOT_DETERMINE)
     - Overall accessibility assessment (PASS/WARNING/FAIL)
     - Assessment confidence (1-100%): How well can you assess accessibility from text?
     - Pass confidence (1-100%): How confident are you accessibility is considered?

  FORMAT YOUR RESPONSE EXACTLY AS:
  TRADEMARK: [PASS/WARNING/FAIL] - [specific findings] - Assessment: [X]% - Pass: [X]%
  COPY_GUIDELINES: [PASS/WARNING/FAIL] - [specific findings] - Assessment: [X]% - Pass: [X]%
  REGULATORY: [PASS/WARNING/FAIL] - [specific findings] - Assessment: [X]% - Pass: [X]%
  TYPOGRAPHY: [PASS/WARNING/FAIL] - [specific findings] - Assessment: [X]% - Pass: [X]%
  ACCESSIBILITY: [PASS/WARNING/FAIL] - [specific findings] - Assessment: [X]% - Pass: [X]%
`

    // Enhance prompt with brand documents
    const textAnalysisPrompt = enhanceAIPromptWithBrandDocuments(baseTextPrompt)

    const { text: textAnalysis } = await generateText({
      model: openai("gpt-4o"),
      prompt: textAnalysisPrompt,
      system: `You are a legal and brand compliance expert with access to official American Express brand guidelines and compliance requirements. Provide specific, actionable assessments with BOTH confidence levels. Assessment confidence = how well you can analyze. Pass confidence = how likely it meets requirements. Use the provided brand guidelines as your primary reference.`,
    })

    console.log("Text Analysis Response:", textAnalysis)

    // Process structured responses
    const trademarkCheck = parseStructuredResponse(textAnalysis, "TRADEMARK")
    const copyCheck = parseStructuredResponse(textAnalysis, "COPY_GUIDELINES")
    const regulatoryCheck = parseStructuredResponse(textAnalysis, "REGULATORY")
    const typographyCheck = parseStructuredResponse(textAnalysis, "TYPOGRAPHY")
    const accessibilityCheck = parseStructuredResponse(textAnalysis, "ACCESSIBILITY")

    results.push({
      id: "trademark-usage",
      name: "Trademark Usage",
      status: trademarkCheck.status,
      description: "Verifies proper use of ® symbol and trademark terms according to American Express guidelines",
      details: trademarkCheck.details,
      category: "legalRequirements",
      assessmentConfidence: trademarkCheck.assessmentConfidence,
      passConfidence: trademarkCheck.passConfidence,
      actionableSteps: trademarkCheck.actionableSteps,
    })

    results.push({
      id: "copy-guidelines",
      name: "Copy Guidelines",
      status: copyCheck.status,
      description: "Checks if copy follows American Express writing standards and preferred terminology",
      details: copyCheck.details,
      category: "legalRequirements",
      assessmentConfidence: copyCheck.assessmentConfidence,
      passConfidence: copyCheck.passConfidence,
      actionableSteps: copyCheck.actionableSteps,
    })

    results.push({
      id: "regulatory-compliance",
      name: "Regulatory Compliance",
      status: regulatoryCheck.status,
      description: "Checks for required financial disclosures and regulatory compliance in marketing materials",
      details: regulatoryCheck.details,
      category: "industryRegulations",
      assessmentConfidence: regulatoryCheck.assessmentConfidence,
      passConfidence: regulatoryCheck.passConfidence,
      actionableSteps: regulatoryCheck.actionableSteps,
    })

    results.push({
      id: "typography-standards",
      name: "Typography Standards",
      status: typographyCheck.status,
      description: "Checks adherence to American Express typography guidelines including font usage and hierarchy",
      details: typographyCheck.details,
      category: "designStandards",
      assessmentConfidence: typographyCheck.assessmentConfidence,
      passConfidence: typographyCheck.passConfidence,
      actionableSteps: typographyCheck.actionableSteps,
    })

    results.push({
      id: "accessibility-standards",
      name: "Accessibility Standards",
      status: accessibilityCheck.status,
      description: "Verifies content meets WCAG 2.1 AA accessibility standards for inclusive design",
      details: accessibilityCheck.details,
      category: "accessibilityCompliance",
      assessmentConfidence: accessibilityCheck.assessmentConfidence,
      passConfidence: accessibilityCheck.passConfidence,
      actionableSteps: accessibilityCheck.actionableSteps,
    })
  } catch (error) {
    console.error("Error analyzing text compliance:", error)
    throw error
  }

  return results
}

// Improved helper function to parse structured AI responses
function parseStructuredResponse(
  analysisText: string,
  keyword: string,
): {
  status: "passed" | "warning" | "failed"
  details: string
  assessmentConfidence: number
  passConfidence: number
  actionableSteps: string[]
} {
  // Find the line containing our keyword
  const lines = analysisText.split("\n")
  const targetLine = lines.find((line) => line.includes(keyword + ":"))

  if (!targetLine) {
    return {
      status: "warning",
      details: `Analysis for ${keyword} could not be parsed from AI response. Manual review recommended.`,
      assessmentConfidence: 0,
      passConfidence: 0,
      actionableSteps: ["Review the original AI analysis response", "Manually verify compliance for this aspect"],
    }
  }

  // Extract status
  let status: "passed" | "warning" | "failed" = "warning"
  if (targetLine.includes("PASS")) status = "passed"
  else if (targetLine.includes("FAIL")) status = "failed"
  else if (targetLine.includes("WARNING")) status = "warning"

  // Extract assessment confidence
  const assessmentMatch = targetLine.match(/Assessment:\s*(\d+)%/)
  const assessmentConfidence = assessmentMatch ? Number.parseInt(assessmentMatch[1]) : 50

  // Extract pass confidence
  const passMatch = targetLine.match(/Pass:\s*(\d+)%/)
  const passConfidence = passMatch ? Number.parseInt(passMatch[1]) : 50

  // Extract details (everything between status and first confidence)
  const detailsMatch = targetLine.match(/(?:PASS|WARNING|FAIL)\s*-\s*(.*?)\s*-\s*Assessment/)
  const details = detailsMatch ? detailsMatch[1].trim() : targetLine

  // Generate actionable steps based on status and keyword
  const actionableSteps = generateActionableSteps(keyword, status, details)

  return {
    status,
    details: details || `${keyword} analysis completed with ${status} status`,
    assessmentConfidence,
    passConfidence,
    actionableSteps,
  }
}

// Helper function to generate actionable steps
function generateActionableSteps(keyword: string, status: string, details: string): string[] {
  const steps: string[] = []

  switch (keyword) {
    case "LOGO_SIZE":
      if (status === "failed") {
        steps.push("Increase logo size to meet minimum 40px height requirement")
        steps.push("Ensure logo remains legible at the required size")
      } else if (status === "warning") {
        steps.push("Consider increasing logo size for better visibility")
      }
      break

    case "CLEAR_SPACE":
      if (status === "failed" || status === "warning") {
        steps.push("Increase clear space around logo to minimum 1/3 of logo height")
        steps.push("Remove any elements that encroach on logo clear space")
        if (details.includes("right")) steps.push("Add more space to the right of the logo")
        if (details.includes("left")) steps.push("Add more space to the left of the logo")
        if (details.includes("top")) steps.push("Add more space above the logo")
        if (details.includes("bottom")) steps.push("Add more space below the logo")
      }
      break

    case "MODIFICATIONS":
      if (status === "failed") {
        steps.push("Use the original, unmodified American Express logo")
        steps.push("Ensure logo proportions are maintained")
        steps.push("Do not stretch, skew, or alter the logo in any way")
      }
      break

    case "COLOR_USAGE":
      if (status === "failed" || status === "warning") {
        steps.push("Use the official American Express blue color (#006FCF or #016FD0)")
        steps.push("Ensure sufficient color contrast for accessibility")
        steps.push("Verify color accuracy across different devices and print materials")
      }
      break

    case "TRADEMARK":
      if (status === "failed" || status === "warning") {
        steps.push("Add ® symbol after the first mention of 'American Express'")
        steps.push("Ensure consistent trademark usage throughout the text")
      }
      break

    case "COPY_GUIDELINES":
      if (status === "failed" || status === "warning") {
        steps.push("Write 'American Express Card' in full, not abbreviated")
        steps.push("Capitalize 'Card' when referring to American Express Card")
        steps.push("Use 'pay with' instead of 'charge to' when referring to card usage")
      }
      break

    case "REGULATORY":
      if (status === "failed" || status === "warning") {
        steps.push("Add required financial disclosures for credit card marketing")
        steps.push("Include applicable terms and conditions")
        steps.push("Ensure all claims are substantiated and truthful")
      }
      break

    case "TYPOGRAPHY":
      if (status === "failed" || status === "warning") {
        steps.push("Use American Express approved fonts: Benton Sans for headlines, Guardian for body text")
        steps.push("Ensure proper typography hierarchy with appropriate font sizes")
        steps.push("Maintain consistent spacing and alignment throughout the design")
      }
      break

    case "ACCESSIBILITY":
      if (status === "failed" || status === "warning") {
        steps.push("Ensure color contrast meets WCAG 2.1 AA standards (4.5:1 for normal text)")
        steps.push("Include descriptive alt text for all images")
        steps.push("Use semantic HTML structure for screen readers")
        steps.push("Ensure interactive elements are keyboard accessible")
      }
      break
  }

  if (steps.length === 0) {
    steps.push("No specific actions required - compliance check passed")
  }

  return steps
}

// Main function to run all compliance checks via API
export async function runComplianceChecks(assets: {
  staticAds: File[]
  primaryText: string[]
  headlines: string[]
  landingPageUrls: string[]
}): Promise<{ results: ComplianceCheckResult[]; isDemo: boolean }> {
  try {
    const response = await fetch("/api/compliance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assets }),
    })

    if (!response.ok) {
      throw new Error("Failed to run compliance checks")
    }

    const data = await response.json()
    return {
      results: data.results,
      isDemo: data.isDemo,
    }
  } catch (error) {
    console.error("Error running compliance checks:", error)
    throw error // Re-throw the error instead of returning demo results
  }
}
