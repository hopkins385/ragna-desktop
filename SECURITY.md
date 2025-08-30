# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | :white_check_mark: |
| < 0.5   | :x:                |

## Reporting a Vulnerability

We take the security of RAGNA Desktop seriously. If you discover a security vulnerability, please follow these steps:

### Private Disclosure

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **Email**: Send details to sven@ragna.app with the subject line "SECURITY VULNERABILITY - RAGNA Desktop"
2. **GitHub Security Advisories**: Use the "Report a vulnerability" feature in the Security tab of this repository

### What to Include

When reporting a vulnerability, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: We aim to respond within 48 hours
- **Investigation**: We will investigate and assess the vulnerability within 7 days
- **Fix Timeline**: Critical vulnerabilities will be addressed within 30 days
- **Disclosure**: We will coordinate disclosure timing with you

### Security Best Practices

For users of RAGNA Desktop:

1. **Keep Updated**: Always use the latest version of the application
2. **Local Data**: The application stores data locally - ensure your system is secure
3. **Document Sensitivity**: Be mindful of sensitive documents you process with the application
4. **Network Security**: While the app runs locally, ensure your network is secure

### Security Features

RAGNA Desktop includes several security features:

- **Local Processing**: All AI processing happens locally, no data sent to external servers
- **Local Storage**: All data is stored locally using SQLite and vector databases
- **No External APIs**: The application doesn't make external API calls for core functionality
- **Sandboxed Environment**: Runs in Electron's sandboxed environment

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 0.5.1, 0.5.2)
- Announced in release notes with security advisory information
- Distributed through standard update channels

## Third-Party Dependencies

We regularly monitor and update our dependencies for security vulnerabilities using:

- npm audit
- Dependabot alerts
- Security advisories from package maintainers

If you discover a vulnerability in one of our dependencies, please report it following the same process outlined above.

## Contact

For any security-related questions or concerns, contact:

- Email: sven@ragna.app
- Security Advisory: Use GitHub's private vulnerability reporting feature

Thank you for helping keep RAGNA Desktop secure!
