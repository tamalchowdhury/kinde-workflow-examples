# ⚙️ Kinde Workflow examples

This repository contains example **JavaScript/TypeScript workflows** for [Kinde](https://kinde.com), showing how to run custom code at key points in the **authentication flow** using **Kinde Workflows**.

## 🧠 What Are Kinde Workflows?

Kinde Workflows let you run custom JavaScript/TypeScript logic **during the authentication process**, giving you full control over:

- User onboarding
- Role and permission assignment
- Profile enrichment
- Custom validation or access control
- Third-party service integration

All code is executed **server-side on Kinde**, meaning you don’t need to host or deploy anything yourself.

## 🧪 Example Use Cases

This repo includes examples for:

| Folder | Triggered when |
| --- | --- |
| `/existingPassword` | a user enters their password |
| `/m2mToken` | an M2M token is requested |
| `/newPassword` | a user sets a new password (including reset) |
| `/postUserAuthentication` | a user completes single factor authentication (e.g Google auth) |
| `/preMFA` | before checking if MFA is required |
| `/userTokens` | ID and access tokens are generated |

Each example includes:

- A full `.ts` workflow file
- Setup or config notes
- A brief explanation of what it does

## 🔧 How to use these examples

1. Open an example file and explore the code.

2. Use it as a starting point for your own workflows.

> 💡 Kinde runs workflows in a secure, isolated environment. All workflows should be deterministic and performant.

📦 Requirements

- A Kinde account
- Basic knowledge of JavaScript or TypeScript

🤝 Contributing

Have a great idea or an awesome use case? Open a PR! Contributions are welcome.
