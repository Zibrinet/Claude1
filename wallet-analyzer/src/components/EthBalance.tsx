import { LoadingSpinner } from './LoadingSpinner'

interface EthBalanceProps {
  address: string
  balance: string | null
  loading: boolean
  error: string | null
}

export function EthBalance({ address, balance, loading, error }: EthBalanceProps) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
          ETH Balance
        </h2>
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300"
          title={address}
        >
          {shortAddress}
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {loading && (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-gray-500">Fetching balance...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {balance !== null && !loading && (
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {parseFloat(balance).toFixed(6)}
          </span>
          <span className="text-lg text-gray-400">ETH</span>
        </div>
      )}
    </div>
  )
}
