import { BalanceOf } from '@polkadot/types/interfaces'
import { SubstrateEvent } from '@subql/types'
import { Proposal, Referendum, Timeline } from '../../types'
import { DispatchedEventData } from "../utils/types"

function getTimeline(data: DispatchedEventData): Timeline {
  const timeline = {
    status: data.rawEvent.event.method,
    extrinsic: data.event.extrinsicId,
    timestamp: data.rawEvent.block.timestamp
  }
  return timeline
}

async function ensureProposal(recordId: string): Promise<Proposal> {
  let entity = await Proposal.get(recordId)
  if (!entity) {
    entity = new Proposal(recordId)
    entity.propIndex = Number(recordId)
    await entity.save()
  }
  return entity
}

async function ensureReferendum(recordId: string): Promise<Referendum> {
  let entity = await Referendum.get(recordId)
  if (!entity) {
    entity = new Referendum(recordId)
    entity.refIndex = Number(recordId)
    await entity.save()
  }
  return entity
}

export async function createProposal(data: DispatchedEventData): Promise<void> {
  const [propIndex, deposit] = data.rawEvent.event.data.toJSON() as [string, BalanceOf]
  const entity = await ensureProposal(propIndex)
  entity.deposit = deposit.toBigInt()
  entity.author = data.rawEvent.extrinsic?.extrinsic.signer.toString()
  entity.preimage = data.rawEvent.extrinsic?.extrinsic.args[0].toString()
  entity.timeline = [getTimeline(data)]
  await entity.save()
}

export async function updateProposal(data: DispatchedEventData): Promise<void> {
  const entity = await ensureProposal(data.rawEvent.event.data[0].toString())
  const timeline = getTimeline(data)
  if (entity.timeline) {
    entity.timeline.push(timeline)
  } else {
    entity.timeline = [timeline]
  }
  await entity.save()
}


export async function createReferendum(data: DispatchedEventData): Promise<void> {
  const [refIndex, threshold] = data.rawEvent.event.data.toJSON() as [string, string]
  const entity = await ensureReferendum(refIndex)
  entity.threshold = threshold
  entity.timeline = [getTimeline(data)]
  await entity.save()
}

export async function updateReferendum(data: DispatchedEventData): Promise<void> {
  const entity = await ensureReferendum(data.rawEvent.event.data[0].toString())
  const timeline = getTimeline(data)
  if (entity.timeline) {
    entity.timeline.push(timeline)
  } else {
    entity.timeline = [timeline]
  }
  entity.executed = entity.executed || (timeline.status==='Executed')
  await entity.save()
}
