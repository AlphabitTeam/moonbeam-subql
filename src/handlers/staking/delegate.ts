import { BalanceOf } from '@polkadot/types/interfaces'
import { DispatchedEventData } from "../utils/types";
import { Delegation, Delegator } from "../../types";
import { ensureCandidate } from './candidate'

async function ensureDelegator(recordId: string): Promise<Delegator> {
  recordId = recordId.toLowerCase()
  let entity = await Delegator.get(recordId)
  if (!entity) {
    entity = new Delegator(recordId)
    await entity.save()
  }
  return entity
}

async function ensureDelegation(delegatorId: string, candidateId: string): Promise<Delegation> {
  delegatorId = delegatorId.toLowerCase()
  candidateId = candidateId.toLowerCase()
  const recordId = `${delegatorId}-${candidateId}`
  let entity = await Delegation.get(recordId)
  if (!entity) {
    entity = new Delegation(recordId)
    entity.delegatorId = delegatorId
    entity.candidateId = candidateId
    entity.value = BigInt(0)
    await entity.save()
  }
  return entity
}

/**
 * For parachainStaking-Nomination and parachainStaking-Delegation event
 * @param data 
 */
export async function createDelegation(data: DispatchedEventData): Promise<void> {
  const [delegatorId, value, candidateId, added] = data.rawEvent.event.data.toJSON() as [string, BalanceOf, string, string]
  const delegator = await ensureDelegator(delegatorId)
  const candidate = await ensureCandidate(candidateId)
  const entity = await ensureDelegation(delegator.id, candidate.id)
  entity.value = value.toBigInt()
  await entity.save()
}

/**
 * For parachainStaking-DelegationDecreased, parachainStaking-DelegationIncreased,
 * parachainStaking-NominationDecreased, parachainStaking-NominationIncreased events
 * @param data 
 */
export async function changeDelegation(data: DispatchedEventData): Promise<void> {
  const [delegatorId, candidateId, value, isTop] = data.rawEvent.event.data.toJSON() as [string, string, BalanceOf, boolean]
  const delegator = await ensureDelegator(delegatorId)
  const candidate = await ensureCandidate(candidateId)
  const entity = await ensureDelegation(delegator.id, candidate.id)
  entity.value = value.toBigInt()
  await entity.save()
}

/**
 * For parachainStaking-DelegatorLeftCandidate and parachainStaking-NominatorLeftCandidate events
 * @param data 
 */
export async function removeDelegation(data: DispatchedEventData): Promise<void> {
  const [delegatorId, candidateId, unstakedAmount, newAmount] = data.rawEvent.event.data.toJSON() as [string, string, BalanceOf, BalanceOf]
  const entity = await ensureDelegation(delegatorId, candidateId)
  await Delegation.remove(entity.id)
}


/**
 * For parachainStaking-DelegatorLeft and parachainStaking-NominatorLeft events
 * @param data 
 */
export async function removeDelegator(data: DispatchedEventData): Promise<void> {
  await removeAllDelegations(data.rawEvent.event.data[0].toString().toLowerCase())
}

export async function removeAllDelegations(delegatorId?: string, candidateId?: string): Promise<void> {
  if (delegatorId) {
    const delegations = await Delegation.getByDelegatorId(delegatorId.toLowerCase())
    delegations.map(d => Delegation.remove(d.id).then())
  }
  if (candidateId) {
    const delegations = await Delegation.getByCandidateId(candidateId.toLowerCase())
    delegations.map(d => Delegation.remove(d.id).then())
  }
}
