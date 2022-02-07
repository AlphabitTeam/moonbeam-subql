import { DispatchedLogData } from "../utils/types"
import { createErc20Transfer } from "./erc20"
import { createErc721Transfer } from "./erc721"

export async function handleTokenTransfer(data:DispatchedLogData): Promise<void> {
  if (data.rawEvent.topics.length === 3) {
    await createErc20Transfer(data)
  } else {
    await createErc721Transfer(data)
  }
}
