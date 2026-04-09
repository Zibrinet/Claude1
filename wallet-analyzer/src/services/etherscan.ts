import { ethers } from 'ethers'

const BASE_URL = 'https://api.etherscan.io/v2/api'
const PUBLIC_RPCS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
]

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timeStamp: string
  isError: string
  gasUsed: string
  blockNumber: string
}

export interface TokenBalance {
  contractAddress: string
  name: string
  symbol: string
  decimals: number
  balance: string
}

async function etherscanFetch(params: Record<string, string>): Promise<unknown> {
  const url = new URL(BASE_URL)
  url.searchParams.set('chainid', '1')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  const json = await res.json() as { status: string; message: string; result: unknown }
  if (json.status === '0' && json.message !== 'No transactions found') {
    const msg = typeof json.result === 'string' ? json.result : json.message
    throw new Error(msg)
  }
  return json.result
}

export async function resolveAddress(input: string): Promise<string> {
  const trimmed = input.trim()
  if (trimmed.startsWith('0x')) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      throw new Error('Invalid Ethereum address format')
    }
    return trimmed
  }
  if (trimmed.endsWith('.eth') || trimmed.includes('.')) {
    let lastError: unknown
    for (const rpc of PUBLIC_RPCS) {
      try {
        const provider = new ethers.JsonRpcProvider(rpc)
        const resolved = await provider.resolveName(trimmed)
        if (resolved) return resolved
      } catch (err) {
        lastError = err
      }
    }
    const msg = lastError instanceof Error ? lastError.message : 'Unknown error'
    throw new Error(`ENS name "${trimmed}" could not be resolved (${msg})`)
  }
  throw new Error('Input must be an 0x address or ENS name (e.g. vitalik.eth)')
}

export async function getEthBalance(address: string, apiKey: string): Promise<string> {
  const result = await etherscanFetch({
    module: 'account',
    action: 'balance',
    address,
    tag: 'latest',
    apikey: apiKey,
  })
  return ethers.formatEther(result as string)
}

export async function getTransactions(address: string, apiKey: string): Promise<Transaction[]> {
  const result = await etherscanFetch({
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '20',
    sort: 'desc',
    apikey: apiKey,
  })
  if (!Array.isArray(result)) return []
  return result as Transaction[]
}

export async function getTokenBalances(address: string, apiKey: string): Promise<TokenBalance[]> {
  // Phase 1: get all ERC-20 transfer events and deduplicate by contract address
  const result = await etherscanFetch({
    module: 'account',
    action: 'tokentx',
    address,
    startblock: '0',
    endblock: '99999999',
    sort: 'desc',
    apikey: apiKey,
  })

  if (!Array.isArray(result)) return []

  type TokenTx = {
    contractAddress: string
    tokenName: string
    tokenSymbol: string
    tokenDecimal: string
  }

  const seen = new Map<string, { name: string; symbol: string; decimals: number }>()
  for (const tx of result as TokenTx[]) {
    const key = tx.contractAddress.toLowerCase()
    if (!seen.has(key)) {
      seen.set(key, {
        name: tx.tokenName,
        symbol: tx.tokenSymbol,
        decimals: parseInt(tx.tokenDecimal, 10),
      })
    }
  }

  // Phase 2: fetch current balance for each unique token contract
  const contractAddresses = Array.from(seen.keys())
  const balanceResults = await Promise.allSettled(
    contractAddresses.map((contractAddress) =>
      etherscanFetch({
        module: 'account',
        action: 'tokenbalance',
        contractaddress: contractAddress,
        address,
        tag: 'latest',
        apikey: apiKey,
      })
    )
  )

  const tokens: TokenBalance[] = []
  for (let i = 0; i < contractAddresses.length; i++) {
    const settled = balanceResults[i]
    if (settled.status === 'rejected') continue
    const meta = seen.get(contractAddresses[i])!
    const rawBalance = settled.value as string
    const formatted = ethers.formatUnits(rawBalance, meta.decimals)
    if (parseFloat(formatted) === 0) continue
    tokens.push({
      contractAddress: contractAddresses[i],
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      balance: formatted,
    })
  }

  return tokens.sort((a, b) => a.symbol.localeCompare(b.symbol))
}
