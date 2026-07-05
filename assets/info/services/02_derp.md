#### type

The type of the service.

#### tag

The tag of the endpoint.


#### tls

TLS configuration, see [TLS](/configuration/shared/tls/#inbound).

#### config_path

==Required==

Derper configuration file path.

Example: `derper.key`

#### verify_client_endpoint

Tailscale endpoints tags to verify clients.

#### verify_client_url

URL to verify clients.

Object format:

```json
{
  "url": "",

  ... // HTTP Client Fields
}
```

Setting Array value to a string `__URL__` is equivalent to configuring:

```json
{ "url": __URL__ }
```
#### verify_client_url.url

URL to verify clients.

#### home

What to serve at the root path. It may be left empty (the default, for a default homepage), `blank` for a blank page, or a URL to redirect to

#### mesh_with

Mesh with other DERP servers.

Object format:

```json
{
  "server": "",
  "server_port": "",
  "host": "",
  "tls": {},
  
  ... // Dial Fields
}
```

Object fields:

#### mesh_with.server

==Required==

DERP server address.

#### mesh_with.server_port

==Required==

DERP server port.

#### mesh_with.host

Custom DERP hostname.

#### mesh_with.tls

[TLS](/configuration/shared/tls/#outbound)


#### mesh_psk

Pre-shared key for DERP mesh.

#### mesh_psk_file

Pre-shared key file for DERP mesh.

#### stun

STUN server listen options.

Object format:

```json
{
  "enabled": true,
  
  ... // Listen Fields
}
```

Setting `stun` value to a number `__PORT__` is equivalent to configuring:

```json
{ "enabled": true, "listen_port": __PORT__ }
```

#### stun.enabled

==Required==

Enable STUN server.


#### stun.listen

==Required==

STUN server listen address, default to `::`.


#### stun.listen_port

==Required==

STUN server listen port, default to `3478`.


