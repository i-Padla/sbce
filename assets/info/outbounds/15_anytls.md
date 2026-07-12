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

#### password

==Required==

The AnyTLS password.

#### idle_session_check_interval

Interval checking for idle sessions. Default: 30s.

#### idle_session_timeout

In the check, close sessions that have been idle for longer than this. Default: 30s.

#### min_idle_session

In the check, at least the first `n` idle sessions are kept open. Default value: `n`=0

#### tls

==Required==

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#outbound).
