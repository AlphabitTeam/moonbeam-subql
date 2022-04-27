import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { MoonbeamEvent, MoonbeamCall } from '@subql/contract-processors/dist/moonbeam';
import { createEvent, createExtrinsic, createLog, createTransaction } from '../handlers';
import { createCall } from "../handlers/call";


export async function handleBlock(block: SubstrateBlock): Promise<void> {
 
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  await createEvent(event)
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  await createExtrinsic(extrinsic)
}

export async function handleMoonbeamEvent(event: MoonbeamEvent): Promise<void> {
  await createLog(event)
}

export async function handleMoonbeamCall(call: MoonbeamCall): Promise<void> {
  await createTransaction(call)
  await createCall(call)
}
