import { MoonbeamEvent } from "@subql/contract-processors/dist/moonbeam";
import { Log } from '../types'
import { ensureAccount } from "./account";
import { handleTokenTransfer } from "./ethereum";
import { ensureTransaction } from "./transaction";
import { Dispatcher } from "./utils/dispatcher";
import { DispatchedLogData } from "./utils/types";

const dispatch = new Dispatcher<DispatchedLogData>();
async function dummyFunction(): Promise<void> { }

dispatch.batchRegist([
  // ERC20 and ERC721 Transfer
  {
    key: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', 
    handler: handleTokenTransfer
  },
])

export async function ensureLog(event: MoonbeamEvent): Promise<Log> {
  const transaction = await ensureTransaction(event.transactionHash)
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
  const address = await ensureAccount(event.address)
  entity.timestamp = event.blockTimestamp
  //null address probably means internalTransaction (So far, not true. No internalTransaction)  
  entity.address = address.id
  entity.removed = event.removed
  entity.data = event.data
  entity.topics = event.topics
  entity.arguments = event.args?.toString()
  //data, topics, arguments
  await entity.save()
  await dispatch.dispatch(event.topics[0].toString(), {
    event: entity,
    rawEvent: event,
  });
}
