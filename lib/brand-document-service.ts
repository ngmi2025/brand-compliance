// Service to integrate brand compliance documents with AI analysis

interface BrandDocument {
  id: string
  name: string
  issuer: string
  product: string
  type: "brand-guidelines" | "compliance-rules" | "legal-requirements"
  content?: string // Extracted text content from the document
}

export async function getBrandDocuments(issuer = "american-express"): Promise<BrandDocument[]> {
  // TODO: In a real implementation, this would:
  // 1. Query the database for uploaded documents
  // 2. Extract text content from PDFs/docs using a service like pdf-parse
  // 3. Return the relevant documents for the specified issuer

  // For now, return mock data representing what would be extracted from uploaded documents
  return [
    {
      id: "amex-brand-guidelines-2024",
      name: "American Express Brand Guidelines 2024",
      issuer: "american-express",
      product: "all",
      type: "brand-guidelines",
      content: `
        AMERICAN EXPRESS BRAND GUIDELINES 2024
        
        LOGO USAGE:
        - Minimum logo height: 40px for digital applications
        - Clear space: Minimum 1/3 of logo height on all sides
        - Never modify, stretch, or alter the logo proportions
        - Use only approved logo files from the brand asset library
        
        COLOR PALETTE:
        - Primary Blue: #006FCF (Pantone 286 C)
        - Secondary Blue: #016FD0
        - Ensure sufficient contrast for accessibility (minimum 4.5:1 ratio)
        
        TYPOGRAPHY:
        - Primary Typeface: Benton Sans (headlines, subheads)
        - Secondary Typeface: Guardian (body text, long-form content)
        - Maintain consistent hierarchy and spacing
        
        TRADEMARK USAGE:
        - Use ® symbol after first mention of "American Express"
        - Write "American Express Card" in full, never abbreviated
        - Capitalize "Card" when referring to American Express Card
        
        ACCESSIBILITY:
        - All content must meet WCAG 2.1 AA standards
        - Provide alt text for all images
        - Ensure keyboard navigation support
        - Maintain minimum color contrast ratios
      `,
    },
    {
      id: "amex-compliance-rules-2024",
      name: "American Express Compliance Rules 2024",
      issuer: "american-express",
      product: "all",
      type: "compliance-rules",
      content: `
        AMERICAN EXPRESS COMPLIANCE REQUIREMENTS
        
        REGULATORY COMPLIANCE:
        - Include required financial disclosures for credit card marketing
        - All claims must be truthful and substantiated
        - Include applicable terms and conditions
        - Comply with Truth in Lending Act requirements
        
        LEGAL REQUIREMENTS:
        - Proper trademark attribution required
        - Include privacy policy references where applicable
        - Ensure compliance with state and federal advertising laws
        
        CONTENT STANDARDS:
        - No misleading or deceptive claims
        - Clear and prominent disclosure of material terms
        - Age-appropriate content and targeting
      `,
    },
  ]
}

export async function enhanceAIPromptWithBrandDocuments(
  basePrompt: string,
  issuer = "american-express",
): Promise<string> {
  const documents = await getBrandDocuments(issuer)

  if (documents.length === 0) {
    return basePrompt
  }

  const brandContext = documents.map((doc) => `${doc.name}:\n${doc.content}`).join("\n\n---\n\n")

  return `${basePrompt}

BRAND COMPLIANCE CONTEXT:
Use the following official brand guidelines and compliance requirements to inform your analysis:

${brandContext}

Base your assessments on these official guidelines rather than general knowledge.`
}
