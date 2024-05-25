import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { PortfoliosComponent } from './portfolios.component';
import { Routes, RouterModule } from '@angular/router';
import { PortfoliosCreateComponent } from './portfolios-create/portfolios-create.component';

const routes: Routes = [
	{
		path: '',
		component: PortfoliosComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes), CoreModule],
	declarations: [PortfoliosComponent, PortfoliosCreateComponent],
	providers: []
})
export class PortfoliosModule {}
