# Secret Patterns Reference

Known secret prefixes and signatures. Referenced by the main `secret-scanning` skill.

## AWS

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `aws:access_key_id` | AWS Access Key ID | `AKIA` followed by 16 uppercase alphanumeric chars |
| `aws:secret_access_key` | AWS Secret Access Key | 40-char base64 string assigned to `aws_secret_access_key` |
| `aws:session_token` | AWS Session Token | 100+ char base64 string assigned to `aws_session_token` |
| `aws:mfa_arn` | AWS MFA ARN | `arn:aws:iam::<12-digit>:mfa/` |
| `aws:role_arn` | AWS Role ARN | `arn:aws:iam::<12-digit>:role/` |
| `aws:account_id` | AWS Account ID | 12-digit number in AWS account context |

## Google / GCP

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `gcp:api_key` | GCP API Key | `AIza` followed by 35 chars |
| `gcp:service_account_key` | GCP Service Account Key | JSON with `private_key` containing `-----BEGIN PRIVATE KEY` |
| `gcp:oauth_token` | Google OAuth Token | `ya29.` followed by alphanumeric chars |
| `gcp:oauth_client_secret` | GCP OAuth Client Secret | `client_secret` key in JSON, 24+ char value |
| `gcp:firebase_config` | Firebase Config | `apiKey` containing `AIza` prefix |

## Azure

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `azure:storage_key` | Azure Storage Key | 86-char base64 string ending `==` assigned to `AccountKey` |
| `azure:sas_token` | Azure SAS Token | `sv=` followed by date, `&s` followed by `b`, `q`, `e`, or `c` |
| `azure:connection_string` | Azure Connection String | `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=` |
| `azure:ad_client_secret` | Azure AD Client Secret | 34+ char string assigned to `clientSecret` or `AZURE_CLIENT_SECRET` |
| `azure:tenant_id` | Azure Tenant ID | UUID assigned to `tenant_id` or `AZURE_TENANT_ID` |

## GitHub / GitLab / Bitbucket

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `github:pat` | GitHub Personal Access Token | `ghp_`, `ghu_`, `gho_`, `ghs_`, or `ghr_` followed by 36+ chars |
| `github:app_token` | GitHub App Token | `ghs_` followed by 36 chars |
| `github:oauth_token` | GitHub OAuth Token | `gho_` followed by 36 chars |
| `github:action_token` | GitHub Action Token | `github_pat_` followed by 82 chars |
| `gitlab:personal_token` | GitLab Personal Token | `glpat-` followed by 20 chars |
| `gitlab:runner_token` | GitLab Runner Token | `glrt-` followed by 20 chars |
| `bitbucket:app_password` | Bitbucket App Password | `BITBUCKET_TOKEN` or `bitbucket.*password` variable |

## Stripe / Payment

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `stripe:secret_key` | Stripe Secret Key | `sk_live_` or `sk_test_` followed by 24+ chars |
| `stripe:publishable_key` | Stripe Publishable Key | `pk_live_` or `pk_test_` followed by 24+ chars |
| `stripe:webhook_secret` | Stripe Webhook Secret | `whsec_` followed by 32+ chars |
| `paypal:client_secret` | PayPal Client Secret | `PAYPAL_CLIENT_SECRET` or `paypal.*secret` variable |
| `square:token` | Square Token | `sq0` followed by 3 lowercase + `-` + 22-43 chars |
| `payment:credit_card` | Credit Card Number | 13-16 digit patterns starting with 3 (AMEX), 4 (Visa), or 5 (MC) |

## Slack / Discord / Telegram

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `slack:bot_token` | Slack Bot Token | `xoxb-` followed by numeric-dash-alphanumeric segments |
| `slack:user_token` | Slack User Token | `xoxp-` followed by numeric-dash-alphanumeric segments |
| `slack:app_token` | Slack App Token | `xapp-` followed by numeric segments |
| `slack:webhook_url` | Slack Webhook URL | `hooks.slack.com/services/T.../B.../...` |
| `discord:bot_token` | Discord Bot Token | Starts with `M`, `N`, or `O` + 23 chars, dot-separated segments |
| `discord:webhook_url` | Discord Webhook URL | `discord(app).com/api/webhooks/` followed by numeric ID and token |
| `telegram:bot_token` | Telegram Bot Token | 8-10 digits `:` 35 chars |

## Communication Services

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `twilio:account_sid` | Twilio Account SID | `AC` followed by 32 hex chars |
| `twilio:auth_token` | Twilio Auth Token | `TWILIO_AUTH_TOKEN` or `twilio.*token` variable, 32 hex chars |
| `sendgrid:api_key` | SendGrid API Key | `SG.` followed by 22 chars `.` 43 chars |
| `mailgun:api_key` | Mailgun API Key | `key-` followed by 32 chars |
| `postmark:server_token` | Postmark Server Token | UUID format assigned to Postmark server token variable |

## AI / ML Services

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `anthropic:api_key` | Anthropic API Key | `sk-ant-` followed by 95+ chars |
| `openai:api_key` | OpenAI API Key | `sk-` followed by 48 chars |
| `openai:project_key` | OpenAI Project Key | `sk-proj-` followed by 90+ chars |
| `huggingface:token` | Hugging Face Token | `hf_` followed by 37 chars |

