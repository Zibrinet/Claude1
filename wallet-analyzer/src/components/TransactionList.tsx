import { Transaction } from '../services/etherscan'
import { LoadingSpinner } from './LoadingSpinner'
import { ethers } from 'ethers'

interface TransactionListProps {
  transactions: Transaction[]
  address: string
  loading: boolean
  error: string | null
}

export function TransactionList({ transactions, address, loading, error }: TransactionListProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
        Last 20 Transactions
      </h2>

      {loading && (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-gray-500">Fetching transactions...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p className="text-sm text-gray-600">No transactions found</p>
      )}

      {!loading && transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600">
                <th className="pb-3 font-medium">Hash</th>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 font-medium">From / To</th>
                <th className="pb-3 text-right font-medium">Value (ETH)</th>
                <th className="pb-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.map((tx) => {
                const isIncoming = tx.to.toLowerCase() === address.toLowerCase()
                const failed = tx.isError === '1'
                const ethValue = ethers.formatEther(tx.value)
                const age = formatAge(parseInt(tx.timeStamp, 10))

                return (
                  <tr
                    key={tx.hash}
                    className={`${failed ? 'opacity-50' : ''}`}
                  >
                    <td className="py-3 pr-4">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                      {age}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            isIncoming
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-orange-950 text-orange-400'
                          }`}
                        >
                          {isIncoming ? 'IN' : 'OUT'}
                        </span>
                        <span className="font-mono text-xs text-gray-400">
                          {isIncoming
                            ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                            : `${(tx.to || 'Contract').slice(0, 6)}...${(tx.to || '').slice(-4)}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-xs text-gray-300">
                      {parseFloat(ethValue) === 0 ? '—' : parseFloat(ethValue).toFixed(6)}
                    </td>
                    <td className="py-3 text-right">
                      {failed ? (
                        <span className="rounded bg-red-950 px-1.5 py-0.5 text-xs text-red-400">Failed</span>
                      ) : (
                        <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">OK</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function formatAge(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`
  return `${Math.floor(diff / (86400 * 365))}y ago`
}
