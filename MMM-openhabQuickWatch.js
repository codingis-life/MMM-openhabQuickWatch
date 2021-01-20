Module.register("MMM-openhabQuickWatch", {
    defaults: {
        openhabUrl: 'http://openhab:8080/',
        updateInterval: 10000, //10 Seconds
        ohItems: [],
    },


    getStyles: function() {
        return [
            this.file('MMM-openhabQuickWatch.css'), 
        ]
    },

    start: function() {
        var self = this;
        self.loaded = false;
        self.itemState = "";
        
        self.sendSocketNotification("FETCH_OP_ITEMS", self.config);
        Log.info("Starting module: " + self.name);
        //add ID to the setInterval function to be able to stop it later on
		self.updateIntervalID = setInterval(function () {
			self.sendSocketNotification("FETCH_OP_ITEMS", {config: self.config, id: self.identifier});
		}, self.config.updateInterval);
    },

	socketNotificationReceived: function (notification, payload, sender) {
        if(payload.id !== this.identifier)
            return
		if (notification === "OH_ITEMS") {
            this.loaded = true;
            this.OhItems = payload.data.sort((a, b) => (a.label > b.label) ? 1 : -1);
			this.updateDom();
		} else if (notification === "FETCH_OH_ERROR") {
			Log.error("Openhab Error. Could not fetch items: " + payload.error);
		}
    },
    
    itemNameCell: function(itemName){
        return this.createCell("title bright alignLeft", itemName);
    },
    itemImageCell: function(state, itemType){
        var imageString = this.getimg(state, itemType);
        return this.createCell("", imageString);
    },
    itemTemperatureCell: function(itemTemp){
        itemTemp = parseFloat(itemTemp).toFixed(2);
        return this.createCell("title bright alignLeft", itemTemp + " °C ");
    },
    itemHumidutyCell:function(itemHumi){
        itemHumi = parseFloat(itemHumi).toFixed(2);
        return this.createCell("title bright alignLeft", itemHumi +" % ");
    },
    createCell: function(className, innerHTML) {
		var cell = document.createElement("div");
		cell.className = "divTableCell " + className;
		cell.innerHTML = innerHTML;
		return cell;
    },
    getimg: function(state, itemType){
        var imageType = "";
        if(itemType === "Contact"){
            imageType = "window"
        }
        return "<img src='./modules/MMM-openhabQuickWatch/img/"+ imageType.toLowerCase() + "-" + state.toLowerCase() + ".png' style='vertical-align:middle' class='OH-image-icon'>"
    },
    getDom: function () {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = "Loading...";
			wrapper.className = "dimmed light small";
			return wrapper;
        }

        var divTable = document.createElement("div");
		divTable.className = "OH-table normal small light";

		var divBody = document.createElement("div");
        divBody.className = "OH-table-body";
        
        //Iterate through openhab items
		this.OhItems.forEach(item => {
            var itemLabel = item.label;
            var itemType = item.type;
            var itemState = item.state;
            var divRow = document.createElement("div");
			//add a Row
            divRow.className = "OH-table-row";
            divRow.appendChild(this.itemNameCell(itemLabel));
            if(itemType === "Contact")
                divRow.appendChild(this.itemImageCell(itemState, itemType));
            if(itemType === "Group"){
                var temperature = item.members[0].type === "Number:Temperature" ? item.members[0].state : item.members[1].state;
                var humiduty = item.members[0].type === "Number:Temperature" ? item.members[1].state : item.members[0].state;
                divRow.appendChild(this.itemTemperatureCell(temperature));
                divRow.appendChild(this.itemHumidutyCell(humiduty));
            }
            divBody.appendChild(divRow);
        });
		divTable.appendChild(divBody);
		wrapper.appendChild(divTable);
        return wrapper;

    },
})