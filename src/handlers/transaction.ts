import { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
import { Transaction } from "../types";
import { ensureAccount } from "./account";
import { ensureLog } from "./log";

export async function ensureTransaction(recordId: string): Promise<Transaction> {
  let entity = await Transaction.get(recordId)
  if (!entity) {
    entity = new Transaction(recordId)
    entity.gasUsed = BigInt(0);
    await entity.save()
  }
  return entity
}

export async function createTransaction(call: MoonbeamCall): Promise<void> {
  const entity = await ensureTransaction(call.hash)
  const from = await ensureAccount(call.from.toString())
  const to = call.to ? await ensureAccount(call.to.toString()) : null

  entity.fromId = from.id
  entity.toId = to?.id
  entity.transactionHash = call.hash;
  entity.success = call.success
  entity.value = call.value.toBigInt()
  entity.nonce = call.nonce
  entity.gasLimit = call.gasLimit.toBigInt()
  entity.gasPrice = call.gasPrice?.toBigInt()
  entity.input_data = call.data
  
  await entity.save()
} 
