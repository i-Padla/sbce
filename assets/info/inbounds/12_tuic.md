#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### users

TUIC users

#### users.name

TUIC user name.

#### users.uuid

==Required==

TUIC user uuid

#### users.password

TUIC user password

#### congestion_control

QUIC congestion control algorithm

One of: `cubic`, `new_reno`, `bbr`

`cubic` is used by default.

#### auth_timeout

How long the server should wait for the client to send the authentication command

`3s` is used by default.

#### zero_rtt_handshake

Enable 0-RTT QUIC connection handshake on the client side  
This is not impacting much on the performance, as the protocol is fully multiplexed  

!!! warning ""
    Disabling this is highly recommended, as it is vulnerable to replay attacks.
    See [Attack of the clones](https://blog.cloudflare.com/even-faster-connection-establishment-with-quic-0-rtt-resumption/#attack-of-the-clones)

#### heartbeat

Interval for sending heartbeat packets for keeping the connection alive

`10s` is used by default.

#### tls

==Required==

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).

### QUIC Fields

See [QUIC Fields](https://sing-box.sagernet.org/configuration/shared/quic/) for details.