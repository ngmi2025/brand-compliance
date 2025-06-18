import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

// Helper function to convert image file to base64 data URL
async function imageToDataURL(filename: string): Promise<string> {
  try {
    const imagePath = join(process.cwd(), "public", filename)
    const imageBuffer = await readFile(imagePath)
    const base64 = imageBuffer.toString("base64")
    const mimeType = filename.endsWith(".png") ? "image/png" : "image/jpeg"
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error(`Error converting ${filename} to base64:`, error)
    // Return a placeholder data URL instead of empty string
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4="
  }
}

// Add the preApprovedAssets data at the top of the file
const preApprovedAssets = {
  primaryText: {
    "primary-1": "Earn 3X points on dining and travel purchases with the Chase Sapphire Preferred Card.",
    "primary-2": "Get 60,000 bonus points after spending $4,000 in the first 3 months.",
    "primary-3": "Transfer points to leading airline and hotel loyalty programs at 1:1 ratio.",
    "primary-4": "No foreign transaction fees on purchases made outside the United States.",
    "primary-5": "Complimentary DashPass subscription and Lyft Pink membership included.",
    "primary-6": "Earn 4X points on dining at restaurants worldwide with the American Express Gold Card.",
    "primary-7": "Get up to $120 in dining credits annually at participating restaurants.",
    "primary-8": "Enjoy complimentary access to airport lounges worldwide.",
  },
  headlines: {
    "headline-1": "Earn More on Every Purchase",
    "headline-2": "Travel Rewards Made Simple",
    "headline-3": "Unlock Premium Benefits",
    "headline-4": "Your Gateway to More Points",
    "headline-5": "Dining Rewards Redefined",
    "headline-6": "Premium Travel Experience",
    "headline-7": "Maximize Your Spending Power",
    "headline-8": "Exclusive Member Benefits",
  },
  creative: {
    "creative-1": {
      title: "Chase Sapphire Preferred Card Hero Image",
      description: "Premium card design with blue gradient background and travel imagery",
      type: "Hero Banner",
      dimensions: "1200x628px",
      imageFile: "amex-creative-1.png",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
      fileType: "PNG",
      fileSize: "245KB",
    },
    "creative-2": {
      title: "Dining Rewards Lifestyle Image",
      description: "High-quality photo of couple dining at upscale restaurant",
      type: "Lifestyle Photo",
      dimensions: "800x600px",
      imageFile: "amex-creative-2.png",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
      fileType: "PNG",
      fileSize: "198KB",
    },
    "creative-3": {
      title: "Travel Benefits Collage",
      description: "Montage of travel destinations and luxury experiences",
      type: "Composite Image",
      dimensions: "1080x1080px",
      imageFile: "amex-creative-3.png",
      publisher: "American Express",
      cardProduct: "Platinum",
      fileType: "PNG",
      fileSize: "312KB",
    },
    "creative-4": {
      title: "American Express Gold Card Product Shot",
      description: "Clean product photography of the Gold Card with metallic finish",
      type: "Product Image",
      dimensions: "800x800px",
      imageFile: "amex-creative-1.png",
      publisher: "American Express",
      cardProduct: "Gold",
      fileType: "PNG",
      fileSize: "156KB",
    },
  },
  urls: {
    "url-1": {
      title: "Chase Sapphire Preferred Application Page",
      url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
      description: "Official application landing page with current bonus offer",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
    },
    "url-2": {
      title: "Chase Ultimate Rewards Portal",
      url: "https://ultimaterewards.chase.com",
      description: "Points redemption portal for travel and shopping",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
    },
    "url-3": {
      title: "Chase Sapphire Benefits Page",
      url: "https://creditcards.chase.com/sapphire/benefits",
      description: "Detailed benefits and features overview page",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
    },
    "url-4": {
      title: "American Express Gold Card Application",
      url: "https://americanexpress.com/us/credit-cards/card/gold-card",
      description: "Official Gold Card application page with current welcome offer",
      publisher: "American Express",
      cardProduct: "Gold",
    },
    "url-5": {
      title: "American Express Membership Rewards",
      url: "https://membershiprewards.com",
      description: "Points redemption and transfer portal",
      publisher: "American Express",
      cardProduct: "Gold",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const { wizardData, format = "pdf" } = await request.json()

    // Generate the HTML content
    const htmlContent = await generateDocumentHTML(wizardData)

    if (format === "html") {
      // Return HTML for preview
      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html",
        },
      })
    }

    // Generate PDF using jsPDF (more reliable for serverless)
    const pdfHtml = await generatePDFOptimizedHTML(wizardData)

    return new Response(pdfHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="${getDocumentFilename(wizardData)}.html"`,
        "X-PDF-Generation": "client-side",
      },
    })
  } catch (error) {
    console.error("Document generation error:", error)
    return NextResponse.json({ error: "Failed to generate document", details: error.message }, { status: 500 })
  }
}

// Generate HTML optimized for browser's native print-to-PDF
async function generatePDFOptimizedHTML(wizardData: any): Promise<string> {
  const { getIssuerName, getCardName } = getDisplayNames()
  const issuerName = getIssuerName(wizardData.projectInfo.issuer)
  const cardName = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)
  const title = getReportTitle(wizardData)
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Use the pre-converted base64 data for user uploads
  const staticAdImages = (wizardData.assets.staticAdsBase64 || []).map((image: any, index: number) => ({
    name: image.name,
    dataURL: image.dataURL,
    index: index + 1,
  }))

  const mockupImages = (wizardData.assets.mockupScreenshotsBase64 || []).map((image: any, index: number) => ({
    name: image.name,
    dataURL: image.dataURL,
    index: index + 1,
  }))

  // Generate the pre-approved section first since it's async
  const preApprovedSectionHTML = await generatePreApprovedSection(wizardData)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${getDocumentCSS()}
        
        /* PDF Generation Controls */
        .pdf-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid #e5e7eb;
        }
        
        .pdf-button {
            background: #1e40af;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            margin-right: 10px;
        }
        
        .pdf-button:hover {
            background: #1d4ed8;
        }
        
        .pdf-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        .pdf-status {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
        }
        
        @media print {
            .pdf-controls {
                display: none;
            }
        }
        
        /* Optimize for PDF generation */
        .document {
            background: white !important;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .creative-image, .mockup-image {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="pdf-controls">
        <button id="downloadPdf" class="pdf-button">Save as PDF</button>
        <button id="printDoc" class="pdf-button" style="background: #059669;">Print</button>
        <div id="pdfStatus" class="pdf-status">Click "Save as PDF" and choose "Save as PDF" in your browser's print dialog</div>
    </div>

    <div id="documentContent" class="document">
        <!-- Header -->
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

        <!-- Title Section -->
        <section class="title-section">
            <h1 class="document-title">${title}</h1>
            <div class="document-subtitle">
                ${issuerName} • ${cardName} • ${wizardData.submissionType.submissionType}
            </div>
        </section>

        <!-- Introduction -->
        <section class="content-section">
            <h2>Introduction & Request</h2>
            <p class="introduction-text">
                ${getIntroductionText(wizardData)}
            </p>
        </section>

        <!-- Project Information -->
        <section class="content-section">
            <h2>Project Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Issuer:</span>
                    <span class="info-value">${issuerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Card Product:</span>
                    <span class="info-value">${cardName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Submission Name:</span>
                    <span class="info-value">${wizardData.projectInfo.submissionName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Submission Type:</span>
                    <span class="info-value">${wizardData.submissionType.submissionType}</span>
                </div>
            </div>
        </section>

        <!-- Assets Section -->
        ${generateAssetsSection(wizardData)}

        <!-- Creative Assets Section -->
        ${generateCreativeSection(staticAdImages, mockupImages)}

        <!-- Pre-Approved Assets -->
        ${preApprovedSectionHTML}

        <!-- Footer -->
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

    <script>
        // Simple print function - works without external libraries
        document.getElementById('printDoc').addEventListener('click', function() {
            window.print();
        });

        // Save as PDF function - triggers print dialog
        document.getElementById('downloadPdf').addEventListener('click', function() {
            const status = document.getElementById('pdfStatus');
            status.textContent = 'Opening print dialog... Select "Save as PDF" as your destination.';
            
            // Small delay to show the message, then trigger print
            setTimeout(() => {
                window.print();
            }, 500);
        });
    </script>
</body>
</html>
  `
}

