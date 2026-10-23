# Setup guide — ekarvo

Run `pnpm install`, then `pnpm doctor` to configure your downloaded project. Follow the applicable Launchpad tasks below from local setup through production operation.

## Project Launchpad

Web deployment: vercel · Starter: v2.1.1

Progress is optional. Imported reports are user-supplied evidence; a local pass does not verify production.

### Run locally

#### Prepare Postgres

Choose the services your project actually uses before configuring it.

- Open your Postgres provider dashboard and create a development database, or choose an existing development database.
- Locate its connection details. Keep production data in a separate database.
- Keep its connection string private; the database-setting task below explains where to save it.

Expected result:
- You can access a development database and locate its connection string.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)

#### Prepare Dodo Payments

Choose the services your project actually uses before configuring it.

- Open the Dodo Payments dashboard and switch to test mode before creating development products or credentials.
- Under Products, create the credits product your app will sell and note its product ID. Under Developer → API Keys, create a test API key.
- Keep the product ID and API key available privately for the Dodo settings task. Production activation and webhook testing are separate launch tasks.

Expected result:
- A test product and test API key exist in the same Dodo environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Prepare Resend

Choose the services your project actually uses before configuring it.

- Open Resend and add a sending domain you control.
- Add the DNS records shown by Resend at your domain provider, then wait for Resend to show that the domain is verified.
- Create an API key with sending permissions. Keep it private for the email settings task.

Expected result:
- Resend shows a verified sending domain and you have a private sending API key.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)

#### Prepare Upstash Redis

Choose the services your project actually uses before configuring it.

- Open the Upstash console, create a Redis database or select your existing development database.
- Open the REST API section and locate its REST URL and REST token; these are different from a Redis TCP connection string.
- Keep the pair privately for the Redis settings task. Use the same database for both values.

Expected result:
- The REST URL and token belong to one reachable Upstash database.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Upstash Redis setup](https://upstash.com/docs/redis/overall/getstarted)

#### Prepare Vercel Blob

Choose the services your project actually uses before configuring it.

- Open your Vercel project → Storage and create or connect a Blob store.
- Locate the store’s read/write token and keep it private.
- Confirm that the store belongs to the intended project and environment before configuring the app.

Expected result:
- A Blob store is connected and its private token is available.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Vercel Blob setup](https://vercel.com/docs/vercel-blob)

#### Register google sign-in

Choose the services your project actually uses before configuring it.

- Open the google developer console and create or select an OAuth application for this project.
- Register the local web origin and redirect address used by Better Auth. Compare its social-provider configuration with the linked google documentation.
- Locate the client ID and client secret. Keep the secret private for the google settings task; register production addresses separately when launching.

Expected result:
- The google application permits your local sign-in callback.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Google OAuth web application setup](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Choose one AI service for your product

Choose the services your project actually uses before configuring it.

- Read the provider list in the AI SDK documentation and choose the service your product needs.
- Create that provider’s account or arrange access to your own model server. Obtain only the credentials for that service.
- Keep the credentials private. This configures AI features in your product; the Launchpad checklist itself needs no AI account.

Expected result:
- You know which one AI service the product will use and can access it.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Prepare the local job runner

Choose the services your project actually uses before configuring it.

- Use the linked Inngest local-development guide to start a development server pointing at your web app’s /api/inngest address.
- Use the actual web port printed by your server. The development server and the web app have different addresses.
- Hosted Inngest credentials are needed for production. General jobs may run inline locally, but agent jobs need the runner.

Expected result:
- Inngest lists this app and its registered functions.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Check your local tools

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open the downloaded project folder in your editor and a terminal. A terminal is the window where you run the commands shown below tasks.
- Read package.json → engines and packageManager. Install the listed Node.js and pnpm versions before continuing.
- Keep this terminal in the project root, the folder containing pnpm-lock.yaml. Commands labelled with another folder must use that folder.

Expected result:
- Your Node.js and pnpm versions match the downloaded project.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Create your private environment files

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- In your editor or file manager, copy apps/web/.env.example and save the copy as apps/web/.env.
- Copy packages/database/.env.example to packages/database/.env. Keep the examples intact.
- Keep environment files out of version control. These copies hold private credentials on your own computer; the following tasks explain the setting groups.

Expected result:
- Both private environment files exist alongside their examples.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Starter files: apps/web/.env.example; packages/database/.env.example.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)
- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

#### Connect the database

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- DATABASE_URL: Postgres connection string from your database provider (Neon, Supabase, Railway).
- Save the same DATABASE_URL in packages/database/.env so the database commands and web app use the same development database.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable DATABASE_URL settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example and packages/database/.env.example.
- DATABASE_URL: Postgres connection string from your database provider (Neon, Supabase, Railway).

- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

#### Protect sign-in sessions

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- BETTER_AUTH_SECRET: Generate with `openssl rand -base64 32`.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Generate a private sign-in secret

```bash
openssl rand -base64 32
```

Expected result:
- The applicable BETTER_AUTH_SECRET settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BETTER_AUTH_SECRET: Generate with `openssl rand -base64 32`.

- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Set the app address and sign-in options

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_URL: The web app origin: localhost in development, your HTTPS domain in production.
- NEXT_PUBLIC_AUTH_EMAIL: Enable or disable email sign-in to match your selected authentication methods.
- NEXT_PUBLIC_EMAIL_CLIENT: Set to resend only when using Resend; provider credentials remain in your environment.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_URL, NEXT_PUBLIC_AUTH_EMAIL, NEXT_PUBLIC_EMAIL_CLIENT settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_URL: The web app origin: localhost in development, your HTTPS domain in production.
- NEXT_PUBLIC_AUTH_EMAIL: Enable or disable email sign-in to match your selected authentication methods.
- NEXT_PUBLIC_EMAIL_CLIENT: Set to resend only when using Resend; provider credentials remain in your environment.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)
- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Configure google sign-in

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- AUTH_GOOGLE_CLIENT_ID: Google Cloud Console → APIs & Services → Credentials → OAuth client.
- AUTH_GOOGLE_CLIENT_SECRET: Same Google OAuth client.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CLIENT_SECRET settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- AUTH_GOOGLE_CLIENT_ID: Google Cloud Console → APIs & Services → Credentials → OAuth client.
- AUTH_GOOGLE_CLIENT_SECRET: Same Google OAuth client.

