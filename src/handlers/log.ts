import { MoonbeamEvent } from "@subql/contract-processors/dist/moonbeam";
import { Log } from '../types'
import { ensureAccount } from "./account";
import { ensureBlock } from "./block";
import { ensureTransaction } from "./transaction";

export async function ensureLog(event: MoonbeamEvent): Promise<Log> {
  const transaction = await ensureTransaction(event.transactionHash,
    event.blockNumber.toString())
  const transactionIndex = event.transactionIndex
  const logIndex = event.logIndex
  const recordId = `${transaction.id}-${logIndex}`
  let entity = await Log.get(recordId)
  if (!entity) {
    entity = Log.create({
      id: recordId,
      transactionId: transaction.id,
      transactionIndex: transactionIndex,
      logIndex: logIndex
    })
    await entity.save()
  }
  return entity
}

export async function createLog(event: MoonbeamEvent): Promise<void> {
  const entity = await ensureLog(event)
  const block = await ensureBlock(event.blockNumber.toString())
  const address = await ensureAccount(event.address)
  entity.blockNumber = block.number
  entity.timestamp = event.blockTimestamp
  //null address probably means internalTransaction (So far, not true. No internalTransaction)  
  entity.address = address.id
  entity.removed = event.removed
  //data, topics, arguments
  await entity.save()
}
