import { AccountType, EthBlock, TransactionReceipt } from './types';

export async function getAccount(address:string): Promise<AccountType> {
  const account: unknown = await api.query.system.account(address)
  return account as AccountType
}

export async function getEthBlock(blockNumber: bigint): Promise<EthBlock> {
  const block: unknown = await api.rpc.eth.getBlockByNumber(blockNumber, true)
  return block as EthBlock
}

export async function getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
  const transaction: unknown = await api.rpc.eth.getTransactionReceipt(hash)
  return transaction as TransactionReceipt
}