async function generateDocumentHTML(wizardData: any): Promise<string> {
  const { getIssuerName, getCardName } = getDisplayNames()
  const issuerName = getIssuerName(wizardData.projectInfo.issuer)
  const cardName = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)
  const title = getReportTitle(wizardData)
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Use the pre-converted base64 data for user uploads
  const staticAdImages = (wizardData.assets.staticAdsBase64 || []).map((image: any, index: number) => ({
    name: image.name,
    dataURL: image.dataURL,
    index: index + 1,
  }))

  const mockupImages = (wizardData.assets.mockupScreenshotsBase64 || []).map((image: any, index: number) => ({
    name: image.name,
    dataURL: image.dataURL,
    index: index + 1,
  }))

  // Generate the pre-approved section first since it's async
  const preApprovedSectionHTML = await generatePreApprovedSection(wizardData)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${getDocumentCSS()}
    </style>
</head>
<body>
    <div class="document">
        <!-- Header -->
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

        <!-- Title Section -->
        <section class="title-section">
            <h1 class="document-title">${title}</h1>
            <div class="document-subtitle">
                ${issuerName} • ${cardName} • ${wizardData.submissionType.submissionType}
            </div>
        </section>

        <!-- Introduction -->
        <section class="content-section">
            <h2>Introduction & Request</h2>
            <p class="introduction-text">
                ${getIntroductionText(wizardData)}
            </p>
        </section>

        <!-- Project Information -->
        <section class="content-section">
            <h2>Project Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Issuer:</span>
                    <span class="info-value">${issuerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Card Product:</span>
                    <span class="info-value">${cardName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Submission Name:</span>
                    <span class="info-value">${wizardData.projectInfo.submissionName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Submission Type:</span>
                    <span class="info-value">${wizardData.submissionType.submissionType}</span>
                </div>
            </div>
        </section>

        <!-- Assets Section -->
        ${generateAssetsSection(wizardData)}

        <!-- Creative Assets Section -->
        ${generateCreativeSection(staticAdImages, mockupImages)}

        <!-- Pre-Approved Assets -->
        ${preApprovedSectionHTML}

        <!-- Footer -->
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
</html>
  `
}

function generateCreativeSection(staticAdImages: any[], mockupImages: any[]): string {
  if (staticAdImages.length === 0 && mockupImages.length === 0) {
    return ""
  }

  let html = '<section class="content-section">'
  html += "<h2>Creative Assets & Mockups</h2>"

  // Static Ad Images
  if (staticAdImages.length > 0) {
    html += "<h3>Static Ad Images</h3>"
    html += '<div class="image-grid">'

    staticAdImages.forEach((image) => {
      html += '<div class="image-item">'
      if (image.dataURL) {
        html += `<img src="${image.dataURL}" alt="${image.name}" class="creative-image" />`
      } else {
        html += '<div class="image-placeholder">Image could not be loaded</div>'
      }
      html += `<div class="image-caption">Static Ad ${image.index}: ${image.name}</div>`
      html += "</div>"
    })

    html += "</div>"
  }

  // Mockup Screenshots
  if (mockupImages.length > 0) {
    html += "<h3>Generated Ad Mockups</h3>"
    html +=
      '<p class="mockup-description">The following mockups demonstrate how the creative assets will appear on Meta platforms:</p>'
    html += '<div class="mockup-grid">'

    mockupImages.forEach((mockup) => {
      html += '<div class="mockup-item">'
      if (mockup.dataURL) {
        html += `<img src="${mockup.dataURL}" alt="${mockup.name}" class="mockup-image" />`
      } else {
        html += '<div class="image-placeholder">Mockup could not be loaded</div>'
      }
      html += `<div class="image-caption">Mockup ${mockup.index}: ${mockup.name}</div>`
      html += "</div>"
    })

    html += "</div>"
  }

  html += "</section>"
  return html
}

function getDocumentCSS(): string {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background: white;
    }

    .document {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        min-height: 100vh;
    }

    /* Header Styles */
    .document-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .company-logo {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }

    .tagline {
        font-size: 0.875rem;
        opacity: 0.9;
    }

    .submission-info {
        text-align: right;
        font-size: 0.875rem;
    }

    .submission-id {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    /* Title Section */
    .title-section {
        text-align: center;
        margin-bottom: 3rem;
        padding: 0 2rem;
    }

    .document-title {
        font-size: 2rem;
        font-weight: bold;
        color: #1e40af;
        margin-bottom: 0.5rem;
        line-height: 1.2;
    }

    .document-subtitle {
        font-size: 1.125rem;
        color: #6b7280;
        font-weight: 500;
    }

    /* Content Sections */
    .content-section {
        margin-bottom: 2.5rem;
        padding: 0 2rem;
        page-break-inside: avoid;
    }

    .content-section h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e5e7eb;
    }

    .content-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin: 1.5rem 0 0.75rem 0;
    }

    .introduction-text {
        font-size: 1rem;
        line-height: 1.7;
        color: #374151;
    }

    .mockup-description {
        font-size: 0.95rem;
        color: #6b7280;
        margin-bottom: 1rem;
        font-style: italic;
    }

    /* Info Grid */
    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.5rem;
        border-left: 4px solid #3b82f6;
    }

    .info-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 0.25rem;
    }

    .info-value {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
    }

    /* Asset Lists */
    .asset-list {
        list-style: none;
        margin: 1rem 0;
    }

    .asset-item {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: #f8fafc;
        border-radius: 0.375rem;
        border-left: 3px solid #10b981;
    }

    .asset-item-content {
        font-size: 0.95rem;
        line-height: 1.5;
    }

    /* Image Grid */
    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin: 1rem 0;
    }

    .image-item {
        text-align: center;
        page-break-inside: avoid;
        background: #f9fafb;
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
    }

    .creative-image {
        width: 100%;
        max-height: 200px;
        object-fit: contain;
        border-radius: 0.375rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Mockup Grid */
    .mockup-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 1.5rem 0;
    }

    .mockup-item {
        text-align: center;
        page-break-inside: avoid;
        background: #f8fafc;
        border-radius: 0.75rem;
        padding: 1.5rem;
        border: 2px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .mockup-image {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .image-placeholder {
        width: 100%;
        height: 150px;
        background: #f3f4f6;
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .image-caption {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        margin-top: 0.5rem;
    }

    /* Footer */
    .document-footer {
        margin-top: 3rem;
        padding: 2rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
    }

    .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .footer-left .company-name {
        font-weight: 600;
        color: #1f2937;
    }

    .footer-tagline {
        font-size: 0.875rem;
        color: #6b7280;
    }

    .footer-right {
        text-align: right;
        font-size: 0.875rem;
        color: #6b7280;
    }

    /* Print Styles */
    @media print {
        .document {
            max-width: none;
            margin: 0;
        }
        
        .content-section {
            page-break-inside: avoid;
        }
        
        .image-item, .mockup-item {
            page-break-inside: avoid;
        }
    }

    /* Page Break Utilities */
    .page-break {
        page-break-before: always;
    }

    .no-break {
        page-break-inside: avoid;
    }
  `
}

function generateAssetsSection(wizardData: any): string {
  let html = '<section class="content-section">'
  html += "<h2>Submitted Assets</h2>"

  // Primary Text
  if (wizardData.assets.primaryText?.length > 0) {
    html += "<h3>Primary Text</h3>"
    html += '<ul class="asset-list">'
    wizardData.assets.primaryText.forEach((text: string, index: number) => {
      html += `<li class="asset-item">${text}</li>`
    })
    html += "</ul>"
  }

  // Headlines
  if (wizardData.assets.headlines?.length > 0) {
    html += "<h3>Headlines</h3>"
    html += '<ul class="asset-list">'
    wizardData.assets.headlines.forEach((headline: string, index: number) => {
      html += `<li class="asset-item">${headline}</li>`
    })
    html += "</ul>"
  }

  // Landing Page URLs
  if (wizardData.assets.landingPageUrls?.length > 0) {
    html += "<h3>Landing Page URLs</h3>"
    html += '<ul class="asset-list">'
    wizardData.assets.landingPageUrls.forEach((url: string, index: number) => {
      html += `<li class="asset-item">
        <a href="${url}" target="_blank">${url}</a>
      </li>`
    })
    html += "</ul>"
  }

  // Video Files (if any)
  if (wizardData.assets.videoFiles?.length > 0) {
    html += "<h3>Video Files</h3>"
    html += '<ul class="asset-list">'
    wizardData.assets.videoFiles.forEach((video: any, index: number) => {
      html += `<li class="asset-item">
        <strong>${video.name}</strong> (${(video.size / (1024 * 1024)).toFixed(2)} MB)
      </li>`
    })
    html += "</ul>"
  }

  // Delivery Instructions
  if (wizardData.assets.deliveryInstructions) {
    html += "<h3>Delivery Instructions</h3>"
    html += `<div class="asset-item">${wizardData.assets.deliveryInstructions}</div>`
  }

  html += "</section>"
  return html
}

async function generatePreApprovedSection(wizardData: any): Promise<string> {
  let html = '<section class="content-section">'
  html += "<h2>Pre-Approved Assets</h2>"

  if (
    wizardData.preApproved.selectedPrimaryText?.length > 0 ||
    wizardData.preApproved.selectedHeadlines?.length > 0 ||
    wizardData.preApproved.selectedCreative?.length > 0 ||
    wizardData.preApproved.selectedUrls?.length > 0
  ) {
    html += "<p>The following pre-approved assets have been selected and will be referenced in this submission:</p>"

    // Primary Text section
    if (wizardData.preApproved.selectedPrimaryText?.length > 0) {
      html += `<h3>Pre-Approved Primary Text (${wizardData.preApproved.selectedPrimaryText.length})</h3>`
      html += '<ul class="asset-list">'
      wizardData.preApproved.selectedPrimaryText.forEach((id: string) => {
        const primaryText = preApprovedAssets.primaryText[id]
        if (primaryText) {
          html += `<li class="asset-item">${primaryText}</li>`
        } else {
          html += `<li class="asset-item">Asset ID: ${id} (not found)</li>`
        }
      })
      html += "</ul>"
    }

    // Headlines section
    if (wizardData.preApproved.selectedHeadlines?.length > 0) {
      html += `<h3>Pre-Approved Headlines (${wizardData.preApproved.selectedHeadlines.length})</h3>`
      html += '<ul class="asset-list">'
      wizardData.preApproved.selectedHeadlines.forEach((id: string) => {
        const headline = preApprovedAssets.headlines[id]
        if (headline) {
          html += `<li class="asset-item">${headline}</li>`
        } else {
          html += `<li class="asset-item">Asset ID: ${id} (not found)</li>`
        }
      })
      html += "</ul>"
    }

    // Creative section - Convert to base64 data URLs
    if (wizardData.preApproved.selectedCreative?.length > 0) {
      html += `<h3>Pre-Approved Creative (${wizardData.preApproved.selectedCreative.length})</h3>`
      html += '<div class="image-grid">'

      for (const id of wizardData.preApproved.selectedCreative) {
        const creative = preApprovedAssets.creative[id]
        if (creative) {
          html += '<div class="image-item">'
          // Convert image file to base64 data URL
          const dataURL = await imageToDataURL(creative.imageFile)
          if (dataURL) {
            html += `<img src="${dataURL}" alt="${creative.title}" class="creative-image" />`
          } else {
            html += '<div class="image-placeholder">Image could not be loaded</div>'
          }
          html += `<div class="image-caption">${creative.title}</div>`
          html += "</div>"
        } else {
          html += '<div class="image-item">'
          html += '<div class="image-placeholder">Creative not found</div>'
          html += `<div class="image-caption">Asset ID: ${id}</div>`
          html += "</div>"
        }
      }
      html += "</div>"
    }

    // URLs section
    if (wizardData.preApproved.selectedUrls?.length > 0) {
      html += `<h3>Pre-Approved URLs (${wizardData.preApproved.selectedUrls.length})</h3>`
      html += '<ul class="asset-list">'
      wizardData.preApproved.selectedUrls.forEach((id: string) => {
        const url = preApprovedAssets.urls[id]
        if (url) {
          html += `<li class="asset-item"><a href="${url.url}" target="_blank">${url.url}</a></li>`
        } else {
          html += `<li class="asset-item">Asset ID: ${id} (not found)</li>`
        }
      })
      html += "</ul>"
    }
  } else {
    html += "<p>No pre-approved assets selected for this submission.</p>"
  }

  html += "</section>"
  return html
}

function getReportTitle(wizardData: any): string {
  const { getIssuerName, getCardName } = getDisplayNames()
  const brand = getIssuerName(wizardData.projectInfo.issuer) || "UpgradedPoints"
  const cardProduct = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct) || ""
  const submissionType = wizardData.submissionType.submissionType || ""

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

function getIntroductionText(wizardData: any): string {
  const submissionType = wizardData.submissionType.submissionType
  const { getCardName } = getDisplayNames()
  const cardName = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)

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

function getDocumentFilename(wizardData: any): string {
  const issuerStr = wizardData.projectInfo.issuer.replace(/\s+/g, "-")
  const cardProductStr = wizardData.projectInfo.cardProduct.replace(/\s+/g, "-")
  const timestampStr = new Date().toISOString().split("T")[0]
  return `${issuerStr}-${cardProductStr}-compliance-${timestampStr}`
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
      cards: {
        "discover-it": "it Cash Back",
        "discover-it-miles": "it Miles",
        "discover-it-student": "it Student",
      },
    },
  }

  const getIssuerName = (issuerKey: string) => {
    return issuerData[issuerKey]?.name || issuerKey
  }

  const getCardName = (issuerKey: string, cardKey: string) => {
    return issuerData[issuerKey]?.cards[cardKey] || cardKey
  }

  return { getIssuerName, getCardName }
}
