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
