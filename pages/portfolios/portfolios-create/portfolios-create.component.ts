import { Component } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio.service';

@Component({
  selector: 'app-portfolios-create',
  templateUrl: './portfolios-create.component.html',
  styleUrl: './portfolios-create.component.scss'
})
export class PortfoliosCreateComponent {
	constructor(private _ps: PortfolioService) { }
	chatGPT = `[{name: 'Entity Name'}]`;
	close: () => void;
	entities = '';
	tag: string;
	create() {
		const entities = JSON.parse(this.entities);
		for (const entity of entities) {
			entity.tag = this.tag ? [this.tag] : [];
			this._ps.create(entity);
		}
	}
}
