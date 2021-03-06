import {Injectable} from '@angular/core';
import {ExtensionInterfaceEventName} from './chrome-extension-interface';
import {ReplaySubject} from 'rxjs';
import {first, startWith} from 'rxjs/operators';

const interfaceEl = window;

@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionInterfaceService {
  // handled as private but needs to assigned first
  _onReady$: ReplaySubject<boolean> = new ReplaySubject(1);
  onReady$ = this._onReady$.pipe(first());
  isReady$ = this.onReady$.pipe(startWith(false));
  // we only every one to catch a single event
  private _isInterfaceReady = false;

  init() {
    interfaceEl.addEventListener('SP_EXTENSION_READY', () => {
      // we only want to show the notification once
      if (!this._isInterfaceReady) {
        console.log('SUCCESS', 'Super Productivity Extension found and loaded.');
        this._isInterfaceReady = true;
        this._onReady$.next(true);
      }
    });
  }

  addEventListener(evName: ExtensionInterfaceEventName, cb) {
    interfaceEl.addEventListener(evName, (ev: CustomEvent) => {
      cb(ev, ev.detail);
    });
  }

  dispatchEvent(evName: ExtensionInterfaceEventName, data) {
    const ev = new CustomEvent(evName, {
      detail: data,
    });

    if (this._isInterfaceReady) {
      interfaceEl.dispatchEvent(ev);
    } else {
      setTimeout(() => {
        interfaceEl.dispatchEvent(ev);
      }, 2000);
    }
  }
}
