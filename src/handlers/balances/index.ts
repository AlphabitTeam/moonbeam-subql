import { Transfer } from "../../types";
import { ensureAccount, updateAccount } from "../account";
import { ensureExtrinsic } from "../extrinsic";
import { DispatchedEventData } from "../utils/types";


export async function balanceSet(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const account = await ensureAccount(address);
  account.freeBalance = BigInt(balance);
  await account.save();
}

export async function deposit(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const account = await ensureAccount(address);
  account.freeBalance += BigInt(balance);
  await account.save();
}

export async function dustLost(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  //const account = await ensureAccount(address);

  await updateAccount(address)
}

export async function endowed(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const createdAt = data.rawEvent.block.createdAtHash;
  const creator = data.rawEvent.extrinsic?.extrinsic.signer;
  const account = await ensureAccount(address);
  account.createdAt = createdAt?.toString();
  account.creatorId = creator?.toString();
  account.freeBalance = BigInt(balance);
  await account.save();
}

export async function reserved(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const account = await ensureAccount(address);
  account.reservedBalance += BigInt(balance);
  account.freeBalance -= BigInt(balance);
  await account.save()
}

export async function reserveRepatriated(data:DispatchedEventData): Promise<void> {
  const [address1, address2, balance, status] = data.rawEvent.event.data.toJSON() as [string, string, string, string]
  await updateAccount(address1)
  await updateAccount(address2)
}

export async function slashed(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const account = await ensureAccount(address);
  account.freeBalance -= BigInt(balance);
  await account.save();
}

export async function transfer(data:DispatchedEventData): Promise<void> {
  const [address1, address2, balance] = data.rawEvent.event.data.toJSON() as [string, string, string]
  const account1 = await ensureAccount(address1);
  const account2 = await ensureAccount(address2);
  account1.freeBalance -= BigInt(balance);
  account2.freeBalance += BigInt(balance);
  await account1.save();
  await account2.save();
  
  const transfer = Transfer.create({
    id: `${data.rawEvent.hash}-${data.rawEvent.idx}`,
    fromId: address1.toLowerCase(),
    toId: address2.toLowerCase(),
    amount: BigInt(balance),
    isSuccess: data.rawEvent.extrinsic?.success,
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
  const account = await ensureAccount(address);
  account.reservedBalance -= BigInt(balance);
  account.freeBalance += BigInt(balance);
  await account.save();
}

export async function withdraw(data:DispatchedEventData): Promise<void> {
  const [address, balance] = data.rawEvent.event.data.toJSON() as [string, string]
  const account = await ensureAccount(address);
  account.freeBalance -= BigInt(balance);
  await account.save();
}

export async function reward(data:DispatchedEventData): Promise<void> {
  const [accountId, value] = data.rawEvent.event.data.toJSON() as [string, string]
  const account = await ensureAccount(accountId);
  account.freeBalance += BigInt(value);
  await account.save();
}