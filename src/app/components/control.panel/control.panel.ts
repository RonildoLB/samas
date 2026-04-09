import { Component } from '@angular/core';
import { EspService } from '../../services/esp.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgIf } from "../../../../node_modules/@angular/common/types/_common_module-chunk";
import { OnInit, OnDestroy } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control.panel.html',
  styleUrl: './control.panel.scss',
})
export class ControlPanel implements OnInit, OnDestroy {
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

  private statusSubscription?: Subscription;

  constructor(private esp: EspService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // timer(espera_inicial, periodo_de_repeticao)
    this.statusSubscription = timer(0, 5000)
      .pipe(
        // switchMap cancela a requisição anterior se ela demorar mais que 5s
        switchMap(() => this.esp.getStatus())
      )
      .subscribe({
        next: (resp: any) => {
          console.log('Status atualizado:', resp);
          // Aqui você mapeia a resposta do novo JSON que fizemos no ESP
          this.connected = resp.status.conectado_internet;
          
          // Formata a hora recebida para exibir na tela
          const h = resp.hora;
          this.horaRecebida = `${h.dia}/${h.mes}/${h.ano} ${h.hora}:${h.min}:${h.seg}`;
          
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao buscar status:', err)
      });
  }

  // Cancela o timer quando sair da página
  ngOnDestroy() {
    this.statusSubscription?.unsubscribe();
  }

  pegarStatus() {
    this.esp.getStatus().subscribe(() => {})
  }

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