- [Google OAuth web application setup](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Connect Upstash rate limiting

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_ALLOW_RATE_LIMIT: Use your selected rate-limit provider: upstash enables the Redis credentials; none disables this integration.
- UPSTASH_REDIS_REST_URL: Upstash → your Redis database → REST API.
- UPSTASH_REDIS_REST_TOKEN: Upstash → your Redis database → REST API.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_ALLOW_RATE_LIMIT, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_ALLOW_RATE_LIMIT: Use your selected rate-limit provider: upstash enables the Redis credentials; none disables this integration.
- UPSTASH_REDIS_REST_URL: Upstash → your Redis database → REST API.
- UPSTASH_REDIS_REST_TOKEN: Upstash → your Redis database → REST API.

- [Upstash Redis setup](https://upstash.com/docs/redis/overall/getstarted)

#### Connect Vercel Blob storage

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- BLOB_READ_WRITE_TOKEN: Vercel → Storage → Blob → tokens.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable BLOB_READ_WRITE_TOKEN settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BLOB_READ_WRITE_TOKEN: Vercel → Storage → Blob → tokens.

- [Vercel Blob setup](https://vercel.com/docs/vercel-blob)

#### Select the saved payment gateway

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_PAYMENT_GATEWAY: Your saved payment provider selection, not a credential.
- Set NEXT_PUBLIC_PAYMENT_GATEWAY to dodo, matching your saved project selection.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_PAYMENT_GATEWAY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_PAYMENT_GATEWAY: Your saved payment provider selection, not a credential.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure Dodo credentials

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- DODO_PAYMENTS_API_KEY: Dodo Payments dashboard → API keys.
- DODO_PAYMENTS_WEBHOOK_KEY: Dodo Payments dashboard → Webhooks.
- A webhook signing secret comes from the provider’s configured webhook endpoint, not its API-key screen. Local webhook delivery needs a reachable development URL or the provider’s documented forwarding tool.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_WEBHOOK_KEY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- DODO_PAYMENTS_API_KEY: Dodo Payments dashboard → API keys.
- DODO_PAYMENTS_WEBHOOK_KEY: Dodo Payments dashboard → Webhooks.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure the Dodo product and environment

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- DODO_CREDITS_PRODUCT_ID: The credits product's ID from the Dodo dashboard. Match the product to the chosen test or live environment.
- DODO_PAYMENTS_ENVIRONMENT: Dodo's test_mode for development or live_mode for production; match the credentials to that mode.
- Use test_mode. The product ID and credentials must come from Dodo’s test environment.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable DODO_CREDITS_PRODUCT_ID, DODO_PAYMENTS_ENVIRONMENT settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- DODO_CREDITS_PRODUCT_ID: The credits product's ID from the Dodo dashboard. Match the product to the chosen test or live environment.
- DODO_PAYMENTS_ENVIRONMENT: Dodo's test_mode for development or live_mode for production; match the credentials to that mode.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure Dodo return and receipt links

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- DODO_PAYMENTS_RETURN_URL: The app URL customers return to after checkout. Use your local app URL for development and your HTTPS app domain in production.
- NEXT_PUBLIC_DODO_PAYMENTS_URL: The Dodo dashboard base URL used for invoice receipt links. Use its origin, not a product checkout link.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable DODO_PAYMENTS_RETURN_URL, NEXT_PUBLIC_DODO_PAYMENTS_URL settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- DODO_PAYMENTS_RETURN_URL: The app URL customers return to after checkout. Use your local app URL for development and your HTTPS app domain in production.
- NEXT_PUBLIC_DODO_PAYMENTS_URL: The Dodo dashboard base URL used for invoice receipt links. Use its origin, not a product checkout link.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure email sending

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- RESEND_API_KEY: Resend → API Keys.
- NEXT_PUBLIC_SUPPORT_MAIL: Your support and email sender address; when sending with Resend, use a sender on your verified domain.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable RESEND_API_KEY, NEXT_PUBLIC_SUPPORT_MAIL settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- RESEND_API_KEY: Resend → API Keys.
- NEXT_PUBLIC_SUPPORT_MAIL: Your support and email sender address; when sending with Resend, use a sender on your verified domain.

- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)

#### Connect BetterStack logging

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- BETTERSTACK_TELEMETRY_SOURCE_TOKEN: BetterStack Logs → your source → source token; keep this credential private.
- BETTERSTACK_TELEMETRY_INGESTING_HOST: The ingesting host listed for the same BetterStack Logs source, not your app's web address.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable BETTERSTACK_TELEMETRY_SOURCE_TOKEN, BETTERSTACK_TELEMETRY_INGESTING_HOST settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BETTERSTACK_TELEMETRY_SOURCE_TOKEN: BetterStack Logs → your source → source token; keep this credential private.
- BETTERSTACK_TELEMETRY_INGESTING_HOST: The ingesting host listed for the same BetterStack Logs source, not your app's web address.

- [BetterStack log sources](https://betterstack.com/docs/logs/)

#### Connect website analytics

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID: Google Analytics → your property's web data stream → measurement ID, typically starting with G-.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID: Google Analytics → your property's web data stream → measurement ID, typically starting with G-.

- [Google Analytics property setup](https://support.google.com/analytics/answer/9304153)

#### Enable analytics reports

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- GA4_PROPERTY_ID: Google Analytics → property settings → numeric property ID, distinct from the web measurement ID.
- GA4_CREDENTIALS_JSON: Private Google service-account JSON for GA4 reports; enable the Analytics Data API and grant that account access to the property.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable GA4_PROPERTY_ID, GA4_CREDENTIALS_JSON settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- GA4_PROPERTY_ID: Google Analytics → property settings → numeric property ID, distinct from the web measurement ID.
- GA4_CREDENTIALS_JSON: Private Google service-account JSON for GA4 reports; enable the Analytics Data API and grant that account access to the property.

- [Google Analytics Data API setup](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries)

#### Enable performance reports

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- GOOGLE_PAGESPEED_API_KEY: Google Cloud → enable PageSpeed Insights API → create an API key for the selected performance reports.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable GOOGLE_PAGESPEED_API_KEY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- GOOGLE_PAGESPEED_API_KEY: Google Cloud → enable PageSpeed Insights API → create an API key for the selected performance reports.

- [PageSpeed Insights setup](https://developers.google.com/speed/docs/insights/v5/get-started)

#### Configure one AI provider

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_AI_ENABLED: Enable the selected AI module when you have configured a model provider.
- OPENAI_API_KEY: OpenAI Platform → API keys.
- ANTHROPIC_API_KEY: Anthropic Console → API keys.
- GOOGLE_GENERATIVE_AI_API_KEY: Google AI Studio → Get API key.
- OPENROUTER_API_KEY: OpenRouter → API keys; configure only if you choose this AI provider.
- AI_GATEWAY_API_KEY: Your AI gateway provider dashboard.
- OLLAMA_BASE_URL: The reachable API address of your Ollama server, including its API path; leave blank unless you use Ollama.
- OPENAI_COMPATIBLE_BASE_URL: Your chosen compatible provider's documented API base address; leave blank when using a different provider.
- Choose one model provider you intend to use. Configure its credential or server address and leave other provider settings blank. Enable NEXT_PUBLIC_AI_ENABLED only when that provider is ready.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- One chosen provider is configured; unused providers remain blank.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_AI_ENABLED: Enable the selected AI module when you have configured a model provider.
- OPENAI_API_KEY: OpenAI Platform → API keys.
- ANTHROPIC_API_KEY: Anthropic Console → API keys.
- GOOGLE_GENERATIVE_AI_API_KEY: Google AI Studio → Get API key.
- OPENROUTER_API_KEY: OpenRouter → API keys; configure only if you choose this AI provider.
- AI_GATEWAY_API_KEY: Your AI gateway provider dashboard.
- OLLAMA_BASE_URL: The reachable API address of your Ollama server, including its API path; leave blank unless you use Ollama.
- OPENAI_COMPATIBLE_BASE_URL: Your chosen compatible provider's documented API base address; leave blank when using a different provider.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Review the optional n8n AI integration

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- N8N_WEBHOOK_URL: Your n8n workflow's active webhook URL; leave blank unless the n8n AI integration is used.
- N8N_WEBHOOK_JWT_KEY: The private JWT key matching the n8n webhook's authentication; configure together with its webhook URL, otherwise leave blank.
- Leave both settings blank if you are not using n8n. If enabled, the webhook URL and JWT key must match your active workflow.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- Both settings match the workflow, or both are blank because n8n is unused.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- N8N_WEBHOOK_URL: Your n8n workflow's active webhook URL; leave blank unless the n8n AI integration is used.
- N8N_WEBHOOK_JWT_KEY: The private JWT key matching the n8n webhook's authentication; configure together with its webhook URL, otherwise leave blank.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Configure background jobs

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- JOBS_DRIVER: Use inngest for queued jobs; read the jobs guide for inline development behavior.
- INNGEST_EVENT_KEY: Inngest dashboard → Manage → Event Keys.
- INNGEST_SIGNING_KEY: Inngest dashboard → Manage → Signing Key.
- Agent jobs always use Inngest. Start its development server against your web /api/inngest URL; follow the linked local-development guide for development mode and keys.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Expected result:
- The applicable JOBS_DRIVER, INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- JOBS_DRIVER: Use inngest for queued jobs; read the jobs guide for inline development behavior.
- INNGEST_EVENT_KEY: Inngest dashboard → Manage → Event Keys.
- INNGEST_SIGNING_KEY: Inngest dashboard → Manage → Signing Key.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Connect the Python API securely

Keep configuration consistent across the web app, database, and selected native clients.

Prerequisites: Access to your selected service dashboards

- Open apps/web/.env. Find the existing setting names below; keep their spelling and the existing equals signs.
- BACKEND_URL: The reachable URL of your separately hosted Python API.
- BACKEND_HMAC_SECRET: Generate with `openssl rand -hex 32`; use the same value in web and backend environments.
- Use the Python server’s printed address for BACKEND_URL, typically http://localhost:8000 in the downloaded starter. Save the same BACKEND_HMAC_SECRET privately in apps/web/.env and apps/backend/.env.
- Fill applicable values privately, save, and restart the affected development server after changing its environment. Never paste credentials into task help.

Generate a private shared backend secret

```bash
openssl rand -hex 32
```

Expected result:
- The applicable BACKEND_URL, BACKEND_HMAC_SECRET settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BACKEND_URL: The reachable URL of your separately hosted Python API.
- BACKEND_HMAC_SECRET: Generate with `openssl rand -hex 32`; use the same value in web and backend environments.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)
- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Install project dependencies

Install dependencies and initialize your development database.

Prerequisites: Environment files configured

- Use the terminal in the project root and run the install command below.
- Wait for the command to finish. If it reports an error, resolve it before running database commands.

Run from the project root

```bash
pnpm install
```

Expected result:
- Dependencies install successfully.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

#### Generate the database client

Install dependencies and initialize your development database.

Prerequisites: Environment files configured

- Run the generate command after installation. It creates the code the app uses to talk to the database.
- Wait for the command to finish successfully before continuing.

Run from the project root

```bash
pnpm generate
```

Expected result:
- The Prisma client is generated without errors.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

#### Initialize the development database

Install dependencies and initialize your development database.

Prerequisites: Environment files configured

- Confirm DATABASE_URL points to your development database. These migrations can change its tables; back up existing data first.
- Run the migration command below. If prompted about resetting existing data, stop and investigate with your developer.
- Read the result and confirm the migrations succeeded. Never reset an existing database just to make this task pass.

Run from the project root

```bash
pnpm migrate
```

Expected result:
- The development database has the schema the starter expects.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

#### Start the local web app

Install dependencies and initialize your development database.

Prerequisites: Environment files configured

- Run the web development command below and leave that terminal open.
- Open the local address printed by the server in your browser. If the usual port is occupied, use the address actually printed.
- Confirm the sign-in or landing page loads. Use a second terminal for later commands.

Run from the project root

```bash
pnpm --dir apps/web dev
```

Expected result:
- The web app opens in your browser at its printed local address.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Export one local setup report

Find configuration problems before building features.

- Use a second terminal in the project root. The command below checks local configuration without editing your environment files.
- It writes launchpad-report.json. A failed check may give the command a nonzero exit code while still producing a useful report.
- Storage checks can write and remove a small probe object. Review that behaviour before checking a sensitive bucket.

Export a doctor JSON report

```bash
pnpm --silent doctor --json > launchpad-report.json
```

Expected result:
- launchpad-report.json exists and contains the local check results.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Import and review the local report

Find configuration problems before building features.

- Choose Local in this Launchpad’s Import verification results section and select launchpad-report.json.
- Review the service-check tasks once. Warning and Failed are different from Passed imported check; omitted checks stay Not checked.
- Resolve the reported issues, export a new report and import it. A local pass does not prove production, backup recovery or complete customer workflows.

Expected result:
- You have reviewed every applicable check and know which issues remain.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Check Postgres

Confirm Postgres accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Postgres service probe explicitly reports a pass for local.

Verification: An explicit postgres service pass from an imported local report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)

#### Check Dodo Payments

Confirm Dodo Payments accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Dodo Payments service probe explicitly reports a pass for local.

Verification: An explicit dodo service pass from an imported local report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Check Resend

Confirm Resend accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Resend service probe explicitly reports a pass for local.

Verification: An explicit resend service pass from an imported local report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)

#### Check Upstash Redis

Confirm Upstash Redis accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Upstash Redis service probe explicitly reports a pass for local.

Verification: An explicit upstash service pass from an imported local report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Upstash Redis setup](https://upstash.com/docs/redis/overall/getstarted)

#### Check Vercel Blob

Confirm Vercel Blob accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Vercel Blob service probe explicitly reports a pass for local.

Verification: An explicit vercel_blob service pass from an imported local report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Vercel Blob setup](https://vercel.com/docs/vercel-blob)

#### Install the Python companion dependencies

Agent and RAG jobs need the signed Python execution service.

- Install Python 3.12 or newer and uv using the linked instructions.
- Read apps/backend/README.md, open a terminal in apps/backend and run uv sync.
- Create apps/backend/.env from its example. Configure its database and matching shared secret privately; use the web guide’s backend settings task for the web-side address.

Run in apps/backend

```bash
uv sync
```

Expected result:
- The Python environment is installed and its private environment file exists.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)

#### Start the Python API

Agent and RAG jobs need the signed Python execution service.

- Enable pgvector on the database used by agent and RAG features, following your database provider’s extension instructions.
- From the project root, run the Python development command below in its own terminal and leave it open.
- Use its printed address for the web-side BACKEND_URL, then restart the web app. Run a small agent or ingestion request to check the signed connection.

Start the Python development API

```bash
pnpm --dir apps/backend dev
```

Expected result:
- A signed request reaches the running Python API.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)
- [Inngest local development](https://www.inngest.com/docs/local-development)
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)

