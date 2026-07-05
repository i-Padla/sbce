#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### network

Listen network, one of `tcp` `udp`.

Both if empty.

#### users

==Required==

Naive users.

#### users.username

Naive user username.

#### users.password

Naive user password.

#### quic_congestion_control

!!! question "Since sing-box 1.13.0"

QUIC congestion control algorithm.

| Algorithm      | Description                     |
|----------------|---------------------------------|
| `bbr`          | BBR                             |
| `bbr_standard` | BBR (Standard version)         |
| `bbr2`         | BBRv2                           |
| `bbr2_variant` | BBRv2 (An experimental variant) |
| `cubic`        | CUBIC                           |
| `reno`         | New Reno                        |

`bbr` is used by default (the default of QUICHE, used by Chromium which NaiveProxy is based on).

#### tls

TLS configuration, see [TLS](/configuration/shared/tls/#inbound).