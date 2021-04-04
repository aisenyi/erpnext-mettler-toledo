erpnext.PointOfSale.Controller = class extends erpnext.PointOfSale.Controller{
	async prepare_app_defaults(data) {
		this.pos_opening = data.name;
		this.company = data.company;
		this.pos_profile = data.pos_profile;
		this.pos_opening_time = data.period_start_date;
		this.item_stock_map = {};
		this.settings = {};

		frappe.db.get_value('Stock Settings', undefined, 'allow_negative_stock').then(({ message }) => {
			this.allow_negative_stock = flt(message.allow_negative_stock) || false;
		});

		frappe.db.get_doc("POS Profile", this.pos_profile).then((profile) => {
			//serial device connection settings
			window.extensionId = profile.serial_extension_id;
			window.portName = profile.port;
			window.bitrate = profile.bit_rate;
			window.dataBits = profile.data_bit.toLowerCase();
			window.parityBit = profile.parity.toLowerCase();
			window.stopBits = profile.stop_bit.toLowerCase();
			Object.assign(this.settings, profile);
			this.settings.customer_groups = profile.customer_groups.map(group => group.customer_group);
			this.make_app();
		});
	}
	
	init_item_details() {
		this.item_details = new erpnext.PointOfSale.ItemDetails({
			wrapper: this.$components_wrapper,
			settings: this.settings,
			events: {
				get_frm: () => this.frm,

				toggle_item_selector: (minimize) => {
					this.item_selector.resize_selector(minimize);
					this.cart.toggle_numpad(minimize);
				},

				form_updated: async (cdt, cdn, fieldname, value) => {
					const item_row = frappe.model.get_doc(cdt, cdn);
					if (item_row && item_row[fieldname] != value) {

						if (fieldname === 'qty' && flt(value) == 0) {
							this.remove_item_from_cart();
							return;
						}

						const { item_code, batch_no, uom } = this.item_details.current_item;
						const event = {
							field: fieldname,
							value,
							item: { item_code, batch_no, uom }
						}
						return this.on_cart_update(event)
					}
				},

				item_field_focused: (fieldname) => {
					this.cart.toggle_numpad_field_edit(fieldname);
				},
				set_value_in_current_cart_item: (selector, value) => {
					this.cart.update_selector_value_in_cart_item(selector, value, this.item_details.current_item);
				},
				clone_new_batch_item_in_frm: (batch_serial_map, current_item) => {
					// called if serial nos are 'auto_selected' and if those serial nos belongs to multiple batches
					// for each unique batch new item row is added in the form & cart
					Object.keys(batch_serial_map).forEach(batch => {
						const { item_code, batch_no } = current_item;
						const item_to_clone = this.frm.doc.items.find(i => i.item_code === item_code && i.batch_no === batch_no);
						const new_row = this.frm.add_child("items", { ...item_to_clone });
						// update new serialno and batch
						new_row.batch_no = batch;
						new_row.serial_no = batch_serial_map[batch].join(`\n`);
						new_row.qty = batch_serial_map[batch].length;
						this.frm.doc.items.forEach(row => {
							if (item_code === row.item_code) {
								this.update_cart_html(row);
							}
						});
					})
				},
				remove_item_from_cart: () => this.remove_item_from_cart(),
				get_item_stock_map: () => this.item_stock_map,
				close_item_details: () => {
					this.item_details.toggle_item_details_section(undefined);
					this.cart.prev_action = undefined;
					this.cart.toggle_item_highlight();
					window.is_item_details_open = false;
				},
				get_available_stock: (item_code, warehouse) => this.get_available_stock(item_code, warehouse)
			}
		});
	}
}
