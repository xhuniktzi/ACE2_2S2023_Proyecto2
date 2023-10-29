import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string = `${environment.baseIp}`;
  notificationsStack: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient) {
    setInterval(() => {
      this.http.get<string[]>(`${this.baseUrl}/notifications`).subscribe((data: string[]) => {
        this.notificationsStack.next(data);
        console.log(data);
      });
    }, 1000);
  }

  updateUrl(ip: string) {
    if (environment.production) {
      this.baseUrl = `http://${ip}`;
    }
  }

  lightsOn() {
    return this.http.get(`${this.baseUrl}/light/on`);
  }

  lightsOff() {
    return this.http.get(`${this.baseUrl}/light/off`);
  }

  windV2() {
    return this.http.get(`${this.baseUrl}/wind/v2`);
  }

  windV1() {
    return this.http.get(`${this.baseUrl}/wind/v1`);
  }

  windOff() {
    return this.http.get(`${this.baseUrl}/wind/off`);
  }

  doorOpen() {
    return this.http.get(`${this.baseUrl}/door/open`);
  }

  doorClose() {
    return this.http.get(`${this.baseUrl}/door/close`);
  }


}
