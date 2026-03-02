import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EspService {
  private baseUrl = 'http://192.168.4.1';

  constructor(private http: HttpClient) {}

  status() {
    return this.http.get(`${this.baseUrl}/status`);
  }

  ligar() {
    return this.http.post(`${this.baseUrl}/on`, {});
  }

  desligar() {
    return this.http.post(`${this.baseUrl}/off`, {});
  }
}