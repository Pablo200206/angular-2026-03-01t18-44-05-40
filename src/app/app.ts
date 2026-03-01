import { Component, inject } from '@angular/core';
import { CounterStore } from './store/counter.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly store = inject(CounterStore);
}
