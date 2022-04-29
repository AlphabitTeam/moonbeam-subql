import { Token } from "../types";

export async function ensureToken(address: string){
    let entity = await Token.get(address);
    if (!entity) {
        entity = Token.create({
            id: address,
            txCount: BigInt(0)
        });
        await entity.save();
    }
  return entity;

}