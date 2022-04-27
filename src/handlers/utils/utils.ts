import { AnyTuple, ArgsDef } from '@polkadot/types/types';
import { KVData } from '../../types'; 
import { SubstrateExtrinsic } from '@subql/types';
import { IEvent } from '@polkadot/types/types'
import { u32 } from '@polkadot/types'
import { DispatchError } from '@polkadot/types/interfaces'

export const getKVData = (data: AnyTuple, keys?: ArgsDef): KVData[] => {
    if (!data) return [];


    if (!keys) {
        return data.map((item, index) => {
            return {
                key: '' + index,
                type: (data as any).typeDef?.[index]?.type?.toString(),
                value: item?.toString()
            }
        })
    }

    return Object.keys(keys).map((_key, index) => {
        return {
            key: _key,
            type: (data[index] as any).type,
            value: data[index]?.toString()
        }
    })
}

export const getBatchInterruptedIndex = (extrinsic: SubstrateExtrinsic): number => {
    const { events } = extrinsic

    const interruptedEvent = events.find((event) => {
        const _event = event?.event

        if (!_event) return false

        const { section, method } = _event

        return section === 'utility' && method === 'BatchInterrupted'
    })

    if (interruptedEvent) {
        const { data } = (interruptedEvent.event as unknown) as IEvent<[u32, DispatchError]>

        return Number(data[0].toString())
    }

    return -1
}
