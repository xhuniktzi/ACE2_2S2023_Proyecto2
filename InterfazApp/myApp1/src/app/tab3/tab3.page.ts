import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private api: ApiService) {}

  windV2(){
    this.api.windV2().subscribe();
  }

  windV1(){
    this.api.windV1().subscribe();
  }

  windOff(){
    this.api.windOff().subscribe();
  }
}
