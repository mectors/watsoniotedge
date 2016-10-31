var mqtt = require(process.env['SNAP']+"/lib/node_modules/mqtt");
var iotf = require(process.env['SNAP']+"/lib/node_modules/ibmiotf");
var jsonfile = require(process.env['SNAP']+"/lib/node_modules/jsonfile");
var fs = require('fs');

function fileExists(filePath)
{
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
}

var file = process.env.SNAP_COMMON+'/gateway.json';
if (!fileExists(file)) {
  console.log("Please run sudo /snap/bin/watsoniotedge.init <org> <key> <token> first, afterwards restart via sudo snap disable watsoniotedge; sudo snap enable watsoniotedge");
  process.exit(1);
}

var gatewayjson = jsonfile.readFileSync(file);

var gatewayClient = new iotf.IotfGateway(gatewayjson);
console.log(gatewayjson);
gatewayClient.connect();

// Create a client instance
var client;
if (gatewayjson.username != '') {
  client = new mqtt.connect('mqtt://'+gatewayjson.host+':'+Number(gatewayjson.port), {'clientId':gatewayjson.id, 'username':gatewayjson.username, 'password':gatewayjson.password});
} else {
  client = new mqtt.connect('mqtt://'+gatewayjson.host+':'+Number(gatewayjson.port), {'clientId':gatewayjson.id});
}



// called when the client connects
client.on('connect', function () {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("cloud/watson/out/#");
});

// called when the client loses its connection
client.on('offline', function () {
  if (gatewayjson.username != '') {
    client = new mqtt.connect('mqtt://'+gatewayjson.host+':'+Number(gatewayjson.port), {'clientId':gatewayjson.id, 'username':gatewayjson.username, 'password':gatewayjson.password});
  } else {
    client = new mqtt.connect('mqtt://'+gatewayjson.host+':'+Number(gatewayjson.port), {'clientId':gatewayjson.id});
  }
});

// called when a message arrives
client.on('message', function (topic, message) {
  console.log("onMessageArrived:"+message+" from:"+topic);
  gatewayClient.publishGatewayEvent(topic, 'json', message, 1);
});

gatewayClient.on('connect', function(){
    gatewayClient.subscribeToGatewayCommand('cloud/watson/in/#');
});

gatewayClient.on('command', function(type, id, commandName, commandFormat, payload, topic){
    console.log("Command received");
    message = new mqtt.Message(payload);
    message.destinationName = commandName+'/'+topic;
    client.send(message);
});

gatewayClient.on('disconnect', function(){
  console.log('Disconnected!!');
  gatewayClient.connect();
});

gatewayClient.on('error', function (argument) {
	console.log(argument);
	process.exit(1);
});
