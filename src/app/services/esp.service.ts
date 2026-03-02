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
    return this.http.get(`${this.baseUrl}/ligar?turn=on`, {});
  }

  desligar() {
    return this.http.get(`${this.baseUrl}/ligar?turn=off`, {});
  }

  setTime(dia: number, mes: number, ano: number, hora: number, min: number, seg: number) {
  const url = `${this.baseUrl}/settime?dia=${dia}&mes=${mes}&ano=${ano}&hora=${hora}&min=${min}&seg=${seg}`;
  return this.http.get(url, { responseType: 'text' });
  }

  getTime() {
    return this.http.get(`${this.baseUrl}/gettime`);
  }
}