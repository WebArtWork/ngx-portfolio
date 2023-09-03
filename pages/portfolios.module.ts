import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { PortfoliosComponent } from './portfolios.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: PortfoliosComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CoreModule
	],
	declarations: [
		PortfoliosComponent
	],
	providers: []

})

export class PortfoliosModule { }
