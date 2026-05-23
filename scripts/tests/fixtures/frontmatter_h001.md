---
id: H001
category: Flames
hypothesis: An adversary is attempting to brute force the admin account on the externally facing VPN gateway.
tactics:
  - Credential Access
techniques:
  - T1110
tags:
  - credentialaccess
  - bruteforce
  - vpn
submitter:
  name: Sydney Marrone
  link: https://x.com/letswastetime
---

# H001 — Brute force VPN admin account

## Why

- The admin account on an externally facing VPN gateway provides significant control over network access, making it a prime target for adversaries.
- Successful brute force attacks on this account could lead to unauthorized access to the internal network, bypassing other security controls.
- Brute force attempts on the VPN gateway may be part of a larger campaign targeting critical infrastructure, necessitating immediate investigation and response.

## References

- https://attack.mitre.org/techniques/T1110/
- https://medium.com/threatpunter/okta-threat-hunting-tips-62dc0013d526
