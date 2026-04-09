import { useState } from 'react'
import { ApiKeySetup } from './components/ApiKeySetup'
import { WalletInput } from './components/WalletInput'
import { EthBalance } from './components/EthBalance'
import { TokenList } from './components/TokenList'
import { TransactionList } from './components/TransactionList'
import { useWalletData } from './hooks/useWalletData'

function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('etherscan_api_key') ?? ''
  )
  const [submittedInput, setSubmittedInput] = useState('')
  const [showApiKeyChange, setShowApiKeyChange] = useState(false)

  const {
    resolvedAddress,
    resolving,
    resolutionError,
    balance,
    ethLoading,
    ethError,
    transactions,
    txLoading,
    txError,
    tokens,
    tokenLoading,
    tokenError,
  } = useWalletData(submittedInput, apiKey)

  function handleApiKeySave(key: string) {
    setApiKey(key)
    setShowApiKeyChange(false)
  }

  function handleChangeApiKey() {
    const newKey = prompt('Enter new Etherscan API key:')?.trim()
    if (newKey) {
      localStorage.setItem('etherscan_api_key', newKey)
      setApiKey(newKey)
    }
  }

  if (!apiKey || showApiKeyChange) {
    return <ApiKeySetup onSave={handleApiKeySave} />
  }

  const hasResults = resolvedAddress !== null

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛓</span>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Wallet Analyzer
            </h1>
          </div>
          <button
            onClick={handleChangeApiKey}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300"
          >
            API Key
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <WalletInput
            onSubmit={setSubmittedInput}
            resolving={resolving}
            resolutionError={resolutionError}
          />
        </div>

        {/* Results */}
        {hasResults && (
          <div className="space-y-6">
            <EthBalance
              address={resolvedAddress}
              balance={balance}
              loading={ethLoading}
              error={ethError}
            />
            <TokenList
              tokens={tokens}
              loading={tokenLoading}
              error={tokenError}
            />
            <TransactionList
              transactions={transactions}
              address={resolvedAddress}
              loading={txLoading}
              error={txError}
            />
          </div>
        )}

        {/* Empty state */}
        {!hasResults && !resolving && !resolutionError && (
          <div className="mt-16 text-center">
            <p className="text-3xl">🔍</p>
            <p className="mt-3 text-gray-600">
              Enter an Ethereum address or ENS name to get started
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
