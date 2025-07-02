import { type NextRequest, NextResponse } from "next/server"

// This object is now just for reference for text/urls.
// Image data will now be URLs from Vercel Blob for user-uploaded,
// and Base64 for pre-approved creative.
const preApprovedAssetsReference = {
  primaryText: {
    "primary-1": "Earn 3X points on dining and travel purchases with the Chase Sapphire Preferred Card.",
    "primary-2": "Get 60,000 bonus points after spending $4,000 in the first 3 months.",
    "primary-3": "Transfer points to leading airline and hotel loyalty programs at 1:1 ratio.",
    "primary-4": "No foreign transaction fees on purchases made outside the United States.",
    "primary-5": "Complimentary DashPass subscription and Lyft Pink membership included.",
    "primary-6": "Earn 4X points on dining at restaurants worldwide with the American Express Gold Card.",
  },
  headlines: {
    "headline-1": "Earn More on Every Purchase",
    "headline-2": "Travel Rewards Made Simple",
    "headline-3": "Unlock Premium Benefits",
    "headline-4": "Your Gateway to More Points",
    "headline-5": "Dining Rewards Redefined",
  },
  urls: {
    "url-1": {
      title: "Chase Sapphire Preferred Application Page",
      url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
    },
    "url-2": { title: "Chase Ultimate Rewards Portal", url: "https://ultimaterewards.chase.com" },
    "url-3": {
      title: "Chase Sapphire Benefits Page",
      url: "https://creditcards.chase.com/sapphire/benefits",
    },
    "url-4": {
      title: "American Express Gold Card Application",
      url: "https://americanexpress.com/us/credit-cards/card/gold-card",
    },
    "url-5": {
      title: "American Express Membership Rewards",
      url: "https://membershiprewards.com",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Document Generation API Called (URL/Base64 based) ===")
    const body = await request.json()
    const { wizardData, format = "html" } = body

    if (!wizardData) {
      console.error("No wizardData provided")
      return NextResponse.json({ error: "wizardData is required" }, { status: 400 })
    }

    // wizardData.assets.staticAdsUrls, wizardData.assets.mockupUrls will be Vercel Blob URLs.
    // wizardData.preApproved.preApprovedCreativeDataUrls will contain Base64 image data.

    const htmlContent = generateDocumentHTML(wizardData)

    if (format === "html") {
      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html", "Cache-Control": "no-cache" },
      })
    }

    const pdfHtml = generatePDFOptimizedHTML(wizardData)
    return new Response(pdfHtml, {
      headers: { "Content-Type": "text/html", "Cache-Control": "no-cache" },
    })
  } catch (error) {
    console.error("=== API Error in generate-document ===", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

function generateDocumentHTML(wizardData: any): string {
  const { getIssuerName, getCardName } = getDisplayNames()
  const issuerName = getIssuerName(wizardData.projectInfo?.issuer || "")
  const cardProduct = getCardName(wizardData.projectInfo?.issuer || "", wizardData.projectInfo?.cardProduct || "")
  const submissionName = wizardData.projectInfo?.submissionName || wizardData.documentFilename || "Untitled Submission"
  const submissionType = wizardData.submissionType?.submissionType || ""
  const introductionText = wizardData.introductionText || getIntroductionTextFallback(wizardData)
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${submissionName} - Compliance Document</title>
    <style>${getDocumentCSS()}</style>
</head>
<body>
    <div class="document">
        <header class="document-header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="company-logo">UpgradedPoints</div>
                    <div class="tagline">Brand Compliance Submission</div>
                </div>
                <div class="submission-info">
                    <div class="submission-date">${date}</div>
                </div>
            </div>
        </header>
        <section class="title-section">
            <h1 class="document-title">${getReportTitle(wizardData)}</h1>
            <div class="document-subtitle">${issuerName} • ${cardProduct} • ${submissionType}</div>
        </section>
        <section class="content-section">
            <h2>Introduction & Request</h2>
            <p class="introduction-text">${introductionText}</p>
        </section>
        <section class="content-section">
            <h2>Project Information</h2>
            <div class="info-grid">
                <div class="info-item"><span class="info-label">Issuer:</span><span class="info-value">${issuerName}</span></div>
                <div class="info-item"><span class="info-label">Card Product:</span><span class="info-value">${cardProduct}</span></div>
                <div class="info-item"><span class="info-label">Submission Name:</span><span class="info-value">${submissionName}</span></div>
                <div class="info-item"><span class="info-label">Submission Type:</span><span class="info-value">${submissionType}</span></div>
            </div>
        </section>
        ${generateAssetsHTML(wizardData)}
        ${generateCreativeAssetsHTML(wizardData)}
        ${generatePreApprovedAssetsHTML(wizardData)}
        <footer class="document-footer">
            <div class="footer-content">
                <div class="footer-left">
                    <div class="company-name">UpgradedPoints</div>
                    <div class="footer-tagline">Brand Compliance Tool</div>
                </div>
                <div class="footer-right">
                    <div class="generation-date">Generated: ${date}</div>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>`
}

function generatePDFOptimizedHTML(wizardData: any): string {
  const documentHTML = generateDocumentHTML(wizardData)
  const pdfControls = `
    <div class="pdf-controls">
        <button id="downloadPdf" class="pdf-button">Save as PDF</button>
        <button id="printDoc" class="pdf-button" style="background: #059669;">Print</button>
        <div id="pdfStatus" class="pdf-status">Click "Save as PDF" and choose "Save as PDF" in your browser's print dialog</div>
    </div>
    <script>
        document.getElementById('printDoc').addEventListener('click', function() { window.print(); });
        document.getElementById('downloadPdf').addEventListener('click', function() {
            const status = document.getElementById('pdfStatus');
            status.textContent = 'Opening print dialog... Select "Save as PDF" as your destination.';
            setTimeout(() => { window.print(); }, 500);
        });
    </script>`
  return documentHTML.replace("</body>", `${pdfControls}</body>`).replace(
    "</style>",
    `
        .pdf-controls { position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; }
        .pdf-button { background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; margin-right: 10px; }
        .pdf-button:hover { background: #1d4ed8; }
        .pdf-status { margin-top: 10px; font-size: 12px; color: #6b7280; }
        @media print { .pdf-controls { display: none; } }
    </style>`,
  )
}

function generatePreApprovedAssetsHTML(wizardData: any): string {
  let html = ""
  const { selectedPrimaryText, selectedHeadlines, preApprovedCreativeDataUrls, selectedUrls } =
    wizardData.preApproved || {} // Changed preApprovedCreativeUrls to preApprovedCreativeDataUrls

  if (
    !(
      selectedPrimaryText?.length > 0 ||
      selectedHeadlines?.length > 0 ||
      preApprovedCreativeDataUrls?.length > 0 || // Check preApprovedCreativeDataUrls
      selectedUrls?.length > 0
    )
  ) {
    return ""
  }
  html += `<section class="content-section"><h2>Pre-Approved Assets</h2>
             <p>The following pre-approved assets have been selected and will be referenced in this submission:</p>`
  if (selectedPrimaryText?.length > 0) {
    html += `<h3>Pre-Approved Primary Text (${selectedPrimaryText.length})</h3><ul class="asset-list">`
    selectedPrimaryText.forEach((id: string) => {
      const primaryText =
        preApprovedAssetsReference.primaryText[id as keyof typeof preApprovedAssetsReference.primaryText]
      if (primaryText) {
        html += `<li class="asset-item">${primaryText}</li>`
      }
    })
    html += `</ul>`
  }
  if (selectedHeadlines?.length > 0) {
    html += `<h3>Pre-Approved Headlines (${selectedHeadlines.length})</h3><ul class="asset-list">`
    selectedHeadlines.forEach((id: string) => {
      const headline = preApprovedAssetsReference.headlines[id as keyof typeof preApprovedAssetsReference.headlines]
      if (headline) {
        html += `<li class="asset-item">${headline}</li>`
      }
    })
    html += `</ul>`
  }

  // Use preApprovedCreativeDataUrls which contains { id, title, base64 }
  if (preApprovedCreativeDataUrls?.length > 0) {
    html += `<h3>Pre-Approved Creative (${preApprovedCreativeDataUrls.length})</h3><div class="image-grid">`
    preApprovedCreativeDataUrls.forEach((creative: { title: string; base64: string }) => {
      // Expecting creative.base64 to be a valid Base64 data URL
      if (creative && creative.base64) {
        html += `
          <div class="image-item">
              <img src="${creative.base64}" alt="${creative.title || "Creative Asset"}" class="creative-image" />
              <div class="image-caption">${creative.title || "Creative Asset"}</div>
          </div>`
      }
    })
    html += `</div>`
  }

  if (selectedUrls?.length > 0) {
    html += `<h3>Pre-Approved URLs (${selectedUrls.length})</h3><ul class="asset-list">`
    selectedUrls.forEach((id: string) => {
      const urlInfo = preApprovedAssetsReference.urls[id as keyof typeof preApprovedAssetsReference.urls]
      if (urlInfo) {
        html += `<li class="asset-item"><a href="${urlInfo.url}" target="_blank">${urlInfo.url}</a></li>`
      }
    })
    html += `</ul>`
  }
  html += `</section>`
  return html
}

function generateCreativeAssetsHTML(wizardData: any): string {
  let html = ""
  // Expecting wizardData.assets.staticAdsUrls and wizardData.assets.mockupUrls
  // These should be arrays of objects like { name: string, url: string } from Vercel Blob
  const staticAdsUrls = wizardData.assets?.staticAdsUrls || []
  const mockupUrls = wizardData.assets?.mockupUrls || []

  if (!(staticAdsUrls.length > 0 || mockupUrls.length > 0)) {
    return ""
  }
  html += `<section class="content-section"><h2>Creative Assets & Mockups</h2>`
  if (staticAdsUrls.length > 0) {
    html += `<h3>Static Ad Images</h3><div class="image-grid">`
    staticAdsUrls.forEach((image: { name: string; url: string }, index: number) => {
      html += `
        <div class="image-item">
            <img src="${image.url}" alt="${image.name}" class="creative-image" />
            <div class="image-caption">Static Ad ${index + 1}: ${image.name}</div>
        </div>`
    })
    html += `</div>`
  }
  if (mockupUrls.length > 0) {
    html += `<h3>Generated Ad Mockups</h3>
             <p class="mockup-description">The following mockups demonstrate how the creative assets will appear on Meta platforms:</p>
             <div class="mockup-grid">`
    mockupUrls.forEach((mockup: { name: string; url: string }, index: number) => {
      html += `
        <div class="mockup-item">
            <img src="${mockup.url}" alt="${mockup.name}" class="mockup-image" />
            <div class="image-caption">Mockup ${index + 1}: ${mockup.name}</div>
        </div>`
    })
    html += `</div>`
  }
  html += `</section>`
  return html
}

function getDocumentCSS(): string {
  return `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; background: white; }
    .document { background: white; padding: 0; }
    .document-header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 2rem; margin-bottom: 2rem; border-radius: 8px; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .company-logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
    .tagline { font-size: 1rem; opacity: 0.9; }
    .submission-date { font-size: 1rem; opacity: 0.9; }
    .title-section { text-align: center; margin-bottom: 3rem; }
    .document-title { font-size: 1.8rem; font-weight: bold; color: #1e40af; margin-bottom: 0.5rem; }
    .document-subtitle { font-size: 1.1rem; color: #6b7280; }
    .content-section { margin-bottom: 2rem; }
    .content-section h2 { color: #1e40af; font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
    .content-section h3 { color: #374151; font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 0.75rem 0; }
    .introduction-text { font-size: 1rem; line-height: 1.7; color: #374151; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
    .info-item { background: #f9fafb; padding: 1rem; border-radius: 6px; border-left: 4px solid #3b82f6; }
    .info-label { font-weight: 500; color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem; display: block; }
    .info-value { color: #1f2937; font-weight: 600; }
    .asset-list { list-style: none; padding: 0; margin: 1rem 0; }
    .asset-item { background: #f8fafc; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 6px; border-left: 3px solid #10b981; font-size: 0.95rem; line-height: 1.5; }
    .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1rem 0; } /* Adjusted minmax for smaller images */
    .image-item { text-align: center; background: #f9fafb; border-radius: 8px; padding: 0.75rem; border: 1px solid #e5e7eb; }
    .creative-image { width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .mockup-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0; }
    .mockup-item { text-align: center; background: #f8fafc; border-radius: 12px; padding: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .mockup-image { width: 100%; max-height: 500px; object-fit: contain; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .image-caption { font-size: 0.8rem; color: #6b7280; font-weight: 500; margin-top: 0.5rem; }
    .document-footer { margin-top: 3rem; padding: 2rem; background: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 8px; }
    .footer-content { display: flex; justify-content: space-between; align-items: center; }
    .footer-left .company-name { font-weight: 600; color: #1f2937; }
    .footer-tagline { font-size: 0.875rem; color: #6b7280; }
    .footer-right { text-align: right; font-size: 0.875rem; color: #6b7280; }
    @media print { body { max-width: none; margin: 0; padding: 0; } .document-header { background: #1e40af !important; -webkit-print-color-adjust: exact; } }
  `
}

function generateAssetsHTML(wizardData: any): string {
  let html = ""
  if (
    !(
      wizardData.assets?.primaryText?.length > 0 ||
      wizardData.assets?.headlines?.length > 0 ||
      wizardData.assets?.landingPageUrls?.length > 0
    )
  ) {
    return ""
  }
  html += `<section class="content-section"><h2>Submitted Assets</h2>`
  if (wizardData.assets?.primaryText?.length > 0) {
    html += `<h3>Primary Text</h3><ul class="asset-list">`
    wizardData.assets.primaryText.forEach((text: string) => {
      html += `<li class="asset-item">${text}</li>`
    })
    html += `</ul>`
  }
  if (wizardData.assets?.headlines?.length > 0) {
    html += `<h3>Headlines</h3><ul class="asset-list">`
    wizardData.assets.headlines.forEach((headline: string) => {
      html += `<li class="asset-item">${headline}</li>`
    })
    html += `</ul>`
  }
  if (wizardData.assets?.landingPageUrls?.length > 0) {
    html += `<h3>Landing Page URLs</h3><ul class="asset-list">`
    wizardData.assets.landingPageUrls.forEach((url: string) => {
      html += `<li class="asset-item"><a href="${url}" target="_blank">${url}</a></li>`
    })
    html += `</ul>`
  }
  html += `</section>`
  return html
}

function getReportTitle(wizardData: any): string {
  const { getIssuerName, getCardName } = getDisplayNames()
  const brand = getIssuerName(wizardData.projectInfo?.issuer || "") || "UpgradedPoints"
  const cardProduct = getCardName(wizardData.projectInfo?.issuer || "", wizardData.projectInfo?.cardProduct || "") || ""
  const submissionType = wizardData.submissionType?.submissionType || ""
  switch (submissionType) {
    case "Full Campaign":
      return `${brand} - ${cardProduct} Compliance Submission`
    case "New Creative Only":
      return `${brand} - ${cardProduct} Additional Ad Creative Requests`
    case "New Primary Text":
      return `${brand} - ${cardProduct} Added Primary Text Variations`
    case "Headline Text":
      return `${brand} - ${cardProduct} Added Headline Variations`
    case "Headline and Primary":
      return `${brand} - ${cardProduct} Added Text Variations`
    case "Motion Graphic":
      return `${brand} - ${cardProduct} Motion Graphic Ad Requests`
    default:
      return `${brand} - ${cardProduct} Compliance Submission`
  }
}

function getIntroductionTextFallback(wizardData: any): string {
  const submissionType = wizardData.submissionType?.submissionType
  const { getCardName } = getDisplayNames()
  const cardName = getCardName(wizardData.projectInfo?.issuer || "", wizardData.projectInfo?.cardProduct || "")
  switch (submissionType) {
    case "Full Campaign":
      return `We are seeking approval for a new campaign for the ${cardName}. This document outlines the ad copy and proposed visual mockups intended for use across Meta platforms.`
    case "New Creative Only":
      return `We would like to seek approval for new images to be used in our Meta ads. These images would be paired with the approved wording you can see above.`
    case "New Primary Text":
      return `We've already had a number of ads approved for the ${cardName}. In order to expand our testing and generate more New Approved Applications, we'd like to run Primary Text variations to our ads.`
    case "Headline Text":
      return `We've already had a number of ads approved for the ${cardName}. In order to expand our testing and generate more New Approved Applications, we'd like to run Headline text variations to our ads.`
    case "Headline and Primary":
      return `We've already had a number of ads approved for the ${cardName}. In order to expand our testing and generate more New Approved Applications, we'd like to run Primary Text and Headline text variations to our ads.`
    case "Motion Graphic":
      return `We are seeking approval for motion graphic ads for the ${cardName}. This document outlines the proposed motion graphics intended for use across Meta platforms.`
    default:
      return `We are seeking approval for updated creative imagery and copy for our ${cardName} ad campaigns.`
  }
}

function getDisplayNames() {
  const issuerData = {
    "american-express": {
      name: "American Express",
      cards: {
        "amex-gold": "Gold Card",
        "amex-platinum": "Platinum Card",
        "amex-green": "Green Card",
        "amex-blue-cash": "Blue Cash Preferred",
        "amex-business-gold": "Business Gold Card",
        "amex-business-platinum": "Business Platinum Card",
      },
    },
    chase: {
      name: "Chase",
      cards: {
        "chase-sapphire-preferred": "Sapphire Preferred",
        "chase-sapphire-reserve": "Sapphire Reserve",
        "chase-freedom-unlimited": "Freedom Unlimited",
        "chase-freedom-flex": "Freedom Flex",
        "chase-ink-business": "Ink Business Preferred",
      },
    },
    "capital-one": {
      name: "Capital One",
      cards: {
        "capital-one-venture": "Venture",
        "capital-one-venture-x": "Venture X",
        "capital-one-savor": "Savor",
        "capital-one-quicksilver": "Quicksilver",
      },
    },
    citi: {
      name: "Citi",
      cards: {
        "citi-premier": "Premier Card",
        "citi-double-cash": "Double Cash",
        "citi-custom-cash": "Custom Cash",
        "citi-aa-platinum": "AAdvantage Platinum",
      },
    },
    discover: {
      name: "Discover",
      cards: { "discover-it": "it Cash Back", "discover-it-miles": "it Miles", "discover-it-student": "it Student" },
    },
  } as const

  const getIssuerName = (issuerKey: string) => issuerData[issuerKey as keyof typeof issuerData]?.name || issuerKey
  const getCardName = (issuerKey: string, cardKey: string) => {
    const issuer = issuerData[issuerKey as keyof typeof issuerData]
    return issuer?.cards[cardKey as keyof typeof issuer.cards] || cardKey
  }
  return { getIssuerName, getCardName }
}
