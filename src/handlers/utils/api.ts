import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountType } from './types';

const wsProvider = new WsProvider('wss://moonbeam.api.onfinality.io/public-ws');

export async function getAccount(address:string): Promise<AccountType> {
  // Would be better if the ws connection is opened throughout instead of per function
  const api = await ApiPromise.create({ provider: wsProvider });
  const account: unknown = await api.query.system.account(address)
  return account as AccountType
}
