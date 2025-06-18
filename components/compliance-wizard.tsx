"use client"

const ComplianceWizard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-8">Compliance Wizard</h1>

        {/* Wizard Steps would go here */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <p className="text-lg">This is where the compliance wizard steps and content will be displayed.</p>
        </div>

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
