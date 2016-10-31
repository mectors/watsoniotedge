var iotf = require(process.env['SNAP']+"/lib/node_modules/ibmiotf");
var program = require(process.env['SNAP']+'/lib/node_modules/commander');
var jsonfile = require(process.env['SNAP']+'/lib/node_modules/jsonfile');

program
.arguments('<orgid> <watsonkey> <watsontoken> [gatewaytype] [devideid]')
.option('-h, --host <host>', 'The mqtt host to connect to. Default: localhost','localhost')
.option('-p, --port <port>', 'The mqtt port to connect to. Default: 1883','1883')
.option('-u, --username <username>', 'The mqtt user to authenticate as')
.option('-k, --password <password>', 'The user\'s password')
.action(function(orgid, watsonkey, watsontoken, gatewaytype, deviceid) {
  orgidValue = orgid;
  watsonkeyValue = watsonkey;
  watsontokenValue = watsontoken;
  gatewaytypeValue = gatewaytype;
  if (typeof gatewaytypeValue == 'undefined') {
    gatewaytypeValue = 'gw';
  }
  deviceidValue = deviceid;
  if (typeof deviceidValue == 'undefined') {
    deviceidValue = 'snappygateway'+Date.now();
  }
})
.parse(process.argv);


var appClientConfig = {
  "org": orgidValue,
  "id": deviceidValue,
  "type": gatewaytypeValue,
  "domain": "internetofthings.ibmcloud.com",
  "auth-key": watsonkeyValue,
  "auth-method": "token",
  "auth-token": watsontokenValue,
  "host": program.host,
  "port": program.port,
  "user": program.username,
  "password": program.password
};

var file = process.env.SNAP_COMMON+'/gateway.json'

console.log(appClientConfig);
jsonfile.writeFile(file, appClientConfig, function (err) {
  console.error(err)
})

var appClient = new iotf.IotfApplication(appClientConfig);

//setting the log level to trace. By default its 'warn'
appClient.log.setLevel('info');

appClient.
getDeviceType(gatewaytypeValue).then (function onSuccess (argument) {
	console.log("Success");
	console.log(argument);
  //sample device Request
  var devices = [
    {
      "typeId": gatewaytypeValue,
      "deviceId": deviceidValue,
      "authToken": watsontokenValue
    }
  ]
  console.log(devices);
  appClient.
  registerMultipleDevices(devices). then (function onSuccess (response) {
  	console.log("Success");
  	console.log(response);
  }, function onError (argument) {

  	console.log("Fail");
  	console.log(argument);
  });
}, function onError (argument) {
  // The devicetype does not exist so let's add it.
  var gwConfig = {
    "serialNumber": "TBD",
    "manufacturer": "TBD",
    "model": "TBD",
    "deviceClass": "Snappy Ubuntu Core Gateway",
    "description": "The Snappy Ubuntu Core Gateway",
    "fwVersion": "0.1",
    "hwVersion": "0.1",
    "descriptiveLocation": "TBD"
  };
  var metaConfig = {};
  appClient.
  registerDeviceType(gatewaytypeValue,"An Ubuntu Core Gateway",gwConfig,metaConfig,"Gateway").then (function onSuccess (argument) {
  	console.log("Success");
  	console.log(argument);
    //sample device Request
    var devices = [
      {
        "typeId": gatewaytypeValue,
        "deviceId": deviceidValue,
        "authToken": watsontokenValue
      }
    ]
    console.log(devices);
    appClient.
    registerMultipleDevices(devices). then (function onSuccess (response) {
    	console.log("Success");
    	console.log(response);
    }, function onError (argument) {

    	console.log("Fail");
    	console.log(argument);
    });
  }, function onError (argument) {
  	console.log("Fail");
  	console.log(argument);
  });

});
