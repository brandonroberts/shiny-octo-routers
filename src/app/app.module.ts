import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import '@angular/compiler';

import { AppComponent } from './app.component';
import { OutletComponent } from './outlet/outlet.component';
import { provideRouter, ROUTER_DIRECTIVES } from './router';
import { LazyComponent } from './lazy/lazy.component';

@NgModule({
  declarations: [
    AppComponent,
    OutletComponent,
    ROUTER_DIRECTIVES,
    LazyComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    provideRouter([
      { path: '/test1', component: LazyComponent },
      { path: '/test2', loadComponent: () => import('./lazy2/lazy2.component').then(({Lazy2Component}) => Lazy2Component) },
      { path: '/test3', component: LazyComponent }
    ])
  ],
  bootstrap: [AppComponent],
  entryComponents: [LazyComponent]
})
export class AppModule { }
