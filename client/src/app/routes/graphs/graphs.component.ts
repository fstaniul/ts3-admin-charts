import { ISubscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { TS3Administrator } from './../../api.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit, OnDestroy {
  loadingState: 'LOADING' | 'ERROR' | 'LOADED' = 'LOADING';
  errorMsg: string | undefined = '';
  teamspeak3Administrators: TS3Administrator[] = [];
  TS3AdministratorsSelectFormControl: FormControl = new FormControl(null);
  TS3AdministratorsSelectFromControlChangeSubscription: ISubscription;
  selectedTS3Administrator: TS3Administrator;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadData();
    this.TS3AdministratorsSelectFromControlChangeSubscription =
      this.TS3AdministratorsSelectFormControl.valueChanges.subscribe(selected =>
        this.selectedTS3Administrator = selected
      );
  }

  ngOnDestroy(): void {
    this.TS3AdministratorsSelectFromControlChangeSubscription.unsubscribe();
  }

  loadData(): void {
    const successHandler = (data) => {
      this.loadingState = 'LOADED';
      this.teamspeak3Administrators = data.administrators;
      this.TS3AdministratorsSelectFormControl.setValue(this.teamspeak3Administrators[0], { onlySelf: true });
    };

    const errorHandler = (err) => {
      console.log(err);
      this.loadingState = 'ERROR';
      this.errorMsg = 'Wystąpił błąd!';
    };

    this.api.getTs3Admins()
      .subscribe(successHandler, errorHandler);
  }

  closeAlert(): void {
    this.errorMsg = undefined;
  }
}