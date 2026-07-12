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

#### server_ports

!!! question "Since sing-box 1.12.0"

Server port range list.

Conflicts with `server_port`.

#### hop_interval

!!! question "Since sing-box 1.12.0"

Port hopping interval.

`30s` is used by default.

#### up

==Required==

Format: `[Integer] [Unit]` e.g. `100 Mbps, 640 KBps, 2 Gbps`

Supported units (case sensitive, b = bits, B = bytes, 8b=1B):

    bps (bits per second)
    Bps (bytes per second)
    Kbps (kilobits per second)
    KBps (kilobytes per second)
    Mbps (megabits per second)
    MBps (megabytes per second)
    Gbps (gigabits per second)
    GBps (gigabytes per second)
    Tbps (terabits per second)
    TBps (terabytes per second)

#### down

==Required==

Format: `[Integer] [Unit]` e.g. `100 Mbps, 640 KBps, 2 Gbps`

Supported units (case sensitive, b = bits, B = bytes, 8b=1B):

    bps (bits per second)
    Bps (bytes per second)
    Kbps (kilobits per second)
    KBps (kilobytes per second)
    Mbps (megabits per second)
    MBps (megabytes per second)
    Gbps (gigabits per second)
    GBps (gigabytes per second)
    Tbps (terabits per second)
    TBps (terabytes per second)

#### up_mbps

==Required==

`up, down` in Mbps.

#### down_mbps

==Required==

`up, down` in Mbps.

#### obfs

Obfuscated password.

#### auth

Authentication password, in base64.

#### auth_str

Authentication password.

#### network

Enabled network

One of `tcp` `udp`.

Both is enabled by default.

#### tls

==Required==

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#outbound).


#### recv_window_conn

!!! failure "Deprecated in sing-box 1.14.0"

    Use QUIC fields `stream_receive_window` instead.

#### recv_window

!!! failure "Deprecated in sing-box 1.14.0"

    Use QUIC fields `connection_receive_window` instead.

#### disable_mtu_discovery

!!! failure "Deprecated in sing-box 1.14.0"

    Use QUIC fields `disable_path_mtu_discovery` instead.