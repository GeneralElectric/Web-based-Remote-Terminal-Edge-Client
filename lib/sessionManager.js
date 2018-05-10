const session = require('./session.js');
const eventEmitter = require('events');

// Session manager to handle all sessions for all users that are connected
class SessionManager extends eventEmitter {
    constructor() {
        super();
        this.sessions = {};
    };

    // Create a new session object for the connecting user
    addSession(user) {
        try{
            this.sessions[user] = new session.Session(user);

            // Listen for messages from the terminal
            this.sessions[user].terminal.on('data', (data) => {
            this.emit('data', { user, message: data });
            });
        } catch(err){
            console.log(err);
        }
    };

    // Remove the local session of the disconnecting user
    removeSession(user) {
        try{
            var term = this.sessions[user].terminal
            if (term !== undefined) {
                term.kill();
            }
            delete this.sessions[user];
        } catch(err){
            console.log(err);
        }
    };

    // Take terminal data from the user and write it to their local session terminal
    sendMessage(user, message) {
        try{
            this.sessions[user].terminal.write(message);
        } catch(err){
            console.log(err);
        }
    };

    // Resize the connected users terminal
    resizeTerminal(user, rows, cols) {
        try{
            this.sessions[user].terminal.resize(cols, rows);
        } catch(err){
            console.log(err);
        }
    };
};

// Export the Session and Session Manager objects
module.exports = {
    SessionManager
};