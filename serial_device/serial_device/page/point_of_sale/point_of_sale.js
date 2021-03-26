frappe.provide('erpnext.PointOfSale');

frappe.pages['point-of-sale'].on_page_load = function(wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Point of Sale'),
		single_column: true
	});

	frappe.require('assets/js/point-of-sale.min.js', function() {
		window.extensionId = "lhphimlabkfchifcfjagjihkjpdcgdgi";
		window.serialPort = new erpnext.PointOfSale.SerialPort();
		wrapper.pos = new erpnext.PointOfSale.Controller(wrapper);
		window.cur_pos = wrapper.pos;
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
