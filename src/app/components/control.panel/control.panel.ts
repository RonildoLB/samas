import { Component } from '@angular/core';
import { EspService } from '../../services/esp.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

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

  constructor(private esp: EspService, private cdr: ChangeDetectorRef) {}

  turnOn() {
    this.esp.ligar().subscribe((resp) => {
      console.log(resp);
      this.ledOn = true;
      console.log(this.ledOn);
      this.cdr.detectChanges();
    });
  }

  turnOff() {
    this.esp.desligar().subscribe((resp) => {
      console.log(resp);
      this.ledOn = false;
      console.log(this.ledOn);
      this.cdr.detectChanges();
    });
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
      this.cdr.detectChanges();
    });
  }
}

