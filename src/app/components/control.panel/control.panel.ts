import { Component } from '@angular/core';
import { EspService } from '../../services/esp.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgIf } from "../../../../node_modules/@angular/common/types/_common_module-chunk";

@Component({
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control.panel.html',
  styleUrl: './control.panel.scss',
})
export class ControlPanel {
  connected = false;
  led1On = false;
  led2On = false;
  led3On = false;

  dia = 0;
  mes = 0;
  ano = 0;
  hora = 0;
  min = 0;
  seg = 0;

  horaRecebida: string | null = null;

  constructor(private esp: EspService, private cdr: ChangeDetectorRef) {}

  turnOn(led: number) {
    this.esp.ligar(led).subscribe((resp) => {
      console.log(resp);
      if (led === 2) {
        this.led1On = true;
      }
      if (led === 4) {
        this.led2On = true;
      }
      if (led === 5) {
        this.led3On = true;
      }
      this.cdr.detectChanges();
    });
  }

  turnOff(led: number) {
    this.esp.desligar(led).subscribe((resp) => {
      console.log(resp);
      if (led === 2) {
        this.led1On = false;
      }
      if (led === 4) {
        this.led2On = false;
      }
      if (led === 5) {
        this.led3On = false;
      }
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