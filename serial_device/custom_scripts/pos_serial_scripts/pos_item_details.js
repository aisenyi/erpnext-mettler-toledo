erpnext.PointOfSale.ItemDetails = class extends erpnext.PointOfSale.ItemDetails {
	init_child_components() {
		this.$component.html(
			`<div class="item-details-header">
				<div class="label">Item Details</div>
				<div class="close-btn">
					<svg width="32" height="32" viewBox="0 0 14 14" fill="none">
						<path d="M4.93764 4.93759L7.00003 6.99998M9.06243 9.06238L7.00003 6.99998M7.00003 6.99998L4.93764 9.06238L9.06243 4.93759" stroke="#8D99A6"/>
					</svg>
				</div>
			</div>
			<div class="item-display">
				<div class="item-name-desc-price">
					<div class="item-name"></div>
					<div class="item-desc"></div>
					<div class="item-price"></div>
				</div>
				<div class="item-image"></div>
			</div>
			<div class="discount-section"></div>
			<div class="form-container"></div>
			<div>
				<button id="sendData">Get Weightttttt</button>
			</div>`
		)
		console.log({"wrapper": window.something});
		this.$component.on('click', '#reloadDevices', () => {
			this.realodDevices();
		});
		this.$component.on('click', '#initialize', () => {
			var serialPort = new erpnext.PointOfSale.SerialPort();
			serialPort.setOnDataReceivedCallback(this.onNewData);
			consoloe.log("Initialize called");
			this.realodDevices();
		});
		
		this.$component.on('click', '#sendData', () => {
			this.sendData();
		});
		this.$item_name = this.$component.find('.item-name');
		this.$item_description = this.$component.find('.item-desc');
		this.$item_price = this.$component.find('.item-price');
		this.$item_image = this.$component.find('.item-image');
		this.$form_container = this.$component.find('.form-container');
		this.$dicount_section = this.$component.find('.discount-section');
		
		//Initialize connection with serial device
		window.serialPort.setOnDataReceivedCallback(this.onNewData);
		window.port = chrome.runtime.connect(window.extensionId);
		this.add_listener();
		
		//Get weight
		this.old_weight = 0;
		this.$component.on('click', '#sendData', () => {
			this.sendData();
		});
	}
	
	toggle_item_details_section(item) {
		const { item_code, batch_no, uom } = this.current_item;
		const item_code_is_same = item && item_code === item.item_code;
		const batch_is_same = item && batch_no == item.batch_no;
		const uom_is_same = item && uom === item.uom;

		this.item_has_changed = !item ? false : item_code_is_same && batch_is_same && uom_is_same ? false : true;

		this.events.toggle_item_selector(this.item_has_changed);
		this.toggle_component(this.item_has_changed);

		if (this.item_has_changed) {
			this.doctype = item.doctype;
			this.item_meta = frappe.get_meta(this.doctype);
			this.name = item.name;
			this.item_row = item;
			this.currency = this.events.get_frm().doc.currency;

			this.current_item = { item_code: item.item_code, batch_no: item.batch_no, uom: item.uom };

			this.render_dom(item);
			this.render_discount_dom(item);
			this.render_form(item);
			
			window.serialPort.getWeight(
				function(response){
					console.log(response);
				}
			);
		} else {
			this.validate_serial_batch_item();
			this.current_item = {};
		}
	}
	
	add_listener(){
		var me = this;
		window.port.onMessage.addListener(
			function(msg) {
			  console.log({"msg":msg});
			  if(msg.header === "guid"){
				window.portGUID = msg.guid;
				me.openSelectedPort();
			  }
			  else if(msg.header === "serialdata"){
				me.onNewData(new Uint8Array(msg.data).buffer);
				/*if(onDataReceivedCallback !== undefined){
				  onDataReceivedCallback(new Uint8Array(msg.data).buffer);
				}*/
			  }
			  else if(msg.header === "serialerror"){
				me.onErrorReceivedCallback(msg.error);
			  }
			}
		);
	}
	
	closeCurrentPort(){
        window.serialPort.closePort(
          function(response){
            console.log(response);
            if(response.result === "ok"){
              //Do something
            }
            else{
              alert(response.error);
            }
          }
        );
    }
	
	sendData(){
        var input = this.stringToArrayBuffer("W");

        window.serialPort.write(input,
          function(response){
            console.log(response);
          }
        );
    }

    stringToArrayBuffer(string){
        var buffer = new ArrayBuffer(string.length);
        var dv = new DataView(buffer);
        for(var i = 0; i < string.length; i++){
          dv.setUint8(i, string.charCodeAt(i));
        }
        return dv.buffer;
    }
	
	openSelectedPort(){
        window.serialPort.openPort(
          {
            portName: window.portName,
            bitrate: window.bitrate,
            dataBits: window.dataBits,
            parityBit: window.parityBit,
            stopBits: window.stopBits
          },
		  window.portGUID,
          function(response){
            console.log(response);
            if(response.result === "ok"){
              //Do something
              alert("Weigh device connected!");
            }
            else{
              alert(response.error);
            }
          }
        );
    }
	
	onNewData(data){
		var str = "";
        var dv = new DataView(data);
        for(var i = 0; i < dv.byteLength; i++){
            str = str.concat(String.fromCharCode(dv.getUint8(i, true)));
        }
		var weight = parseFloat(str)
		console.log(weight);
		if(isNaN(weight)){
			//setTimeout(this.sendData(), 500);
		}
		else{ 
			if(weight > 0 && weight != this.old_weight){
				this.old_weight = weight;
				this.qty_control.set_value(weight);
				
				//$('qty_control').value(weight);
				//$('#output').append(weight);
			}
			setTimeout(this.sendData(), 200);
		}
	}
}
