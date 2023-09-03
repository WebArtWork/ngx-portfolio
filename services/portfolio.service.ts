import { Injectable } from '@angular/core';
import { MongoService, AlertService } from 'wacom';

export interface Portfolio {
	_id: string;
	name: string;
	description: string;
}

@Injectable({
	providedIn: 'root'
})
export class PortfolioService {
	portfolios: Portfolio[] = [];

	_portfolios: any = {};

	new(): Portfolio {
		return {
			_id: '',
			name: '',
			description: ''
		}
	}

	constructor(
		private mongo: MongoService,
		private alert: AlertService
	) {
		this.portfolios = mongo.get('portfolio', {}, (arr: any, obj: any) => {
			this._portfolios = obj;
		});
	}

	create(
		portfolio: Portfolio = this.new(),
		callback = (created: Portfolio) => {},
		text = 'portfolio has been created.'
	) {
		if (portfolio._id) {
			this.save(portfolio);
		} else {
			this.mongo.create('portfolio', portfolio, (created: Portfolio) => {
				callback(created);
				this.alert.show({ text });
			});
		}
	}

	doc(portfolioId: string): Portfolio {
		if(!this._portfolios[portfolioId]){
			this._portfolios[portfolioId] = this.mongo.fetch('portfolio', {
				query: {
					_id: portfolioId
				}
			});
		}
		return this._portfolios[portfolioId];
	}

	update(
		portfolio: Portfolio,
		callback = (created: Portfolio) => {},
		text = 'portfolio has been updated.'
	): void {
		this.mongo.afterWhile(portfolio, ()=> {
			this.save(portfolio, callback, text);
		});
	}

	save(
		portfolio: Portfolio,
		callback = (created: Portfolio) => {},
		text = 'portfolio has been updated.'
	): void {
		this.mongo.update('portfolio', portfolio, () => {
			if(text) this.alert.show({ text, unique: portfolio });
		});
	}

	delete(
		portfolio: Portfolio,
		callback = (created: Portfolio) => {},
		text = 'portfolio has been deleted.'
	): void {
		this.mongo.delete('portfolio', portfolio, () => {
			if(text) this.alert.show({ text });
		});
	}
}
