import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types"
import { MoonbeamEvent } from "@subql/contract-processors/dist/moonbeam"
import { Balance } from '@polkadot/types/interfaces'
import { Extrinsic, Log } from "../../types"
import type { CallBase, AnyTuple } from '@polkadot/types/types'

export type AnyCall = CallBase<AnyTuple>

export type DispatchedEventData = {
  rawEvent: SubstrateEvent
}

export type DispatchedLogData = {
  event: Log
  rawEvent: MoonbeamEvent
}

export type DispatchedExtrisicData = {
  extrinsic: Extrinsic,
  rawExtrinsic: SubstrateExtrinsic
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
