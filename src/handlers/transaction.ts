import { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
import { Transaction } from "../types";
import { addContract, ensureAccount } from "./account";
import { ensureBlock } from "./block";
import { getTransactionReceipt } from "./utils/api";

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
  const receipt = await getTransactionReceipt(entity.id)
  
  entity.fromId = from.id
  entity.toId = to?.id
  entity.success = call.success
  entity.value = call.value.toBigInt()
  entity.nonce = call.nonce
  entity.gasLimit = call.gasLimit.toNumber()
  entity.gasPrice = call.gasPrice?.toNumber()
  entity.maxFeePerGas = call.maxFeePerGas?.toNumber()
  entity.gasUsed = receipt.gasUsed
  entity.cumulativeGasUsed = receipt.cumulativeGasUsed
  if (receipt.contractAddress) {
    addContract(receipt.contractAddress, from.id, entity.id)
  }
  //entity.data = call.data.toString()
  //entity.arguments = call.args?.toString()
  await entity.save()
} 
