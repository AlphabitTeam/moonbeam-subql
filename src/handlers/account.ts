import { Account } from "../types";

export async function ensureAccount(recordId: string): Promise<Account> {
  recordId = recordId.toLowerCase()
  let entity = await Account.get(recordId)
  if (!entity) {
    entity = Account.create({
      id: recordId,
      totalBalance: BigInt(0),
      freeBalance: BigInt(0),
      //reducibleBalance: BigInt(0),
      reservedBalance: BigInt(0),
      miscFrozenBalance: BigInt(0),
      feeFrozenBalance: BigInt(0)
    })
    await entity.save()
  }
  return entity
}

// updateBalance
