# PII Placeholders Reference

Safe placeholder values for test data, examples, and mock content. Referenced by the main `secret-scanning` skill.

## Safe Placeholder Values

| Rule ID | PII Type | Use This | Never This |
|---------|----------|----------|------------|
| `pii:email` | Email | `test@example.uri` | Realistic-looking emails at real domains |
| `pii:phone_au` | Phone (AU) | `+61 400 000 000` | Real-looking mobile numbers |
| `pii:phone_us` | Phone (US) | `+1 555-000-0000` | Real-looking numbers outside 555 prefix |
| `pii:phone_intl` | Phone (International) | `+99 000 000 0000` | Real-looking international numbers |
| `pii:tfn_au` | TFN (AU) | `000 000 000` | 9-digit numbers that look real |
| `pii:medicare_au` | Medicare (AU) | `2000 00000 0 0` | Real-looking Medicare numbers |
| `pii:ssn_us` | SSN (US) | `000-00-0000` | Real-looking SSNs |
| `pii:ni_uk` | NI Number (UK) | `AA 00 00 00 A` | Real-looking NI numbers |
| `pii:passport` | Passport Number | `A0000000` | Real-looking passport numbers |
| `pii:credit_card` | Credit Card | `4000 0000 0000 0000` (Stripe test) | Real-looking card numbers |
| `pii:bsb_au` | BSB (AU) | `000-000` | Real-looking BSB numbers |
| `pii:iban` | IBAN | `XX00 0000 0000 0000` | Real-looking IBANs |
| `pii:bank_account` | Bank Account | `0000000000` | Real-looking account numbers |
| `pii:ip_address` | IP Address | `192.0.2.1` (TEST-NET) | Real public IPs |
| `pii:ip_rfc1918` | Private IP (RFC1918) | `10.0.0.1`, `192.168.0.1` | Real RFC1918 ranges in production code/config |
| `pii:hostname` | Hostname | `test.example.uri` | Real-looking internal hostnames (`.local`, `.corp`, `.lan`, `.priv`) |
| `pii:street_address` | Street Address | `123 Test Street, Testville` | Real street addresses |
| `pii:postcode_au` | Postcode (AU) | `0000` | Real-looking postcodes |
| `pii:full_name` | Full Name | `Jane Doe`, `John Smith`, `Test User` | Uncommon names that could be real people |
| `pii:dob` | DOB | `2000-01-01` | Specific dates that look real |
