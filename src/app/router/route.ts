/**
 * Route and IndexRoute interfaces are similar to react-router's interfaces.
 */
import { Type, InjectionToken } from '@angular/core';

import { Async } from './resource-loader';

export type Routes = Array<Route>;

export interface BaseRoute {
  component?: Type<any>;
  loadComponent?: Async<Type<any>>;
}

export interface IndexRoute extends BaseRoute {
  components?: { [name: string]: Type<any> };
  loadComponents?: { [name: string]: Async<Type<any>> };
  redirectTo?: string;
  options?: any;
}

export interface Route extends IndexRoute {
  path?: string;
  guards?: any[];
  index?: IndexRoute;
  loadIndex?: Async<IndexRoute>;
  children?: Routes;
  loadChildren?: Async<Routes>;
}

export const ROUTES = new InjectionToken('@ngrx/router Init Routes');

export function getNamedComponents(route: IndexRoute, name?: string): BaseRoute {
  if (!route) {
    return { component: null, loadComponent: null };
  }

  if (!name) {
    return { component: route.component, loadComponent: route.loadComponent };
  }

  const components = route.components || {};
  const loadComponents = route.loadComponents || {};

  return { component: components[name], loadComponent: loadComponents[name] };
}
