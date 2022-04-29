import { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
import { Call } from "../types";
import { ensureAccount } from "./account";
import { ensureExtrinsic } from "./extrinsic";

export async function ensureCall(recordId: string): Promise<Call> {
    let entity = await Call.get(recordId);
    if (!entity) {
        entity = new Call(recordId)
        await entity.save()
      }
    return entity
}

export async function createCall(call: MoonbeamCall): Promise<void> {
    const entity = await ensureCall(call.hash);
    entity.section = 'ethereum';
    entity.method = 'transact';
    entity.timestamp = new Date(call.timestamp);
    entity.isSuccess = call.success;
    const signer = await ensureAccount(call.from);
    entity.signerId = signer.id;
    const extrinsic = await ensureExtrinsic(call.hash);
    entity.args = extrinsic.args;
    entity.extrinsicId = extrinsic.id;
}