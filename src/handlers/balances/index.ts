import { Transfer } from "../../types";
import { updateAccount } from "../account";
import { ensureExtrinsic } from "../extrinsic";
import { DispatchedEventData } from "../utils/types";


export async function balanceSet(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function deposit(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function dustLost(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function endowed(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const createdAt = data.rawEvent.block.timestamp;
  const creator = data.rawEvent.extrinsic.extrinsic.signer;
  await updateAccount(address)
}

export async function reserved(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function reserveRepatriated(data:DispatchedEventData): Promise<void> {
  const [address1, address2, balance, status] = data.rawEvent.event.data.toJSON() as [string, string, string, string]
  await updateAccount(address1)
  await updateAccount(address2)
}

export async function slashed(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function transfer(data:DispatchedEventData): Promise<void> {
  const [address1, address2, balance] = data.rawEvent.event.data.toJSON() as [string, string, string]
  await updateAccount(address1)
  await updateAccount(address2)

  const transfer = Transfer.create({
    id: `${data.rawEvent.hash}-${data.rawEvent.idx}`,
    fromId: address1.toLowerCase(),
    toId: address2.toLowerCase(),
    amount: BigInt(balance),
    isSuccess: data.rawEvent.extrinsic.success,
    timestamp: data.rawEvent.block.timestamp
  })

  if(data.rawEvent.extrinsic) {
    const extrinsic = await ensureExtrinsic(data.rawEvent.extrinsic.extrinsic.hash.toString());
    transfer.extrinsicId = extrinsic.id;
  }
  await transfer.save()
}

export async function unreserved(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function withdraw(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(address)
}

export async function reward(data:DispatchedEventData): Promise<void> {
  const [accountId, value] = data.rawEvent.event.data.toJSON() as [string, string]
  await updateAccount(accountId)
}