sap.ui.define([
	"sap/ui/core/mvc/Controller",
	// "sap/ui/table/TablePersoController",
	"sap/ui/comp/personalization/Controller"
],
	function (Controller, TablePersoController) {
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
					}
				});
			},

			handleTablePersoPress: function(/* oEvent */){
				this.oTPC.openDialog();
			}

		});
		
	});
