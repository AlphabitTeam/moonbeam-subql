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
  {key: 'parachainStaking-CandidateBondedMore', handler: dummyFunction},
  {key: 'parachainStaking-CandidateLeft', handler: dummyFunction},
  {key: 'parachainStaking-CollatorBondedMore', handler: dummyFunction},
  {key: 'parachainStaking-CollatorBondedLess', handler: dummyFunction},
  {key: 'parachainStaking-CollatorChosen', handler: dummyFunction},
  {key: 'parachainStaking-CollatorLeft', handler: dummyFunction},
  {key: 'parachainStaking-Delegation', handler: dummyFunction},
  {key: 'parachainStaking-DelegationDecreased', handler: dummyFunction},
  {key: 'parachainStaking-DelegationIncreased', handler: dummyFunction},
  {key: 'parachainStaking-DelegatorLeft', handler: dummyFunction},
  {key: 'parachainStaking-DelegatorLeftCandidate', handler: dummyFunction},
  {key: 'parachainStaking-JoinedCollatorCandidates', handler: dummyFunction},
  {key: 'parachainStaking-Nomination', handler: dummyFunction},
  {key: 'parachainStaking-NominationDecreased', handler: dummyFunction},
  {key: 'parachainStaking-NominationIncreased', handler: dummyFunction},
  {key: 'parachainStaking-NominatorLeft', handler: dummyFunction},
  {key: 'parachainStaking-NominatorLeftCollator', handler: dummyFunction},
  {key: 'parachainStaking-Rewarded', handler: dummyFunction},
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
