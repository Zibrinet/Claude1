import { useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface WalletInputProps {
  onSubmit: (input: string) => void
  resolving: boolean
  resolutionError: string | null
}

export function WalletInput({ onSubmit, resolving, resolutionError }: WalletInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0x address or ENS name (e.g. vitalik.eth)"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled={resolving}
        />
        <button
          type="submit"
          disabled={!value.trim() || resolving}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {resolving ? (
            <>
              <LoadingSpinner size="sm" />
              Resolving
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </form>
      {resolutionError && (
        <p className="mt-2 text-sm text-red-400">{resolutionError}</p>
      )}
    </div>
  )
}
