import { updateAccount } from "../account";
import { DispatchedEventData } from "../utils/types";

export async function contractInstantiated(event: DispatchedEventData) {
    logger.info(event.rawEvent.event.data.toString())
}