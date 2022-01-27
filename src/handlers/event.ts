import { SubstrateEvent } from "@subql/types";
import { Event } from "../types";
import { ensureBlock } from "./block";
import { ensureExtrinsic } from "./extrinsic";
import { Dispatcher } from "./utils/dispatcher";
import { DispatchedEventData } from "./utils/types";
import { balanceSet, deposit, dustLost, endowed, reserved,
  reserveRepatriated, slashed, transfer, unreserved, withdraw
} from "./balances";
import { createProposal, updateProposal,
  createReferendum, updateReferendum
} from "./democracy";
import { createCandidate, createDelegation, createReward,
  chooseCandidate, removeCandidate,
  removeDelegator, removeDelegation,
  changeDelegation, changeSelfBonded
 } from "./staking";

const dispatch = new Dispatcher<DispatchedEventData>();
async function dummyFunction(): Promise<void> { }

dispatch.batchRegist([
  // Balances
  {key: 'balances-BalanceSet', handler: balanceSet},
  {key: 'balances-Deposit', handler: deposit},
  {key: 'balances-DustLost', handler: dustLost},
  {key: 'balances-Endowed', handler: endowed},
  {key: 'balances-Reserved', handler: reserved},
  {key: 'balances-ReserveRepatriated', handler: reserveRepatriated},
  {key: 'balances-Slashed', handler: slashed},
  {key: 'balances-Transfer', handler: transfer},
  {key: 'balances-Unreserved', handler: unreserved},
  {key: 'balances-Withdraw', handler: withdraw},

  // Democracy
  {key: 'democracy-Cancelled', handler: updateReferendum},
  {key: 'democracy-Executed', handler: updateReferendum},
  {key: 'democracy-NotPassed', handler: updateReferendum},
  {key: 'democracy-Passed', handler: updateReferendum},
  {key: 'democracy-Proposed', handler: createProposal},
  {key: 'democracy-Started', handler: createReferendum},
  {key: 'democracy-Tabled', handler: updateProposal},
  
  // Ethereum/EVM
  {key: 'ethereum-Executed', handler: dummyFunction},
  
  // Identity
  {key: 'identity-IdentityCleared', handler: dummyFunction},
  {key: 'identity-IdentityKilled', handler: dummyFunction},
  {key: 'identity-IdentitySet', handler: dummyFunction},

  // Staking
  // Lingo really change between spec versions
  // e.g Collator to Candidate and Nomination to Delegation
  {key: 'parachainStaking-CandidateBondedLess', handler: changeSelfBonded},
  {key: 'parachainStaking-CandidateBondedMore', handler: changeSelfBonded},
  {key: 'parachainStaking-CandidateLeft', handler: removeCandidate},
  {key: 'parachainStaking-CollatorBondedLess', handler: changeSelfBonded},
  {key: 'parachainStaking-CollatorBondedMore', handler: changeSelfBonded},
  {key: 'parachainStaking-CollatorChosen', handler: chooseCandidate},
  {key: 'parachainStaking-CollatorLeft', handler: removeCandidate},
  {key: 'parachainStaking-Delegation', handler: createDelegation},
  {key: 'parachainStaking-DelegationDecreased', handler: changeDelegation},
  {key: 'parachainStaking-DelegationIncreased', handler: changeDelegation},
  {key: 'parachainStaking-DelegatorLeft', handler: removeDelegator},
  {key: 'parachainStaking-DelegatorLeftCandidate', handler: removeDelegation},
  {key: 'parachainStaking-JoinedCollatorCandidates', handler: createCandidate},
  {key: 'parachainStaking-Nomination', handler: createDelegation},
  {key: 'parachainStaking-NominationDecreased', handler: changeDelegation},
  {key: 'parachainStaking-NominationIncreased', handler: changeDelegation},
  {key: 'parachainStaking-NominatorLeft', handler: removeDelegator},
  {key: 'parachainStaking-NominatorLeftCollator', handler: removeDelegation},
  {key: 'parachainStaking-Rewarded', handler: createReward},
])

export async function ensureEvent(event: SubstrateEvent): Promise<Event> {
  const block = await ensureBlock(event.block.block.header.number.toString())
  const idx = event.idx
  const recordId = `${block.id}-${idx}`
  let entity = await Event.get(recordId)
  if (!entity) {
    entity = Event.create({
      id: recordId,
      blockId: block.id,
      blockNumber: block.number,
      index: idx
    })
    await entity.save()
  }
  return entity
}

export async function createEvent(event: SubstrateEvent): Promise<void> {
  const entity = await ensureEvent(event)
  entity.section = event.event.section
  entity.method = event.event.method
  //docs, argument, data
  if (event.extrinsic) {
    const extrinsic = await ensureExtrinsic(event.extrinsic)
    entity.extrinsicId = extrinsic.id
  }
  await entity.save()
  // day, sections
}
