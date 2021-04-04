frappe.provide('erpnext.PointOfSale');

frappe.pages['point-of-sale'].on_page_load = function(wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Point of Sale'),
		single_column: true
	});

	frappe.require('assets/js/point-of-sale.min.js', function() {
		window.serialPort = new erpnext.PointOfSale.SerialPort();		
		wrapper.pos = new erpnext.PointOfSale.Controller(wrapper);
		window.cur_pos = wrapper.pos;
		
		//Initialize connection with serial device
		/*window.serialPort.setOnDataReceivedCallback(window.onNewData);
		window.port = chrome.runtime.connect(window.extensionId);
		window.add_listener();*/
		window.is_item_details_open = false;
		window.add_listener = function(){
			window.port.onMessage.addListener(
				function(msg) {
				  console.log({"msg":msg});
				  if(msg.header === "guid"){
					window.portGUID = msg.guid;
					window.openSelectedPort();
				  }
				  else if(msg.header === "serialdata"){
					window.onNewData(new Uint8Array(msg.data).buffer);
					/*if(onDataReceivedCallback !== undefined){
					  onDataReceivedCallback(new Uint8Array(msg.data).buffer);
					}*/
				  }
				  else if(msg.header === "serialerror"){
					window.onErrorReceivedCallback(msg.error);
				  }
				}
			);
		}
		
		window.sendData = function(){
			var input = window.stringToArrayBuffer("W");

			window.serialPort.write(input,
			  function(response){
				console.log(response);
			  }
			);
		}

		window.stringToArrayBuffer = function(string){
			var buffer = new ArrayBuffer(string.length);
			var dv = new DataView(buffer);
			for(var i = 0; i < string.length; i++){
			  dv.setUint8(i, string.charCodeAt(i));
			}
			return dv.buffer;
		}
		
		window.openSelectedPort = function(){
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
		
		window.onNewData = function(data){
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
				if(weight > 0 && weight != window.old_weight){
					window.old_weight = weight;
					window.qty_control.set_value(weight);
					
					//$('qty_control').value(weight);
					//$('#output').append(weight);
				}
				setTimeout(window.sendData(), 200);
			}
		}
	});
};

frappe.pages['point-of-sale'].refresh = function(wrapper) {
	if (document.scannerDetectionData) {
		onScan.detachFrom(document);
		wrapper.pos.wrapper.html("");
		wrapper.pos.check_opening_entry();
	}
	
	window.onbeforeunload = function(){
		//if(window.serialPort.isOpen()){
		  window.serialPort.closePort(
			function(response){
			  console.log(response);
			  if(response.result === "ok"){
				return null;
			  }
			  else{
				alert(response.error);
				return false;
			  }
			}
		  );
		//}
		return null;
	}
};
