'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '../../components/Toast'
import CountingNumber from '../../components/CountingNumber'
import { 
  Home, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  User,
  Bell,
  LogOut,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Calendar,
  Info
} from 'lucide-react'

interface Transaction {
  id: string
  type: 'incoming' | 'outgoing'
  amount: number
  description: string
  date: string
  category: string
}

export default function Savings() {
  // Helper functions for localStorage operations
  const saveToStorage = (key: string, value: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  const loadFromStorage = (key: string, defaultValue: any) => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : defaultValue
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
    return defaultValue
  }

  // Initialize state with data from localStorage or default values
  const [balance, setBalance] = useState(() => loadFromStorage('bankBalance', 545780.50))
  const [savingsBalance, setSavingsBalance] = useState(() => {
    const loaded = loadFromStorage('bankSavingsBalance', 25000000);
    return loaded < 25000000 ? 25000000 : loaded;
  })

  // Always enforce minimum savings balance on mount
  useEffect(() => {
    if (savingsBalance < 25000000) {
      setSavingsBalance(25000000);
    }
  }, [])
  const [showBalance, setShowBalance] = useState(true)
  const [showSavingsBalance, setShowSavingsBalance] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('bankTransactions', []))
  const [showSavingsModal, setShowSavingsModal] = useState(false)
  const [savingsAction, setSavingsAction] = useState<'deposit' | 'withdraw'>('deposit')
  const [savingsAmount, setSavingsAmount] = useState('')
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    transactionType: undefined as 'incoming' | 'outgoing' | undefined,
    amount: undefined as number | undefined
  })
  const [balanceHighlight, setBalanceHighlight] = useState(false)
  const router = useRouter()

  // Save data to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('bankBalance', balance)
  }, [balance])

  useEffect(() => {
    saveToStorage('bankSavingsBalance', savingsBalance)
  }, [savingsBalance])

  useEffect(() => {
    saveToStorage('bankTransactions', transactions)
  }, [transactions])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', transactionType?: 'incoming' | 'outgoing', amount?: number) => {
    setToast({
      isVisible: true,
      message,
      type,
      transactionType,
      amount
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const updateBalanceWithAnimation = (newBalance: number) => {
    setBalance(newBalance)
    setBalanceHighlight(true)
    setTimeout(() => setBalanceHighlight(false), 1500)
  }

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('bankAuth')
    if (!auth) {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('bankAuth')
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  const handleSavings = () => {
    const amount = parseFloat(savingsAmount)
    if (amount && amount > 0) {
      if (savingsAction === 'deposit') {
        // Deposit from main account to savings
        if (amount <= balance) {
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'outgoing',
            amount: amount,
            description: 'Transfer to Savings Account',
            date: new Date().toISOString().split('T')[0],
            category: 'Savings'
          }
          
          setTransactions([newTransaction, ...transactions])
          updateBalanceWithAnimation(balance - amount)
          setSavingsBalance((prev: number) => prev + amount)
          setSavingsAmount('')
          setShowSavingsModal(false)
          showToast(`$${amount.toLocaleString()} deposited to savings account`, 'success', 'outgoing', amount)
        } else {
          showToast('Insufficient funds in main account!', 'error')
        }
      } else {
        // Withdraw from savings to main account
        if (amount <= savingsBalance) {
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'incoming',
            amount: amount,
            description: 'Withdrawal from Savings Account',
            date: new Date().toISOString().split('T')[0],
            category: 'Savings'
          }
          
          setTransactions([newTransaction, ...transactions])
          updateBalanceWithAnimation(balance + amount)
          setSavingsBalance((prev: number) => prev - amount)
          setSavingsAmount('')
          setShowSavingsModal(false)
          showToast(`$${amount.toLocaleString()} withdrawn from savings account`, 'success', 'incoming', amount)
        } else {
          showToast('Insufficient funds in savings account!', 'error')
        }
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Filter savings-related transactions
  const savingsTransactions = transactions.filter(t => t.category === 'Savings')

  // Calculate savings growth (mock data for demonstration)
  const monthlyGrowth = savingsBalance * 0.025 / 12 // 2.5% APY monthly
  const yearlyProjection = savingsBalance * 1.025

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-1.5 sm:p-2 mr-2 sm:mr-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="bg-green-600 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Savings Account</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <div 
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('/joseph.jpg')`,
                      backgroundColor: '#F3F4F6'
                    }}
                  >
                    <svg className="w-full h-full rounded-full opacity-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="20" fill="#F3F4F6"/>
                      <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 5V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="11" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Joseph Morris</p>
                  <p className="text-xs text-gray-500">Premium Savings</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Savings Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Savings Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-green-200 text-sm">Savings Balance</p>
                  <div className="flex items-center mt-3">
                    <span className="text-4xl font-bold">
                      {showSavingsBalance ? (
                        <CountingNumber 
                          value={savingsBalance} 
                          duration={1500} 
                          formatAsCurrency={true} 
                        />
                      ) : '••••••'}
                    </span>
                    <button
                      onClick={() => setShowSavingsBalance(!showSavingsBalance)}
                      className="ml-4 text-green-200 hover:text-white"
                    >
                      {showSavingsBalance ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
                <PiggyBank className="h-12 w-12 text-green-200" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-green-200">
                <div>
                  <p>Account: ****3456</p>
                  <p>APY: 2.5%</p>
                </div>
                <div>
                  <p>Monthly Growth: {formatCurrency(monthlyGrowth)}</p>
                  <p>Year Projection: {formatCurrency(yearlyProjection)}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSavingsAction('deposit')
                    setShowSavingsModal(true)
                  }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
                >
                  <ArrowDownLeft className="h-5 w-5" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => {
                    setSavingsAction('withdraw')
                    setShowSavingsModal(true)
                  }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          {/* Savings Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Main Account</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {showBalance ? formatCurrency(balance) : '••••••'}
                  </p>
                </div>
                <Home className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Interest</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{formatCurrency(monthlyGrowth)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {savingsTransactions.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Savings Information */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-green-100 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Info className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">About Your Savings Account</h3>
              <div className="mt-2 text-gray-600 space-y-2">
                <p>• <strong>2.5% Annual Percentage Yield (APY)</strong> - Earn competitive interest on your savings</p>
                <p>• <strong>No minimum balance</strong> - Start saving with any amount</p>
                <p>• <strong>No monthly fees</strong> - Keep more of your money</p>
                <p>• <strong>FDIC Insured</strong> - Your deposits are protected up to $250,000</p>
                <p>• <strong>Easy transfers</strong> - Move money between your accounts anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Transactions */}
        {savingsTransactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Savings Transactions</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {savingsTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'incoming' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.type === 'incoming' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'incoming' 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                      }`}>
                        {transaction.type === 'incoming' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {savingsTransactions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <PiggyBank className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Transactions Yet</h3>
            <p className="text-gray-500 mb-4">Start building your savings by making your first deposit!</p>
            <button
              onClick={() => {
                setSavingsAction('deposit')
                setShowSavingsModal(true)
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Make First Deposit
            </button>
          </div>
        )}
      </div>

      {/* Savings Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <PiggyBank className="h-5 w-5 mr-2 text-green-600" />
              {savingsAction === 'deposit' ? 'Deposit to Savings' : 'Withdraw from Savings'}
            </h3>
            
            <div className="space-y-4">
              {/* Account balances display */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Main Account:</span>
                  <span className="font-medium">{formatCurrency(balance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Savings Account:</span>
                  <span className="font-medium">{formatCurrency(savingsBalance)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to {savingsAction === 'deposit' ? 'Deposit' : 'Withdraw'}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {savingsAction === 'deposit' 
                    ? `Maximum: ${formatCurrency(balance)}` 
                    : `Maximum: ${formatCurrency(savingsBalance)}`
                  }
                </p>
              </div>

              {/* Quick amount buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quick amounts:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSavingsAmount(amount.toString())}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      disabled={
                        savingsAction === 'deposit' ? amount > balance : amount > savingsBalance
                      }
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Information box */}
              <div className={`p-4 rounded-lg ${
                savingsAction === 'deposit' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-start">
                  {savingsAction === 'deposit' ? (
                    <ArrowDownLeft className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  )}
                  <div className={`text-sm ${
                    savingsAction === 'deposit' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    <p className="font-medium">
                      {savingsAction === 'deposit' ? 'Deposit Information' : 'Withdrawal Information'}
                    </p>
                    <p>
                      {savingsAction === 'deposit' 
                        ? 'Money will be moved from your main account to your savings account. Earn 2.5% APY on your savings.'
                        : 'Money will be transferred from your savings account to your main account. You can then transfer to external banks.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSavingsModal(false)
                  setSavingsAmount('')
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSavings}
                disabled={!savingsAmount || parseFloat(savingsAmount) <= 0}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  savingsAction === 'deposit' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {savingsAction === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        transactionType={toast.transactionType}
        amount={toast.amount}
      />
    </div>
  )
}
