import { useState, useEffect } from 'react'
import { resolveAddress } from '../services/etherscan'
import { useEthBalance } from './useEthBalance'
import { useTransactions } from './useTransactions'
import { useTokens } from './useTokens'

export function useWalletData(input: string, apiKey: string) {
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const [resolutionError, setResolutionError] = useState<string | null>(null)

  useEffect(() => {
    if (!input || !apiKey) {
      setResolvedAddress(null)
      setResolutionError(null)
      return
    }

    let cancelled = false
    setResolving(true)
    setResolutionError(null)
    setResolvedAddress(null)

    resolveAddress(input)
      .then((addr) => {
        if (!cancelled) {
          setResolvedAddress(addr)
          setResolving(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResolutionError(err instanceof Error ? err.message : 'Failed to resolve address')
          setResolving(false)
        }
      })

    return () => { cancelled = true }
  }, [input, apiKey])

  const { balance, loading: ethLoading, error: ethError } = useEthBalance(resolvedAddress, apiKey)
  const { transactions, loading: txLoading, error: txError } = useTransactions(resolvedAddress, apiKey)
  const { tokens, loading: tokenLoading, error: tokenError } = useTokens(resolvedAddress, apiKey)

  return {
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
  }
}
