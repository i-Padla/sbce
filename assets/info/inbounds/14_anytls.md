#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### users

==Required==

AnyTLS users.

#### users.name

User name

#### users.password

User password

#### padding_scheme

AnyTLS padding scheme line array.

Default padding scheme:

```json
[
  "stop=8",
  "0=30-30",
  "1=100-400",
  "2=400-500,c,500-1000,c,500-1000,c,500-1000,c,500-1000",
  "3=9-9,500-1000",
  "4=500-1000",
  "5=500-1000",
  "6=500-1000",
  "7=500-1000"
]
```

#### tls

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).