### Build your MVP

#### Describe the first useful customer outcome

Set a clear boundary for your first usable product.

- Write down the target customer, their problem, the single result the MVP delivers, and how you will know it works.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Describe the first useful customer outcome.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A tester can follow a written scenario and judge whether the product delivers its promised result.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Map the screens and data for that outcome

Set a clear boundary for your first usable product.

- Describe the path from first visit to that result; list the screens, data, and selected modules it needs.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Map the screens and data for that outcome.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A tester can follow a written scenario and judge whether the product delivers its promised result.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Keep later ideas out of the MVP

Set a clear boundary for your first usable product.

- Keep a separate list of later ideas so they do not delay the first usable release.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Keep later ideas out of the MVP.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A tester can follow a written scenario and judge whether the product delivers its promised result.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Replace branding and public copy

Replace demonstration content with the experience your customers need.

- Configure branding in site settings and update your landing copy, support contact, and relevant legal content.
- Open /admin/settings for configured branding. Review apps/web/app/landing/page.tsx and the legal pages under apps/web/app/landing/legal.

Expected result:
- This action is complete and reviewed: Replace branding and public copy.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The core journey works with your product's content and real stored data; demo placeholders are removed.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Implement the core customer journey

Replace demonstration content with the experience your customers need.

- Implement the core journey in root apps/ and packages/ using existing components and server authorization patterns.
- Start with apps/web/app/(home)/page.tsx and apps/web/components/home/AppSidebar.tsx. Product data models live in packages/database/prisma; authorized server procedures live in apps/web/trpc/routers. New product features need your own implementation.

