#!/usr/bin/env node

var fs = require('fs'),
	SerialComms = require('../src/SerialComms'),
	DeviceManager = require('../src/DeviceManager'),

	PORT_FILENAME = __dirname + '/port.txt';




var config = {


	port: {

		set: function (port) {
			fs.writeFileSync(PORT_FILENAME, port);
		},


		get: function () {
			console.log ('Port:', port || '[not set]');
		}

	},


	file: {

		list: function () {
			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).getFileList()
					.then(function (files) {
						for (var i = 0, file; file = files[i]; i++) {
							size = '' + file.size;
							size = '        '.substr(size.length) + size;
							console.log (size + ' bytes  ' + file.filename);
						}
					})
					.then(comms.close.bind(comms));
			});
		},

		
		remove: function (filename) {
			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).removeFile(filename)
					.then(comms.close.bind(comms));
			});
		},

		
		write: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				basename = pathLib.basename(destination || filename);

			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).writeFile(basename, data)
					.then(comms.close.bind(comms));
			});
		},


		push: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				basename = pathLib.basename(destination || filename),
				match = filename.match(/\.([^\.]+)$/);

			if (match) {
				switch (match[1]) {
					case 'lua':
						data = require('luamin').minify(data);
						break;

					case 'html':
						data = require('html-minifier').minify(data, {
							removeComments: true,
							collapseWhitespace: true,
							removeRedundantAttributes: true,
							minifyJS: true,
							minifyCSS: true
						});
						break;

					case 'js':
						data = require('uglify-js').minify(data, {fromString: true}).code;
						break;

					case 'css':
						data = (new (require('clean-css'))).minify(data).styles;
						break;
				}
			}

			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).writeFile(basename, data)
					.then(comms.close.bind(comms));
			});
		},


		read: function (filename) {
			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).readFile(filename)
					.then(function (data) { return data.replace(/\r\n\r\n/g, '\n'); })
					.then(console.log)
					.then(comms.close.bind(comms));
			});
		},


		execute: function (filename) {
			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).executeFile(filename)
					.then(comms.close.bind(comms));
			});
		}

	},


	restart: function () {
		new SerialComms(port).on('ready', function (comms) {
			new DeviceManager(comms).restart()
				.then(comms.close.bind(comms));
		});
	},


	run: function (lua) {
		new SerialComms(port).on('ready', function (comms) {
			new DeviceManager(comms).executeLua(lua)
				.then(console.log)
				.then(comms.close.bind(comms));
		});
	}

};




function execute (config, args) {
	var prop = config[args.shift()];
	if (!prop) return false;

	if (typeof prop == 'function') {
		prop.apply(null, args);
		return true;
	}

	return execute(prop, args)
}






var args = process.argv.slice(2),
	port,
	success;


if (args[0] == 'port' && args[1] == 'set') {
	// NOOP

} else if (!fs.existsSync(PORT_FILENAME)) {
	console.log ('Serial port not configured.\nPlease use "esp port set <port_address>" to configure.');
	process.exit();

} else {
	port = '' + fs.readFileSync(PORT_FILENAME);
}


success = execute(config, args);

if (!success) console.log ('Invalid command.');

