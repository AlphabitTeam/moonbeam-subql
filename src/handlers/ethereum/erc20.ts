import { ensureAccount } from "../account";
import { Erc20Token, Erc20Balance, Erc20Transfer } from "../../types";
import { DispatchedLogData } from "../utils/types";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function createErc20Transfer(
  data: DispatchedLogData
): Promise<void> {
  const token = await ensureToken(data.rawEvent.address);
  const from = await ensureAccount(`0x${data.rawEvent.topics[1].slice(-40)}`);
  const to = await ensureAccount(`0x${data.rawEvent.topics[2].slice(-40)}`);
  const value = BigInt(data.rawEvent.data);
  const transfer = Erc20Transfer.create({
    id: data.event.id,
    fromId: from.id,
    toId: to.id,
    tokenId: token.id,
    value: value,
    transactionHash: data.event.transactionId,
    transactionIndex: data.event.transactionIndex,
    blockNumber: data.event.blockNumber,
    timestamp: data.event.timestamp,
  });
  await transfer.save();

  // Minting and burning
  if (from.id === NULL_ADDRESS) {
    token.supply += value;
  } else if (to.id === NULL_ADDRESS) {
    token.supply -= value;
  }
  await token.save();

  // Edit balance
  const toBalance = await ensureBalance(token.id, to.id);
  toBalance.value += value;
  await toBalance.save();

  if (from.id != NULL_ADDRESS) {
    const fromBalance = await ensureBalance(token.id, from.id);
    fromBalance.value -= value;
    await fromBalance.save();
  }
}

async function ensureToken(address: string): Promise<Erc20Token> {
  let entity = await Erc20Token.get(address);
  if (!entity) {
    entity = Erc20Token.create({
      id: address,
      supply: BigInt(0),
    });
    await entity.save();
  }
  return entity;
}

async function ensureBalance(
  tokenId: string,
  accountId: string
): Promise<Erc20Balance> {
  const recordId = `${tokenId}-${accountId}`;
  let entity = await Erc20Balance.get(recordId);
  if (!entity) {
    entity = Erc20Balance.create({
      id: recordId,
      tokenId: tokenId,
      accountId: accountId,
      value: BigInt(0),
    });
    await entity.save();
  }
  return entity;
}
