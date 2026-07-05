#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### network

Listen network, one of `tcp` `udp`.

Both if empty.

#### method

==Required==

| Method                        | Key Length |
|-------------------------------|------------|
| 2022-blake3-aes-128-gcm       | 16         |
| 2022-blake3-aes-256-gcm       | 32         |
| 2022-blake3-chacha20-poly1305 | 32         |
| none                          | /          |
| aes-128-gcm                   | /          |
| aes-192-gcm                   | /          |
| aes-256-gcm                   | /          |
| chacha20-ietf-poly1305        | /          |
| xchacha20-ietf-poly1305       | /          |

#### password

==Required==

| Method        | Password Format                                |
|---------------|------------------------------------------------|
| none          | /                                              |
| 2022 methods  | `sing-box generate rand --base64 <Key Length>` |
| other methods | any string                                     |

#### users

Shadowsocks users.

#### users.name

Shadowsocks user name.

#### users.password

Shadowsoscks user password.

#### destinations

List of relay destinations for Shadowsocks 2022 relay mode. 

#### destinations.name

==Required==

A label for this destination entry (used for logging/identification)

#### destinations.password

==Required==

The per-user sub-key. For 2022 methods, this is the user's individual key that the client embeds in the request to select this destination

#### destinations.server

==Required==

The address of the backend Shadowsocks server to relay matching traffic to

#### destinations.server_port

==Required==

The port of the backend Shadowsocks server

#### managed

Defaults to `false`. Enable this when the inbound is managed by the [SSM API](/configuration/service/ssm-api) for dynamic user.

#### multiplex

See [Multiplex](/configuration/shared/multiplex#inbound) for details.