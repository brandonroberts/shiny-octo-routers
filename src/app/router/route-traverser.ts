/**
* This is a fork of react-router's MatchRoute. Instead of async callbacks, it
* uses observables to perform async traversal of a route trie. It is expanded
* to run route guards as part of the traversal process
*/

import { Observable, from, of, pipe } from 'rxjs';
import { InjectionToken, Provider, Inject, Injectable, Optional } from '@angular/core';
import * as queryString from 'query-string';

import { ResourceLoader } from './resource-loader';
import { matchPattern, makeParams } from './match-pattern';
import { Route, Routes, ROUTES } from './route';
import { Hook, composeHooks } from './hooks';
import { LocationChange } from './router';
import { concatMap, catchError, filter, take, mergeMap, map, tap } from 'rxjs/operators';

export const TRAVERSAL_HOOKS = new InjectionToken(
  '@ngrx/router Traversal Hooks'
);

export interface Match {
  routes: Routes;
  routeParams: any;
  queryParams: any;
  locationChange: LocationChange;
};

export interface TraversalCandidate {
  route: Route;
  routeParams: any;
  queryParams: any;
  locationChange: LocationChange;
  isTerminal: boolean;
}


@Injectable({ providedIn: 'root' })
export class RouteTraverser {
  constructor(
    private _loader: ResourceLoader,
    @Inject(ROUTES) private _routes: Routes,
    @Optional() @Inject(TRAVERSAL_HOOKS)
      private _hooks: Hook<TraversalCandidate>[] = []
  ) { }

  /**
  * Asynchronously matches the given location to a set of routes. The state
  * object will have the following properties:
  *
  * - routes       An array of routes that matched, in hierarchical order
  * - params       An object of URL parameters
  */
  find(change: LocationChange) {
    const [ pathname, query ] = change.path.split('?');
    const queryParams = queryString.parse(query);
    return this._matchRoutes(queryParams, change, pathname);
  }

  private _matchRoutes(
    queryParams: any,
    locationChange: LocationChange,
    pathname: string,
    remainingPathname = pathname,
    routes: Routes = this._routes,
    routeParamNames = [],
    routeParamValues = []
  ): Observable<Match> {console.log('here', routes);
    return from(routes).pipe(
      concatMap(route => this._matchRouteDeep(
        route,
        queryParams,
        locationChange,
        pathname,
        remainingPathname,
        routeParamNames,
        routeParamValues
      )),
      tap(console.log),
      catchError(error => {
        console.error('Error During Traversal', error);
        return of(null);
      }),
      
      filter(match => !!match),
      take(1)
    );
  }

  private _matchRouteDeep(
    route: Route,
    queryParams: any,
    locationChange: LocationChange,
    pathname: string,
    remainingPathname: string,
    paramNames: string[],
    paramValues: string[]
  ): Observable<Match> {
    const pattern = route.path || '';

    return of(route).pipe(
      filter(() => remainingPathname !== null),
      tap(() => {
        const matched = matchPattern(pattern, remainingPathname);
        remainingPathname = matched.remainingPathname;
        paramNames = [ ...paramNames, ...matched.paramNames ];
        paramValues = [ ...paramValues, ...matched.paramValues ];
      }),
      filter(() => remainingPathname !== null),
      map(() => {
        return {
          route,
          queryParams,
          locationChange,
          routeParams: makeParams(paramNames, paramValues),
          isTerminal: remainingPathname === '' && !!route.path
        };
      }),
      pipe(composeHooks(this._hooks)),
      filter(({ route }) => !!route),
      mergeMap(({ route, routeParams, queryParams, isTerminal }) => {
        if ( isTerminal ) {
          const match: Match = {
            routes: [ route ],
            routeParams,
            queryParams,
            locationChange
          };

          return of(route).pipe(
            mergeMap(route => this._loadIndex(route)),
            map(index => {
              if ( !!index ) {
                match.routes.push(index);
              }

              return match;
            }));
        }

        return of(route).pipe(
          mergeMap(route => this._loadChildRoutes(route)),
          mergeMap(childRoutes => this._matchRoutes(
            queryParams,
            locationChange,
            pathname,
            remainingPathname,
            childRoutes,
            paramNames,
            paramValues
          )),
          map(match => {
            if ( !!match ) {
              match.routes.unshift(route);

              return match;
            }

            return null;
          }));
      }));
  }

  private _loadChildRoutes(route: Route): Promise<Routes> {
    return this._loader.load(route.children, route.loadChildren, []);
  }

  private _loadIndex(route: Route): Promise<Route> {
    return this._loader.load(route.index, route.loadIndex, null);
  }
}

export const MATCH_ROUTE_PROVIDERS = [
  { provide: RouteTraverser, useClass: RouteTraverser }
];