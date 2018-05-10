# Description
The Aperture client is designed to connect to an aperture server, get authorization if this option is added, and create a websocket connection for the purpose of sharing its terminal out to a web interface. This is great for managing devices remotely using a modern, HTML5 interface. The aperture client uses the xterm.js project for terminal emulation.

# Configuration
All configuration for the client is stored in `config/config.json`  Here are the environment configurations:
* `interface`: This is the interface that you want to get your MAC address from which will be used as the unique identifier of your device.
* `terminalEnvironment`: This should be set to `bash` if you are running in a Unix environment. If you are running in a Windows environment then it should be `cmd.exe` or `powershell.exe`.
* `terminalName`: This is set to `xterm-256color`. There is no need to change this unless you know what you are doing.
* `terminalColumns`: This is the default number of columns for the terminal, which is set to `80`.
* `terminalRows`: This is the default number of rows for the terminal, which is set to `24`.
* `apertureEndpoint`: This is the URL of your Aperture Server that your device will connect to.

# Installation
This application should be able to run on any Windows or Unix machine. Make sure to fill out your .env and then follow these steps:
```
git clone https://github.com/GeneralElectric/Web-based-Remote-Terminal-Edge-Client
npm start
```

# Usage
The client will sit and wait for data to come in from an aperture server--there is no further usage or input needed.

# Contributing
If you feel you can improve this service in any way, I'm happy to accept pull requests for the good of the service. I'm pretty new to Node.js/JavaScript and there is always room for improvement; feel free to submit pull requests.