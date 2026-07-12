#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### users

==Required==

Trojan users.

#### users.name

Trojan user name.

#### users.password

Trojan user password.

#### tls

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).

#### fallback

!!! failure ""

    There is no evidence that GFW detects and blocks Trojan servers based on HTTP responses, and opening the standard http/s port on the server is a much bigger signature.

Fallback server configuration. Disabled if `fallback` and `fallback_for_alpn` are empty.

#### fallback.server

Fallback server address.

#### fallback.server_port

Fallback server port.

#### fallback_for_alpn

Fallback server configuration for specified ALPN.

If not empty, TLS fallback requests with ALPN not in this table will be rejected.

#### multiplex

See [Multiplex](https://sing-box.sagernet.org/configuration/shared/multiplex#inbound) for details.

#### transport

V2Ray Transport configuration, see [V2Ray Transport](https://sing-box.sagernet.org/configuration/shared/v2ray-transport/).