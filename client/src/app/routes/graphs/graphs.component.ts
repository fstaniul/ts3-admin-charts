import { ISubscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

import { TS3Administrator, RegData } from './../../api.service';
import { ApiService } from '../../api.service';

function checkDate(control: FormControl): any | null {
  const value = control.value;
  if (typeof value.month !== 'undefined' && typeof value.year !== 'undefined' && typeof value.day !== undefined) {
    return null;
  }
  return { selectedDateInvalid: true };
}

function atLeastOneSelected(control: FormControl) {
  const value = control.value;
  if (value.filter(val => !!val).length > 0) {
    return null;
  }
  return { notSelectedAdministrator: true };
}

export interface ChartType {
  type: string;
  name: string;
}

const CHART_TYPES: ChartType[] = [
  { type: 'bar', name: 'słupkowy' },
  { type: 'line', name: 'liniowy' }
];

const COLORS = [
  ['rgba(0, 123, 255, 1)', 'rgba(0, 123, 255, .3)'],
  ['rgba(240, 173, 78, 1)', 'rgba(240, 173, 78, .3)'],
  ['rgba(92, 184, 92, 1)', 'rgba(92, 184, 92, .3)'],
  ['rgba(217, 83, 79, 1)', 'rgba(217, 83, 79, .3)'],
  ['rgba(91, 192, 222, 1)', 'rgba(91, 192, 222, .3)'],
  ['rgba(99, 108, 114, 1)', 'rgba(99, 108, 114, .3)'],
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
  lastData: RegData = undefined;

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder
  ) {

  }

  ngOnInit() {
    this.loadData();
    this.chartTypeSelectSubscription = this.chartTypeSelectFormControl.valueChanges
      .subscribe(() => {
        if (this.lastData) {
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
      this.dataSelectionForm = this.formBuilder.group({
        ids: this.formBuilder.array(data.administrators.map(admin => false), atLeastOneSelected),
        from: [{}, checkDate],
        to: [{}, checkDate],
      });

      this.loadingState = 'LOADED';
      this.teamspeak3Administrators = data.administrators;
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
      this.lastData = data;
      this.refreshGraph(data);
    };

    const requestData = {
      from: this.dataSelectionForm.controls.from.value,
      to: this.dataSelectionForm.controls.to.value,
      ids: this.dataSelectionForm.controls.ids.value.map((val, id, arr) => {
        if (val) {
          return this.teamspeak3Administrators[id].databaseId;
        } else {
          return false;
        }
      }).filter(el => !!el),
    };

    this.api.getReg(requestData)
      .subscribe(success);
  }

  getColor(index) {
    const color = COLORS[index % COLORS.length];

    if (this.chartTypeSelectFormControl.value === 'line') {
      return [color[0], 'transparent'];
    }

    return color;
  }

  refreshGraph(data: RegData) {

    if (this.currentChart) {
      this.currentChart.destroy();
    }

    const datasets = data.data.map((info, index) => Object.assign({}, {
      backgroundColor: this.getColor(index)[1],
      borderColor: this.getColor(index)[0],
      pointBackgroundColor: this.getColor(index)[0],
      borderWidth: 2,
      pointRadius: 3,
    }, {
        label: info.label,
        data: info.count,
      }));

    this.currentChart = new Chart('chart', {
      type: this.chartTypeSelectFormControl.value,
      data: {
        labels: data.labels,
        datasets: datasets,
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
