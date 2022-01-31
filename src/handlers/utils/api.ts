import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountType } from './types';

export async function getAccount(address:string): Promise<AccountType> {
  const account: [nonce, balance] = await api.query.system.account(address)
  return account as AccountType
}
