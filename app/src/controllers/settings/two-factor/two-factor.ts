import { Component } from 'angular2/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { RouterLink } from "angular2/router";

import { Client } from '../../../services/api';
import { Material } from '../../../directives/material';


@Component({
  selector: 'minds-settings-two-factor',
  inputs: ['object'],
  templateUrl: 'src/controllers/settings/two-factor/two-factor.html',
  directives: [ CORE_DIRECTIVES, Material, RouterLink, FORM_DIRECTIVES]
})

export class SettingsTwoFactor{

  minds : Minds;
  telno : number;
  secret;
  waitingForCheck : boolean = false;

  inProgress : boolean = false;
  error : string = "";

  constructor(public client: Client){
    this.minds = window.Minds;
    this.load();
  }

  load(){
    this.inProgress = true;
    this.client.get('api/v1/twofactor')
      .then((response : any) => {
        if(response.telno)
          this.telno = response.telno;
        this.inProgress = false;
      });
  }

  setup(smsNumber : any){
    this.telno = smsNumber;
    this.waitingForCheck = true;
    this.error = "";
    this.client.post('api/v1/twofactor/setup', { tel: smsNumber })
      .then((response : any) => {
        this.secret = response.secret;
      })
      .catch(() => {
        this.waitingForCheck = false;
        this.telno = null;
        this.error = "The number you entered was incorrect";
      })
  }

  check(code : number){
    this.client.post('api/v1/twofactor/check/' + this.secret, {
        code: code,
        telno: this.telno
      })
      .then((response : any) => {
        this.waitingForCheck = false;
      })
      .catch((response : any) => {
        this.waitingForCheck = false;
        this.telno = null;
        this.error = "The code was incorrect. Try again.";
      });
  }

  retry(){
    this.telno = null;
    this.waitingForCheck = false;
  }

  cancel(){
    this.client.delete('api/v1/twofactor');
    this.telno = null;
    this.error = "";
  }

}
