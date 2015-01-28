# An ESP8266 command line interface.
Administer the file system and more on an ESP8266 that is flashed with [NodeMcu firmware](https://github.com/nodemcu/nodemcu-firmware).

## Install
```
$ npm install esp8266 -g
```

## Usage
```
$ esp command [subcommand] [data]
```

## Commands
#### port set
Sets the name of the serial port to use in future commands.
```
$ esp port set /dev/tty.usbserial-A603UC7E
```

#### port get
Displays the current port that is used.
```
$ esp port get
Port: /dev/tty.usbserial-A603UC7E
```

#### file list
Lists the sizes and names of all files on the module.
```
$ esp file list
    1093 bytes  init.lua
    1321 bytes  test.lua
```

#### file write &lt;local_filename> [&lt;remote_filename>]
Writes a file from the local file system to the module. If a second filename is given, the local file will be renamed to this value on the device, else it will keep its local name.
```
$ esp file write ./webserver.lua init.lua
```

#### file push &lt;local_filename> [&lt;remote_filename>]
Alternative to `esp file write` that compress the file if they are of any of the following types: Lua, HTML, JavaScript, CSS. 
```
$ esp file push ./webserver.lua init.lua
```

#### file read &lt;remote_filename>
Displays the content of a file from the module.
```
$ esp file read hello-world.lua
print 'Hello, world'
```

#### file execute &lt;remote_filename>
Executes the content of a Lua file on the module, returns the output.
```
$ esp file execute hello-world.lua
Hello, world
```

#### file remove &lt;remote_filename>
Removes a file from the module.
```
$ esp file remove test.lua
```

#### restart
Restarts the module.
```
$ esp restart
```

#### run &lt;lua>
Runs Lua code on the module, returns the output.
```
$ esp run "print 'Mechanisms, not policy.'"
Mechanisms, not policy.
```

## License
MIT



