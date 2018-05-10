// Require additional libraries needed for application
const pty = require('node-pty');
const config = require('../config/config.json');
const os = require('os');

// Session object to hold individual user sessions while connected to the device
class Session {
    constructor(user) {
        this.user = user;
        this.terminal = pty.spawn((os.platform()==='win32')? "cmd.exe" : "bash", [], {
            name: config.terminalName,
            cols: config.terminalColumns,
            rows: config.terminalRows,
            cwd: process.env.PWD,
            env: process.env,
        });
    };
};

// Export the Session object
module.exports = {
    Session
};