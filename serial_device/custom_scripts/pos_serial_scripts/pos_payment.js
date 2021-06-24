erpnext.PointOfSale.Payment = class extends erpnext.PointOfSale.Payment{
	checkout() {
		this.events.toggle_other_sections(true);
		this.toggle_component(true);

		this.render_payment_section();
		
		if(window.enable_weigh_scale == 1){
			if(typeof(window.mettlerWorker) != "undefined"){
				window.mettlerWorker.postMessage({"command": "stop"});
			}
		}
	}
}
