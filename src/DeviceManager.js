


var Promise = require('es6-promise').Promise;



var CHUNK_SIZE = 128;




function DeviceManager (comms) {
	this._comms = comms;
}




DeviceManager.prototype.getFileList = function () {
	var command = 'for f,s in pairs(file.list()) do print(f,s) end';

	return this._sendCommand(command)
		.then(function (data) {
			var files = data.split('\r\n'),
				result = [],
				i, file;

			for (i = 0; file = files[i]; i++) {
				file = file.split('\t');
				result.push({ filename: file[0], size: file[1] });
			}

			return result;
		});
}




DeviceManager.prototype.removeFile = function (filename) {
	var command = 'file.remove"' + filename + '"';

	return this._sendCommand(command)
		.then(function (data) {
			return '' + data != '';
		});
};




DeviceManager.prototype.writeFile = function (filename, data) {
	return this.removeFile(filename)
		.then(this._writeFileHeader.bind(this, filename))
		.then(this._writeFileData.bind(this, data))
		.then(this._writeFileFooter.bind(this));
};




DeviceManager.prototype._writeFileHeader = function (filename, data) {
	var command = 'file.open("' + filename + '", "w")';
	return this._sendCommand(command);
};




DeviceManager.prototype._writeFileData = function (data) {
	var _this = this,
		chunked = [],
		chunk;

	data = '' + data;

	while (data.length) {
		chunk = data.substr(0, CHUNK_SIZE);
		data = data.substr(chunk.length);

		chunked.push(chunk);
	}

	return new Promise(function (resolve, reject) {
		function sendNextChunk () {
			if (!chunked.length) return resolve();
			_this._writeFileChunk(chunked.shift()).then(sendNextChunk);
		}

		sendNextChunk();
	});
};




DeviceManager.prototype._writeFileChunk = function (chunk) {
	var command,
		translate = { '\t': '\\t', '\n': '\\n', '\r': '\\r', '"': '\\"', '\\': '\\\\' };

	chunk = chunk.replace(/[\t\n\r"\\]/g, function (x) { return translate[x]; });
	command = 'file.write"' + chunk + '"';

	return this._sendCommand(command);
};




DeviceManager.prototype._writeFileFooter = function () {
	var command = 'file.flush()file.close()';
	return this._sendCommand(command);
};




DeviceManager.prototype.readFile = function (filename) {
	var command = 'file.open("' + filename + '","r")for line in file.readline do print(line) end file.close()';
	return this._sendCommand(command);
};




DeviceManager.prototype.executeFile = function (filename) {
	var command = 'dofile"' + filename + '"';
	return this._sendCommand(command);
};




DeviceManager.prototype.executeLua = function (lua) {
	return this._sendCommand(lua);
};




DeviceManager.prototype.restart = function (lua) {
	var command = 'node.restart()';
	return this._sendCommand(command);
};




DeviceManager.prototype._sendCommand = function (command) {
	var _this = this;

	return new Promise(function (resolve, reject) {
		_this._comms.once('response', resolve).send(command + '\r\n');
	});
};




module.exports = DeviceManager;

