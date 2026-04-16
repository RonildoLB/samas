import { Component } from '@angular/core';
import { EspService } from '../../services/esp.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
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

  horaLigar: string = '';   // Formato 'HH:mm' do input type="time"
  horaDesligar: string = '';
  agendamentos: any[] = [];

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

  // --- CONTROLE DO MOTOR (PULSO) ---
  acionarMotor(direcao: 'cw' | 'acw') {
    this.esp.pulseMotor(direcao).subscribe(resp => {
      console.log(`Motor acionado: ${direcao}`, resp);
    });
  }

  // --- AGENDAMENTOS ---
  carregarAgendamentos() {
    this.esp.listarAgendamentos().subscribe((lista: any[]) => {
      this.agendamentos = lista;
      this.cdr.detectChanges();
    });
  }

  salvarAgendamento() {
    if (!this.horaLigar || !this.horaDesligar) {
      alert('Preencha os horários de Ligar e Desligar.');
      return;
    }

    // Processa "Ligar" (CW)
    const [hrLigar, minLigar] = this.horaLigar.split(':').map(Number);
    const idLigar = Math.floor(Math.random() * 10000); // Gera ID aleatório

    this.esp.adicionarAgendamento(idLigar, hrLigar, minLigar, 'cw', 1).subscribe(() => {
      
      // Processa "Desligar" (ACW) logo em seguida
      const [hrDesligar, minDesligar] = this.horaDesligar.split(':').map(Number);
      const idDesligar = Math.floor(Math.random() * 10000);
      
      this.esp.adicionarAgendamento(idDesligar, hrDesligar, minDesligar, 'acw', 1).subscribe(() => {
        this.horaLigar = '';
        this.horaDesligar = '';
        this.carregarAgendamentos(); // Atualiza a tabela
      });
    });
  }

  deletarAgendamento(id: number) {
    this.esp.deletarAgendamento(id).subscribe(() => {
      this.carregarAgendamentos();
    });
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