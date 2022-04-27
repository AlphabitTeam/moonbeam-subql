import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { Extrinsic, KVData } from "../types";
import { ensureAccount } from "./account";
import { handleTransact } from "./ethereum";
import { handleBatch } from "./utility";
import { Dispatcher } from "./utils/dispatcher";
import { DispatchedExtrisicData } from "./utils/types";
import { getKVData } from "./utils/utils";

const dispatcher = new Dispatcher<DispatchedExtrisicData>();

dispatcher.batchRegist([
  {key: 'utility-batch', handler: handleBatch},
  {key: 'utility-batchAll', handler: handleBatch},
  {key: 'ethereum-transact', handler: handleTransact}
])

export async function ensureExtrinsic(recordId: string): Promise<Extrinsic> {

  let entity = await Extrinsic.get(recordId)
  if (!entity) {
    entity = new Extrinsic(recordId)
    entity.hash = recordId
    await entity.save()
  }
  return entity
}

export async function createExtrinsic(extrinsic: SubstrateExtrinsic): Promise<void> {
  const entity = await ensureExtrinsic(extrinsic.extrinsic.hash.toString())
  const isSigned = extrinsic.extrinsic.isSigned
  if (isSigned) {
    const signerAccount = extrinsic.extrinsic.signer.toString()
    const signer = await ensureAccount(signerAccount)
    entity.signerId = signer.id
  }
  entity.isSigned = isSigned
  entity.section = extrinsic.extrinsic.method.section
  entity.method = extrinsic.extrinsic.method.method
  entity.isSuccess = extrinsic.success
  entity.timestamp = extrinsic.block.timestamp

  const args = extrinsic.extrinsic.args;
  const argDefs = extrinsic.extrinsic.argsDef;

  let argsData: KVData[] = getKVData(args, argDefs);
  
  entity.args = argsData;
  await entity.save()
  
  logger.info(`${entity.section}-${entity.method}`)

  await dispatcher.dispatch(`${entity.section}-${entity.method}`, {
    extrinsic: entity,
    rawExtrinsic: extrinsic
  })
  // day.extrinsics
}
