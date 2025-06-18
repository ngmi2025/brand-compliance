"use client"

import { useState } from "react"

const ComplianceWizard = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    country: "",
    dataTypes: [],
    dataStorageLocation: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target
    setFormData({
      ...formData,
      dataTypes: checked ? [...formData.dataTypes, value] : formData.dataTypes.filter((type) => type !== value),
    })
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/submit-compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Handle success (e.g., show a success message, redirect)
        alert("Compliance data submitted successfully!")
      } else {
        // Handle error (e.g., show an error message)
        alert("Failed to submit compliance data.")
      }
    } catch (error) {
      console.error("Error submitting compliance data:", error)
      alert("An error occurred while submitting data.")
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Step 1: Company Information</h2>
            <div className="mb-4">
              <label htmlFor="companyName" className="block text-white text-sm font-bold mb-2">
                Company Name:
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="industry" className="block text-white text-sm font-bold mb-2">
                Industry:
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="country" className="block text-white text-sm font-bold mb-2">
                Country:
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Step 2: Data Types</h2>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2">Select Data Types:</label>
              <div className="flex flex-col">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    value="Personal Data"
                    checked={formData.dataTypes.includes("Personal Data")}
                    onChange={handleCheckboxChange}
                  />
                  <span className="ml-2 text-white">Personal Data</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    value="Financial Data"
                    checked={formData.dataTypes.includes("Financial Data")}
                    onChange={handleCheckboxChange}
                  />
                  <span className="ml-2 text-white">Financial Data</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    value="Health Data"
                    checked={formData.dataTypes.includes("Health Data")}
                    onChange={handleCheckboxChange}
                  />
                  <span className="ml-2 text-white">Health Data</span>
                </label>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Step 3: Data Storage</h2>
            <div className="mb-4">
              <label htmlFor="dataStorageLocation" className="block text-white text-sm font-bold mb-2">
                Data Storage Location:
              </label>
              <input
                type="text"
                id="dataStorageLocation"
                name="dataStorageLocation"
                value={formData.dataStorageLocation}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-8">Compliance Wizard</h1>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {renderStepContent()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-green-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Submit
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-white/20 text-center">
          <p className="text-white/60 text-sm">
            Powered by UpgradedPoints.com -{" "}
            <a href="/admin" className="font-bold text-white hover:text-blue-200 underline">
              Access Admin Panel
            </a>
            {" | "}
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/login"
              }}
              className="font-bold text-white hover:text-blue-200 underline bg-transparent border-none cursor-pointer"
            >
              Logout
            </button>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default ComplianceWizard
