frappe.ui.form.on('POS Profile', {
	refresh: function(frm){
		if(frm.doc.enable_weigh_scale){
			frm.events.load_ports(frm);
		}
		frm.events.show_hide_fields(frm);
	},
	
	validate: function(frm){
		if(frm.doc.enable_weigh_scale){
			var serial_fields = ['serial_extension_id', 'port', 'bit_rate', 'data_bit', 'parity', 'stop_bit'];
			serial_fields.forEach(function(field){
				if(!frm.doc[field]){
					frappe.throw('Please enter all fields in the Weight Device settings section');
					frappe.validated = false;
				}
			});
		}
	},
	
	show_hide_fields: function(frm){
		var display = false;
		if(frm.doc.enable_weigh_scale){
			display = true;
		}
		var serial_fields = ['serial_extension_id', 'port', 'bit_rate', 'data_bit', 'parity', 'stop_bit'];
		serial_fields.forEach(function(field){
			cur_frm.toggle_display(field, display);
		});
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
	},
	
	enable_weigh_scale: function(frm){
		frm.events.show_hide_fields(frm);
	}
});
