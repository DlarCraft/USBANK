'use client'

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🏦 Bank Dashboard - Working!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Account Balance</h2>
            <p className="text-3xl font-bold">$545,780.50</p>
            <p className="text-blue-200 text-sm mt-2">Michael Paul • ****7891</p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
            <p className="text-2xl font-bold text-green-600">+$3,000</p>
            <p className="text-gray-600 text-sm">Income</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses</h3>
            <p className="text-2xl font-bold text-red-600">-$1,335</p>
            <p className="text-gray-600 text-sm">This month</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Salary Deposit</p>
                <p className="text-sm text-gray-500">Income • 2025-07-26</p>
              </div>
              <p className="text-green-600 font-medium">+$2,500.00</p>
            </div>
            
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Grocery Store</p>
                <p className="text-sm text-gray-500">Shopping • 2025-07-25</p>
              </div>
              <p className="text-red-600 font-medium">-$89.99</p>
            </div>
            
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Rent Payment</p>
                <p className="text-sm text-gray-500">Housing • 2025-07-24</p>
              </div>
              <p className="text-red-600 font-medium">-$1,200.00</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
            Transfer Money
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-colors">
            Top Up Account
          </button>
          <a 
            href="/" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Back to Login
          </a>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">✅ Dashboard is working! Navigation issue resolved.</p>
        </div>
      </div>
    </div>
  )
}
