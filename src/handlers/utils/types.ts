import { SubstrateEvent } from "@subql/types"
import { Balance } from '@polkadot/types/interfaces'
import { Event } from "../../types"


export type DispatchedEventData = {
  event: Event
  rawEvent: SubstrateEvent
}

// Type construct is not correct
export type AccountType = {
  nonce: number
  consumers: number
  providers: number
  sufficients: number
  data: {
    free: Balance
    reserved: Balance
    miscFrozen: Balance
    feeFrozen: Balance
  }
}

export type EthBlock = {
  evmHash: string
  evmParentHash: string
  evmStateRoot: string
  size: number
  author: string
  difficult: number
  totalDifficulty: number
  gasLimit: number
  gasUsed: number
  transactionsRoot: string
  receiptsRoot: string
  sha3Uncles: string
}

export type TransactionReceipt = {
  gasUsed: number
  cumulativeGasUsed: number
  contractAddress: string|null
}
