import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.css']
})
export class OutletComponent implements OnInit {

  constructor(private vcRef: ViewContainerRef, private resolver: ComponentFactoryResolver) { }

  ngOnInit() {
    import('../lazy/lazy.component').then(({LazyComponent}) => {
      const component = this.resolver.resolveComponentFactory(LazyComponent);

      this.vcRef.createComponent(component);
    });
  }

}
