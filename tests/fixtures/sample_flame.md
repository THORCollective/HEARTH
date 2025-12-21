# F999
Adversaries are using malicious browser extensions to steal credentials and session tokens.

| Hunt # | Idea / Hypothesis                                                                 | Tactic           | Notes                                   | Tags                                   | Submitter   |
|--------------|----------------------------------------------------------------------------|------------------|-----------------------------------------|----------------------------------------|----------------------------------------|
| F999         | Adversaries are using malicious browser extensions to steal credentials and session tokens. | Credential Access | Browser extensions have broad permissions and can intercept sensitive data | #credentialaccess #browserextensions #sessionhijacking     | [Test User](https://example.com/test)

## Why

- Browser extensions have extensive permissions to access web content, making them ideal for credential harvesting.
- Malicious extensions can operate silently in the background, intercepting login forms and API tokens without user awareness.
- Once installed, extensions persist across sessions and can exfiltrate data over extended periods before detection.

## References

- https://attack.mitre.org/techniques/T1185/
- https://example.com/browser-extension-threats
- https://example.com/credential-theft-research
