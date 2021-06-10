sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/comp/personalization/Controller",
	'sap/ui/comp/personalization/Util',
	'sap/ui/model/Sorter',
	'sap/ui/model/Filter'
],
	function (Controller, TablePersoController, UtilPersonalization, Sorter, Filter) {
		"use strict";

		return Controller.extend("persotest.controller.Main", {
			onInit: function () {
				var oTable = this.byId("bigFuckingTable");
				this.oTPC = new TablePersoController({
					table: oTable,
					setting: {
						columns: {
							visible: false
						}
					},
					afterP13nModelDataChange: [this.onAfterP13nModelDataChange, this]
				});
			},

			handleTablePersoPress: function(/* oEvent */){
				this.oTPC.openDialog();
			}, 

			onAfterP13nModelDataChange: function (oEvent) {
				var oPersistentData = oEvent.getParameter("persistentData");
				var oTable = oEvent.getSource().getTable();

				var aColumns = oTable.getColumns();
				var aFilters = [];
				var aSorters = [];
				var oBinding = oTable.getBinding("rows");
				if (oPersistentData.filter && oPersistentData.filter.filterItems) {
					oPersistentData.filter.filterItems.forEach(function (oModelItem) {
						var oColumn = this.getColumn(oModelItem.columnKey, aColumns);
						var sPath = UtilPersonalization.getColumnKey(oColumn);
						aFilters.push(new Filter(sPath, oModelItem.operation, oModelItem.value1, oModelItem.value2));
					}, this);
				}
				oBinding.filter(aFilters);

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
				oBinding.sort(aSorters);
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
