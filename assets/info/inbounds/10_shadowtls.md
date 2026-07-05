#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### version

ShadowTLS protocol version.

| Value         | Protocol Version                                                                        |
|---------------|-----------------------------------------------------------------------------------------|
| `1` (default) | [ShadowTLS v1](https://github.com/ihciah/shadow-tls/blob/master/docs/protocol-en.md#v1) |
| `2`           | [ShadowTLS v2](https://github.com/ihciah/shadow-tls/blob/master/docs/protocol-en.md#v2) |
| `3`           | [ShadowTLS v3](https://github.com/ihciah/shadow-tls/blob/master/docs/protocol-v3-en.md) |

#### password

ShadowTLS password.

Only available in the ShadowTLS protocol 2.

#### users

ShadowTLS users.

Only available in the ShadowTLS protocol 3.

#### users.name

ShadowTLS user name.

#### users.password

ShadowTLS user password.

#### handshake

==Required==

When `wildcard_sni` is configured to `all`, the server address is optional.

Handshake server address and [Dial Fields](/configuration/shared/dial/).

#### handshake.server

Handshake server address.

#### handshake.server_port

Handshake server port.

#### handshake_for_server_name

Handshake server address and [Dial Fields](/configuration/shared/dial/) for specific server name.

Only available in the ShadowTLS protocol 2/3.

#### strict_mode

ShadowTLS strict mode.

Only available in the ShadowTLS protocol 3.

#### wildcard_sni

!!! question "Since sing-box 1.12.0"

ShadowTLS wildcard SNI mode.

Available values are:

* `off`: (default) Disabled.
* `authed`: Authenticated connections will have their destination overwritten to `(servername):443`
* `all`: All connections will have their destination overwritten to `(servername):443`

Additionally, connections matching `handshake_for_server_name` are not affected.

Only available in the ShadowTLS protocol 3.