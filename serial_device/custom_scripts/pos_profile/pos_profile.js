frappe.ui.form.on('POS Profile', {
	refresh: function(frm){
		if(frm.doc.enable_weigh_scale){
			frm.events.load_ports(frm);
		}
	},
	
	load_ports: function(frm){
		var extensionId = frm.doc.serial_extension_id;
		if(extensionId){
			chrome.runtime.sendMessage(extensionId, 
				{cmd: "list"}, 
				function(response){
					if(response.result === "ok"){
						var ports = [];
						for(var i = 0; i < response.ports.length; i++){
							ports.push(response.ports[i].path);
						}
						cur_frm.set_df_property("port", "options", ports);
						cur_frm.refresh_field("port");
					}
					else{
					  alert(response.error);
					}
				}
			);
		}
	},
	
	serial_extension_id: function(frm){
		frm.events.load_ports(frm);
	}
});
