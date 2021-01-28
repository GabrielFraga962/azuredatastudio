/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { MigrationWizardPage } from '../models/migrationWizardPage';
import { BlobContainer, FileShare, MigrationStateModel, NetworkContainerType, NetworkShare, StateChangeEvent } from '../models/stateMachine';
import * as constants from '../models/strings';

export class SummaryPage extends MigrationWizardPage {
	private _view!: azdata.ModelView;
	private _flexContainer!: azdata.FlexContainer;

	constructor(wizard: azdata.window.Wizard, migrationStateModel: MigrationStateModel) {
		super(wizard, azdata.window.createWizardPage(constants.SUMMARY_PAGE_TITLE), migrationStateModel);
	}

	protected async registerContent(view: azdata.ModelView): Promise<void> {
		this._view = view;
		this._flexContainer = view.modelBuilder.flexContainer().withLayout({
			flexFlow: 'column'
		}).component();
		const form = view.modelBuilder.formContainer()
			.withFormItems(
				[
					{
						component: this._flexContainer
					}
				]
			);
		await view.initializeModel(form.component());
	}

	public async onPageEnter(): Promise<void> {
		this._flexContainer.addItems(
			[
				this.createHeadingTextComponent(constants.AZURE_ACCOUNT_LINKED),
				this.createHeadingTextComponent(this.migrationStateModel.azureAccount.displayInfo.displayName),


				this.createHeadingTextComponent(constants.MIGRATION_TARGET),
				this.createInformationRow(constants.TYPE, constants.SUMMARY_MI_TYPE),
				this.createInformationRow(constants.SUBSCRIPTION, this.migrationStateModel.getSubscriptionName(this.migrationStateModel._targetSubscriptionId)),
				this.createInformationRow(constants.SUMMARY_MI_TYPE, this.migrationStateModel._targetSQLMIServer),
				this.createInformationRow(constants.SUMMARY_DATABASE_COUNT_LABEL, '1'),

				this.createHeadingTextComponent(constants.DATABASE_BACKUP_PAGE_TITLE),
				this.createNetworkContainerRows(),

				this.createHeadingTextComponent(constants.IR_PAGE_TITLE),
				this.createInformationRow(constants.IR_PAGE_TITLE, this.migrationStateModel.migrationController?.name!),
				this.createInformationRow(constants.SUMMARY_IR_NODE, this.migrationStateModel._nodeName),

			]
		);
	}

	public async onPageLeave(): Promise<void> {
		this._flexContainer.clearItems();
		this.wizard.registerNavigationValidator(async (pageChangeInfo) => {
			return true;
		});
	}

	protected async handleStateChange(e: StateChangeEvent): Promise<void> {
	}

	private createInformationRow(label: string, value: string): azdata.FlexContainer {
		return this._view.modelBuilder.flexContainer()
			.withLayout(
				{
					flexFlow: 'row',
					alignItems: 'center',
				})
			.withItems(
				[
					this.creaetLabelTextComponent(label),
					this.createTextCompononent(value)
				],
				{
					CSSStyles: { 'margin-right': '5px' }
				})
			.component();
	}

	private createHeadingTextComponent(value: string): azdata.TextComponent {
		const component = this.createTextCompononent(value);
		component.updateCssStyles({
			'font-size': '13px',
			'font-weight': 'bold'
		});
		return component;
	}


	private creaetLabelTextComponent(value: string): azdata.TextComponent {
		const component = this.createTextCompononent(value);
		component.updateCssStyles({
			'color': '#595959',
			'width': '250px'
		});
		return component;
	}

	private createTextCompononent(value: string): azdata.TextComponent {
		return this._view.modelBuilder.text().withProps({
			value: value
		}).component();
	}

	private createNetworkContainerRows(): azdata.FlexContainer {
		const flexContainer = this._view.modelBuilder.flexContainer().withLayout({
			flexFlow: 'column'
		}).component();
		switch (this.migrationStateModel.databaseBackup.networkContainerType) {
			case NetworkContainerType.NETWORK_SHARE:
				const networkShare = <NetworkShare>this.migrationStateModel.databaseBackup.networkContainer;
				flexContainer.addItems(
					[
						this.createInformationRow(constants.TYPE, constants.NETWORK_SHARE),
						this.createInformationRow(constants.PATH, networkShare.networkShareLocation),
						this.createInformationRow(constants.USER_ACCOUNT, networkShare.windowsUser),
						this.createInformationRow(constants.SUMMARY_AZURE_STORAGE_SUBSCRIPTION, this.migrationStateModel.getSubscriptionName(networkShare.storageSubscriptionId)),
						this.createInformationRow(constants.SUMMARY_AZURE_STORAGE, networkShare.storageAccountId),
					]
				);
				break;
			case NetworkContainerType.FILE_SHARE:
				const fileShare = <FileShare>this.migrationStateModel.databaseBackup.networkContainer;
				flexContainer.addItems(
					[
						this.createInformationRow(constants.TYPE, constants.FILE_SHARE),
						this.createInformationRow(constants.SUMMARY_AZURE_STORAGE_SUBSCRIPTION, this.migrationStateModel.getSubscriptionName(fileShare.subscriptionId)),
						this.createInformationRow(constants.SUMMARY_AZURE_STORAGE, fileShare.storageAccountId),
						this.createInformationRow(constants.FILE_SHARE, fileShare.fileShareId),
					]
				);
				break;
			case NetworkContainerType.BLOB_CONTAINER:
				const blobConainer = <BlobContainer>this.migrationStateModel.databaseBackup.networkContainer;
				flexContainer.addItems(
					[
						this.createInformationRow(constants.TYPE, constants.BLOB_CONTAINER),
						this.createInformationRow(constants.SUMMARY_AZURE_STORAGE_SUBSCRIPTION, this.migrationStateModel.getSubscriptionName(blobConainer.subscriptionId)),
						this.createInformationRow(constants.SUMMARY_AZURE_STORAGE, blobConainer.storageAccountId),
						this.createInformationRow(constants.BLOB_CONTAINER, blobConainer.containerId),
					]
				);
		}
		return flexContainer;
	}
}
