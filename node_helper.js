"use strict";
const NodeHelper = require("node_helper");
const fetch = require('node-fetch');

module.exports = NodeHelper.create({

    socketNotificationReceived: async function(notification, payload) {
		if (notification === "FETCH_OP_ITEMS" && payload.config !== undefined) {
			this.config = payload.config;
			await this.fetchOHItems(payload.id);
		}
    },
    fetchOHItems : async function(id) {
        var self = this;
        var ohItems = self.config.ohItems;
		var responseItems = [];
		await Promise.all(ohItems.map(async (ohItem) => {
			var url = self.config.openhabUrl+ "rest/items/" + ohItem;
			let settings = { method: "Get" };
			const jsonObj = await fetch(url,settings).then(response => response.json());
			responseItems.push(jsonObj);
		}));
        self.sendSocketNotification("OH_ITEMS", {data: responseItems, id: id});
    }
});