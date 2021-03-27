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
}