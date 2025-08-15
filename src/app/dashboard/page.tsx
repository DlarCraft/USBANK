'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '../../components/Toast'
import CountingNumber from '../../components/CountingNumber'
import { 
  Home, 
  CreditCard, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff, 
  LogOut,
  User,
  Settings,
  Bell,
  DollarSign,
  TrendingUp,
  Calendar,
  PiggyBank,
  ArrowRightLeft,
  X,
  ChevronRight,
  Download,
  Clock
} from 'lucide-react'

interface Transaction {
  id: string
  type: 'incoming' | 'outgoing'
  amount: number
  description: string
  date: string
  category: string
  reason?: string // Optional reason field
  status?: string // Optional status field for pending transactions
  submittedAt?: string // Optional submission timestamp for pending transactions
  rejectionReason?: string // Optional rejection reason field
  declineReason?: string // Optional decline reason field
  isPendingTransaction?: boolean // Optional pending flag
}

export default function Dashboard() {
  // Hydration guard (Claude 4 style)
  const [isClient, setIsClient] = useState(false);
  // ...existing code...
  
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

  // Generate realistic transaction ID
  const generateTransactionId = (type: 'incoming' | 'outgoing', category: string) => {
    const date = new Date()
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0') +
                   (date.getHours() * 100 + date.getMinutes()).toString().padStart(4, '0')
    
    const typeCode = type === 'incoming' ? 'INC' : 'OUT'
    const categoryCode = category.substring(0, 3).toUpperCase()
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    return `TXN-${dateStr}-${typeCode}-${categoryCode}-${randomSuffix}`
  }

  // Create pending transaction for admin approval
  // Accepts transactionType: 'incoming' | 'outgoing'
  const createPendingTransaction = (amount: number, description: string, method: string, category: string, transactionType: 'incoming' | 'outgoing' = 'incoming') => {
    const pendingTransaction = {
      id: generateTransactionId(transactionType, category),
      type: transactionType,
      amount: amount,
      description: description,
      date: new Date().toISOString().split('T')[0],
      category: category,
      status: 'pending' as const,
      userEmail: 'roofingconstructionboss@gmail.com', // From predefined user
      submittedAt: new Date().toISOString(),
      method: method
    }

    // Store in pending transactions for admin review
    const existingPending = JSON.parse(localStorage.getItem('pendingTransactions') || '[]')
    existingPending.unshift(pendingTransaction)
    localStorage.setItem('pendingTransactions', JSON.stringify(existingPending))

    return pendingTransaction
  }

  // Load pending transactions for current user
  const loadPendingTransactions = () => {
    const allPending = JSON.parse(localStorage.getItem('pendingTransactions') || '[]')
    const userPending = allPending.filter((t: any) => 
      t.userEmail === 'roofingconstructionboss@gmail.com' && t.status === 'pending'
    )
    setPendingTransactions(userPending)
  }

  // Load declined transactions for current user
  const loadDeclinedTransactions = () => {
    const allPending = JSON.parse(localStorage.getItem('pendingTransactions') || '[]')
    const userDeclined = allPending.filter((t: any) => 
      t.userEmail === 'roofingconstructionboss@gmail.com' && t.status === 'rejected'
    )
    setDeclinedTransactions(userDeclined)
  }

  // Generate and download receipt
  const downloadReceipt = (transaction: Transaction | any) => {
    // Robust status checking - check all possible status indicators
    let status = 'Completed'
    let statusClass = 'status-badge'
    
    // Check for declined/rejected status first (highest priority)
    if (transaction.status === 'declined' || 
        transaction.status === 'rejected' || 
        transaction.rejectionReason || 
        transaction.declineReason) {
      status = 'Declined'
      statusClass = 'status-badge-declined'
    }
    // Then check for pending status
    else if (transaction.status === 'pending' || 
             transaction.isPendingTransaction === true) {
      status = 'Processing'
      statusClass = 'status-badge-pending'
    }
    // Default to completed for approved transactions
    else {
      status = 'Completed'
      statusClass = 'status-badge'
    }
    
    const receiptContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Receipt - ${transaction.id}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .receipt {
            background: white;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #003366;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .bank-logo {
            font-size: 24px;
            font-weight: bold;
            color: #003366;
            margin-bottom: 10px;
        }
        .receipt-title {
            font-size: 18px;
            color: #666;
            margin: 0;
        }
        .transaction-details {
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: 600;
            color: #333;
        }
        .detail-value {
            color: #666;
            font-family: monospace;
        }
        .amount {
            font-size: 20px;
            font-weight: bold;
            color: ${transaction.type === 'incoming' ? '#16a34a' : '#dc2626'};
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background-color: #16a34a;
            color: white;
        }
        .status-badge-pending {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background-color: #eab308;
            color: white;
        }
        .status-badge-declined {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background-color: #dc2626;
            color: white;
        }
        @media print {
            body { background: white; }
            .receipt { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="bank-logo">U.S BANK</div>
            <p class="receipt-title">Transaction Receipt</p>
        </div>
        
        <div class="transaction-details">
            <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${transaction.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${new Date(transaction.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} at ${new Date().toLocaleTimeString('en-US')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">${transaction.description}</span>
            </div>
            ${transaction.reason ? `
            <div class="detail-row">
                <span class="detail-label">Reason:</span>
                <span class="detail-value">${transaction.reason}</span>
            </div>` : ''}
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${transaction.category}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Transaction Type:</span>
                <span class="detail-value">${transaction.type === 'incoming' ? 'Credit (Money In)' : 'Debit (Money Out)'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">
                    ${transaction.type === 'incoming' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Account Holder:</span>
                <span class="detail-value">Michael Paul</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Account Number:</span>
                <span class="detail-value">****-****-****-7890</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="${statusClass}">${status}</span>
            </div>
            ${transaction.declineReason || transaction.rejectionReason ? `
            <div class="detail-row">
                <span class="detail-label">Decline Reason:</span>
                <span class="detail-value" style="color: #dc2626;">${transaction.declineReason || transaction.rejectionReason}</span>
            </div>` : ''}
        </div>
        
        <div class="footer">
            <p>This is an official transaction receipt from U.S Bank </p>
            <p>Generated on ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')}</p>
            <p>For customer support, call: 1-800-USBANK-1 or email: support@securebank.com</p>
        </div>
    </div>
</body>
</html>`

    // Create blob and download
    const blob = new Blob([receiptContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Receipt-${transaction.id}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Show success toast
    setToast({
      message: 'Receipt downloaded successfully!',
      type: 'success',
      isVisible: true,
      transactionType: undefined,
      amount: undefined
    })
  }

  // Always use the static initial balance for calculations
  const STATIC_INITIAL_BALANCE = 545780.50;
  const [balance, setBalance] = useState(STATIC_INITIAL_BALANCE);
  const [receivedThisMonth, setReceivedThisMonth] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [showBalance, setShowBalance] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transferAmount, setTransferAmount] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')
  const [transferRecipientBank, setTransferRecipientBank] = useState('')
  const [transferRecipientAccount, setTransferRecipientAccount] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([])
  const [declinedTransactions, setDeclinedTransactions] = useState<any[]>([])
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [topUpCode, setTopUpCode] = useState('')
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpFromWho, setTopUpFromWho] = useState('')
  const [topUpMethod, setTopUpMethod] = useState<'card' | 'bank' | 'code'>('card')
  const [topUpStep, setTopUpStep] = useState(1) // 1: Method, 2: Details, 3: Confirmation
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    transactionType: undefined as 'incoming' | 'outgoing' | 'topup' | undefined,
    amount: undefined as number | undefined
  })
  const [balanceHighlight, setBalanceHighlight] = useState(false)
  const router = useRouter()

  // Save data to localStorage whenever state changes (but not on initial load)
  const [hasInitialized, setHasInitialized] = useState(false)
  
  useEffect(() => {
    if (hasInitialized) {
      saveToStorage('bankBalance', balance)
      // Also update userBalance for admin system consistency
      localStorage.setItem('userBalance', balance.toString())
    }
  }, [balance, hasInitialized])


  // Update receivedThisMonth, totalSpent, and balance whenever transactions change (Claude 4 logic, but always start from static initial balance)
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let received = 0;
    let spent = 0;
    let newBalance = STATIC_INITIAL_BALANCE;
    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date);
      // Only count transactions that are approved (not pending, not declined)
      const isConfirmed = (
        (!txn.status || txn.status === 'approved' || txn.status === 'completed') &&
        !txn.isPendingTransaction &&
        !txn.rejectionReason &&
        !txn.rejectionReason
      );
      if (isConfirmed) {
        if (txn.type === 'incoming') {
          newBalance += txn.amount;
        }
        if (txn.type === 'outgoing') {
          newBalance -= txn.amount;
        }
        if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
          if (txn.type === 'incoming') {
            received += txn.amount;
          }
          if (txn.type === 'outgoing') {
            spent += txn.amount;
          }
        }
      }
    });
    setReceivedThisMonth(received);
    setTotalSpent(spent);
    setBalance(newBalance);
    if (hasInitialized) {
      saveToStorage('bankReceivedThisMonth', received);
      saveToStorage('bankTotalSpent', spent);
      saveToStorage('bankBalance', newBalance);
      // Also update userBalance for admin system consistency
      localStorage.setItem('userBalance', newBalance.toString());
    }
  }, [transactions, hasInitialized]);

  useEffect(() => {
    // Calculate received this month and total spent ONLY for confirmed transactions
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    let received = 0
    let spent = 0
    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date)
      // Only count transactions that are approved (not pending, not declined)
      const isConfirmed = (
        (!txn.status || txn.status === 'approved' || txn.status === 'completed') &&
        !txn.isPendingTransaction &&
        !txn.rejectionReason
      )
      if (isConfirmed && txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
        if (txn.type === 'incoming') {
          received += txn.amount
        }
        if (txn.type === 'outgoing') {
          spent += txn.amount
        }
      }
    })
    setReceivedThisMonth(received)
    setTotalSpent(spent)
  }, [transactions])

  useEffect(() => {
    if (hasInitialized) {
      saveToStorage('bankTransactions', transactions)
    }
  }, [transactions, hasInitialized])

  // Load all transactions (approved, pending, declined) and sort by most recent, only update if changed
  useEffect(() => {
    const loadAllTransactions = () => {
      const adminTransactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      const savedTransactions = loadFromStorage('bankTransactions', [])
      const pendingTransactionsRaw = JSON.parse(localStorage.getItem('pendingTransactions') || '[]')
      const userEmail = 'roofingconstructionboss@gmail.com'
      // All admin transactions for this user (approved/declined)
      const adminUserTxns = adminTransactions.filter((t: any) => t.userEmail === userEmail)
      // All pending/declined for this user
      const userPendingAndDeclined = pendingTransactionsRaw.filter((t: any) => t.userEmail === userEmail)
      // All saved transactions for this user
      const userSavedTxns = savedTransactions.filter((t: any) => !t.userEmail || t.userEmail === userEmail)
      // Merge all, always prefer adminUserTxns (approved/declined) over pending/saved for the same ID
      const txnMap = new Map();
      // First, add all userSavedTxns (lowest priority)
      userSavedTxns.forEach((txn: Transaction) => {
        txnMap.set(txn.id, txn);
      });
      // Next, add all userPendingAndDeclined (overwrites saved if same ID)
      userPendingAndDeclined.forEach((txn: any) => {
        txnMap.set(txn.id, txn);
      });
      // Finally, add all adminUserTxns (highest priority, overwrites if same ID)
      adminUserTxns.forEach((txn: any) => {
        txnMap.set(txn.id, txn);
      });
      const uniqueTransactions = Array.from(txnMap.values());
      // Sort by date (descending)
      uniqueTransactions.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.date).getTime();
        const dateB = new Date(b.submittedAt || b.date).getTime();
        return dateB - dateA;
      });
      // Only update if transactions actually changed
      setTransactions(prev => {
        const prevIds = prev.map(t => t.id).join(',')
        const newIds = uniqueTransactions.map(t => t.id).join(',')
        if (prevIds !== newIds) {
          return uniqueTransactions
        }
        return prev
      })
      setHasInitialized(true)
      loadPendingTransactions()
    }
    loadAllTransactions()
    // Listen for localStorage changes (from admin approval/decline in another tab/window)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'transactions' || event.key === 'pendingTransactions') {
        loadAllTransactions()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Auto-refresh pending and declined transactions every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadPendingTransactions()
      loadDeclinedTransactions()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', transactionType?: 'incoming' | 'outgoing' | 'topup', amount?: number) => {
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  // New function specifically for pending transactions
  const handlePendingTransactionClick = (transaction: any) => {
    // Preserve all transaction data as-is for proper status detection
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const closeTransactionModal = () => {
    setShowTransactionModal(false)
    setSelectedTransaction(null)
  }

  const updateBalanceWithAnimation = (newBalance: number) => {
    setBalance(newBalance)
    setBalanceHighlight(true)
    setTimeout(() => setBalanceHighlight(false), 1500) // Remove highlight after animation
  }

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('bankAuth')
    if (!auth) {
      router.push('/')
    }

    // setIsClient(true) removed (no isClient state)

    // Debug localStorage data
    console.log('Current localStorage data:')
    console.log('Balance:', localStorage.getItem('bankBalance'))
    console.log('Received:', localStorage.getItem('bankReceivedThisMonth'))
    console.log('Transactions:', localStorage.getItem('bankTransactions'))

    // Add keyboard shortcut to reset data (Ctrl+Shift+R)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault()
        if (confirm('Are you sure you want to reset all banking data? This cannot be undone.')) {
          // Reset to default values
          localStorage.removeItem('bankBalance')
          localStorage.removeItem('bankReceivedThisMonth')
          localStorage.removeItem('bankTransactions')
          window.location.reload()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('bankAuth')
    localStorage.removeItem('userEmail')
    // Optionally clear banking data on logout (uncomment if you want this behavior)
    // localStorage.removeItem('bankBalance')
    // localStorage.removeItem('bankReceivedThisMonth')
    // localStorage.removeItem('bankTransactions')
    router.push('/')
  }

  const handleTransfer = () => {
    // Check if account is frozen
    const frozenAccounts = JSON.parse(localStorage.getItem('frozenAccounts') || '[]')
    if (frozenAccounts.includes('roofingconstructionboss@gmail.com')) {
      showToast('Account is temporarily frozen. Please visit the bank or email support@usbank.com to resolve this issue.', 'error')
      return
    }

    if (
      transferAmount &&
      transferRecipient &&
      transferRecipientBank &&
      transferRecipientAccount &&
      parseFloat(transferAmount) > 0
    ) {
      const amount = parseFloat(transferAmount)
      if (amount <= balance) {
        // Create description with all details
        const baseDescription = `Transfer to ${transferRecipient} (${transferRecipientBank}, Acct: ${transferRecipientAccount})`
        const description = transferReason 
          ? `${baseDescription} - ${transferReason}`
          : baseDescription
        
        // Create pending transaction for admin approval as OUTGOING
        const pendingTransaction = createPendingTransaction(
          amount,
          description,
          'Transfer',
          'Transfer',
          'outgoing'
        )

        setTransferAmount('')
        setTransferRecipient('')
        setTransferRecipientBank('')
        setTransferRecipientAccount('')
        setTransferReason('')
        setShowTransferModal(false)
        loadPendingTransactions() // Refresh pending transactions
        loadDeclinedTransactions() // Refresh declined transactions
        showToast(
          `Transfer request submitted for approval. Transaction ID: ${pendingTransaction.id}`, 
          'info'
        )
      } else {
        showToast('Insufficient funds for this transfer!', 'error')
      }
    }
  }

  const handleTopUp = () => {
    if (topUpMethod === 'code') {
      // Handle code-based top-up (instant approval for demo codes)
      const validCodes = ['TOPUP1000', 'BONUS500', 'RELOAD2000']
      if (validCodes.includes(topUpCode.toUpperCase())) {
        let codeAmount = 0
        switch (topUpCode.toUpperCase()) {
          case 'TOPUP1000':
            codeAmount = 1000
            break
          case 'BONUS500':
            codeAmount = 500
            break
          case 'RELOAD2000':
            codeAmount = 2000
            break
        }
        
        const newTransaction: Transaction = {
          id: generateTransactionId('incoming', 'Top-up'),
          type: 'incoming',
          amount: codeAmount,
          description: `Top-up with code: ${topUpCode}`,
          date: new Date().toISOString().split('T')[0],
          category: 'Top-up'
        }
        
        setTransactions([newTransaction, ...transactions])
        updateBalanceWithAnimation(balance + codeAmount)
        setReceivedThisMonth((prev: number) => prev + codeAmount)
        resetTopUpModal()
        showToast(`Account topped up successfully!`, 'success', 'topup', codeAmount)
      } else {
        showToast('Invalid top-up code! Please check and try again.', 'error')
      }
    } else {
      // Handle card/bank transfer top-up - CREATE PENDING TRANSACTION
      const amount = parseFloat(topUpAmount)
      if (amount && amount > 0 && amount <= 50000) {
        const methodName = topUpMethod === 'card' ? 'Card' : 'Bank Transfer'
        const fromWhoText = topUpFromWho ? ` from ${topUpFromWho}` : ''
        const pendingTransaction = createPendingTransaction(
          amount,
          `${methodName} top-up - $${amount.toLocaleString()}${fromWhoText}`,
          methodName,
          'Top-up'
        )

        resetTopUpModal()
        loadPendingTransactions() // Refresh pending transactions
        loadDeclinedTransactions() // Refresh declined transactions
        showToast(
          `Transaction is being processed. Your account will be updated shortly. Transaction ID: ${pendingTransaction.id}`, 
          'info'
        )
      } else {
        showToast('Please enter a valid amount between $1 and $50,000', 'error')
      }
    }
  }

  const resetTopUpModal = () => {
    setShowTopUpModal(false)
    setTopUpStep(1)
    setTopUpAmount('')
    setTopUpFromWho('')
    setTopUpCode('')
    setTopUpMethod('card')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleTransferButtonClick = () => {
    // Check if account is frozen
    const frozenAccounts = JSON.parse(localStorage.getItem('frozenAccounts') || '[]')
    if (frozenAccounts.includes('roofingconstructionboss@gmail.com')) {
      showToast('Account is temporarily frozen. Please visit the bank or email support@usbank.com to resolve this issue.', 'error')
      return
    }
    setShowTransferModal(true)
  }

  // ...existing code...
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) {
    // Minimal skeleton to prevent SSR/CSR mismatch
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <div className="bg-blue-900 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">U.S Bank</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Michael Paul</p>
                  <p className="text-xs text-gray-500">Premium Account</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Message */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div 
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-2 sm:border-3 border-blue-200 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('/joseph.jpg')`,
                      backgroundColor: '#DBEAFE'
                    }}
                  ></div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-4 sm:ml-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, Joseph Morris!</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Here's your account overview for today, {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Balance Card */}
          <div className="xl:col-span-2">
            <div className={`bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-4 sm:p-6 text-white transition-all duration-300 ${
              balanceHighlight ? 'ring-4 ring-green-400 ring-opacity-50 shadow-lg shadow-green-400/25' : ''
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-200 text-xs sm:text-sm">Main Account Balance</p>
                  <div className="flex items-center mt-2">
                    <span className="text-2xl sm:text-3xl font-bold">
                      {showBalance ? (
                        <CountingNumber 
                          value={balance} 
                          duration={1500} 
                          formatAsCurrency={true} 
                        />
                      ) : '••••••'}
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="ml-2 sm:ml-3 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
              </div>
              
              <div className="flex justify-between text-xs sm:text-sm text-blue-200 mb-4 sm:mb-6">
                <span>Account: ****7891</span>
                <span>Michael Paul</span>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleTransferButtonClick}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transition-colors flex-1 sm:flex-initial text-sm sm:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Transfer</span>
                  <span className="sm:hidden">Send</span>
                </button>
                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transition-colors flex-1 sm:flex-initial text-sm sm:text-base"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Top Up</span>
                </button>
                <button
                  onClick={() => router.push('/savings')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transition-colors flex-1 sm:flex-initial text-sm sm:text-base"
                >
                  <PiggyBank className="h-4 w-4" />
                  <span>Savings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Received This Month</p>
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    +${receivedThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ArrowDownLeft className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Savings Account</p>
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    Access Available
                  </p>
                </div>
                <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Spent This Month</p>
                  <p className="text-base sm:text-lg font-semibold text-red-600">-${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <ArrowUpRight className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Transactions */}
        {pendingTransactions.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-yellow-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <h2 className="text-base sm:text-lg font-semibold text-yellow-800">
                    Pending Transactions ({pendingTransactions.length})
                  </h2>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Processing in progress
                </p>
              </div>
              
              <div className="divide-y divide-yellow-200">
                {pendingTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-yellow-100 transition-colors cursor-pointer"
                    onClick={() => handlePendingTransactionClick(transaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="p-2 bg-yellow-200 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {new Date(transaction.submittedAt).toLocaleDateString('en-US')} • ID: {transaction.id}
                          </p>
                          {transaction.reason && (
                            <p className="text-xs text-yellow-700 mt-1">
                              Reason: {transaction.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-bold text-yellow-600">
                            +${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Declined Transactions section removed. Declined transactions now appear in Recent Transactions, sorted by date/time. */}

        {/* Recent Transactions */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => {
                // Status detection
                let statusColor = ''
                let statusBg = ''
                let statusText = ''
                if (transaction.status === 'declined' || transaction.status === 'rejected' || transaction.rejectionReason) {
                  statusColor = 'text-red-600'
                  statusBg = 'bg-red-100'
                  statusText = 'Declined'
                } else if (transaction.status === 'pending' || transaction.isPendingTransaction === true) {
                  statusColor = 'text-yellow-700'
                  statusBg = 'bg-yellow-100'
                  statusText = 'Processing'
                } else {
                  statusColor = 'text-green-600'
                  statusBg = 'bg-green-100'
                  statusText = 'Completed'
                }
                return (
                  <div 
                    key={transaction.id} 
                    onClick={() => handleTransactionClick(transaction)}
                    className={`px-4 sm:px-6 py-3 sm:py-4 transition-colors cursor-pointer active:bg-gray-100 hover:${statusBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${statusBg} ${statusColor}`}>
                          {transaction.type === 'incoming' ? (
                            <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {transaction.category} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center space-x-2">
                        <div>
                          <p className={`text-sm font-medium ${statusColor}`}>
                            {transaction.type === 'incoming' ? '+' : '-'}
                            ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${statusBg} ${statusColor}`}>{statusText}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Money</h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  placeholder="Enter recipient's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Bank
                </label>
                <input
                  type="text"
                  value={transferRecipientBank}
                  onChange={(e) => setTransferRecipientBank(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  placeholder="Enter recipient's bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Account Number
                </label>
                <input
                  type="text"
                  value={transferRecipientAccount}
                  onChange={(e) => setTransferRecipientAccount(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  placeholder="Enter recipient's account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Transfer
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  placeholder="e.g., Rent payment, Gift, Loan repayment"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="flex-1 px-4 py-3 sm:py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                Send Money
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Money to Account</h3>
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${topUpStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${topUpStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${topUpStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {/* Step 1: Choose Method */}
            {topUpStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Choose Top-up Method</h4>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    topUpMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                  }`}>
                    <input
                      type="radio"
                      name="topUpMethod"
                      value="card"
                      checked={topUpMethod === 'card'}
                      onChange={(e) => setTopUpMethod(e.target.value as 'card' | 'bank' | 'code')}
                      className="mr-3 text-blue-600 w-4 h-4"
                    />
                    <div className="flex items-center">
                      <CreditCard className={`h-5 w-5 mr-3 ${
                        topUpMethod === 'card' ? 'text-blue-600' : 'text-blue-500'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          topUpMethod === 'card' ? 'text-blue-900' : 'text-gray-900'
                        }`}>Debit/Credit Card</p>
                        <p className={`text-sm ${
                          topUpMethod === 'card' ? 'text-blue-700' : 'text-gray-500'
                        }`}>Instant transfer • No fees</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    topUpMethod === 'bank' 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-25 hover:shadow-sm'
                  }`}>
                    <input
                      type="radio"
                      name="topUpMethod"
                      value="bank"
                      checked={topUpMethod === 'bank'}
                      onChange={(e) => setTopUpMethod(e.target.value as 'card' | 'bank' | 'code')}
                      className="mr-3 text-green-600 w-4 h-4"
                    />
                    <div className="flex items-center">
                      <Home className={`h-5 w-5 mr-3 ${
                        topUpMethod === 'bank' ? 'text-green-700' : 'text-green-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          topUpMethod === 'bank' ? 'text-green-900' : 'text-gray-900'
                        }`}>Bank Transfer</p>
                        <p className={`text-sm ${
                          topUpMethod === 'bank' ? 'text-green-700' : 'text-gray-500'
                        }`}>1-2 business days • Secure</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    topUpMethod === 'code' 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25 hover:shadow-sm'
                  }`}>
                    <input
                      type="radio"
                      name="topUpMethod"
                      value="code"
                      checked={topUpMethod === 'code'}
                      onChange={(e) => setTopUpMethod(e.target.value as 'card' | 'bank' | 'code')}
                      className="mr-3 text-purple-600 w-4 h-4"
                    />
                    <div className="flex items-center">
                      <DollarSign className={`h-5 w-5 mr-3 ${
                        topUpMethod === 'code' ? 'text-purple-700' : 'text-purple-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          topUpMethod === 'code' ? 'text-purple-900' : 'text-gray-900'
                        }`}>Promotional Code</p>
                        <p className={`text-sm ${
                          topUpMethod === 'code' ? 'text-purple-700' : 'text-gray-500'
                        }`}>Use special codes • Limited time</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={resetTopUpModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setTopUpStep(2)}
                    className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Enter Details */}
            {topUpStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  {topUpMethod === 'card' ? 'Card Details' : 
                   topUpMethod === 'bank' ? 'Transfer Amount' : 'Promotional Code'}
                </h4>

                {topUpMethod === 'code' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Promotional Code
                      </label>
                      <input
                        type="text"
                        value={topUpCode}
                        onChange={(e) => setTopUpCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-center font-mono text-lg tracking-wider"
                        placeholder="ENTER-CODE-HERE"
                        maxLength={12}
                      />
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium mb-2">Available Promotional Codes:</p>
                      <div className="space-y-1 text-sm text-purple-600">
                        <p><span className="font-mono">TOPUP1000</span> - $1,000 bonus</p>
                        <p><span className="font-mono">BONUS500</span> - $500 bonus</p>
                        <p><span className="font-mono">RELOAD2000</span> - $2,000 bonus</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount to Add
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-lg"
                          placeholder="0.00"
                          min="1"
                          max="50000"
                          step="0.01"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum: $1.00 • Maximum: $50,000.00</p>
                    </div>

                    {/* From Who Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Who (Optional)
                      </label>
                      <input
                        type="text"
                        value={topUpFromWho}
                        onChange={(e) => setTopUpFromWho(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        placeholder="e.g., John Smith, Company Name, Family"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">Who is sending you this money?</p>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Quick amounts:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[100, 500, 1000, 5000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setTopUpAmount(amount.toString())}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>

                    {topUpMethod === 'card' && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <CreditCard className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Secure Payment</p>
                            <p>Your card will be charged immediately. Funds appear instantly in your account.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {topUpMethod === 'bank' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Home className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                          <div className="text-sm text-green-700">
                            <p className="font-medium">Bank Transfer</p>
                            <p>Funds will be transferred from your linked bank account within 1-2 business days.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setTopUpStep(1)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setTopUpStep(3)}
                    disabled={topUpMethod === 'code' ? !topUpCode : !topUpAmount || parseFloat(topUpAmount) <= 0}
                    className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {topUpStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Confirm Top-up</h4>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">
                      {topUpMethod === 'card' ? 'Credit/Debit Card' : 
                       topUpMethod === 'bank' ? 'Bank Transfer' : 'Promotional Code'}
                    </span>
                  </div>
                  
                  {/* Show From Who info if provided and not using code */}
                  {topUpFromWho && topUpMethod !== 'code' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">{topUpFromWho}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-lg">
                      {topUpMethod === 'code' 
                        ? (topUpCode === 'TOPUP1000' ? '$1,000.00' : 
                           topUpCode === 'BONUS500' ? '$500.00' : 
                           topUpCode === 'RELOAD2000' ? '$2,000.00' : 'Invalid Code')
                        : `$${parseFloat(topUpAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-medium text-green-600">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-xl text-blue-600">
                      {topUpMethod === 'code' 
                        ? (topUpCode === 'TOPUP1000' ? '$1,000.00' : 
                           topUpCode === 'BONUS500' ? '$500.00' : 
                           topUpCode === 'RELOAD2000' ? '$2,000.00' : 'Invalid Code')
                        : `$${parseFloat(topUpAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      }
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Bell className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Important</p>
                      <p>
                        {topUpMethod === 'card' && 'Your card will be charged immediately.'}
                        {topUpMethod === 'bank' && 'This transfer may take 1-2 business days to complete.'}
                        {topUpMethod === 'code' && 'This promotional code can only be used once.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setTopUpStep(2)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleTopUp}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Confirm Top-up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <button
                onClick={closeTransactionModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Transaction Status */}
              <div className="flex items-center justify-center p-4 rounded-lg bg-gray-50">
                <div className={`p-3 rounded-full mr-3 ${
                  selectedTransaction.type === 'incoming' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {selectedTransaction.type === 'incoming' ? (
                    <ArrowDownLeft className="h-6 w-6" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedTransaction.type === 'incoming' ? 'Money Received' : 'Money Sent'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    selectedTransaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'incoming' ? '+' : '-'}
                    ${selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Description</span>
                  <span className="text-sm text-gray-900">{selectedTransaction.description}</span>
                </div>
                
                {selectedTransaction.reason && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Reason</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.reason}</span>
                  </div>
                )}
                
                {(selectedTransaction.declineReason || selectedTransaction.rejectionReason) && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Decline Reason</span>
                    <span className="text-sm text-red-600 font-medium">
                      {selectedTransaction.declineReason || selectedTransaction.rejectionReason}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Category</span>
                  <span className="text-sm text-gray-900">{selectedTransaction.category}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Transaction ID</span>
                  <span className="text-sm font-mono text-gray-900">#{selectedTransaction.id}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  {(() => {
                    // Use same status detection logic as receipt
                    if (selectedTransaction.status === 'declined' || 
                        selectedTransaction.status === 'rejected' || 
                        selectedTransaction.rejectionReason || 
                        selectedTransaction.declineReason) {
                      return <span className="text-sm text-red-600 font-medium">Declined</span>
                    } else if (selectedTransaction.status === 'pending' || 
                               selectedTransaction.isPendingTransaction === true) {
                      return <span className="text-sm text-yellow-600 font-medium">Pending Admin Approval</span>
                    } else {
                      return <span className="text-sm text-green-600 font-medium">Completed</span>
                    }
                  })()}
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">Balance Impact</span>
                  {(() => {
                    // Handle declined transactions
                    if (selectedTransaction.status === 'declined' || 
                        selectedTransaction.status === 'rejected' || 
                        selectedTransaction.rejectionReason || 
                        selectedTransaction.declineReason) {
                      return <span className="text-sm font-medium text-red-600">
                        Declined - No balance change
                      </span>
                    } else if (selectedTransaction.status === 'pending' || 
                               selectedTransaction.isPendingTransaction === true) {
                      return <span className="text-sm font-medium text-yellow-600">
                        Pending - No balance change yet
                      </span>
                    } else {
                      return <span className={`text-sm font-medium ${
                        selectedTransaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedTransaction.type === 'incoming' ? 'Increased' : 'Decreased'} account balance
                      </span>
                    }
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={closeTransactionModal}
                  className="flex-1 px-4 py-3 sm:py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadReceipt(selectedTransaction)}
                  className="flex-1 px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Receipt</span>
                </button>
              </div>
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
