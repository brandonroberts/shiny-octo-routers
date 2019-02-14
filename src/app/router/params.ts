import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RouterInstruction } from './router-instruction';

export abstract class RouteParams extends Observable<{ [param: string]: any }> { }
export abstract class QueryParams extends Observable<{ [param: string]: any }> { }

function createRouteParams(set$: RouterInstruction): RouteParams {
  return set$.pipe(map(next => next.routeParams));
}

function createQueryParams(set$: RouterInstruction): QueryParams {
  return set$.pipe(map(next => next.queryParams));
}

export const PARAMS_PROVIDERS = [
  { provide: RouteParams, 
    deps: [ RouterInstruction ],
    useFactory: createRouteParams
  },
  { provide: QueryParams, 
    deps: [ RouterInstruction ],
    useFactory: createQueryParams
  }
];
