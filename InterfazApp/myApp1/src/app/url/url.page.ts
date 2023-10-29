import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-url',
  templateUrl: './url.page.html',
  styleUrls: ['./url.page.scss'],
})
export class UrlPage implements OnInit {
  ip: string = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

  save(){
    this.api.updateUrl(this.ip);
  }

}
