import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ControlPanel } from "./components/control.panel/control.panel";

@Component({
  selector: 'app-root',
  imports: [ControlPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('samas');
}
