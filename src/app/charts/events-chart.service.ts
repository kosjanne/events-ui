import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export interface AnomalyData {
  deviceId: string;
  anomalies: number;
}

@Injectable()
export class EventsChartService {
  private intervalSource = interval(5000);
  private anomaliesSubject = new BehaviorSubject<ReadonlyArray<AnomalyData>>([
    { deviceId: 'abc', anomalies: 0 },
    { deviceId: '123', anomalies: 0 },
  ]);
  anomalies$ = this.anomaliesSubject.asObservable();
  intervalSubscription?: Subscription;

  start(): void {
    if (!this.intervalSubscription) {
      this.intervalSubscription = this.intervalSource.subscribe((_) =>
        this.reportNewValues()
      );
    }
  }

  stop(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = undefined;
    }
  }

  private reportNewValues(): void {
    this.anomaliesSubject.next([
      {
        deviceId: 'abc',
        anomalies: Math.floor(Math.random() * 11),
      },
      {
        deviceId: '123',
        anomalies: Math.floor(Math.random() * 11),
      },
    ]);
  }
}