## Infrastructure

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `vault:token` | Vault Token | `s.` followed by 24 chars |
| `terraform:cloud_token` | Terraform Cloud Token | 14 chars `.` 6 chars `.` 32 chars |
| `newrelic:license_key` | New Relic License Key | `NRAK-` followed by 27 chars |
| `sentry:dsn` | Sentry DSN | `https://<32-hex>@<host>.ingest.sentry.io/` |
| `cloudflare:api_token` | Cloudflare API Token | 40 chars assigned to `CF_API_TOKEN` |
| `datadog:api_key` | Datadog API Key | 32 hex chars assigned to `DD_API_KEY` |
| `heroku:api_key` | Heroku API Key | UUID format assigned to `heroku` context |
| `k8s:service_account_token` | Kubernetes Service Account Token | JWT starting with `eyJhbGciOiJSUzI1NiIs` |
| `k8s:kubeconfig_credential` | kubeconfig Embedded Credential | `users:` block with `token:` field, 40+ char value |
| `ansible:vault_encrypted` | Ansible Vault Encrypted | `$ANSIBLE_VAULT;` prefix |
| `ssh:private_key_inline` | SSH Private Key (inline) | `ssh-rsa AAAA` prefix |

## Private Keys & Certificates

| Rule ID | Name | Signature |
|---------|------|-----------|
| `key:rsa_private` | RSA Private Key | `-----BEGIN RSA PRIVATE KEY-----` |
| `key:ec_private` | EC Private Key | `-----BEGIN EC PRIVATE KEY-----` |
| `key:dsa_private` | DSA Private Key | `-----BEGIN DSA PRIVATE KEY-----` |
| `key:openssh_private` | OpenSSH Private Key | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `key:pgp_private` | PGP Private Key | `-----BEGIN PGP PRIVATE KEY BLOCK-----` |
| `key:pkcs8_private` | PKCS8 Private Key | `-----BEGIN PRIVATE KEY-----` |
| `key:certificate` | Certificate (potential internal CA) | `-----BEGIN CERTIFICATE-----` |
| `key:keystore_password` | Keystore Password | `KEYSTORE_PASS` or `keystore.*password` variable |
| `key:pem_passphrase` | PEM Passphrase | `PEM_PASS` or `pem.*passphrase` variable |

## Generic Patterns

| Rule ID | Name | Signature |
|---------|------|-----------|
| `generic:jwt` | JWT Token | `eyJ` base64 dot-separated three segments |
| `generic:npm_auth` | npm Auth Token | `//registry.npmjs.org/:_authToken=` |
| `generic:pypi_token` | PyPI Token | `pypi-` followed by 150+ chars |
| `generic:basic_auth_url` | Basic auth in URL | `https://user:password@host` |
| `generic:auth_header` | Auth header with credential | `Authorization: Basic`, `Bearer`, or `Token` followed by credential string |
| `generic:db_connection_string` | Database connection string | `protocol://user:password@host` |
| `generic:netrc` | `.netrc` credentials | `machine ... login ... password` pattern |

## Database / Connection Strings

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `db:postgresql_dsn` | PostgreSQL DSN | `postgres://` or `postgresql://` with embedded credentials |
| `db:mysql_dsn` | MySQL DSN | `mysql://` with embedded credentials |
| `db:mongodb_dsn` | MongoDB DSN | `mongodb://` or `mongodb+srv://` with embedded credentials |
| `db:redis_dsn` | Redis DSN | `redis://` with embedded password |
| `db:jdbc_connection` | JDBC Connection String | `jdbc:` prefix with embedded credentials |
| `db:sqlserver_connection` | SQL Server Connection String | `Server=...;Password=` pattern |
| `db:password_in_config` | Database Password in Config | `DB_PASS`, `DATABASE_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `POSTGRES_PASSWORD` variables |

## Generic Password / Secret Patterns

| Rule ID | Name | Variable / Signature |
|---------|------|---------------------|
| `generic:password_in_code` | Password in code | `password`, `passwd`, `pwd`, `pass` assigned to a string literal |
| `generic:secret_in_code` | Secret in code | `secret`, `SECRET` assigned to a string literal |
| `generic:api_key_in_code` | API Key in code | `api_key`, `API_KEY`, `apikey`, `access_key` assigned to a string literal |
| `generic:token_in_code` | Token in code | `token`, `TOKEN` assigned to a string literal |
| `generic:private_key_var` | Private key variable | `private_key`, `PRIVATE_KEY` assigned to a string literal |
| `generic:bearer_token` | Hardcoded bearer token | `bearer` followed by 20+ char token string |

## Okta / Auth Providers

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `okta:api_token` | Okta API Token | `OKTA_API_TOKEN` variable, value starting with `00` followed by 40+ chars |
| `auth0:client_secret` | Auth0 Client Secret | `AUTH0_CLIENT_SECRET` or `auth0.*secret` variable |

## Social / API Services

| Rule ID | Name | Prefix / Signature |
|---------|------|-------------------|
| `twitter:bearer_token` | Twitter/X Bearer Token | `AAAAAAAAAAAAAAAAAAAAAA` prefix |
| `twitter:api_key` | Twitter/X API Key | `TWITTER_API_KEY` or `twitter.*api_key` variable |
| `facebook:app_secret` | Facebook App Secret | `FACEBOOK_APP_SECRET` or `fb.*secret` variable |
