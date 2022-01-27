import { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
import { Transaction } from "../types";
import { ensureAccount } from "./account";
import { ensureBlock } from "./block";

export async function ensureTransaction(recordId: string, blockId: string|null): Promise<Transaction> {
  let entity = await Transaction.get(recordId)
  if (!entity) {
    entity = new Transaction(recordId)
    if (blockId) {
      const block = await ensureBlock(blockId)
      entity.blockId = block.id
      entity.blockNumber = block.number
    }
    await entity.save()
  }
  return entity
}

export async function createTransaction(call: MoonbeamCall): Promise<void> {
  const entity = await ensureTransaction(call.hash, call.blockNumber?.toString())
  const from = await ensureAccount(call.from.toString())
  const to = call.to ? await ensureAccount(call.to.toString()) : null

  entity.fromId = from.id
  entity.toId = to?.id
  entity.success = call.success
  entity.value = call.value.toBigInt()
  entity.nonce = call.nonce
  entity.gasLimit = call.gasLimit.toBigInt()
  entity.gasPrice = call.gasPrice?.toBigInt()
  entity.maxFeePerGas = call.maxFeePerGas?.toBigInt()
  entity.type = call.type
  //entity.data = call.data.toString()
  //entity.arguments = call.args?.toString()
  await entity.save()
} 
