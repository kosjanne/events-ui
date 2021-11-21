import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { AnomalyData, EventsChartService } from './events-chart.service';

@Component({
  selector: 'events-chart',
  templateUrl: './events-chart.component.html',
  providers: [EventsChartService],
})
export class EventsChart implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private canvas?: ElementRef;

  chart?: Chart;
  private destroy = new Subject<boolean>();

  constructor(private chartDataService: EventsChartService) {}

  ngAfterViewInit(): void {
    Chart.register(...registerables);
    this.chart = new Chart(this.canvas?.nativeElement, this.config as any);

    this.chartDataService.anomalies$
      .pipe(takeUntil(this.destroy))
      .subscribe((chartData) => this.newData(chartData));
    this.chartDataService.start();
  }

  ngOnDestroy(): void {
    this.chartDataService.stop();
    this.destroy.next(true);
    this.destroy.complete();
  }

  private newData(anomalyData: ReadonlyArray<AnomalyData>): void {
    const chartData = {
      labels: anomalyData.map((d) => d.deviceId),
      datasets: [
        {
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)'],
          data: anomalyData.map((d) => d.anomalies),
        },
      ],
    };
    if (this.chart) {
      this.chart.data = chartData;
      this.chart.update('none');
    }
  }

  config = {
    type: 'bar',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          display: false,
        },
        title: {
          display: true,
          text: 'Anomalies for the past 1 hour',
        },
      },
    },
  };
}
