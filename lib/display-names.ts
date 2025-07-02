export const getDisplayNames = () => {
  const issuerData: Record<string, { name: string; cards: Record<string, string> }> = {
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

// Export both naming conventions to fix import errors
export const getDisplayName = getDisplayNames
