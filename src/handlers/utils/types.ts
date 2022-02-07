import { SubstrateEvent } from "@subql/types"
import { MoonbeamEvent } from "@subql/contract-processors/dist/moonbeam"
import { Balance } from '@polkadot/types/interfaces'
import { Event, Log } from "../../types"


export type DispatchedEventData = {
  event: Event
  rawEvent: SubstrateEvent
}

export type DispatchedLogData = {
  event: Log
  rawEvent: MoonbeamEvent
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
