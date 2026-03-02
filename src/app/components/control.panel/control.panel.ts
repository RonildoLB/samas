import { Component } from '@angular/core';
import { EspService } from '../../services/esp.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control.panel.html',
  styleUrl: './control.panel.scss',
})
export class ControlPanel {
  connected = false;
  ledOn = false;

  dia = 0;
  mes = 0;
  ano = 0;
  hora = 0;
  min = 0;
  seg = 0;

  horaRecebida: string | null = null;

  constructor(private esp: EspService) {}

  connect() {
    this.esp.status().subscribe({
      next: (d: any) => {
        this.connected = true;
        this.ledOn = d.led === 1;
      },
      error: () => {
        this.connected = false;
      }
    });
  }

  turnOn() {
    this.esp.ligar().subscribe(() => this.ledOn = true);
  }

  turnOff() {
    this.esp.desligar().subscribe(() => this.ledOn = false);
  }

  enviarDataHora() {
    this.esp.setTime(this.dia, this.mes, this.ano, this.hora, this.min, this.seg)
      .subscribe(resp => {
        console.log("Time updated:", resp);
      });
  }

  lerHoraEsp() {
    this.esp.getTime().subscribe(t => {
      console.log("ESP TIME:", t);
      this.horaRecebida = JSON.stringify(t);
    });
  }
}

