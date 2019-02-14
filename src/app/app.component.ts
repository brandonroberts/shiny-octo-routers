import { Component } from '@angular/core';
import { Router } from './router';

@Component({
  selector: 'app-root',
  template: `
    <a linkTo="/test1">Test</a>
    <button (click)="go('test2')">Test 2</button>
    <button (click)="go('test3')">Test 3</button>

    <route-view></route-view>
  `,
  styles: []
})
export class AppComponent {

  constructor(private router: Router) {}

  go(url: string) {
    this.router.go(url);
  }
}
