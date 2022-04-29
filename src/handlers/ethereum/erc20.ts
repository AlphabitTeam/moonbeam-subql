import { ensureAccount } from "../account";
import { Erc20Token, Erc20Balance, Erc20Transfer } from "../../types";
import { DispatchedLogData } from "../utils/types";
import { ensureTransaction } from "../transaction";
import { ensureToken } from "../token";
import { getContractInfo, getIssuannce } from "../utils/api";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function createErc20Transfer(
  data: DispatchedLogData
): Promise<void> {
  const erc20token = await ensureERC20Token(data.rawEvent.address);
  const token = await ensureToken(data.rawEvent.address);
  const from = await ensureAccount(`0x${data.rawEvent.topics[1].slice(-40)}`);
  const to = await ensureAccount(`0x${data.rawEvent.topics[2].slice(-40)}`);
  const value = BigInt(data.rawEvent.data);
  const tx = await ensureTransaction(data.rawEvent.transactionHash)
  const transfer = Erc20Transfer.create({
    id: data.event.id,
    fromId: from.id,
    toId: to.id,
    tokenId: erc20token.id,
    value: value,
    transactionId: tx.id,
    timestamp: data.event.timestamp,
  });
  await transfer.save();

  // Minting and burning
  if (from.id === NULL_ADDRESS) {
    erc20token.totalSupply += value;
  } else if (to.id === NULL_ADDRESS) {
    erc20token.totalSupply -= value;
  }
  
  erc20token.contract_address = data.rawEvent.address;
  await erc20token.save();

  //add txCount 
  token.txCount += BigInt(1);

  // Edit balance
  const toBalance = await ensureBalance(erc20token.id, to.id);
  toBalance.value += value;
  await toBalance.save();

  if (from.id != NULL_ADDRESS) {
    const fromBalance = await ensureBalance(erc20token.id, from.id);
    fromBalance.value -= value;
    await fromBalance.save();
  }
}

async function ensureERC20Token(address: string): Promise<Erc20Token> {
  let entity = await Erc20Token.get(address);
  if (!entity) {
    entity = Erc20Token.create({
      id: address,
      totalSupply: BigInt(0),
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
