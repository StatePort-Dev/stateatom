import 'zone.js';import '@angular/compiler';import {Component,signal} from '@angular/core';import {bootstrapApplication} from '@angular/platform-browser';
class App{plan=signal('Loading');async ngOnInit(){this.plan.set((await (await fetch('/api/account')).json()).profile.plan);}}
Component({selector:'xray-app',standalone:true,template:'<p id="plan">{{plan()}}</p>'})(App);bootstrapApplication(App);
