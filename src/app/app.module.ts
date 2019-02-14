import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import '@angular/compiler';

import { AppComponent } from './app.component';
import { OutletComponent } from './outlet/outlet.component';
import { provideRouter, ROUTER_DIRECTIVES } from './router';
import { LazyComponent } from './lazy/lazy.component';
import { Lazy2Component } from './lazy2/lazy2.component';

@NgModule({
  declarations: [
    AppComponent,
    OutletComponent,
    ROUTER_DIRECTIVES,
    LazyComponent,
    Lazy2Component
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    provideRouter([
      { path: '/test1', component: LazyComponent },
      { path: '/test2', component: Lazy2Component },
      { path: '/test3', component: LazyComponent }
    ])
  ],
  bootstrap: [AppComponent],
  entryComponents: [LazyComponent, Lazy2Component]
})
export class AppModule { }
