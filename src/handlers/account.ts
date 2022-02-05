import { Account } from "../types";
import { getAccount } from './utils/api'

export async function ensureAccount(recordId: string): Promise<Account> {
  // toLowerCase cause some do contain different cases (Checksum Address)
  recordId = recordId.toLowerCase()
  let entity = await Account.get(recordId)
  if (!entity) {
    entity = Account.create({
      id: recordId,
      totalBalance: BigInt(0),
      freeBalance: BigInt(0),
      reducibleBalance: BigInt(0),
      reservedBalance: BigInt(0),
      miscFrozenBalance: BigInt(0),
      feeFrozenBalance: BigInt(0)
    })
    await entity.save()
  }
  return entity
}

export async function updateAccount(address: string, blockNumber: bigint): Promise<void> {
  // I still hope I got the balance right
  const entity = await ensureAccount(address)
  const account = await getAccount(entity.id)
  entity.nonce = account.nonce
  entity.freeBalance = account.data.free.toBigInt()
  entity.reservedBalance = account.data.reserved.toBigInt()
  entity.miscFrozenBalance = account.data.miscFrozen.toBigInt()
  entity.feeFrozenBalance = account.data.feeFrozen.toBigInt()
  entity.reducibleBalance = entity.freeBalance - entity.miscFrozenBalance - entity.feeFrozenBalance
  entity.totalBalance = entity.freeBalance + entity.reservedBalance
  entity.updateAt = blockNumber
  entity.save()
}

export async function addContract(accountId: string, creatorId: string, createdAt: string): Promise<void> {
  const account = await ensureAccount(accountId)
  const creator = await ensureAccount(creatorId)
  account.isContract = true
  account.creatorId = creator.id
  account.createdAt = createdAt
  await account.save()
}
