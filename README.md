# IBM Watson IoT Edge Snap

Snap that runs IBM Watson IoT Edge Snap. It automatically registers the device after you have provided the organization identifier and sets up a connection between a local MQTT server on the device and bridges it transparently to the IBM Watson IoT cloud.

Build:
git clone ...
snapcraft

Run:

sudo snap install watsoniotedge
The first time you need to register your edge gateway. Just run:
sudo /snap/bin/watsoniotedge.init <orgid> <key> <token> [optionally gatewaytype] [optionally deviceid]
Optionally you can set an alternative mqtt host, user and password via:
sudo /snap/bin/watsoniotedge.init <orgid> <key> <token> --host localhost:1833 --user myuser --password mypassword
This will generate a file called watsoniotedge.json in /var/snap/watsoniotedge/common
Afterwards you can restart the service
sudo snap disable watsoniotedge
sudo snap enable watsoniotedge
From this moment onwards, the snap will connect to a local mqtt server (if you don't have one sudo snap install mosquitto)
and send all messages send to the local MQTT topic: cloud/watson/out/<optional topic>, to the cloud
If you listen to cloud/watson/in/<optional topic> you will receive messages from Watson.
