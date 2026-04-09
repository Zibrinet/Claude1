import { useState, useEffect } from 'react'
import { getTransactions, Transaction } from '../services/etherscan'

export function useTransactions(address: string | null, apiKey: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !apiKey) {
      setTransactions([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setTransactions([])

    getTransactions(address, apiKey)
      .then((txns) => {
        if (!cancelled) {
          setTransactions(txns)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [address, apiKey])

  return { transactions, loading, error }
}
