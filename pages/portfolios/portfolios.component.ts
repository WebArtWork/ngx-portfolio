import { Component } from '@angular/core';
import {FormService} from 'src/app/modules/form/form.service';
import { PortfolioService, Portfolio } from "src/app/modules/portfolio/services/portfolio.service";
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { AlertService, CoreService, ModalService, MongoService, StoreService } from 'wacom';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { Tag, TagService } from 'src/app/modules/tag/services/tag.service';
import { Store, StoreService as _StoreService } from '../../../store/services/store.service';
import { Router } from '@angular/router';
import { PortfoliosCreateComponent } from './portfolios-create/portfolios-create.component';
import { UserService } from 'src/app/core';

@Component({
	templateUrl: './portfolios.component.html',
	styleUrls: ['./portfolios.component.scss']
})
export class PortfoliosComponent {
	columns = ['enabled', 'top', 'name', 'short'];

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
				key: 'tags',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill product tag'
					},
					{
						name: 'Label',
						value: 'Tag'
					},
					{
						name: 'Multiple',
						value: true
					},
					{
						name: 'Items',
						value: this._ts.tags
					}
				]
			}
			// {
			// 	name: 'Select',
			// 	key: 'tag',
			// 	fields: [
			// 		{
			// 			name: 'Placeholder',
			// 			value: 'Select tag'
			// 		},
			// 		{
			// 			name: 'Items',
			// 			value: this._ts.group('portfolio')
			// 		}
			// 	]
			// }
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
		},
		buttons: [
			{
				icon: 'cloud_download',
				click: (doc: Portfolio) => {
					this._form
						.modalUnique<Portfolio>(
							'portfolio',
							'url',
							doc
						);
				}
			}
		],
		headerButtons: [
			this._us.role('admin') || this._us.role('agent')
				? {
					icon: 'add_circle',
					click: () => {
						this._modal.show({
							component: PortfoliosCreateComponent,
							tag: this.tag
						});
					}
				}
				: null
		]
	};

	portfolios: Portfolio[] = [];
	setPortfolios() {
		this.portfolios.splice(0, this.portfolios.length);
		for (const portfolio of this._ps.portfolios) {
			portfolio.tags = portfolio.tags || [];
			if (this.tag) {
				if (portfolio.tags.includes(this.tag)) {
					this.portfolios.push(portfolio);
				}
			} else {
				this.portfolios.push(portfolio);
			}
		}
	}
	get title(): string {
		if (this._router.url === '/craftsman/crafts') {
			return 'Crafts';
		}

		if (this._router.url === '/craftsman/craftlinks') {
			return 'Product Links';
		}

		return 'Portfolios';
	}

	update(portfolio: Portfolio) {
		this._ps.update(portfolio);
	}

	tags: Tag[] = [];
	tagIncludeStore(tag: Tag) {
		if (tag.stores.includes(this.store)) return true;
		while (tag.parent) {
			tag = this._ts.doc(tag.parent);
			if (tag.stores.includes(this.store)) return true;
		}
		return false;
	}
	setTags() {
		this.tags = [];
		for (const tag of this._ts.tags) {
			tag.stores = tag.stores || [];
			if (!this.store || this.tagIncludeStore(tag)) {
				this.tags.push({
					...tag,
					name: this.tagName(tag)
				});
			}
		}
		this.tags.sort((a, b) => {
			if (a.name < b.name) {
				return -1; // a comes first
			} else if (a.name > b.name) {
				return 1; // b comes first
			} else {
				return 0; // no sorting necessary
			}
		});
		this.setPortfolios();
	}
	tag: string;
	available: string;
	setTag(tagId: string) {
		this._store.set('tag', tagId);
		this.tag = tagId;
		this.available = '';
		if (tagId) {
			let tag = this._ts.doc(tagId);
			while (tag.parent) {
				tag = this._ts.doc(tag.parent);
				this.available += (this.available ? ', ' : '') + tag.name;
			}
		}
		this.setPortfolios();
	}
	tagName(tag: Tag) {
		let name = tag.name;
		while (tag.parent) {
			tag = this._ts.doc(tag.parent);
			name = tag.name + ' / ' + name;
		}
		return name;
	}

	get stores(): Store[] {
		return this._ss.stores;
	}
	store: string;
	setStore(store: string) {
		this.store = store;
		this._store.set('store', store);
		this.setTags();
	}

	constructor(
		private _translate: TranslateService,
		private _ps: PortfolioService,
		private _alert: AlertService,
		private _mongo: MongoService,
		private _form: FormService,
		private _modal: ModalService,
		private _core: CoreService,
		private _store: StoreService,
		private _ss: _StoreService,
		private _ts: TagService,
		private _router: Router,
		private _us: UserService
	) {
		this._store.get('store', this.setStore.bind(this));
		this._store.get('tag', this.setTag.bind(this));
		this._mongo.on('tag', this.setTags.bind(this));
		this._mongo.on('portfolio', this.setPortfolios.bind(this));
	}
}
