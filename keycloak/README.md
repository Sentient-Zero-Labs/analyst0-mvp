# Building and Running Keycloak

## Build Docker Image
To build the Keycloak Docker image for ARM64 architecture:

```bash
docker build --no-cache --platform=linux/arm64 -f Containerfile . -t catering/keycloak:<tag>
```

## Environment Variables

The following environment variables are required to run the Keycloak container:

### Authentication Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `KC_BOOTSTRAP_ADMIN_USERNAME` | Initial admin username | `admin` |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | Initial admin password | `admin` |

### Server Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `KC_PROXY` | Proxy mode | `edge` |
| `KC_HOSTNAME` | Server hostname | `auth.cateringrewards.com` |
| `KC_HTTP_RELATIVE_PATH` | Base path for the server | `/preprod` |
| `KC_HTTP_ENABLED` | Enable HTTP | `true` |

### Monitoring
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `KC_HEALTH_ENABLED` | Enable health checks | `true` |
| `KC_METRICS_ENABLED` | Enable metrics | `true` |

### Database Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `KC_DB` | Database type | `mysql` |
| `KC_DB_URL` | Database URL | `jdbc:mysql://localhost:3306/keycloak` |
| `KC_DB_USERNAME` | Database username | `keycloak` |
| `KC_DB_PASSWORD` | Database password | `password` |

### Proxy Settings
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `KC_PROXY_HEADERS` | Proxy headers configuration | `xforwarded` |
| `KC_PROXY_TRUSTED_ADDRESSES` | Trusted proxy addresses | `172.31.0.0/16` |

## Additional Documentation

For a complete list of configuration options, please refer to the [official Keycloak Server Configuration Guide](https://www.keycloak.org/server/all-config).
