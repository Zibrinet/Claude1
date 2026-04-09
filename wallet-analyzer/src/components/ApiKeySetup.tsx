import { useState } from 'react'

interface ApiKeySetupProps {
  onSave: (key: string) => void
}

export function ApiKeySetup({ onSave }: ApiKeySetupProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    localStorage.setItem('etherscan_api_key', trimmed)
    onSave(trimmed)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🔑</div>
          <h2 className="text-xl font-semibold text-white">Etherscan API Key</h2>
          <p className="mt-2 text-sm text-gray-400">
            A free API key is required to fetch on-chain data.{' '}
            <a
              href="https://etherscan.io/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Get one free at etherscan.io
            </a>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste your API key here..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save & Continue
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-600">
          Your key is stored only in your browser's localStorage and never sent anywhere except Etherscan.
        </p>
      </div>
    </div>
  )
}
