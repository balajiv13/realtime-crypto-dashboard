/// <reference lib="webworker" />
import { TickerData, WorkerIn, WorkerOut } from '../models/market-data.model';
import { buildStreamUrl, parseTicker } from './ticker-parser';

let ws: WebSocket | undefined;
let flushTimer: ReturnType<typeof setInterval> | undefined;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let retry = 0;
let wanted: string[] = [];
const latest = new Map<string, TickerData>();

const send = (msg: WorkerOut) => postMessage(msg);

function closeSocket() {
    clearTimeout(reconnectTimer);
    if (ws) {
        ws.onclose = null;
        ws.onmessage = null;
        ws.close();
        ws = undefined;
    }
}

function open() {
    if (!wanted.length) return;
    closeSocket();
    send({ type: 'status', status: 'connecting' });
    ws = new WebSocket(buildStreamUrl(wanted));
    ws.onopen = () => { retry = 0; send({ type: 'status', status: 'open' }); };
    ws.onmessage = (e) => {
        try {
            const t = parseTicker(JSON.parse(e.data));
            if (t) latest.set(t.symbol, t);
        } catch { /* ignore malformed frames */ }
    };
    ws.onclose = () => {
        send({ type: 'status', status: 'closed' });
        if (wanted.length) {
            reconnectTimer = setTimeout(open, Math.min(1000 * 2 ** retry++, 30000));
        }
    };
}

addEventListener('message', ({ data }: MessageEvent<WorkerIn>) => {
    if (data.type === 'connect') {
        wanted = data.symbols;
        open();
        flushTimer ??= setInterval(() => {
            if (latest.size) {
                send({ type: 'batch', batch: { ts: Date.now(), tickers: [...latest.values()] } });
                latest.clear();
            }
        }, 1000);
    } else {
        wanted = [];
        closeSocket();
        clearInterval(flushTimer);
        flushTimer = undefined;
        latest.clear();
    }
});