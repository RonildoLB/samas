import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EspService {
  private baseUrl = 'http://esp.local';

  constructor(private http: HttpClient) {}

  ligar(led: number) {
    return this.http.get(`${this.baseUrl}/turn/on?led=${led}`, {});
  }

  desligar(led: number) {
    return this.http.get(`${this.baseUrl}/turn/off?led=${led}`, {});
  }

  setTime(dia: number, mes: number, ano: number, hora: number, min: number, seg: number) {
  const url = `${this.baseUrl}/settime?dia=${dia}&mes=${mes}&ano=${ano}&hora=${hora}&min=${min}&seg=${seg}`;
  return this.http.get(url, { responseType: 'text' });
  }

  getTime() {
    return this.http.get(`${this.baseUrl}/gettime`);
  }

  getStatus() {
    return this.http.get(`${this.baseUrl}/status`);
  }
}