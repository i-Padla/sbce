#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### users

==Required==

VMess users.

| Alter ID | Description             |
|----------|-------------------------|
| 0        | Disable legacy protocol |
| > 0      | Enable legacy protocol  |

!!! warning ""

    Legacy protocol support (VMess MD5 Authentication) is provided for compatibility purposes only, use of alterId > 1 is not recommended.


#### users.name

VMess user name.

#### users.uuid

VMess user uuid.

#### users.alterId

VMess user alterId.

#### tls

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).

#### multiplex

See [Multiplex](https://sing-box.sagernet.org/configuration/shared/multiplex#inbound) for details.

#### transport

V2Ray Transport configuration, see [V2Ray Transport](https://sing-box.sagernet.org/configuration/shared/v2ray-transport/).