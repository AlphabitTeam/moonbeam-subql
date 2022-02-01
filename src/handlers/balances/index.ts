import { Transfer } from "../../types";
import { updateAccount } from "../account";
import { DispatchedEventData } from "../utils/types";


export async function balanceSet(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function deposit(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function dustLost(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function endowed(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function reserved(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function reserveRepatriated(data:DispatchedEventData): Promise<void> {
  const [address1, address2, balance, status] = data.rawEvent.event.data.toJSON() as [string, string, string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address1, blockNumber)
  await updateAccount(address2, blockNumber)
}

export async function slashed(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function transfer(data:DispatchedEventData): Promise<void> {
  const [address1, address2, balance] = data.rawEvent.event.data.toJSON() as [string, string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address1, blockNumber)
  await updateAccount(address2, blockNumber)

  const transfer = Transfer.create({
    id: data.event.id,
    index: data.event.index,
    blockId: data.event.blockId,
    blockNumber: data.event.blockNumber,
    extrinsicId: data.event.extrinsicId,
    fromId: address1.toLowerCase(),
    toId: address2.toLowerCase(),
    value: BigInt(balance)
  })
  await transfer.save()
  // aggregate
}

export async function unreserved(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}

export async function withdraw(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const blockNumber = data.event.blockNumber
  await updateAccount(address, blockNumber)
}
