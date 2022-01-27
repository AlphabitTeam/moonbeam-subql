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