Expected result:
- This action is complete and reviewed: Implement the core customer journey.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The core journey works with your product's content and real stored data; demo placeholders are removed.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test the product’s business rules

Replace demonstration content with the experience your customers need.

- Keep project-specific data and business rules covered by meaningful tests.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test the product’s business rules.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The core journey works with your product's content and real stored data; demo placeholders are removed.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Create two test workspaces and invite a member

Validate the multi tenancy capability your project includes.

- Create two workspaces with different owners, invite a member, and switch workspaces.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Create two test workspaces and invite a member.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A member cannot read or modify the other workspace's data.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Verify workspace data stays private

Validate the multi tenancy capability your project includes.

- Check authorization on the server for every workspace query and mutation.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Verify workspace data stays private.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A member cannot read or modify the other workspace's data.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test document ingestion and an agent request

Validate the ai agents capability your project includes.

- Create a small collection, ingest a sample document, and run an agent against it.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test document ingestion and an agent request.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Ingestion and agent execution finish; unauthorized access is rejected.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Verify queue retries and collection access

Validate the ai agents capability your project includes.

- Test signed backend execution, job retries, and workspace access to collections.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Verify queue retries and collection access.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Ingestion and agent execution finish; unauthorized access is rejected.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Choose a product action that runs a background job

Validate the jobs capability your project includes.

- Choose a real product action that should trigger background work. Perform it with a test account, then check that its result appears once. Use the local queue configuration you already completed.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Choose a product action that runs a background job.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Queued work finishes once; exhausted retries appear for recovery.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Test retries and dead-letter recovery

Validate the jobs capability your project includes.

- Sync /api/inngest with Inngest, dispatch a job, and test retry and dead-letter replay on /admin/jobs.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test retries and dead-letter recovery.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Queued work finishes once; exhausted retries appear for recovery.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Check the product uses your chosen AI provider

Validate the ai capability your project includes.

- Open your product’s AI feature and confirm it offers the provider you already configured during local setup. Make one small request and check that the expected answer appears.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check the product uses your chosen AI provider.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The core AI flow works and handles provider errors without leaking credentials.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Test AI requests, failures and cancellation

Validate the ai capability your project includes.

- Try a successful request, a provider failure, cancellation, and exhausted credits; show useful feedback.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test AI requests, failures and cancellation.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The core AI flow works and handles provider errors without leaking credentials.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Test inbox delivery and channel preferences

Validate the notifications capability your project includes.

- Trigger a real event, check its inbox notification, and change channel preferences.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test inbox delivery and channel preferences.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Notifications respect preferences and deduplication.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Check duplicate notifications are prevented

Validate the notifications capability your project includes.

- Trigger the same dedupe key twice and confirm only one notification is created.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check duplicate notifications are prevented.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Notifications respect preferences and deduplication.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test issuing, using and revoking an API key

Validate the api keys capability your project includes.

- Create a scoped key, call an allowed endpoint, then revoke the key.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test issuing, using and revoking an API key.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Revoked keys stop working and scopes are enforced.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test rejected keys, scopes and rate limits

Validate the api keys capability your project includes.

- Check invalid keys, missing scopes, and rate limits.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test rejected keys, scopes and rate limits.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Revoked keys stop working and scopes are enforced.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Try onboarding with a new test account

Validate the onboarding capability your project includes.

- Try a fresh account and complete tasks using real app actions.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Try onboarding with a new test account.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- New users see useful guidance; existing users are not incorrectly treated as new.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Check completion and onboarding preferences

Validate the onboarding capability your project includes.

