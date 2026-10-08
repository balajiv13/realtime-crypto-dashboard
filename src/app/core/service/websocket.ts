import { Injectable, OnDestroy } from '@angular/core';
import { delay, Observable, retryWhen, Subject, take, takeUntil } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {

  private socket$!: WebSocketSubject<any>;
  private readonly destroy$ = new Subject<void>();

  /**
   * Connects to a WebSocket endpoint and returns an untyped cold observable stream
   * Includes an auto-reconnect strategy if the market feed drops
   */
  public connect(url: string): Observable<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url,
        deserializer: (e) => JSON.parse(e.data),
      });
    }
    return this.socket$.asObservable().pipe(
      retryWhen((errors) => errors.pipe(delay(3000))),
      takeUntil(this.destroy$)
    )
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }


  ngOnDestroy(): void {
    // Cleanup logic for the websocket connection
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
