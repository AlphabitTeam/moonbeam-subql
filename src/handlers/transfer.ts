import { Transfer } from "../types"
import { ensureAccount } from "./account";
import { ensureExtrinsic } from "./extrinsic";
import { ensureToken } from "./token";
import { DispatchedLogData } from "./utils/types";

export async function ensureTransfer(hash: string) {
    let entity = await Transfer.get(hash);
    if(!entity) {
        entity = new Transfer(hash);
        entity.save()
    }
    return entity;
}

export async function createTransfer(data: DispatchedLogData) {
    const transfer = await ensureTransfer(data.rawEvent.transactionHash);
    const token = await ensureToken(data.rawEvent.address);
    const from = await ensureAccount(`0x${data.rawEvent.topics[1].slice(-40)}`);
    const to = await ensureAccount(`0x${data.rawEvent.topics[2].slice(-40)}`);
    const value = BigInt(data.rawEvent.data);
    const extrinsic = await ensureExtrinsic(data.rawEvent.transactionHash);
    transfer.fromId = from.id;
    transfer.toId = to.id;
    transfer.tokenId = token.id;
    transfer.amount = value;
    transfer.timestamp = data.event.timestamp;
    transfer.isSuccess = extrinsic.isSuccess;
    transfer.extrinsicId = extrinsic.id;    
    await transfer.save()
}