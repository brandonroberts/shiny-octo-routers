/**
 * RouteSet is a projection of the current location. It maps location changes
 * into parsed route params and a list of components to render
 */
import { Observable, pipe } from 'rxjs';
import { InjectionToken, Inject, Optional, Injectable, NgZone } from '@angular/core';
import { parse as parseQueryString } from 'query-string';

import { Router, LocationChange } from './router';
import { RouteTraverser, Match } from './route-traverser';
import { Hook, composeHooks } from './hooks';
import { observeOn, distinctUntilChanged, switchMap, filter, publishReplay, refCount } from 'rxjs/operators';
import { asap } from 'rxjs/internal/scheduler/asap';

export const ROUTER_HOOKS = new InjectionToken('@ngrx/router Router Hooks');
export const INSTRUCTION_HOOKS = new InjectionToken('@ngrx/router Instruction Hooks');
export const LOCATION_CHANGES = new InjectionToken('@ngrx/router Location Changes');


export abstract class RouterInstruction extends Observable<Match> { }

@Injectable({ providedIn: 'root' })
export class RouterInstructionFactory {
  constructor(
    @Inject(LOCATION_CHANGES) private _locationChanges$: Observable<LocationChange>,
    private _traverser: RouteTraverser,
    private _ngZone: NgZone,
    @Optional() @Inject(ROUTER_HOOKS)
      private _routerHooks: Hook<LocationChange>[] = [],
    @Optional() @Inject(INSTRUCTION_HOOKS)
      private _instructionHooks: Hook<Match>[] = []
  ) { }

  create(): RouterInstruction {
    return this._locationChanges$
      .pipe(
        //observeOn(asap),
        distinctUntilChanged((prev, next) => prev.path === next.path),
        pipe(composeHooks(this._routerHooks)),
        switchMap(change => this._traverser.find(change)),
        filter(match => !!match),
        pipe(composeHooks(this._instructionHooks)),
        //.enterZone(this._ngZone)
        publishReplay(1),
        refCount()
      );
  }
}


export const ROUTER_INSTRUCTION_PROVIDERS = [
  { provide: RouterInstruction, 
    deps: [ RouterInstructionFactory ],
    useFactory(rif: RouterInstructionFactory) {
      return rif.create()
    }
  },
  { provide: RouterInstructionFactory, useClass: RouterInstructionFactory },
  { provide: LOCATION_CHANGES, useExisting: Router }
];
