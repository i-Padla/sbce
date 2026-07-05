#### type

The type of the service.

#### tag

The tag of the endpoint.

#### tls

TLS configuration, see [TLS](/configuration/shared/tls/#inbound).

When configured, the realm serves HTTP/2 over TLS; otherwise plain HTTP/1.1.

#### users

==Required==

Authorized users.

#### users.name

==Required==

Username, used in logs and as the quota key.

#### users.token

==Required==

Bearer token presented by Hysteria2 inbounds and outbounds via `Authorization: Bearer <token>`.

#### users.max_realms

Maximum number of realm slots this user may hold concurrently.