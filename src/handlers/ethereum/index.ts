import { ensureCall } from "../call"
import { DispatchedExtrisicData, DispatchedLogData } from "../utils/types"
import { createErc20Transfer } from "./erc20"
import { createErc721Transfer } from "./erc721"

export async function handleTokenTransfer(data:DispatchedLogData): Promise<void> {
  if (data.rawEvent.topics.length === 3) {
    await createErc20Transfer(data)
  } else {
    await createErc721Transfer(data)
  }
}

export async function handleTransact(data: DispatchedExtrisicData): Promise<void> {
  const call = await ensureCall(data.extrinsic.id);
  call.method = data.extrinsic.method;
  call.section = data.extrinsic.section;
  call.signerId = data.extrinsic.signerId;
  call.isSuccess = data.extrinsic.isSuccess;
  call.args = data.extrinsic.args;
  call.timestamp = data.extrinsic.timestamp;
  call.extrinsicId = data.extrinsic.id;
  await call.save();
}