import { Component } from '@angular/core';
import {FormService} from 'src/app/modules/form/form.service';
import { PortfolioService, Portfolio } from "src/app/modules/portfolio/services/portfolio.service";
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { AlertService, CoreService, MongoService } from 'wacom';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { TagService } from 'src/app/core/services/tag.service';

@Component({
	templateUrl: './portfolios.component.html',
	styleUrls: ['./portfolios.component.scss']
})
export class PortfoliosComponent {
	columns = ['name', 'short'];

	form: FormInterface = this._form.getForm('portfolio', {
		formId: 'portfolio',
		title: 'Portfolio',
		components: [
			{
				name: 'Text',
				key: 'name',
				focused: true,
				fields: [
					{
						name: 'Placeholder',
						value: 'fill portfolio title'
					},
					{
						name: 'Label',
						value: 'Title'
					}
				]
			},
			{
				name: 'Photo',
				key: 'thumb',
				fields: [
					{
						name: 'Label',
						value: 'Header picture'
					}
				]
			},
			{
				name: 'Photos',
				key: 'thumbs',
				fields: [
					{
						name: 'Label',
						value: 'Detailed pictures'
					}
				]
			},
			{
				name: 'Text',
				key: 'short',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill portfolio short description'
					},
					{
						name: 'Label',
						value: 'Short Description'
					}
				]
			},
			{
				name: 'Text',
				key: 'description',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill portfolio description'
					},
					{
						name: 'Label',
						value: 'Description'
					}
				]
			},
			{
				name: 'Select',
				key: 'tag',
				fields: [
					{
						name: 'Placeholder',
						value: 'Select tag'
					},
					{
						name: 'Items',
						value: this._ts.group('portfolio')
					}
				]
			}
		]
	});

	config = {
		create: () => {
			this._form
				.modal<Portfolio>(this.form, {
					label: 'Create',
					click: (created: unknown, close: () => void) => {
						this._ps.create(created as Portfolio);
						close();
					}
				});
		},
		update: (doc: Portfolio) => {
			this._form.modal<Portfolio>(this.form, [], doc).then((updated: Portfolio) => {
				this._core.copy(updated, doc);
				this._ps.save(doc);
			});
		},
		delete: (doc: Portfolio) => {
			this._alert.question({
				text: this._translate.translate('Common.Are you sure you want to delete this portfolio?'),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: () => {
							this._ps.delete(doc);
						}
					}
				]
			});
		}
	};

	get rows(): Portfolio[] {
		return this._ps.portfolios;
	}

	constructor(
		private _translate: TranslateService,
		private _ps: PortfolioService,
		private _alert: AlertService,
		private _mongo: MongoService,
		private _form: FormService,
		private _core: CoreService,
		private _ts: TagService
	) {
		this._mongo.on('tag', () => {
			this.form.components[this.form.components.length-1].fields[1].value = this._ts.module['portfolio'];
		});
	}
}
