# H001
An adversary is attempting to brute force the admin account on the externally facing VPN gateway.

| Hunt # | Idea / Hypothesis                                                                 | Tactic           | Notes                                   | Tags                                   | Submitter   | 
|--------------|----------------------------------------------------------------------------|------------------|-----------------------------------------|----------------------------------------|----------------------------------------|
| H001         | An adversary is attempting to brute force the admin account on the externally facing VPN gateway. | Credential Access | Attackers want to gain initial access through elevated credentials and move laterally | #credentialaccess #bruteforce #vpn #T1110 | [Sydney Marrone](https://x.com/letswastetime)

## Why

- The admin account on an externally facing VPN gateway provides significant control over network access, making it a prime target for adversaries.
- Successful brute force attacks on this account could lead to unauthorized access to the internal network, bypassing other security controls.
- Brute force attempts on the VPN gateway may be part of a larger campaign targeting critical infrastructure, necessitating immediate investigation and response.

## References

- https://attack.mitre.org/techniques/T1110/
- https://medium.com/threatpunter/okta-threat-hunting-tips-62dc0013d526
