import { SubstrateEvent } from "@subql/types";
import { Dispatcher } from "./utils/dispatcher";
import { DispatchedEventData } from "./utils/types";
import { balanceSet, deposit, dustLost, endowed, reserved,
  reserveRepatriated, slashed, transfer, unreserved, withdraw, reward
} from "./balances";
import { extrinsicSuccess, newAccount } from "./system";
import { contractInstantiated } from "./contracts";

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
  //staking
  {key: 'parachainStaking-Rewarded', handler: reward},
  //system
  {key: 'system-NewAccount', handler: newAccount},
  {key: 'system-ExtrinsicSuccess', handler: extrinsicSuccess},
  //contract
  {key: 'contracts-Instantiated', handler: contractInstantiated}
])



export async function createEvent(event: SubstrateEvent): Promise<void> {

  await dispatch.dispatch(`${event.event.section}-${event.event.method}`, {
    rawEvent: event,
  });
  // day, sections
}
