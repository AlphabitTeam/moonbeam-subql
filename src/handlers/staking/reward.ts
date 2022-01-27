import { BalanceOf } from "@polkadot/types/interfaces";
import { DispatchedEventData } from "../utils/types";
import { Reward } from "../../types";
import { ensureAccount } from "../account";

/**
 * For parachainStaking-Rewarded event
 * @param data 
 */
export async function createReward(data: DispatchedEventData): Promise<void> {
  const [accountId, value] = data.rawEvent.event.data.toJSON() as [string, BalanceOf]
  const account = await ensureAccount(accountId)
  const entity = Reward.create({
    id: data.event.id,
    blockNumber: data.event.blockNumber,
    accountId: account.id,
    value: value.toBigInt(),
    timestamp: data.rawEvent.block.timestamp
  })
  await entity.save()
}
