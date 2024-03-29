import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer,
  Optional,
  Inject,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { LinkTo } from './link-to';
import { Router } from './router';
import { from } from 'rxjs';
import { mergeAll, map } from 'rxjs/operators';

export interface LinkActiveOptions {
  exact: boolean;
}

export const LINK_ACTIVE_OPTIONS: LinkActiveOptions = {
  exact: true
};

/**
 * The LinkActive directive toggles classes on elements that contain an active linkTo directive
 *
 * <a linkActive="active" linkTo="/home/page">Home Page</a>
 * <ol>
 *  <li linkActive="active" *ngFor="var link of links">
 *    <a [linkTo]="'/link/' + link.id">{{ link.title }}</a>
 *  </li>
 * </ol>
 */
 @Directive({ selector: '[linkActive]' })
 export class LinkActive implements AfterViewInit, OnInit, OnDestroy {
   @Input('linkActive') activeClass: string = 'active';
   @Input() activeOptions: LinkActiveOptions;
   private _activeOptions: LinkActiveOptions = { exact: true };
   private _routerSub: any;
   private _linksSub: any;

   constructor(
     @ViewChildren(LinkTo) public links: QueryList<LinkTo>,
     public element: ElementRef,
     public router$: Router,
     public renderer: Renderer,
     @Optional()
     @Inject(LINK_ACTIVE_OPTIONS)
      private defaultActiveOptions: LinkActiveOptions
   ) {}

   ngOnInit () {
     this.links.changes.subscribe(_ => {
       this.subscribeLinks();
     });
   }

   ngAfterViewInit() {
     if (this.defaultActiveOptions && !this.activeOptions) {
       this._activeOptions = this.defaultActiveOptions;
     } else if (this.activeOptions) {
       this._activeOptions = this.activeOptions;
     }

     this._routerSub = this.router$
     .pipe(
       map(({path}) => this.router$.prepareExternalUrl(path || '/'))
     )
     .subscribe(path => {
       this.checkActive(path);
     });
   }

   checkActive(path) {
    let active = this.links.reduce((active, current) => {
      let [href, query] = current.linkHref.split('?');

      if (this._activeOptions.exact) {
        return active ? active : href === path;
      } else {
        return active ? active : path.startsWith(href);
      }
    }, false);

     let activeClasses = this.activeClass.split(' ');
     activeClasses.forEach((activeClass) => {
       this.renderer.setElementClass(this.element.nativeElement, activeClass, active);
     });
   }

   subscribeLinks() {
     if (this._linksSub) {
       this._linksSub.unsubscribe();
     }

     let observables = this.links.map(link => {
       return link.hrefUpdated;
     });

     this._linksSub = from(observables).pipe(mergeAll())
       .subscribe(_ => {
         this.checkActive(this.router$.prepareExternalUrl(this.router$.path() || '/'));
       });
   }

   ngOnDestroy() {
     if (this._routerSub) {
       this._routerSub.unsubscribe();
     }
     if (this._linksSub) {
       this._linksSub.unsubscribe();
     }
   }
 }
