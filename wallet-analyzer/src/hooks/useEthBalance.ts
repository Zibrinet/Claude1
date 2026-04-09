import { useState, useEffect } from 'react'
import { getEthBalance } from '../services/etherscan'

export function useEthBalance(address: string | null, apiKey: string) {
  const [balance, setBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !apiKey) {
      setBalance(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setBalance(null)

    getEthBalance(address, apiKey)
      .then((bal) => {
        if (!cancelled) {
          setBalance(bal)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch ETH balance')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [address, apiKey])

  return { balance, loading, error }
}
