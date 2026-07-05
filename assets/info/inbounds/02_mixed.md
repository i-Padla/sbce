#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### users

SOCKS and HTTP users.

No authentication required if empty.

#### users.username

SOCKS and HTTP user username.

#### users.password

SOCKS and HTTP user password.

#### set_system_proxy

!!! quote ""

    Only supported on Linux, Android, Windows, and macOS.

!!! warning ""

    To work on Android and Apple platforms without privileges, use tun.platform.http_proxy instead.

Automatically set system proxy configuration when start and clean up when stop.