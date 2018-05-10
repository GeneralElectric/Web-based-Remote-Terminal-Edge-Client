// Require additional libraries needed for application
const io = require('socket.io-client');
var os = require('os');
const request = require('sync-request');
const moment = require('moment');
const sleep = require('system-sleep');
const sessionManager = require('../lib/sessionManager.js');
const config = require('../config/config.json');
const timestampFormat = config.logTimestampFormat;
const apertureServer = config.apertureEndpoint;
const macAddress = getMacAddress();

// Start application by first fetching token from UAA
startSocketConnection(macAddress);

// Get MAC Address of primary adapter used for internet for the device
function getMacAddress(){
    var macAddress;
    while (macAddress === undefined){
        try{
            macAddress = os.networkInterfaces()[config.interface][0].mac.split(":").join("").toUpperCase();
        } catch(err){
            console.log(err);
            console.log(`${moment().format(timestampFormat)}: Failed to retrieve the MAC address. Make sure your network adapter is set correctly in the config and your network adatper is online. Retrying...`);
            sleep(5000);
        }
    }
    console.log(`${moment().format(timestampFormat)}: Your MAC address is ${macAddress}.`);
    return macAddress;  
};

// Start connection to Aperture Server
function startSocketConnection(macAddress){
    const sm = new sessionManager.SessionManager();
    const clientInfo = {apertureClientId: macAddress, type: 'device'};

    console.log(`${moment().format(timestampFormat)}: Pointing device to aperture at ${apertureServer}.`);
    const socket = io.connect(apertureServer, {
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: Infinity
    });

    // Connect to Aperture and send authentication details
    socket.on(config.clientSubOptions.connect, () => {
        console.log(`${moment().format(timestampFormat)}: This device is attemtping to authenticate with the aperture server as "${macAddress}".`);
        socket.emit(config.clientPubOptions.authentication, clientInfo);
    });

    // Request to join room if authenticated
    socket.on(config.clientSubOptions.authenticated, () => {
        console.log(`${moment().format(timestampFormat)}: This device was successfully authenticated with the aperture server.`);
        console.log(`${moment().format(timestampFormat)}: This device is now attempting to join the room "${macAddress}".`);
        socket.emit(config.clientPubOptions.joinRoom, macAddress);
    });

    // Log that the device has joined the room successfully
    socket.on(config.clientSubOptions.joinedRoom, (data) => {
        console.log(`${moment().format(timestampFormat)}: Successfully joined the room: ${data}.`);
    });
  
    // Create a terminal session once the user has joined the device
    socket.on(config.clientSubOptions.userJoinedDevice, (data) => {
        console.log(`${moment().format(timestampFormat)}: Creating local terminal session for the user ${data}.`);
        sm.addSession(data);
    });

    // Take in terminal data and pass it to session manager
    socket.on(config.clientSubOptions.terminalData, (data) => {
        sm.sendMessage(data.user, data.terminalData);
    });

    // Remove users terminal session via the session manager if they disconnect from the device
    socket.on(config.clientSubOptions.userLeftDevice, (user) => {
        console.log(`${moment().format(timestampFormat)}: The socket ID ${user} has ended their session with this device.`);
        sm.removeSession(user);
    });

    // Resize users terminal session via the session manager
    socket.on(config.clientSubOptions.resizeTerminal, (data) => {
        console.log(`${moment().format(timestampFormat)}: Resizing the terminal for user ${data.user} to ${data.cols} columns and ${data.rows} rows.`);
        sm.resizeTerminal(data.user, data.rows, data.cols);
    });

    // Attempt to connect to the aperture server again if we were unauthorized
    socket.on(config.clientSubOptions.unauthorized, (data) => {
        console.log(`${moment().format(timestampFormat)}: This device was unauthorized to access the Aperture server; reconnecting.`);
        const macAddress = getMacAddress();
        const clientInfo = {apertureClientId: macAddress, type: 'device'};
        setTimeout(() => { socket.emit(config.clientPubOptions.authentication, clientInfo); }, 5000);
    });

    // Log that the device has successfully disconnected from the aperture server
    socket.on(config.clientSubOptions.disconnect, () => {
        console.log(`${moment().format(timestampFormat)}: This device has been disconnected from the aperture server.`);
    });

    // Forward user terminal data from the session manager back up to the aperture server
    sm.on('data', (messageData) => {
        socket.emit(config.clientPubOptions.terminalData, { terminalData: messageData.message, user: messageData.user });
    });
};