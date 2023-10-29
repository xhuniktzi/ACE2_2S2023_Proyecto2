import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  items: string[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.notificationsStack.subscribe((data: string[]) => {
      this.items = data;
    });
  }

}
