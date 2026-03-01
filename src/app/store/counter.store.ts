import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { CounterState } from './counter.types';

const initialState: CounterState = {
  count: 0,
};

export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    increment(): void {
      patchState(store, (state) => ({ count: state.count + 1 }));
    },
  }))
);
