import { BalanceOf } from '@polkadot/types/interfaces'
import { DispatchedEventData } from "../utils/types";
import { Candidate } from "../../types";
import { removeAllDelegations } from "./delegate"

export async function ensureCandidate(recordId: string, amount?: BalanceOf): Promise<Candidate> {
  recordId = recordId.toLowerCase()
  let entity = await Candidate.get(recordId)
  if (!entity) {
    entity = new Candidate(recordId)
    // The default amount is because of the genesis candidates
    // This was the self bonded on moonriver (not moonbeam)
    // There's got to be a better way to get genesis candidates
    entity.selfBonded = amount ? amount.toBigInt() : BigInt(10**21)
    await entity.save()
  }
  return entity
}

/**
 * For parachainStaking-JoinedCollatorCandidates event
 * @param data 
 */
export async function createCandidate(data: DispatchedEventData): Promise<void> {
  const [candidateId, amount, amountTotal] = data.rawEvent.event.data.toJSON() as [string, BalanceOf, BalanceOf]
  const entity = await ensureCandidate(candidateId, amount)
  entity.joined = data.rawEvent.block.timestamp
  await entity.save()
}

/**
 * For parachainStaking-CollatorChosen event
 * @param data 
 */
export async function chooseCandidate(data: DispatchedEventData): Promise<void> {
  const entity = await ensureCandidate(data.rawEvent.event.data[1].toString())
  entity.isChosen = true
  await entity.save()
}

/**
 * For parachainStaking-CandidateBondedLess and parachainStaking-CandidateBondedMore
 * parachainStaking-CollatorBondedLess and parachainStaking-CollatorBondedMore events
 * @param data 
 */
export async function changeSelfBonded(data: DispatchedEventData): Promise<void> {
  const [candidateId, amount, newBond] = data.rawEvent.event.data.toJSON() as [string, BalanceOf, BalanceOf]
  const entity = await ensureCandidate(candidateId)
  entity.selfBonded = newBond.toBigInt()
  await entity.save()
}

/**
 * For parachainStaking-CandidateLeft and parachainStaking-CollatorLeft events
 * @param data 
 */
export async function removeCandidate(data: DispatchedEventData): Promise<void> {
  const candidateId = data.rawEvent.event.data[0].toString().toLowerCase()
  await Candidate.remove(candidateId)
  await removeAllDelegations(null, candidateId)
}
