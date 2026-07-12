#### tag

The tag of the outbound.

#### type

The type of the outbound.

#### server

==Required==

The server address.

#### server_port

==Required==

The server port.

#### uuid

==Required==

The VMess user id.

#### security

Encryption methods:

* `auto`
* `none`
* `zero`
* `aes-128-gcm`
* `chacha20-poly1305`

Legacy encryption methods:

* `aes-128-ctr`

#### alter_id

| Alter ID | Description         |
|----------|---------------------|
| 0        | Use AEAD protocol   |
| 1        | Use legacy protocol |
| > 1      | Unused, same as 1   |

#### global_padding

Protocol parameter. Will waste traffic randomly if enabled (enabled by default in v2ray and cannot be disabled).

#### authenticated_length

Protocol parameter. Enable length block encryption.

#### network

Enabled network

One of `tcp` `udp`.

Both is enabled by default.

#### tls

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#outbound).

#### packet_encoding

UDP packet encoding.

| Encoding   | Description           |
|------------|-----------------------|
| (none)     | Disabled              |
| packetaddr | Supported by v2ray 5+ |
| xudp       | Supported by xray     |

#### multiplex

See [Multiplex](https://sing-box.sagernet.org/configuration/shared/multiplex#outbound) for details.

#### transport

V2Ray Transport configuration, see [V2Ray Transport](https://sing-box.sagernet.org/configuration/shared/v2ray-transport/).