import { updateAccount, ensureAccount } from "../account";
import { ensureTransaction } from "../transaction";
import { DispatchedEventData } from "../utils/types";

export async function newAccount(event: DispatchedEventData) {
    const [accountId] = event.rawEvent.event.data.toJSON() as [string];
    const createdAt = event.rawEvent.hash.toString();
    const creator = event.rawEvent.extrinsic?.extrinsic.signer.toString();
    await updateAccount(accountId, createdAt, creator, false)
}

export async function extrinsicSuccess(event: DispatchedEventData) {
    const data = event.rawEvent.event.data.toJSON()[0];
    const call = await ensureTransaction(event.rawEvent.extrinsic.extrinsic.hash.toString());
    call.gasUsed += BigInt(data.weight);
    await call.save();
}