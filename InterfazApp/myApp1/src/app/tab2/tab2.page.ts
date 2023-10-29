import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private api: ApiService) {}

  lightOn(){
    this.api.lightsOn().subscribe();
  }

  lightOff(){
    this.api.lightsOff().subscribe();
  }
}
