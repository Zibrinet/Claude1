import { TokenBalance } from '../services/etherscan'
import { LoadingSpinner } from './LoadingSpinner'

interface TokenListProps {
  tokens: TokenBalance[]
  loading: boolean
  error: string | null
}

export function TokenList({ tokens, loading, error }: TokenListProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
        ERC-20 Tokens
      </h2>

      {loading && (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-gray-500">Fetching token balances...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && tokens.length === 0 && (
        <p className="text-sm text-gray-600">No ERC-20 tokens found</p>
      )}

      {!loading && tokens.length > 0 && (
        <div className="divide-y divide-gray-800">
          {tokens.map((token) => (
            <div
              key={token.contractAddress}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-300">
                  {token.symbol.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {formatTokenBalance(token.balance)}
                </p>
                <a
                  href={`https://etherscan.io/token/${token.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 hover:text-indigo-400"
                >
                  {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTokenBalance(balance: string): string {
  const num = parseFloat(balance)
  if (num === 0) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
  if (num < 0.0001) return num.toExponential(2)
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
}
