import { SubstrateBlock } from "@subql/types";
import { Block } from '../types'
import { getEthBlock } from "./utils/api";

export async function ensureBlock(recordId: string): Promise<Block> {
  let entity = await Block.get(recordId)
  if (!entity) {
    entity = new Block(recordId)
    entity.number = BigInt(recordId)
    await entity.save()
  }
  return entity
}

export async function createBlock(block: SubstrateBlock): Promise<void> {
  const entity = await ensureBlock(block.block.header.number.toString())
  const ethBlock = await getEthBlock(entity.number)
  
  entity.hash = block.block.hash.toString()
  entity.timestamp = block.timestamp
  entity.parentHash = block.block.header.parentHash.toString()
  entity.specVersion = block.specVersion
  entity.stateRoot = block.block.header.stateRoot.toString()

  entity.evmHash = ethBlock.evmHash
  entity.evmParentHash = ethBlock.evmParentHash
  entity.evmStateRoot = ethBlock.evmStateRoot
  entity.size = ethBlock.size
  entity.author = ethBlock.author
  entity.difficult = ethBlock.difficult
  entity.totalDifficulty = ethBlock.totalDifficulty
  entity.gasLimit = ethBlock.gasLimit
  entity.gasUsed = ethBlock.gasUsed
  entity.transactionsRoot = ethBlock.transactionsRoot
  entity.receiptsRoot = entity.receiptsRoot
  entity.sha3Uncles = entity.sha3Uncles

  await entity.save()
}
