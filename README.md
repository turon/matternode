```
                                                                                     █
                             █     █                                                 █
  ▄▀▀▀▄ ▄▀▀▀▄     ▄▀▀▀▀▄█  ▀▀█▀▀▀▀▀█▀▀   ▄▀▀▀▀▄    ▄▀▀   ▄▀▀▀▀▄     ▄▀▀▀▀▄     ▄▀▀▀▀▄█    ▄▀▀▀▀▄
 █     █     █   █      █    █     █    █▄▄▄▄▄▄█  ▐▌     █     █   █      █   █      █   █▄▄▄▄▄▄█
 █     █     █   █      █    █     █    █         ▐▌     █     █   █      █   █      █   █
 █     █     █    ▀▄▄▄▄▀█    ▀▄▄   ▀▄▄   ▀▄▄▄▄▀   ▐▌     █     █    ▀▄▄▄▄▀     ▀▄▄▄▄▀█    ▀▄▄▄▄▀
```

![Build](https://github.com/turon/matternode/actions/workflows/node.js.yml/badge.svg?event=push)

# Matter implementation on node.js

This project provides a light-weight node.js implementation of a Matter Node:
https://github.com/project-chip/connectedhomeip

## Install Dependencies

```
npm install
```

## Build

Because TypeScript is used, the project needs to be built before it can be run.

```
npm run build
```
## Run

There are three ways to start matternode. The `nodenum` parameter provides a unique identifier for the matternode process mainly to allocate a unique port number. If `nodenum` is not passed, it will default to `0`. The node will allocate a default port of `nodenum + 5540` unless a config file already exists with a manually configured port for the node.

```
npm start <nodenum>
```

or

```
node dist/app.js <nodenum>
```

or

To build and run:
```
make run dev <nodenum>
```

## Run tests

To execute all tests and generate a coverage report:

```
npm test
```

To execute one test file with full trace level logging:

```
PINO_LOG_LEVEL=trace npm testone dist/test/message/TestMsgCodec.js
```

## Build Docs

```
make doc
```
## Usage

```
$ node src/shell/cli.js 
Network interfaces: [ '::%lo', '::%wlp2s0' ]
store: fabricid = 0000000000000000
store: nodeid = 13671e3e9dd98181

matternode>
```

### help

Display a list of all top-level commands supported and a brief description.

```
> help
help        Display list of all commands
config      Display all config variables
crypto	    Run crypto functions
dacpriv	    Get and set the Device Attestation private key
dacpub	    Get the Device Attestation public key
dac	        Get the Device Attestation Certificate
exchange	  Manage active exchanges
exit        Exit the shell
fabricid    Get and set the FabricId
key         Get and set the EncryptionKey
log	        Output a log message
loglevel	  Get and set the LogLevel
mdns        Execute the mDNS discovery client
msg         Encode a message
nodeid      Get and set the NodeId
nodenum     Get and set the Node Number
pase	      Manage a PASE session
port        Get and set the IPv6 port
session	    Manage active sessions
tlv	        Encode / decode TLV
trace	      Output a trace event
tracelevel	Get and set the TraceLevel
x509	      Encode and decode X.509 certificates
Done
```
### config

Display all node configuration in persistant store.

```
> config
store: fabricid = 0000000000000000
store: nodeid = dc2ab22aad1f573e
store: encryptionKey = 00112233445566778899aabbccddeeff
store: nodeid = 3
store: ipPort = 5543
Done
```

### crypto

Encrypt or decrypt given messages.

```
> crypto -h
Key:  5eded244e5532b3cdc23409dbad052d2
Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -d, --decrypt  decrypt the given msg                                  [string]
  -e, --encrypt  encrypt the given msg                                  [string]
  -k, --key      encryption key to use, otherwise use `key` as stored in config
                                                                        [string]
Done
```

### dacpriv

Get DAC private key.

```
> dacpriv
aab600ae8ae8aab7d73627c217b7c204709ca6946af5f2f7530833a52b44fbff
Done
```
### dacpriv <privateKey>

Set DAC private key.
### dacpub

Get DAC public key.

```
> dacpub
04463ac69342910a0e5588fc6ff56bb63e62eccecb148f7d4eb03ee552601415767d16a5c663f793e49123260b8297a7cd7e7cfc7b316b39d98e90d29377738e82
Done
```
### dacpub <publicKey>

Set DAC public key.

### dac

Get Devise Attestation Certificat

```
> dac
308201e73082018ea003020102020869cdf10de9e54ed1300a06082a8648ce3d040302303d3125302306035504030c1c4d6174746572204465762050414920307846464631206e6f2050494431143012060a2b0601040182a27c02010c04464646313020170d3232303230353030303030305a180f39393939313233313233353935395a30533125302306035504030c1c4d61747465722044657620444143203078464646312f30783830303131143012060a2b0601040182a27c02010c044646463131143012060a2b0601040182a27c02020c04383030313059301306072a8648ce3d020106082a8648ce3d03010703420004463ac69342910a0e5588fc6ff56bb63e62eccecb148f7d4eb03ee552601415767d16a5c663f793e49123260b8297a7cd7e7cfc7b316b39d98e90d29377738e82a360305e300c0603551d130101ff04023000300e0603551d0f0101ff040403020780301d0603551d0e0416041488dde7b300382932cff734c04624810f44168a6f301f0603551d2304183016801463540e47f64b1c38d13884a462d16c195d8ffb3c300a06082a8648ce3d040302034700304402200127a27b4b44610ee2fcdc4d2b7885563660bc0f76f17219ed6a08dfb2b3c1cd02206b59e0af45f3eb2a85b919d35731528c6028c415239545e108e4e54e70971353
Done
```
### exit

Exit the shell terminal.

```
> exit
Goodbye
```

### fabricid

Display the Fabric ID of the node.

```
> fabricid
0000000000000000
Done
```

### fabricid <hex_string>

Set the Fabric ID of the node.

```
> fabricid 0
0000000000000000
Done
```

### key

Display the UDP port number of the node.

```
> key
00112233445566778899aabbccddeeff
Done
```

### key <hex_string>

Set the UDP port number of the node.

```
> key 000102030405060708090a0b0c00d0e0f
000102030405060708090a0b0c00d0e0f
Done
```

### log <message>

Output a log message. Outputs at all verbosity levels up to the current loglevel.  

```
> log hello
[2022-05-07 19:19:31.794 +0000] TRACE: hello
[2022-05-07 19:19:31.800 +0000] DEBUG: hello
[2022-05-07 19:19:31.800 +0000] INFO: hello
[2022-05-07 19:19:31.800 +0000] WARN: hello
[2022-05-07 19:19:31.801 +0000] ERROR: hello
[2022-05-07 19:19:31.801 +0000] FATAL: hello
Done
```

### loglevel <level>

Get the current loglevel.

```
> loglevel
info
Done
```
### loglevel <level>

Set the current loglevel. Valid levels are fatal, error, warn, info, debug, and trace.

```
> loglevel debug
debug
Done
```
### mdns

Trigger operational discovery.

```
> mdns 
response: 0000000000000000-dc2ab22aad1f573e._matter._tcp.local @ fe80::9f50:74d7:96c5:1a4f:5543
```

### msg

Encrypt and send a message.

```
>  msg
Plain:  00040000ab0000000400050303000300
Secure: 00040000ab00000014a05bca141327c184b93680b2e4dc7cf57dffe4de1329de
client sent to ::1:5543
server got: 00040000ab00000014a05bca141327c184b93680b2e4dc7cf57dffe4de1329de from ::1:59117
Plain:  00040000ab0000000400050303000300
Done

> msg help
Options:
      --help           Show help                                       [boolean]
      --version        Show version number                             [boolean]
  -d, -d, --dst        the destination node id                          [string]
  -n, -n, --src        the source node id                               [string]
  -c, -c, --counter    the message counter                              [number]
  -s, -s, --session    the session id                                   [number]
  -k, -k, --key        the encryption key to use for encoding the message
                                                                        [string]
  -x, -x, --privacy    the privacy flag                                 [number]
  -c, -c, --control    the control message flag                         [number]
  -i, -i, --initiator  the initiator flag (responder if clear)          [number]
  -a, -a, --ack        the acknowledgement flag                         [number]
  -r, -r, --reliable   the reliable message flag                        [number]
  -p, -p, --port       the ip port to send to                           [number]
  -h, -h, --host       the hostname or ipv6 address to send to          [string]
```

### nodeid

Display the Node ID of the node.

```
> nodeid
dc2ab22aad1f573e
Done
```

### nodeid <hex_string>

Set the Node ID of the node.

```
> nodeid 1
0000000000000001
Done
```

### nodenum

Display the node number of the node. The node num identifies the instance locally and maps to port allocation to allow running multiple nodes as processes on a single machine.

```
> nodenum
3
Done
```

### nodenum <number>

Set the Node number of the node.

```
> nodenum 3
3
Done
```

### pase

Start PASE session negotiation with given port.

```
> pase --help
Options:
      --version  Show version number                                   [boolean]
  -d, --dst      the destination node id                                [string]
  -k, --key      the PAKE key or pincode to use to establish the PASE session
                                                                        [string]
  -i, --ip       the destination IP address                             [string]
  -p, --port     the IP port to connect to                              [number]
      --help     Show help                                             [boolean]
Done

> pase -p 5540
...
```

### port

Display the UDP port number of the node.

```
> port
5543
Done
```

### port <number>

Set the UDP port number of the node.

```
> port 5544
5544
Done
```
### session

Session management command.

```
> session --help
Options:
      --version         Show version number                            [boolean]
  -p, --peerSessionId   the peer session id                             [number]
  -l, --localSessionId  the local session id                            [number]
      --help            Show help                                      [boolean]
Done
```

### tlv

TLV encode / decode tool.

```
> tlv --help
Options:
      --version    Show version number                                 [boolean]
  -d, --decode     the raw tlv to decode in hex                         [string]
  -e, --encode     the json to encode                                   [string]
  -t, --tab_width  tab width of json (default 2)                        [number]
      --help       Show help                                           [boolean]
Done
```

### tlv --decode <hex_string>

Decode the given TLV bytes.

```
> tlv -d 0118fc
[
  {
    "type": "int16",
    "value": -1000
  }
]
Done
```

### tlv --encode <json_string>

Encode the given JSON string into TLV hex string.

```
> tlv -e -1000
0118fc
Done
```

### x509

Converts given certificate to one of pem, base64, base64url, or hex.

```
> x509 --help
Options:
      --version  Show version number                                   [boolean]
  -i, --in       the x509 certificate input in tlv, tlv hex, der, der hex, or
                 pem                                                    [string]
  -o, --out      the output format of the x509 cetificate: pem, base64,
                 base64url, or hex (der)                                [string]
      --help     Show help                                             [boolean]
Done
```

# Running multiple instances

`matternode` uses the `node-localstorage` package to persistantly store configuration data of each node on disk. In order to run multiple nodes on one machine, start each node with their own `nodenum` so each will create and use their own `.node#` directory and use different ports for communication where `#` is the `nodenum` passed from the commandline.

```
# From matternode top-level
npm start 1

# In different terminal
npm start 2
```

To delete node state, i.e. factory reset, just delete the `.node#` directory of the node:

```
rm -fr .node2
```

The contents of the `.node#` directory are human-readable, where each field in the key/value store is a separate file in ascii format:

```
$ ls .node2
encryptionKey	fabricid	ipPort		logLevel	nodeid		nodenum
$ more .node2/nodeid
3dc34bc616f1cb59
```

# Roadmap

## Platform

- [X] Node Singleton
- [X] Persistant Store
- [X] Shell Framework
- [X] Test Framework
  - [X] Unit Tests
  - [X] Expect Testing Framework
  - [X] Functional Tests
  - [X] Code Coverage
- [X] Debug Tools
  - [X] Logger
  - [X] Tracer
## Message Layer
### Messaging

- [X] Message Encrypt / Decrypt
- [ ] Message Privacy
- [X] Operational Discovery (DNS-SD)
- [ ] Operational Discovery (Integration)
- [X] Session Management
- [X] Exchange Management
- [X] Protocol Dispatch
### Transports

- [X] UDPv6 Transport
- [X] PASE
  - [X] SPAKE2+
  - [X] PaseServer
  - [X] PaseClient
- [ ] CASE
- [ ] MRP
- [ ] BLE / BTP Transport
- [ ] TCP Transport
### Groupcast

- [ ] Group Messaging
- [ ] MCSP
- [ ] Group Key Management Cluster
- [ ] Groups Cluster
## Device Attestation / x509 certificates

- [ ] TLV Encoded Certificates
  - [X] Parse NOC
  - [ ] Parse CA Root/Intermediate
  - [ ] Parse DAC
  - [ ] Parse PAA/PAI
- [ ] Node Operational Credentials (NOC)
  - [X] Server / Commissionee
  - [ ] Client / Commissioner
- [X] Commissioning Discovery
- [ ] Rendevous
- [ ] QR Code / Setup Code
- [ ] Network Provisioning Cluster

## Fabric

- [ ] Fabric
- [ ] FabricTable
  - [ ] Single Fabric
  - [ ] Multi-Fabric
- [ ] ACL
  - [ ] ACL Management
  - [ ] ACL Enforcement

## Data Model
### Interaction Model

- [X] TLV Encode / Decode
- [ ] IM Server
  - [X] Commands
    - [X] InvokeRequest
    - [X] InvokeResponse
  - [X] Attribute Read
    - [X] ReadRequest
    - [X] ReportData
  - [ ] Attribute Write
  - [ ] Subscribe
  - [ ] Events
  - [ ] Attribute Lists

- [ ] IM Client
  - [ ] Commands
    - [ ] InvokeRequest
    - [ ] InvokeResponse
  - [ ] Attribute Read
    - [ ] ReadRequest
    - [ ] ReportData
  - [ ] Attribute Write
  - [ ] Subscribe
  - [ ] Events
  - [ ] Attribute Lists
### Server Clusters

- [X] Commissioning Clusters
  - [X] BasicInfoServer
  - [X] GeneralCommissioningServer
  - [X] NetworkCommissioningServer
  - [X] OpCredentialsServer
- [ ] OnOff Cluster
- [ ] Level Control Cluster
- [ ] Temperature Measurement Cluster
- [ ] Diagnostics Cluster

### Client Clusters

- [ ] Commissioning Clusters
  - [ ] BasicInfoClient
  - [ ] GeneralCommissioningClient
  - [ ] NetworkCommissioningClient
  - [ ] OpCredentialsClient
- [ ] OnOff Cluster
- [ ] Level Control Cluster
- [ ] Temperature Measurement Cluster
- [ ] Diagnostics Cluster

### Access Control
- [ ] ACL Configure
- [ ] ACL Store
- [ ] ACL Enforce
### OTA

- [ ] BDX
- [ ] OTA Cluster

```
          █
          █
      ▄   █   ▄
      ▀▀█████▀▀
    ▀█▄       ▄█▀
      ▀█▄   ▄█▀
   ▄██▀▀█   █▀▀██▄
  ▀▀    █   █    ▀▀
```