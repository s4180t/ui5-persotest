sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/comp/personalization/Controller",
	"sap/ui/comp/personalization/Util",
	"sap/ui/comp/smartvariants/PersonalizableInfo",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/base/util/merge"
],
	function (Controller, TablePersoController, UtilPersonalization, PersonalizableInfo, Sorter, Filter, FakeLrepConnectorLocalStorage, FakeLrepLocalStorage, merge) {
		"use strict";

		return Controller.extend("persotest.controller.Main", {
			onInit: function () {
				
				FakeLrepConnectorLocalStorage.enableFakeConnector();
				// FakeLrepLocalStorage.deleteChanges();

				var oTable = this.byId("bigFuckingTable");
				var oSmartVariant = this.byId("bigFuckingTable-SmartVariant");
				var oPage = this.byId("page");

				this.oPersistentData = {};

				this.oTPC = new TablePersoController({
					table: oTable,
					setting: {
						columns: {
							visible: true
						}
					},
					afterP13nModelDataChange: [this.onAfterP13nModelDataChange, this]
				});

				oPage.mProperties["persistencyKey"] = "PKeyTest";
				oPage.getMetadata()._mAllProperties["persistencyKey"] = {
					type: "string",
					name: "persistencyKey"
				};

				oPage.fetchVariant = function () {
					return merge({}, this.oPersistentData);
				}.bind(this);
				oPage.applyVariant = function (oVariantJSON) {
					this.oTPC.setPersonalizationData(jQuery.isEmptyObject(oVariantJSON) ? null : merge({}, oVariantJSON));
				}.bind(this);

				oSmartVariant.addPersonalizableControl(new PersonalizableInfo({
					type: "table",
					keyName: "persistencyKey",
					// dataSource: "TODO",
					control: oPage
				}));
				
				oSmartVariant.initialise(function () {}, oPage);

			},

			handleTablePersoPress: function(){
				this.oTPC.openDialog();
			},

			onAfterP13nModelDataChange: function (oEvent) {
				var oPersistentData = oEvent.getParameter("persistentData");
				this.oPersistentData = oPersistentData;
				var oPersistentDataChangeType = oEvent.getParameter("persistentDataChangeType");
				var oTable = oEvent.getSource().getTable();
				var aColumns = oTable.getColumns();
				var aFilters = [];
				var aSorters = [];
				var oTableRowsBinding = oTable.getBinding("rows");
				var oSmartVariant = this.byId("bigFuckingTable-SmartVariant");

				oSmartVariant.currentVariantSetModified(UtilPersonalization.hasChangedType(oPersistentDataChangeType));

				if (oPersistentData.filter && oPersistentData.filter.filterItems) {
					oPersistentData.filter.filterItems.forEach(function (oModelItem) {
						var oColumn = this.getColumn(oModelItem.columnKey, aColumns);
						var sPath = UtilPersonalization.getColumnKey(oColumn);
						aFilters.push(new Filter(sPath, oModelItem.operation, oModelItem.value1, oModelItem.value2));
					}, this);
				}
				oTableRowsBinding.filter(aFilters);

				if (oPersistentData.sort && oPersistentData.sort.sortItems) {
					oPersistentData.sort.sortItems.forEach(function(oMSortItem) {
						var aSorter = aSorters.filter(function(oSorter) {
							return oSorter.sPath === oMSortItem.columnKey;
						});
						if (aSorter[0]) {
							aSorter[0].bDescending = oMSortItem.operation === "Descending";
						} else {
							aSorters.push(new Sorter(oMSortItem.columnKey, oMSortItem.operation === "Descending"));
						}
					});
				}
				oTableRowsBinding.sort(aSorters);
			},

			getColumn: function(sColumnKey, aColumns) {
				var oResultColumn = null;
				aColumns.some(function(oColumn) {
					if (UtilPersonalization.getColumnKey(oColumn) === sColumnKey) {
						oResultColumn = oColumn;
						return true;
					}
				}, this);
				return oResultColumn;
			}

		});

	});
