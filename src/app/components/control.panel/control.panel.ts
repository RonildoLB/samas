import { Component } from '@angular/core';
import { EspService } from '../../services/esp.service';

@Component({
  selector: 'app-control-panel',
  imports: [],
  templateUrl: './control.panel.html',
  styleUrl: './control.panel.scss',
})
export class ControlPanel {
  connected = false;
  ledOn = false;

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
    this.esp.ligar().subscribe(() => {
      this.ledOn = true;
    });
  }

  turnOff() {
    this.esp.desligar().subscribe(() => {
      this.ledOn = false;
    });
  }
}



