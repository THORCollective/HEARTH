# B999
Baseline normal DNS query patterns to identify potential DNS tunneling or data exfiltration.

| Hunt # | Idea / Hypothesis                                                                 | Tactic           | Notes                                   | Tags                                   | Submitter   |
|--------------|----------------------------------------------------------------------------|------------------|-----------------------------------------|----------------------------------------|----------------------------------------|
| B999         | Baseline normal DNS query patterns to identify potential DNS tunneling or data exfiltration. | Command and Control, Exfiltration      | Understanding normal DNS behavior helps detect anomalies | #baseline #dns #tunneling #exfiltration |[Test User](https://example.com/test)

## Why

- DNS is often overlooked in security monitoring, making it an attractive channel for covert communications.
- By establishing baseline patterns (query frequency, domain lengths, character distributions), we can detect anomalies that indicate tunneling.
- DNS tunneling can bypass traditional security controls as DNS traffic is rarely blocked.

## References

- https://attack.mitre.org/techniques/T1071/004/
- https://example.com/dns-tunneling-detection
- https://example.com/dns-baseline-analysis
