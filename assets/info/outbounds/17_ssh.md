#### tag

The tag of the outbound.

#### type

The type of the outbound.

#### server

==Required==

Server address.

#### server_port

Server port. 22 will be used if empty.

#### user

SSH user, root will be used if empty.

#### password

Password.

#### private_key

Private key.

#### private_key_path

Private key path.

#### private_key_passphrase

Private key passphrase.

#### host_key

Host key. Accept any if empty.

#### host_key_algorithms

Host key algorithms.

#### client_version

Client version. Random version will be used if empty.

#### cipher

!!! question "Since sing-box 1.14.0"

Allowed ciphers. Default values are used if empty.

#### mac

!!! question "Since sing-box 1.14.0"

Allowed MAC algorithms. Default values are used if empty.

#### kex_algorithm

!!! question "Since sing-box 1.14.0"

Allowed key exchange algorithms. Default values are used if empty.
