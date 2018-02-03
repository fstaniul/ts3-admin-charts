import { ISubscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

import { TS3Administrator, RegResponse, RegData } from './../../api.service';
import { ApiService } from '../../api.service';

function checkDate(control: FormControl): any | null {
  const value = control.value;
  if (typeof value.month !== 'undefined' && typeof value.year !== 'undefined' && typeof value.day !== undefined) {
    return null;
  }
  return { selectedDateInvalid: true };
}

export interface ChartType {
  type: string;
  name: string;
}

const CHART_TYPES: ChartType[] = [
  {type: 'bar', name: 'słupkowy'},
  {type: 'line', name: 'liniowy'}
];

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit, OnDestroy {
  loadingState: 'LOADING' | 'ERROR' | 'LOADED' = 'LOADING';
  errorMsg: string | undefined = '';
  teamspeak3Administrators: TS3Administrator[] = [];
  dataSelectionForm: FormGroup;
  @ViewChild('canvas') canvas: ElementRef;
  currentChart: Chart;
  chartTypeSelectFormControl: FormControl = new FormControl(CHART_TYPES[0].type);
  chartTypeSelectSubscription: ISubscription;
  chartTypes: ChartType[] = CHART_TYPES;
  lastData: RegData[] = [];

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder
  ) {
    this.dataSelectionForm = this.formBuilder.group({
      id: [''],
      from: [{}, checkDate],
      to: [{}, checkDate],
    });
  }

  ngOnInit() {
    this.loadData();
    this.chartTypeSelectSubscription = this.chartTypeSelectFormControl.valueChanges
      .subscribe(() => {
        if (this.lastData.length > 0) {
          this.refreshGraph(this.lastData);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.chartTypeSelectSubscription) {
      this.chartTypeSelectSubscription.unsubscribe();
    }
  }

  loadData(): void {
    const successHandler = (data) => {
      this.loadingState = 'LOADED';
      this.teamspeak3Administrators = data.administrators;
      this.dataSelectionForm.controls.id.setValue(
        this.teamspeak3Administrators[0].databaseId, { onlySelf: true }
      );
    };

    const errorHandler = (err) => {
      console.log(err);
      this.loadingState = 'ERROR';
      this.errorMsg = 'Wystąpił błąd!';
    };

    this.api.getTs3Admins()
      .subscribe(successHandler, errorHandler);
  }

  getInputErrorClasses(controlName: string): any {
    const control = this.dataSelectionForm.controls[controlName];
    return { 'is-invalid': control.invalid && (control.touched || control.dirty) };
  }

  shouldShowError(controlName: string): boolean {
    const control = this.dataSelectionForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit() {
    if (this.dataSelectionForm.invalid || !this.dataSelectionForm.touched) {
      Object.keys(this.dataSelectionForm.controls).map(key => this.dataSelectionForm.controls[key])
        .forEach(control => control.markAsDirty());
      return;
    }

    const success = data => {
      this.lastData = data.data;
      this.refreshGraph(data.data);
    };
    const error = err => console.log(err);

    this.api.getReg(this.dataSelectionForm.value)
      .subscribe(success, error);
  }

  refreshGraph(data: RegData[]) {
    const labels = data.map(el => /^(\d{4}-\d{2}-\d{2})/.exec(el.date.toISOString())[1]);
    const countData = data.map(el => el.count);

    this.currentChart = new Chart('chart', {
      type: this.chartTypeSelectFormControl.value,
      data: {
        labels: labels,
        datasets: [{
          label: 'Zarejestrowanych użytkowników',
          data: countData,
          backgroundColor: 'rgba(0, 123, 255, .3)',
          borderColor: 'rgba(0, 123, 255, 1)',
          pointBackgroundColor: 'rgba(0, 86, 179, 0.5)',
          borderWidth: 3,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }

  closeAlert(): void {
    this.errorMsg = undefined;
  }
}
