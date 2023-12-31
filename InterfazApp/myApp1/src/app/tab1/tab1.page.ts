import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private api: ApiService) {}

  closeDoor(){
    this.api.doorClose().subscribe();
  }

  openDoor(){
    this.api.doorOpen().subscribe();
  }
}
