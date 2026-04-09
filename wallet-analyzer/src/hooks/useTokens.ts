import { useState, useEffect } from 'react'
import { getTokenBalances, TokenBalance } from '../services/etherscan'

export function useTokens(address: string | null, apiKey: string) {
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !apiKey) {
      setTokens([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setTokens([])

    getTokenBalances(address, apiKey)
      .then((toks) => {
        if (!cancelled) {
          setTokens(toks)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch token balances')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [address, apiKey])

  return { tokens, loading, error }
}