- For an existing user database, run the documented onboarding backfill before enabling the wizard.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check completion and onboarding preferences.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- New users see useful guidance; existing users are not incorrectly treated as new.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test a fresh customer’s journey

Catch failures that would stop a customer from using your MVP.

- Test a fresh signup, sign-in, core action, sign-out, and forbidden access to another user's data.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test a fresh customer’s journey.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The acceptance scenario succeeds and failures give useful feedback; checks pass for selected apps.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test failures and selected devices

Catch failures that would stop a customer from using your MVP.

- Exercise empty states, invalid input, slow or failed services, and flows on: web.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test failures and selected devices.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The acceptance scenario succeeds and failures give useful feedback; checks pass for selected apps.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Run code and build checks

Catch failures that would stop a customer from using your MVP.

- Run the available lint, typecheck, tests, and production builds. Check the downloaded package scripts before assuming a command exists.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Run from the project root

```bash
pnpm lint
```

Run from the project root

```bash
pnpm --dir apps/web typecheck
```

Run from the project root

```bash
pnpm test
```

Run from the project root

```bash
pnpm --dir apps/web build
```

Expected result:
- This action is complete and reviewed: Run code and build checks.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The acceptance scenario succeeds and failures give useful feedback; checks pass for selected apps.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

### Launch

#### Check Postgres in production

Confirm Postgres accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Postgres service probe explicitly reports a pass for production.

Verification: An explicit postgres service pass from an imported production report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)

#### Check Dodo Payments in production

Confirm Dodo Payments accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Dodo Payments service probe explicitly reports a pass for production.

Verification: An explicit dodo service pass from an imported production report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Check Resend in production

Confirm Resend accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Resend service probe explicitly reports a pass for production.

Verification: An explicit resend service pass from an imported production report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)

#### Check Upstash Redis in production

Confirm Upstash Redis accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Upstash Redis service probe explicitly reports a pass for production.

Verification: An explicit upstash service pass from an imported production report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Upstash Redis setup](https://upstash.com/docs/redis/overall/getstarted)

#### Check Vercel Blob in production

Confirm Vercel Blob accepts the credentials used in this environment.

- Use the Import report action to import one doctor report for this environment.
- Read this task’s Passed imported check, Warning or Failed status. A missing result stays Not checked.
- Resolve failures using the provider reference below and import a fresh report. Do not rerun doctor separately for every check.

Expected result:
- The Vercel Blob service probe explicitly reports a pass for production.

Verification: An explicit vercel_blob service pass from an imported production report. You can also record manual confirmation separately.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Vercel Blob setup](https://vercel.com/docs/vercel-blob)

#### Connect the database for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- DATABASE_URL: Postgres connection string from your database provider (Neon, Supabase, Railway).
- Use a production database. Supply its DATABASE_URL privately to migration commands; do not point development commands at it.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable DATABASE_URL settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example and packages/database/.env.example.
- DATABASE_URL: Postgres connection string from your database provider (Neon, Supabase, Railway).

- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

#### Protect sign-in sessions for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- BETTER_AUTH_SECRET: Generate with `openssl rand -base64 32`.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Generate a private sign-in secret

```bash
openssl rand -base64 32
```

Expected result:
- The applicable BETTER_AUTH_SECRET settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BETTER_AUTH_SECRET: Generate with `openssl rand -base64 32`.

- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Set the app address and sign-in options for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_URL: The web app origin: localhost in development, your HTTPS domain in production.
- NEXT_PUBLIC_AUTH_EMAIL: Enable or disable email sign-in to match your selected authentication methods.
- NEXT_PUBLIC_EMAIL_CLIENT: Set to resend only when using Resend; provider credentials remain in your environment.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_URL, NEXT_PUBLIC_AUTH_EMAIL, NEXT_PUBLIC_EMAIL_CLIENT settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_URL: The web app origin: localhost in development, your HTTPS domain in production.
- NEXT_PUBLIC_AUTH_EMAIL: Enable or disable email sign-in to match your selected authentication methods.
- NEXT_PUBLIC_EMAIL_CLIENT: Set to resend only when using Resend; provider credentials remain in your environment.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)
- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Configure google sign-in for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- AUTH_GOOGLE_CLIENT_ID: Google Cloud Console → APIs & Services → Credentials → OAuth client.
- AUTH_GOOGLE_CLIENT_SECRET: Same Google OAuth client.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CLIENT_SECRET settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- AUTH_GOOGLE_CLIENT_ID: Google Cloud Console → APIs & Services → Credentials → OAuth client.
- AUTH_GOOGLE_CLIENT_SECRET: Same Google OAuth client.

