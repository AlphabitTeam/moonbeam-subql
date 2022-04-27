import { SubstrateExtrinsic } from "@subql/types";
import type { Vec } from '@polkadot/types'
import { Call, Extrinsic } from "../../types";
import { AnyCall, DispatchedExtrisicData } from "../utils/types";
import { getBatchInterruptedIndex, getKVData } from "../utils/utils";
import { ensureCall } from "../call";

async function traverseExtrinsic(extrinsic: Extrinsic, raw: SubstrateExtrinsic): Promise<Call[]> {
    const list = [];
    const batchInterruptedIndex = getBatchInterruptedIndex(raw)
    const inner = async (
        data: AnyCall,
        parentCallId: string,
        idx: number,
        isRoot: boolean,
        depth: number
      ) => {
        const id = isRoot ? parentCallId : `${parentCallId}-${idx}`
        const method = data.method
        const section = data.section
        const args = data.args
    
        const call = await ensureCall(id)
    
        call.method = method
        call.section = section
        call.args = getKVData(data.args, data.argsDef)
        call.signerId = extrinsic.signerId
        call.isSuccess = depth === 0 ? extrinsic.isSuccess : batchInterruptedIndex > idx;
        call.timestamp = extrinsic.timestamp
    
        if (!isRoot) {
          call.parentCallId = isRoot ? '' : parentCallId
    
          call.extrinsicId = parentCallId.split('-')[0]
        } else {
          call.extrinsicId = parentCallId
        }
    
        list.push(call)
    
        if (depth < 1) {
          const temp = args[0] as unknown as Vec<AnyCall>
    
          await Promise.all(temp.map((item, idx) => inner(item, id, idx, false, depth + 1)))
        } 
      }
    
      await inner(raw.extrinsic.method, extrinsic.id, 0, true, 0)
    
      return list

}

export async function handleBatch(data: DispatchedExtrisicData) {
    const calls = await traverseExtrinsic(data.extrinsic, data.rawExtrinsic)

    await Promise.all(calls.map(async (item) => item.save()));
}