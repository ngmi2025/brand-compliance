// American Express Brand Compliance Rules Database

export const americanExpressRules = {
  logoUsage: {
    minimumSizes: {
      standardBlueBox: {
        minHeight: 40, // pixels
        minHeightInches: 0.325,
        description: "Standard 'Blue Box' Logo must be at least 0.325 inches (40 pixels) in height.",
      },
      alternateLogo: {
        minHeight: 22, // pixels
        minHeightInches: 0.175,
        description:
          "Alternate Logo (for small-scale digital use) must be at least 0.175 inches (22 pixels) in height.",
      },
    },
    clearSpace: {
      standard: {
        description: "Maintain a clear space of at least 1/3 the height of the logo (X) on all sides.",
        rule: "1/3 of logo height on all sides",
      },
      partnerLogos: {
        description:
          "When placed alongside partner logos, ensure a space equal to 1.5 times the height of the Blue Box.",
        rule: "1.5x logo height between logos",
      },
    },
    restrictions: [
      "Do not modify, stretch, or alter the logo in any way.",
      "Avoid placing the logo on backgrounds that compromise its legibility.",
      "The logo should not be locked up with other logos or text without proper separation.",
    ],
  },
  colorPalette: {
    primaryColors: {
      amexBlue: {
        hex: "#016FD0",
        rgb: "1, 111, 208",
        cmyk: "100, 47, 0, 18",
        pantone: "285 C",
        description:
          "The Blue Box logo must always be reproduced in the official American Express blue, except in black-and-white contexts.",
      },
    },
  },
  typography: {
    primaryTypefaces: [
      {
        name: "Benton Sans",
        usage: "Used for sans-serif applications.",
      },
      {
        name: "Guardian",
        usage: "Used for serif applications.",
      },
    ],
    guidelines: ["These fonts should be used consistently across all communications to maintain brand coherence."],
  },
  legalRequirements: {
    trademarkUsage: [
      "The ® symbol must be used upon the first mention of 'American Express' in any communication.",
      "The term 'American Express Card' should always be written in full and not abbreviated.",
    ],
    copyGuidelines: [
      "Avoid phrases like 'charge it to the American Express Card'; instead, use 'pay with the American Express Card.'",
      "Ensure that the term 'Card' is always capitalized when referring to the American Express Card.",
    ],
  },
  accessibilityStandards: {
    colorContrast: ["Ensure sufficient contrast between text and background colors to meet accessibility standards."],
    userInterface: [
      "Design interfaces that are navigable and usable for individuals with disabilities, adhering to WCAG guidelines.",
    ],
  },
  industryRegulations: {
    financialServicesCompliance: [
      "All marketing materials must comply with financial industry regulations, including clear disclosure of terms and conditions.",
      "Ensure that all representations are truthful and not misleading, adhering to advertising standards and financial regulations.",
    ],
  },
  trademarks: [
    "AMERICAN EXPRESS®",
    "AMERICAN EXPRESS Blue Box Logo",
    "ENTERTAINMENT ACCESS®",
    "Connect™",
    "Amex® Offers",
    "Amex® Essentials",
  ],
}

// Compliance check functions
export const complianceChecks = [
  {
    id: "logo-size",
    name: "Logo Size Check",
    description: "Verifies that the American Express logo meets minimum size requirements",
    category: "logoUsage",
  },
  {
    id: "logo-clear-space",
    name: "Logo Clear Space",
    description: "Checks if proper clear space is maintained around the American Express logo",
    category: "logoUsage",
  },
  {
    id: "logo-modifications",
    name: "Logo Modifications",
    description: "Detects if the logo has been modified, stretched, or altered",
    category: "logoUsage",
  },
  {
    id: "color-usage",
    name: "Brand Color Usage",
    description: "Verifies correct usage of American Express blue and other brand colors",
    category: "colorPalette",
  },
  {
    id: "typography",
    name: "Typography Standards",
    description: "Checks if approved typefaces (Benton Sans, Guardian) are used correctly",
    category: "typography",
  },
  {
    id: "trademark-usage",
    name: "Trademark Usage",
    description: "Verifies proper use of ® symbol and trademark terms",
    category: "legalRequirements",
  },
  {
    id: "copy-guidelines",
    name: "Copy Guidelines",
    description: "Checks if copy follows American Express writing standards",
    category: "legalRequirements",
  },
  {
    id: "accessibility",
    name: "Accessibility Standards",
    description: "Verifies WCAG compliance for color contrast and accessibility",
    category: "accessibilityStandards",
  },
  {
    id: "regulatory-compliance",
    name: "Regulatory Compliance",
    description: "Checks for required financial disclosures and regulatory compliance",
    category: "industryRegulations",
  },
]
