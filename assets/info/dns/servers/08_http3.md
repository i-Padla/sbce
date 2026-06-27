#### type

The type of the DNS server.

#### tag

The tag of the DNS server.

#### server

==Required==

The address of the DNS server.

If domain name is used, `domain_resolver` must also be set to resolve IP address.

#### server_port

The port of the DNS server.

`443` will be used by default.

#### path

The path of the DNS server.

`/dns-query` will be used by default.

#### headers

Additional headers to be sent to the DNS server.

#### tls

TLS configuration