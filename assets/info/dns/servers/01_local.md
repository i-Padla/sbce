#### type

The type of the DNS server.

#### tag

The tag of the DNS server.

#### prefer_go

When enabled, `local` DNS server will resolve DNS by dialing itself whenever possible.

Specifically, it disables following behaviors which was added as features in sing-box 1.13.0:

1. On Apple platforms: Attempt to resolve A/AAAA requests using `getaddrinfo` in NetworkExtension.
2. On Linux: Resolve through `systemd-resolvd`'s DBus interface when available.

As a sole exception, it cannot disable the following behavior:

1. In the Android graphical client,
`local` will always resolve DNS through the platform interface,
as there is no other way to obtain upstream DNS servers;
On devices running Android versions lower than 10, this interface can only resolve A/AAAA requests.

2. On macOS, `local` will try DHCP first in Network Extension, since DHCP respects DIal Fields,
it will not be disabled by `prefer_go`.