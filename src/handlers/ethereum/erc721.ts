import { ensureAccount } from '../account'
import { Erc721Token, Erc721Balance, Erc721Transfer } from '../../types'
import { DispatchedLogData } from '../utils/types'
import { ensureTransaction } from '../transaction'

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export async function createErc721Transfer(data: DispatchedLogData): Promise<void> {
  // create Transfer, Edit Balance, 
  const token = await ensureToken(data.rawEvent.address)
  const from = await ensureAccount(`0x${data.rawEvent.topics[1].slice(-40)}`)
  const to = await ensureAccount(`0x${data.rawEvent.topics[2].slice(-40)}`)
  const value = BigInt(data.rawEvent.topics[3])
  const tx = await ensureTransaction(data.rawEvent.transactionHash)
  const transfer = Erc721Transfer.create({
    id: data.event.id,
    fromId: from.id,
    toId: to.id,
    tokenId: token.id,
    value: value,
    transactionId: tx.id,
    timestamp: data.event.timestamp
  })
  await transfer.save()
  await setBalance(token.id, to.id, value)
}

async function ensureToken(address: string): Promise<Erc721Token> {
  let entity = await Erc721Token.get(address)
  if (!entity) {
    entity = Erc721Token.create({
      id: address
    })
    await entity.save()
  }
  return entity
}

async function setBalance(tokenId: string, accountId: string, value: bigint): Promise<void> {
  const recordId = `${tokenId}-${value}`
  if (accountId === NULL_ADDRESS) {
    await Erc721Balance.remove(recordId)
  } else {
    const entity = Erc721Balance.create({
      id: recordId,
      tokenId: tokenId,
      accountId: accountId,
      value: value
    })
    await entity.save()
  }
}
