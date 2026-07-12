#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### tls

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).

#### users

HTTP users.

No authentication required if empty.

#### users.name

HTTP user name.

#### users.password

HTTP user password.

#### set_system_proxy

!!! quote ""

    Only supported on Linux, Android, Windows, and macOS.

!!! warning ""

    To work on Android and Apple platforms without privileges, use tun.platform.http_proxy instead.

Automatically set system proxy configuration when start and clean up when stop.