- [Google OAuth web application setup](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Connect Upstash rate limiting for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_ALLOW_RATE_LIMIT: Use your selected rate-limit provider: upstash enables the Redis credentials; none disables this integration.
- UPSTASH_REDIS_REST_URL: Upstash → your Redis database → REST API.
- UPSTASH_REDIS_REST_TOKEN: Upstash → your Redis database → REST API.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_ALLOW_RATE_LIMIT, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_ALLOW_RATE_LIMIT: Use your selected rate-limit provider: upstash enables the Redis credentials; none disables this integration.
- UPSTASH_REDIS_REST_URL: Upstash → your Redis database → REST API.
- UPSTASH_REDIS_REST_TOKEN: Upstash → your Redis database → REST API.

- [Upstash Redis setup](https://upstash.com/docs/redis/overall/getstarted)

#### Connect Vercel Blob storage for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- BLOB_READ_WRITE_TOKEN: Vercel → Storage → Blob → tokens.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable BLOB_READ_WRITE_TOKEN settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BLOB_READ_WRITE_TOKEN: Vercel → Storage → Blob → tokens.

- [Vercel Blob setup](https://vercel.com/docs/vercel-blob)

#### Select the saved payment gateway for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_PAYMENT_GATEWAY: Your saved payment provider selection, not a credential.
- Set NEXT_PUBLIC_PAYMENT_GATEWAY to dodo, matching your saved project selection.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_PAYMENT_GATEWAY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_PAYMENT_GATEWAY: Your saved payment provider selection, not a credential.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure Dodo credentials for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- DODO_PAYMENTS_API_KEY: Dodo Payments dashboard → API keys.
- DODO_PAYMENTS_WEBHOOK_KEY: Dodo Payments dashboard → Webhooks.
- A webhook signing secret comes from the provider’s configured webhook endpoint, not its API-key screen. Local webhook delivery needs a reachable development URL or the provider’s documented forwarding tool.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_WEBHOOK_KEY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- DODO_PAYMENTS_API_KEY: Dodo Payments dashboard → API keys.
- DODO_PAYMENTS_WEBHOOK_KEY: Dodo Payments dashboard → Webhooks.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure the Dodo product and environment for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- DODO_CREDITS_PRODUCT_ID: The credits product's ID from the Dodo dashboard. Match the product to the chosen test or live environment.
- DODO_PAYMENTS_ENVIRONMENT: Dodo's test_mode for development or live_mode for production; match the credentials to that mode.
- Use live_mode only after sandbox checkout tests pass; the product and credentials must also belong to live mode.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable DODO_CREDITS_PRODUCT_ID, DODO_PAYMENTS_ENVIRONMENT settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- DODO_CREDITS_PRODUCT_ID: The credits product's ID from the Dodo dashboard. Match the product to the chosen test or live environment.
- DODO_PAYMENTS_ENVIRONMENT: Dodo's test_mode for development or live_mode for production; match the credentials to that mode.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure Dodo return and receipt links for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- DODO_PAYMENTS_RETURN_URL: The app URL customers return to after checkout. Use your local app URL for development and your HTTPS app domain in production.
- NEXT_PUBLIC_DODO_PAYMENTS_URL: The Dodo dashboard base URL used for invoice receipt links. Use its origin, not a product checkout link.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable DODO_PAYMENTS_RETURN_URL, NEXT_PUBLIC_DODO_PAYMENTS_URL settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- DODO_PAYMENTS_RETURN_URL: The app URL customers return to after checkout. Use your local app URL for development and your HTTPS app domain in production.
- NEXT_PUBLIC_DODO_PAYMENTS_URL: The Dodo dashboard base URL used for invoice receipt links. Use its origin, not a product checkout link.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Configure email sending for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- RESEND_API_KEY: Resend → API Keys.
- NEXT_PUBLIC_SUPPORT_MAIL: Your support and email sender address; when sending with Resend, use a sender on your verified domain.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable RESEND_API_KEY, NEXT_PUBLIC_SUPPORT_MAIL settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- RESEND_API_KEY: Resend → API Keys.
- NEXT_PUBLIC_SUPPORT_MAIL: Your support and email sender address; when sending with Resend, use a sender on your verified domain.

- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)

#### Connect BetterStack logging for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- BETTERSTACK_TELEMETRY_SOURCE_TOKEN: BetterStack Logs → your source → source token; keep this credential private.
- BETTERSTACK_TELEMETRY_INGESTING_HOST: The ingesting host listed for the same BetterStack Logs source, not your app's web address.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable BETTERSTACK_TELEMETRY_SOURCE_TOKEN, BETTERSTACK_TELEMETRY_INGESTING_HOST settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BETTERSTACK_TELEMETRY_SOURCE_TOKEN: BetterStack Logs → your source → source token; keep this credential private.
- BETTERSTACK_TELEMETRY_INGESTING_HOST: The ingesting host listed for the same BetterStack Logs source, not your app's web address.

- [BetterStack log sources](https://betterstack.com/docs/logs/)

#### Connect website analytics for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID: Google Analytics → your property's web data stream → measurement ID, typically starting with G-.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID: Google Analytics → your property's web data stream → measurement ID, typically starting with G-.

- [Google Analytics property setup](https://support.google.com/analytics/answer/9304153)

#### Enable analytics reports for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- GA4_PROPERTY_ID: Google Analytics → property settings → numeric property ID, distinct from the web measurement ID.
- GA4_CREDENTIALS_JSON: Private Google service-account JSON for GA4 reports; enable the Analytics Data API and grant that account access to the property.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable GA4_PROPERTY_ID, GA4_CREDENTIALS_JSON settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- GA4_PROPERTY_ID: Google Analytics → property settings → numeric property ID, distinct from the web measurement ID.
- GA4_CREDENTIALS_JSON: Private Google service-account JSON for GA4 reports; enable the Analytics Data API and grant that account access to the property.

- [Google Analytics Data API setup](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries)

#### Enable performance reports for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- GOOGLE_PAGESPEED_API_KEY: Google Cloud → enable PageSpeed Insights API → create an API key for the selected performance reports.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable GOOGLE_PAGESPEED_API_KEY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- GOOGLE_PAGESPEED_API_KEY: Google Cloud → enable PageSpeed Insights API → create an API key for the selected performance reports.

- [PageSpeed Insights setup](https://developers.google.com/speed/docs/insights/v5/get-started)

#### Configure one AI provider for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- NEXT_PUBLIC_AI_ENABLED: Enable the selected AI module when you have configured a model provider.
- OPENAI_API_KEY: OpenAI Platform → API keys.
- ANTHROPIC_API_KEY: Anthropic Console → API keys.
- GOOGLE_GENERATIVE_AI_API_KEY: Google AI Studio → Get API key.
- OPENROUTER_API_KEY: OpenRouter → API keys; configure only if you choose this AI provider.
- AI_GATEWAY_API_KEY: Your AI gateway provider dashboard.
- OLLAMA_BASE_URL: The reachable API address of your Ollama server, including its API path; leave blank unless you use Ollama.
- OPENAI_COMPATIBLE_BASE_URL: Your chosen compatible provider's documented API base address; leave blank when using a different provider.
- Choose one model provider you intend to use. Configure its credential or server address and leave other provider settings blank. Enable NEXT_PUBLIC_AI_ENABLED only when that provider is ready.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- One chosen provider is configured; unused providers remain blank.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- NEXT_PUBLIC_AI_ENABLED: Enable the selected AI module when you have configured a model provider.
- OPENAI_API_KEY: OpenAI Platform → API keys.
- ANTHROPIC_API_KEY: Anthropic Console → API keys.
- GOOGLE_GENERATIVE_AI_API_KEY: Google AI Studio → Get API key.
- OPENROUTER_API_KEY: OpenRouter → API keys; configure only if you choose this AI provider.
- AI_GATEWAY_API_KEY: Your AI gateway provider dashboard.
- OLLAMA_BASE_URL: The reachable API address of your Ollama server, including its API path; leave blank unless you use Ollama.
- OPENAI_COMPATIBLE_BASE_URL: Your chosen compatible provider's documented API base address; leave blank when using a different provider.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Review the optional n8n AI integration for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- N8N_WEBHOOK_URL: Your n8n workflow's active webhook URL; leave blank unless the n8n AI integration is used.
- N8N_WEBHOOK_JWT_KEY: The private JWT key matching the n8n webhook's authentication; configure together with its webhook URL, otherwise leave blank.
- Leave both settings blank if you are not using n8n. If enabled, the webhook URL and JWT key must match your active workflow.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- Both settings match the workflow, or both are blank because n8n is unused.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- N8N_WEBHOOK_URL: Your n8n workflow's active webhook URL; leave blank unless the n8n AI integration is used.
- N8N_WEBHOOK_JWT_KEY: The private JWT key matching the n8n webhook's authentication; configure together with its webhook URL, otherwise leave blank.

- [AI SDK provider configuration](https://ai-sdk.dev/docs/foundations/providers-and-models)

#### Configure background jobs for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- JOBS_DRIVER: Use inngest for queued jobs; read the jobs guide for inline development behavior.
- INNGEST_EVENT_KEY: Inngest dashboard → Manage → Event Keys.
- INNGEST_SIGNING_KEY: Inngest dashboard → Manage → Signing Key.
- Use the production Inngest event and signing keys. Sync the production /api/inngest endpoint before testing a queued job.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Expected result:
- The applicable JOBS_DRIVER, INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- JOBS_DRIVER: Use inngest for queued jobs; read the jobs guide for inline development behavior.
- INNGEST_EVENT_KEY: Inngest dashboard → Manage → Event Keys.
- INNGEST_SIGNING_KEY: Inngest dashboard → Manage → Signing Key.

- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Connect the Python API securely for production

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Open your production host’s environment settings. Find the existing setting names below; keep their spelling and the existing equals signs.
- BACKEND_URL: The reachable URL of your separately hosted Python API.
- BACKEND_HMAC_SECRET: Generate with `openssl rand -hex 32`; use the same value in web and backend environments.
- Use the deployed Python API origin for BACKEND_URL. The same BACKEND_HMAC_SECRET must be saved privately on both the web and Python services.
- Fill applicable values privately, save, and redeploy when build-time settings change. Never paste credentials into task help.

Generate a private shared backend secret

```bash
openssl rand -hex 32
```

Expected result:
- The applicable BACKEND_URL, BACKEND_HMAC_SECRET settings have been reviewed and saved in the intended environment.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Compare the exact setting names with the supplied .env.example. Remove accidental spaces or line breaks in copied values.
- If the service rejects a key, confirm the account, environment and permissions match. Never share the value in logs or task help.

Technical details:
- Starter reference: apps/web/.env.example.
- BACKEND_URL: The reachable URL of your separately hosted Python API.
- BACKEND_HMAC_SECRET: Generate with `openssl rand -hex 32`; use the same value in web and backend environments.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)
- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Apply reviewed production migrations

Separate production credentials and data from development.

Prerequisites: A production database and hosting account

- Back up the production database and review the pending migration changes with the person responsible for the code.
- Supply the production DATABASE_URL privately and use the deployment command below. Never use development reset commands on production.
- Check the command’s result before deploying code that needs the new schema. A successful app build does not apply database migrations.

Run with the production DATABASE_URL supplied securely

```bash
pnpm --dir packages/database migrate:deploy
```

Expected result:
- Reviewed migrations are applied to the intended production database.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

- [Prisma development and production migrations](https://www.prisma.io/docs/orm/migrations/applying-a-migration)
- [PostgreSQL backup and recovery](https://www.postgresql.org/docs/current/backup.html)

#### Connect the repository to Vercel

Release the web app using the repo's managed deployment path.

- Connect your Git repository to Vercel and set the project root to apps/web.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Connect the repository to Vercel.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The production URL serves the app and the core journey works.

- [Vercel monorepo deployment](https://vercel.com/docs/monorepos)

#### Configure Vercel build and environment settings

Release the web app using the repo's managed deployment path.

- Configure preview and production environment variables separately; use the repository's Next.js configuration and verify the install/build settings.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Configure Vercel build and environment settings.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The production URL serves the app and the core journey works.

- [Vercel monorepo deployment](https://vercel.com/docs/monorepos)

#### Test preview before releasing production

Release the web app using the repo's managed deployment path.

- Deploy a preview, run the core acceptance scenario, then deploy the production branch. Keep the last working deployment available for rollback.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test preview before releasing production.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The production URL serves the app and the core journey works.

- [Vercel monorepo deployment](https://vercel.com/docs/monorepos)

#### Deploy the Python execution service

The Python API and Inngest jobs must be reachable independently of the web deployment.

- Deploy the documented backend container on infrastructure that runs Python services; a web-only Vercel deployment does not host this companion.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Deploy the Python execution service.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A production agent task completes through the queue and signed Python API.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)
- [Docker Compose production guidance](https://docs.docker.com/compose/how-tos/production/)
- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Connect the deployed web and Python services

The Python API and Inngest jobs must be reachable independently of the web deployment.

- Configure production BACKEND_URL and the matching BACKEND_HMAC_SECRET on both services.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Connect the deployed web and Python services.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A production agent task completes through the queue and signed Python API.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)
- [Docker Compose production guidance](https://docs.docker.com/compose/how-tos/production/)
- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Test the production queue and agent flow

The Python API and Inngest jobs must be reachable independently of the web deployment.

- Enable pgvector, configure Inngest keys, sync production /api/inngest, and run an end-to-end ingestion and agent task.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test the production queue and agent flow.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A production agent task completes through the queue and signed Python API.

- [uv installation and Python setup](https://docs.astral.sh/uv/getting-started/installation/)
- [Docker Compose production guidance](https://docs.docker.com/compose/how-tos/production/)
- [Inngest local development](https://www.inngest.com/docs/local-development)

#### Connect DNS and HTTPS

Give users a stable HTTPS address and keep generated links correct.

- Add the domain to your host and configure its DNS records; Docker hosting also needs a configured TLS reverse proxy.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Connect DNS and HTTPS.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The final domain serves HTTPS and application links return to the correct origin.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Update the app’s public address

Give users a stable HTTPS address and keep generated links correct.

- Set NEXT_PUBLIC_URL to the final HTTPS origin and redeploy when build-time public values change.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Update the app’s public address.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The final domain serves HTTPS and application links return to the correct origin.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Check redirects and email links

Give users a stable HTTPS address and keep generated links correct.

- Check redirects, a fresh browser session, and links opened from email.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check redirects and email links.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The final domain serves HTTPS and application links return to the correct origin.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Register production sign-in callbacks

A working local sign-in does not guarantee a working production callback.

- For each selected OAuth provider (google), register the production callback using the auth configuration and provider documentation.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Register production sign-in callbacks.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Selected social sign-in flows return to the correct app without redirect or cookie errors.

- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Check redirects and native app schemes

A working local sign-in does not guarantee a working production callback.

- Confirm the production origin, allowed redirect URLs, and app schemes for: web.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check redirects and native app schemes.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Selected social sign-in flows return to the correct app without redirect or cookie errors.

- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Test new and returning users

A working local sign-in does not guarantee a working production callback.

- Test a new user and a returning user on every selected platform.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test new and returning users.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Selected social sign-in flows return to the correct app without redirect or cookie errors.

- [Better Auth social sign-in](https://www.better-auth.com/docs/concepts/oauth)

#### Verify the production sending domain

Users need working verification, recovery, and selected notification emails.

- Verify the sending domain with Resend, configure its required DNS records, and use the correct sender address.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Verify the production sending domain.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Required emails arrive and their links work; API-key validity alone is insufficient.

- [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction)

#### Test verification and recovery emails

Users need working verification, recovery, and selected notification emails.

- Test the enabled verification and password-reset flows using a real inbox. Check that links point to production.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test verification and recovery emails.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Required emails arrive and their links work; API-key validity alone is insufficient.

- [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction)

#### Test notification email preferences

Users need working verification, recovery, and selected notification emails.

- If notifications are selected, test the email channel and preferences too.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test notification email preferences.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Required emails arrive and their links work; API-key validity alone is insufficient.

- [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction)

#### Configure products and payment callbacks

Verify that successful payments grant access exactly once.

Prerequisites: Provider dashboard access; A reachable payment webhook endpoint

- Configure dodo products and prices, return URLs, and the production payment webhook endpoint.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Configure products and payment callbacks.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A successful payment grants the intended access; duplicate callbacks do not grant it again.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Test sandbox checkout and duplicate webhooks

Verify that successful payments grant access exactly once.

Prerequisites: Provider dashboard access; A reachable payment webhook endpoint

- Use sandbox credentials first. Test checkout success, cancellation, signature rejection, and replaying the same webhook event.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test sandbox checkout and duplicate webhooks.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A successful payment grants the intended access; duplicate callbacks do not grant it again.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Check access and receipts before live payments

Verify that successful payments grant access exactly once.

Prerequisites: Provider dashboard access; A reachable payment webhook endpoint

- Check credits or entitlements, invoices, and provider-specific refund behavior before enabling live payments.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check access and receipts before live payments.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A successful payment grants the intended access; duplicate callbacks do not grant it again.

- [Dodo Payments integration guide](https://docs.dodopayments.com/developer-resources/integration-guide)

#### Test the released customer journey

Confirm the released product works as a customer would use it.

- Use a clean session and real devices for: web. Run your written core journey against production.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test the released customer journey.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The intended customer can complete the core journey on all selected platforms.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Test authorization and integration failures

Confirm the released product works as a customer would use it.

- Test authorization, selected integrations, and failure feedback without using an admin account for the customer flow.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Test authorization and integration failures.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The intended customer can complete the core journey on all selected platforms.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Resolve launch blockers

Confirm the released product works as a customer would use it.

- Record unresolved launch blockers and fix them before sharing the release widely.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Resolve launch blockers.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The intended customer can complete the core journey on all selected platforms.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

### Operate

#### Enable backups and choose retention

A backup is useful only if you can restore it.

- Enable database backups and decide retention and recovery objectives appropriate to your product.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Enable backups and choose retention.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A restore drill succeeds without touching the live database, and the recovery steps are documented.

- [PostgreSQL backup and recovery](https://www.postgresql.org/docs/current/backup.html)

#### Practice restoring to an isolated database

A backup is useful only if you can restore it.

- Restore a backup to an isolated database, run application checks against it, and record the recovery procedure.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Practice restoring to an isolated database.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A restore drill succeeds without touching the live database, and the recovery steps are documented.

- [PostgreSQL backup and recovery](https://www.postgresql.org/docs/current/backup.html)

#### Protect file backups and recovery secrets

A backup is useful only if you can restore it.

- Include uploaded files and required encryption/signing secrets in your recovery plan; restrict access to backups.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Protect file backups and recovery secrets.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A restore drill succeeds without touching the live database, and the recovery steps are documented.

- [PostgreSQL backup and recovery](https://www.postgresql.org/docs/current/backup.html)

#### Check logging and analytics

Learn about failures before customers have to tell you.

- Configure your selected logging and analytics tools; verify a test error and avoid sending credentials or sensitive data to logs.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Check logging and analytics.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A simulated failure reaches the right person and there is a documented response.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Set an uptime check and alert destination

Learn about failures before customers have to tell you.

- Set up an external uptime check for your production URL and an alert destination your team watches.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Set an uptime check and alert destination.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A simulated failure reaches the right person and there is a documented response.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Assign responses for failed jobs and webhooks

Learn about failures before customers have to tell you.

- Watch failed jobs and webhook deliveries when those modules are selected; define who responds and how.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Assign responses for failed jobs and webhooks.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- A simulated failure reaches the right person and there is a documented response.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Rehearse restoring the previous app version

Have a recovery path when a deployment breaks the product.

- Document how to restore the previous working Vercel deployment and test the procedure in preview.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Rehearse restoring the previous app version.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The team can recover a failed release using a tested procedure.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Review database compatibility for rollback

Have a recovery path when a deployment breaks the product.

- Keep migrations additive where possible. Application rollback does not automatically reverse database changes.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Review database compatibility for rollback.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The team can recover a failed release using a tested procedure.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Document native release recovery

Have a recovery path when a deployment breaks the product.

- Document distribution and rollback behavior for: web; native versions have a separate release process.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Document native release recovery.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- The team can recover a failed release using a tested procedure.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Review release notes and security advisories

Keep the starter current while preserving your product's custom code.

- This project records starter v2.1.1. Review its release notes and security advisories in this Launchpad.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Review release notes and security advisories.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Relevant advisories have been reviewed and any upgrade has been tested before release.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Preview and test an upgrade in a separate branch

Keep the starter current while preserving your product's custom code.

- Preview an upgrade from My Projects, apply it in a separate branch, inspect conflicts and migration requirements, and run the project's checks.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Preview and test an upgrade in a separate branch.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Relevant advisories have been reviewed and any upgrade has been tested before release.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)

#### Recheck integrations after configuration changes

Keep the starter current while preserving your product's custom code.

- After changing modules, providers, platforms, or starter version, rerun doctor checks and repeat affected acceptance scenarios.
- Use the reference below and the relevant starter files. Record the result before moving to the next step.

Expected result:
- This action is complete and reviewed: Recheck integrations after configuration changes.

Verification: Check the expected result yourself. Mark this step complete only after confirming it.

Common fixes:
- Check the relevant app's .env.example and README against your selected modules and providers.
- Read the failing command or service logs, correct the cause, and retry this task.

Technical details:
- Relevant advisories have been reviewed and any upgrade has been tested before release.

- [Next.js project setup](https://nextjs.org/docs/app/getting-started/installation)
