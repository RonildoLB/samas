import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EspService } from '../../services/esp.service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './control.panel.html',
  styleUrl: './control.panel.scss',
})
export class ControlPanel implements OnInit, OnDestroy {
  connected = false;

  statusEsp = {
    cliente_conectado: false,
    conectado_wifi: false,
    conectado_internet: false,
    relogio_atualizado: false
  };

  // Data/Hora ESP
  dataEsp: string = '';
  horaEsp: string = '';
  ssidEsp: string = '';
  passEsp: string = '';
  horaRecebida: string | null = null;

  // Agendamento
  horaLigar: string = '';
  horaDesligar: string = '';
  agendamentosAgrupados: any[] = [];

  // Motor / Animação
  loadingCw: boolean = false;
  loadingAcw: boolean = false;
  ultimoMotor: 'cw' | 'acw' | null = null;
  tempoProgressoMs: number = 5000; // Tempo do progresso em milissegundos (2 segundos)

  private statusSubscription?: Subscription;

  constructor(private esp: EspService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarAgendamentos();

    this.statusSubscription = timer(0, 5000)
      .pipe(switchMap(() => this.esp.getStatus()))
      .subscribe({
        next: (resp: any) => {
          this.statusEsp = resp.status;
          this.connected = resp.status?.conectado_internet || false;
          if (resp.hora) {
            this.horaRecebida = this.formatarHora(resp.hora);
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao buscar status:', err)
      });
  }

  ngOnDestroy() {
    this.statusSubscription?.unsubscribe();
  }

  // Formatação padronizada (DD/MM/YYYY HH:mm:ss)
  private formatarHora(h: any): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h.dia)}/${pad(h.mes)}/${h.ano} ${pad(h.hora)}:${pad(h.min)}:${pad(h.seg)}`;
  }

  // --- CONTROLE DO MOTOR COM PROGRESSO ---
  acionarMotorProgresso(direcao: 'cw' | 'acw') {
    if (this.loadingCw || this.loadingAcw) return; // Evita duplo clique

    if (direcao === 'cw') this.loadingCw = true;
    if (direcao === 'acw') this.loadingAcw = true;

    // Inicia a contagem da barra de progresso antes de executar
    setTimeout(() => {
      this.esp.pulseMotor(direcao).subscribe(resp => {
        console.log(`Motor acionado: ${direcao}`, resp);
        this.ultimoMotor = direcao; // Alterna a inatividade
        this.loadingCw = false;
        this.loadingAcw = false;
        this.cdr.detectChanges();
      });
    }, this.tempoProgressoMs);
  }

  // --- AGENDAMENTOS EM DUPLAS ---
  carregarAgendamentos() {
    this.esp.listarAgendamentos().subscribe((lista: any[]) => {
      this.agendamentosAgrupados = this.agruparEmDuplas(lista);
      this.cdr.detectChanges();
    });
  }

  // Agrupa os envios individuais em cards de dupla Ligar/Desligar
  private agruparEmDuplas(lista: any[]): any[] {
    const duplas = [];
    for (let i = 0; i < lista.length; i += 2) {
      const t1 = lista[i];
      const t2 = lista[i + 1];
      
      if (t1 && t2) {
        duplas.push({
          idLigar: t1.dir === 'cw' ? t1.id : t2.id,
          idDesligar: t1.dir === 'acw' ? t1.id : t2.id,
          hrLigar: t1.dir === 'cw' ? t1.hr : t2.hr,
          minLigar: t1.dir === 'cw' ? t1.min : t2.min,
          hrDesligar: t1.dir === 'acw' ? t1.hr : t2.hr,
          minDesligar: t1.dir === 'acw' ? t1.min : t2.min
        });
      }
    }
    return duplas;
  }

  adicionarAgendamento() {
    if (!this.horaLigar || !this.horaDesligar) {
      alert('Preencha os horários de Ligar e Desligar.');
      return;
    }

    const [hrLigar, minLigar] = this.horaLigar.split(':').map(Number);
    const idLigar = Math.floor(Math.random() * 10000);

    this.esp.adicionarAgendamento(idLigar, hrLigar, minLigar, 'cw', 1).subscribe(() => {
      
      const [hrDesligar, minDesligar] = this.horaDesligar.split(':').map(Number);
      const idDesligar = Math.floor(Math.random() * 10000);
      
      this.esp.adicionarAgendamento(idDesligar, hrDesligar, minDesligar, 'acw', 1).subscribe(() => {
        this.horaLigar = '';
        this.horaDesligar = '';
        this.carregarAgendamentos();
      });
    });
  }

  deletarDupla(idLigar: number, idDesligar: number) {
    this.esp.deletarAgendamento(idLigar).subscribe(() => {
      this.esp.deletarAgendamento(idDesligar).subscribe(() => {
        this.carregarAgendamentos();
      });
    });
  }

  // --- RELÓGIO DO SISTEMA (ESP32) ---
  enviarDataHora() {
    if (!this.dataEsp || !this.horaEsp) {
      alert('Preencha a data e a hora.');
      return;
    }

    const [ano, mes, dia] = this.dataEsp.split('-').map(Number);
    const [hora, min, seg] = this.horaEsp.split(':').map(Number);
    const s = seg || 0; 

    this.esp.setTime(dia, mes, ano, hora, min, s).subscribe(resp => {
      console.log("Relógio sincronizado");
      this.lerHoraEsp();
    });
  }

  atualizarWifi() {
    if (!this.ssidEsp || !this.passEsp) {
      alert('Preencha os campos SSID e Senha.');
      return;
    }

    const ssid = this.ssidEsp;
    const pass = this.passEsp; 

    this.esp.setWifi(ssid, pass).subscribe(resp => {
      console.log("Wifi atualizado");
    });
  }

  lerHoraEsp() {
    this.esp.getTime().subscribe((t: any) => {
      // Usa a mesma formatação do status
      this.horaRecebida = this.formatarHora(t);
      this.cdr.detectChanges();
    });
  }
}