import { Account } from "../types";
import { getAccount, getAccountCode } from './utils/api'

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

export async function updateAccount(address: string, createdAt?: string, creator?: string, isContract?: boolean): Promise<void> {
  // I still hope I got the balance right
  const entity = await ensureAccount(address)
  const account = await getAccount(entity.id)
  const acccoutCode = await getAccountCode(address)
  entity.txCount = account.nonce + 1
  entity.isContract = isContract !== undefined? isContract: (acccoutCode.length !== 0)
  entity.freeBalance = account.data.free.toBigInt()
  entity.reservedBalance = account.data.reserved.toBigInt()
  entity.miscFrozenBalance = account.data.miscFrozen.toBigInt()
  entity.feeFrozenBalance = account.data.feeFrozen.toBigInt()
  entity.reducibleBalance = entity.freeBalance - entity.miscFrozenBalance - entity.feeFrozenBalance
  entity.totalBalance = entity.freeBalance + entity.reservedBalance
  // account creation : balances.Endowed, proxy.AnonymousCreated, system.NewAccount
  entity.createdAt = createdAt;
  if(creator) {
    const creatorEntity  = await ensureAccount(creator);
    entity.creatorId = creatorEntity.id;
  }
  entity.save()
}
