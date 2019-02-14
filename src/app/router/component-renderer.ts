import {
  ComponentFactoryResolver,
  ViewContainerRef,
  Injector,
  Injectable,
  Inject,
  Type,
  Provider,
  InjectionToken,
  ComponentRef,
  Optional,
  StaticProvider
} from '@angular/core';
import { Observable, of, pipe } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { Async, ResourceLoader } from './resource-loader';
import { Route, BaseRoute } from './route';
import { Hook, composeHooks } from './hooks';

export const PRE_RENDER_HOOKS = new InjectionToken('@ngrx/router Pre-Render Hooks');
export const POST_RENDER_HOOKS = new InjectionToken('@ngrx/router Post-Render Hooks');

export interface RenderInstruction {
  component: Type<any>;
  injector: Injector;
  providers: StaticProvider[];
}

@Injectable({ providedIn: 'root' })
export class ComponentRenderer {
  constructor(
    private _loader: ResourceLoader,
    private _compiler: ComponentFactoryResolver,
    @Optional() @Inject(PRE_RENDER_HOOKS)
      private _preRenderHooks: Hook<RenderInstruction>[],
    @Optional() @Inject(POST_RENDER_HOOKS)
      private _postRenderHooks: Hook<ComponentRef<any>>[]
  ) { }

  render(
    route: Route,
    components: BaseRoute,
    injector: Injector,
    ref: ViewContainerRef,
    providers: any[]
  ) {
    return of(route)
      .pipe(
        mergeMap(_ => this._loadComponent(components)),
        map(component => ({ component, injector, providers })),
        pipe(composeHooks(this._preRenderHooks)),
        map(instruction => {
          const instructionInjector = Injector.create({ providers : instruction.providers, parent: injector });
          const component = instruction.component;
  
          const comp = this._compiler.resolveComponentFactory(component);
          return ref.createComponent(comp, null, instructionInjector);
        }),
        pipe(composeHooks(this._postRenderHooks))
      );
  }

  private _loadComponent(route: BaseRoute): Promise<Type<any>> {
    return this._loader.load(route.component, route.loadComponent);
  }
}

export const COMPONENT_RENDERER_PROVIDERS = [
  { provide: ComponentRenderer, useClass: ComponentRenderer }
];
