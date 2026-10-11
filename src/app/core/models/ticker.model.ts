import { TickerData } from "./market-data.model";

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

export type WorkerOut =
    | { type: 'status'; status: ConnectionStatus }
    | { type: 'batch'; batch: TickerData };
    