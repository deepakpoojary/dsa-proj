import type { BankQuestion } from './types';

// Detailed, fresher-friendly rewrites of DEVOPS questions 1-50.
// Ids, groups, stars, difficulty and question text match devops.ts exactly.
export const DEVOPS_1: BankQuestion[] = [
  // ───────────────────────── DevOps & SDLC Concepts ─────────────────────────
  {
    id: 'what-is-devops',
    group: 'DevOps & SDLC Concepts',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is DevOps and why do teams adopt it?',
    a: [
      "# ELI5",
      "Imagine a bakery where one group bakes cakes in the back and another group sells them at the front counter.",
      "If the bakers never talk to the sellers, cakes come out late, customers complain, and each group blames the other.",
      "Now the bakery makes everyone one team: bakers hear complaints directly, a machine wraps and delivers each cake automatically, and a screen shows which cakes are selling.",
      "Back to software: the bakers are developers (Dev), the sellers are operations (Ops), and DevOps is the 'one team plus automation' way of working.",
      "# What it is",
      "DevOps is a culture plus a set of practices that joins software development (writing code) and IT operations (running that code on servers) into one shared responsibility.",
      "The goal is to deliver changes to users quickly, often and safely, instead of in big, risky releases a few times a year.",
      "Before DevOps, developers 'threw code over the wall' to an ops team who had to deploy it; problems bounced back and forth between two silos (separate teams that rarely talk).",
      "Key practices that make DevOps work:",
      "  CI (Continuous Integration) — every code change is automatically built and tested as soon as it is pushed.",
      "  CD (Continuous Delivery/Deployment) — tested changes are automatically packaged and released to servers.",
      "  IaC (Infrastructure as Code) — servers, networks and databases are described in code files (e.g. Terraform) instead of clicked together by hand.",
      "  Monitoring and observability — metrics, logs and traces tell you how the system behaves in production.",
      "  Fast feedback loops — problems are detected minutes after a change, not weeks.",
      "'You build it, you run it' — the team that writes a service is also responsible for keeping it healthy in production.",
      "DevOps is NOT a job title or a single tool; Docker, Kubernetes, Jenkins and Terraform are just tools that support the culture.",
      "# How it works",
      "A typical DevOps loop for one change:",
      "  A developer makes a small change on a short-lived branch and opens a pull request.",
      "  The CI pipeline automatically installs dependencies, runs linters and tests, and reports pass/fail on the pull request.",
      "  After review and merge, the CD pipeline builds a container image and deploys it to staging, then production.",
      "  Monitoring dashboards and alerts watch error rates and latency right after the deploy.",
      "  If something breaks, the team rolls back quickly and writes a blameless postmortem (a 'what went wrong and how do we prevent it' document without finger-pointing).",
      "This loop repeats many times a day, so each change is small, easy to review and easy to undo.",
      "# Example walkthrough",
      "The `code` is a GitHub Actions workflow — a YAML file that tells GitHub what to do on each push.",
      "`on: push` with `branches: [main]` means the workflow runs every time someone pushes to main.",
      "The `test` job checks out the code, installs Node 22, runs `npm ci` (clean install from the lockfile) and `npm test`.",
      "The `deploy` job has `needs: test`, so it runs only if tests pass; a failing test stops the release automatically.",
      "Result: every merged change is tested and deployed with no human copy-pasting files to a server.",
      "# Why it matters / when to use",
      "Businesses can ship features and bug fixes in hours instead of months, reacting faster to users and competitors.",
      "Small, frequent releases are less risky: if one breaks, you know exactly which small change caused it.",
      "Automation removes manual, error-prone steps ('I forgot to restart the server') and frees engineers for real work.",
      "It is measured with the DORA metrics: deployment frequency, lead time, change failure rate and time to restore.",
      "# Common mistakes",
      "Thinking 'we bought Jenkins/Kubernetes, so we do DevOps' — without shared ownership and small changes, tools alone change little.",
      "Creating a separate 'DevOps team' that becomes a new silo between dev and ops; instead, embed the practices in every team.",
      "Automating deploys but skipping tests and monitoring, which just ships bugs faster.",
      "# Say this in the interview",
      "DevOps is a culture and set of practices that brings development and operations together so a team can ship small changes quickly and safely. It relies on CI/CD, Infrastructure as Code, automated testing and good monitoring, with the same team owning a service from code to production. Teams adopt it to shorten lead time, release more often, reduce failed changes and recover faster, which are exactly the DORA metrics.",
      "Follow-up: Is DevOps a role?",
      "  Not really; it is a way of working. 'DevOps engineer' roles usually build the platform and pipelines that help product teams work this way.",
      "Follow-up: How is DevOps different from SRE?",
      "  SRE (Site Reliability Engineering) is Google's concrete implementation of DevOps ideas, using SLOs (reliability targets) and error budgets to balance speed and stability.",
    ],
    code: `# .github/workflows/ci-cd.yml — a minimal DevOps pipeline
name: ci-cd
on:
  push:
    branches: [main]          # run on every push to main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4       # get the code
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci                     # clean install from package-lock.json
      - run: npm test                   # → fails the pipeline if any test fails

  deploy:
    needs: test                         # only runs if 'test' succeeded
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myorg/api:$GITHUB_SHA .   # image tagged with commit id
      - run: echo "Deploying myorg/api:$GITHUB_SHA"    # → Deploying myorg/api:3f9c2e1...`,
  },
  {
    id: 'microservices-vs-monolith',
    group: 'DevOps & SDLC Concepts',
    stars: 5,
    difficulty: 'Medium',
    q: 'Monolith vs microservices: what are the trade-offs?',
    a: [
      "# ELI5",
      "A monolith is like one big department store: clothes, food and toys all under one roof, one manager, one set of doors.",
      "Microservices are like a street of small shops: a bakery, a toy shop, a shoe shop, each with its own owner, hours and stock.",
      "The big store is easy to run at first, but renovating the toy section means closing the whole building. Small shops can renovate alone, but now customers walk between shops and you need roads, signs and delivery vans.",
      "In software: the department store is one big application; the small shops are separate services that talk over the network.",
      "# What it is",
      "Monolith — the whole application (users, orders, payments, emails) lives in one codebase and is deployed as one unit (one process or one container).",
      "Microservices — the application is split into small, independently deployable services, each owning one business area and usually its own database.",
      "Services talk to each other over the network using HTTP/REST, gRPC (a fast binary RPC protocol from Google) or message queues (e.g. RabbitMQ, Kafka).",
      "Comparison, row by row:",
      "  Deployment — monolith: deploy everything together. Microservices: deploy each service on its own.",
      "  Scaling — monolith: scale the whole app even if only one part is busy. Microservices: scale just the busy service.",
      "  Development speed early on — monolith: faster and simpler. Microservices: slower, lots of setup.",
      "  Failure isolation — monolith: one memory leak can crash everything. Microservices: one service can fail while others keep working (if designed well).",
      "  Data — monolith: one database with easy joins and transactions. Microservices: each service owns its data, so cross-service consistency is harder (eventual consistency — data becomes consistent after a short delay).",
      "  Debugging — monolith: one stack trace. Microservices: a request hops across many services, so you need distributed tracing.",
      "  Team structure — monolith: everyone touches one codebase. Microservices: each team owns a service end to end.",
      "# How it works",
      "In a monolith, a call from the orders module to the payments module is a normal function call inside the same process — fast and cannot 'time out'.",
      "In microservices, the same call becomes a network request:",
      "  The orders service looks up where payments lives (service discovery — a registry or DNS name like `payments.svc`).",
      "  It sends an HTTP or gRPC request; the network may be slow or drop it, so you need timeouts and retries.",
      "  The payments service reads its own database and replies.",
      "  If payments is down, orders must degrade gracefully (circuit breaker — stop calling a failing service for a while).",
      "Each service has its own CI/CD pipeline, container image, monitoring and API version.",
      "# Example walkthrough",
      "The `code` is a Docker Compose file describing a small microservices setup.",
      "`orders` and `payments` are two separate services built from different folders, each with its own database container.",
      "`orders` reaches payments using the URL `http://payments:3000` — Compose provides DNS so the service name works as a hostname.",
      "In a monolith you would have only one `app` service and one `db`; here you already have four containers to run and monitor.",
      "# Why it matters / when to use",
      "Start with a monolith (ideally a modular monolith — one deployable app with clean internal module boundaries) for new products and small teams.",
      "Move to microservices when many teams step on each other in one codebase, or when parts of the system have very different scaling needs.",
      "Microservices need mature DevOps: automated CI/CD per service, containers and orchestration (Kubernetes), centralised logging, tracing and API versioning.",
      "# Common mistakes",
      "Splitting too early into many tiny services, creating a 'distributed monolith' — services that must all be deployed together anyway.",
      "Sharing one database between services, which couples them tightly; each service should own its data.",
      "Forgetting network failure handling (timeouts, retries, circuit breakers), so one slow service freezes everything.",
      "# Say this in the interview",
      "A monolith is a single deployable application; it is simple to build, test and deploy early on, but it scales and releases as one unit. Microservices split the system into independently deployable services that own their data, which gives independent scaling, team autonomy and fault isolation, at the cost of distributed-system complexity like network failures, eventual consistency and harder debugging. I would usually start with a modular monolith and extract services when team or scaling boundaries become clear.",
      "Follow-up: How do microservices keep data consistent?",
      "  Using patterns like the Saga pattern (a chain of local transactions with compensating actions) and events, accepting eventual consistency.",
      "Follow-up: What is a distributed monolith?",
      "  Services that are split physically but so tightly coupled that they must change and deploy together — the worst of both worlds.",
    ],
    code: `# compose.yaml — two microservices, each with its own database
services:
  orders:
    build: ./orders                 # its own codebase and Dockerfile
    environment:
      PAYMENTS_URL: http://payments:3000   # service name works as a hostname
      DATABASE_URL: postgres://app:app@orders-db:5432/orders
    ports: ["8080:3000"]            # only orders is exposed to the outside
    depends_on: [orders-db, payments]

  payments:
    build: ./payments               # deployed and scaled independently
    environment:
      DATABASE_URL: postgres://app:app@payments-db:5432/payments

  orders-db:
    image: postgres:16              # each service owns its own data
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: orders }

  payments-db:
    image: postgres:16
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: payments }

# docker compose up -d --scale payments=3   → 3 payments containers, 1 orders`,
  },
  {
    id: 'dora-metrics',
    group: 'DevOps & SDLC Concepts',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are the DORA metrics?',
    a: [
      "# ELI5",
      "Think of a pizza delivery shop measuring how good it is.",
      "It counts how many pizzas go out per day, how long from order to doorstep, how many pizzas come back wrong, and how fast they fix a wrong order.",
      "The first two show speed; the last two show quality. A great shop is fast AND rarely gets orders wrong.",
      "DORA metrics are those four numbers, but for shipping software changes instead of pizzas.",
      "# What it is",
      "DORA stands for DevOps Research and Assessment, a research group (now part of Google Cloud) that studied thousands of teams and publishes the yearly 'State of DevOps' report.",
      "They found four metrics that reliably predict how well a team delivers software:",
      "  Deployment frequency — how often you release to production (e.g. several times per day vs once a month).",
      "  Lead time for changes — time from a commit (saved code change) to that code running in production.",
      "  Change failure rate — the percentage of deployments that cause a failure needing a fix, rollback or hotfix.",
      "  Time to restore service (often called MTTR — mean time to recovery) — how long it takes to recover from a production incident.",
      "The first two measure throughput (speed); the last two measure stability (quality).",
      "Elite teams do well on all four at once — the research shows speed and stability are not a trade-off when you work in small, automated batches.",
      "Newer reports also add a fifth, reliability (meeting availability/performance targets), and split restore time into 'failed deployment recovery time'.",
      "# How it works",
      "You collect the raw data automatically from your tools:",
      "  Deployments — from your CD tool (GitHub Actions, Argo CD) each time it deploys to prod.",
      "  Commit times — from Git, to calculate lead time (deploy time minus commit time).",
      "  Failures — from incidents or deployments marked as rolled back / hotfixed.",
      "  Recovery time — from incident open and close times in your paging tool (PagerDuty, Opsgenie).",
      "Plot them over weeks or months and look at trends, not single numbers.",
      "Use the trends to find bottlenecks: long lead time may mean slow reviews or slow CI; high failure rate may mean weak tests.",
      "# Example walkthrough",
      "The `code` is a small shell example computing two DORA metrics from a list of deploys.",
      "`deploys.csv` has one line per production deploy: date, lead time in hours, and whether it failed.",
      "`wc -l` counts deploys, so dividing by 30 days gives deployment frequency.",
      "`awk` sums the 'failed' column and divides by the total to get change failure rate.",
      "With 4 deploys and 1 failure, the change failure rate is 25%.",
      "# Why it matters / when to use",
      "Gives leaders and engineers an objective, shared language for 'are we getting better at delivery?'.",
      "Helps justify investments such as faster CI, better tests or trunk-based development by showing measurable improvement.",
      "Commonly discussed in interviews for DevOps, SRE and platform roles.",
      "# Common mistakes",
      "Using DORA metrics to rank or punish individuals — they measure team and system performance; gaming them destroys their value.",
      "Optimising one metric only, e.g. deploying very often while the failure rate explodes.",
      "Measuring by hand in spreadsheets; automate collection from your pipeline so the numbers are trustworthy.",
      "# Say this in the interview",
      "The DORA metrics are four measures of software delivery performance from the DevOps Research and Assessment program: deployment frequency, lead time for changes, change failure rate and time to restore service. The first two measure throughput and the last two stability, and elite teams score well on both. I would collect them automatically from Git, the CD pipeline and the incident tool and use the trends to find bottlenecks.",
      "Follow-up: How would you improve lead time?",
      "  Smaller pull requests, faster CI (caching, parallel tests), trunk-based development and automated deploys instead of manual approvals.",
      "Follow-up: What counts as a 'failure' for change failure rate?",
      "  Any deployment that degrades service and needs remediation — a rollback, hotfix, or patch.",
    ],
    code: `# deploys.csv  (one row per production deploy in the last 30 days)
# date,lead_time_hours,failed
# 2026-11-01,5,0
# 2026-11-03,30,1
# 2026-11-05,2,0
# 2026-11-08,8,0

total=$(tail -n +2 deploys.csv | wc -l)            # skip header → 4
echo "Deployment frequency: $total deploys / 30 days"
# → Deployment frequency: 4 deploys / 30 days

tail -n +2 deploys.csv | awk -F, '
  { lead += $2; failed += $3; n++ }
  END {
    printf "Avg lead time: %.1f h\\n", lead / n          # → Avg lead time: 11.2 h
    printf "Change failure rate: %d%%\\n", failed / n * 100  # → Change failure rate: 25%
  }'`,
  },
  {
    id: 'shift-left',
    group: 'DevOps & SDLC Concepts',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does "shift left" mean?',
    a: [
      "# ELI5",
      "Imagine building a toy car on a long table, moving from left (design) to right (shipping to the shop).",
      "If you only check the wheels at the far right end, you might have to take the whole car apart to fix one wheel.",
      "If you check each wheel the moment it is attached (on the left side of the table), fixing it takes seconds.",
      "Shift left means doing checks (tests, security, quality) as early as possible on the software 'table'.",
      "# What it is",
      "The SDLC (Software Development Life Cycle — the stages from idea to production) is often drawn as a timeline from left to right: plan, code, build, test, release, operate.",
      "Shift left means moving testing, security and quality checks earlier (to the left), close to the developer writing the code.",
      "Why: a bug caught while typing costs seconds; the same bug found in production can cost hours of downtime, angry users and emergency fixes.",
      "Typical shift-left practices:",
      "  Linting (automatic style and bug-pattern checks, e.g. ESLint) and type checking in the editor and in pre-commit hooks.",
      "  Unit tests running on every push in CI.",
      "  SAST (Static Application Security Testing — scanning source code for security bugs) on every pull request.",
      "  Dependency scanning (e.g. `npm audit`, Dependabot) for known vulnerable libraries.",
      "  IaC policy checks (e.g. Checkov, tfsec) that block insecure cloud config before it is applied.",
      "The opposite partner idea is 'shift right': testing in production safely with canary releases, feature flags and observability.",
      "# How it works",
      "Checks are layered from fastest/earliest to slowest/latest:",
      "  In the editor: type errors and lint warnings appear as you type.",
      "  Pre-commit hook: a script runs lint and quick tests before Git accepts the commit.",
      "  Pull request CI: full unit tests, security scans and build run automatically; merge is blocked if they fail.",
      "  After merge: integration and end-to-end tests run against a staging environment.",
      "Each layer catches problems before the more expensive later stages.",
      "# Example walkthrough",
      "The `code` is a GitHub Actions job that runs on every pull request.",
      "`npm run lint` and `npx tsc --noEmit` catch style and type errors first (fast, cheap).",
      "`npm test` runs unit tests.",
      "`npm audit --audit-level=high` fails the job if a dependency has a known high-severity vulnerability.",
      "Because this runs on the pull request, the problem is found before the code ever reaches main or production.",
      "# Why it matters / when to use",
      "Reduces cost and time of fixing defects; developers get feedback while the code is fresh in their mind.",
      "Security issues are caught before they are deployed, which is the core idea of DevSecOps (security built into DevOps).",
      "Use it on every project with a CI pipeline; even a small Node API benefits from lint + tests + audit on each PR.",
      "# Common mistakes",
      "Adding so many slow checks that pull requests take an hour; keep early checks fast and move slow ones later.",
      "Making scanners noisy with many false positives, so developers ignore them; tune rules and severity thresholds.",
      "Thinking shift left removes the need for production monitoring; you still need shift-right practices.",
      "# Say this in the interview",
      "Shift left means moving testing, security and quality checks earlier in the development lifecycle, close to the developer, because defects are far cheaper to fix early. In practice that is linting and type checks in the editor and pre-commit hooks, unit tests and security scans like SAST and dependency audits on every pull request, and policy checks on infrastructure code. It is complemented by shift right, which tests safely in production with canaries and monitoring.",
      "Follow-up: What is DevSecOps?",
      "  DevOps with security built into every stage of the pipeline instead of a final security review before release.",
      "Follow-up: How do you keep shift-left checks from slowing developers down?",
      "  Run fast checks first, cache dependencies, run tests in parallel, and push slow suites to later stages.",
    ],
    code: `# .github/workflows/pr-checks.yml — catch problems before merge
name: pr-checks
on: pull_request                  # runs on every pull request

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }   # cache speeds up installs
      - run: npm ci
      - run: npm run lint            # style + bug patterns   (seconds)
      - run: npx tsc --noEmit        # type errors            (seconds)
      - run: npm test                # unit tests             (a minute)
      - run: npm audit --audit-level=high
        # → exits 1 if any dependency has a high/critical CVE,
        #   which blocks the pull request from merging`,
  },
  {
    id: 'immutable-infrastructure',
    group: 'DevOps & SDLC Concepts',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is immutable infrastructure?',
    a: [
      "# ELI5",
      "Imagine your school lunch box. One way: every day you scrape out yesterday's food, patch the lid with tape, and reuse it, until it is a mystery mess.",
      "Another way: every day you get a brand-new, identical lunch box packed from the same recipe, and throw away the old one.",
      "With the second way, every lunch box is exactly as expected, and if today's recipe is bad you just go back to yesterday's recipe.",
      "Immutable infrastructure is the 'new lunch box every time' approach for servers and containers.",
      "# What it is",
      "Immutable means 'cannot be changed after creation'.",
      "Immutable infrastructure: once a server or container is deployed, you never modify it (no SSH-ing in to install packages or edit config).",
      "To change anything, you build a new image (a pre-packaged snapshot of OS + app + config) and replace the old instances with new ones.",
      "The opposite is mutable infrastructure: long-lived servers patched in place over months.",
      "Mutable servers suffer from configuration drift — small manual changes pile up so no two servers are the same and nobody knows the exact state.",
      "Those unique, hand-tuned servers are called 'snowflake servers' — impossible to reproduce if they die.",
      "Tools: Docker images, VM images such as AWS AMIs (Amazon Machine Images) built with Packer, plus IaC (Terraform) and orchestrators (Kubernetes, auto-scaling groups).",
      "# How it works",
      "A change flows like this:",
      "  Developer changes code or config in Git.",
      "  CI builds a new versioned image, e.g. `myorg/api:1.5.0`, and pushes it to a registry (an image storage server).",
      "  The deploy tool starts new instances from the new image (rolling update or blue-green — run old and new side by side, then switch traffic).",
      "  Once new instances are healthy, old ones are destroyed.",
      "Rollback is just deploying the previous image tag, e.g. `1.4.2`, which is guaranteed to be exactly what ran before.",
      "Any data that must survive (databases, uploads) lives outside the instance in volumes, managed databases or object storage.",
      "# Example walkthrough",
      "The `code` shows the immutable workflow with Docker and Kubernetes.",
      "`docker build -t myorg/api:1.5.0 .` creates a new image; the old `1.4.2` image is untouched.",
      "`kubectl set image` tells the Deployment to use the new tag; Kubernetes replaces pods one by one rather than patching them.",
      "The anti-pattern `kubectl exec ... apt-get install` modifies a running container — that change is lost when the pod restarts and causes drift.",
      "`kubectl rollout undo` rolls back by recreating pods from the previous image.",
      "# Why it matters / when to use",
      "Every environment (dev, staging, prod) runs the same image, so 'works on my machine' problems shrink.",
      "Deployments and rollbacks become predictable and fast.",
      "Security improves: no long-lived servers collecting unpatched packages; patching means rebuilding the image.",
      "It is the default model with containers and Kubernetes.",
      "# Common mistakes",
      "Hot-fixing a running container or server by hand during an incident and forgetting to put the fix into the image.",
      "Using the `latest` tag, which changes over time and breaks the 'exact same image' guarantee; use versioned tags or digests.",
      "Storing data on the instance's local disk and losing it when the instance is replaced.",
      "# Say this in the interview",
      "Immutable infrastructure means servers or containers are never modified after they are deployed; to change anything you build a new versioned image and replace the old instances. This removes configuration drift and snowflake servers, makes every environment reproducible, and turns rollback into redeploying the previous image. It is implemented with Docker images or Packer-built machine images, Infrastructure as Code and rolling or blue-green deployments.",
      "Follow-up: How do you handle state with immutable infrastructure?",
      "  Keep state outside the instances — managed databases, persistent volumes, object storage like S3.",
      "Follow-up: How do you patch an OS vulnerability?",
      "  Rebuild the image on the patched base image, run it through CI and roll it out, instead of patching servers in place.",
    ],
    code: `# Immutable workflow: build a NEW image, replace pods, never patch in place

docker build -t myorg/api:1.5.0 .          # new version; 1.4.2 still exists
docker push myorg/api:1.5.0                 # store it in the registry

kubectl set image deployment/api api=myorg/api:1.5.0
kubectl rollout status deployment/api
# → deployment "api" successfully rolled out   (old pods replaced, not edited)

# Anti-pattern (mutable): changing a live container by hand
# kubectl exec -it api-7d9f-abc -- apt-get install curl
#   → lost on next restart and creates drift between pods

# Rollback = run the previous immutable image again
kubectl rollout undo deployment/api
# → deployment.apps/api rolled back            (pods now run myorg/api:1.4.2)`,
  },
  {
    id: 'twelve-factor-app',
    group: 'DevOps & SDLC Concepts',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is the Twelve-Factor App methodology?',
    a: [
      "# ELI5",
      "Think of a food truck that can park in any city and start serving right away.",
      "It carries its own recipes, gets water and power from whatever plug the city provides, can add more trucks on busy days, and can pack up in minutes.",
      "The Twelve-Factor rules are a checklist that makes your app like that food truck: easy to move, copy and restart anywhere.",
      "In software: the 'city' is any cloud or server, and 'plugs' are things like databases and environment variables.",
      "# What it is",
      "The Twelve-Factor App is a set of 12 principles, written by engineers at Heroku (a cloud platform), for building cloud-native apps — apps designed to run in the cloud, scale out and be deployed often.",
      "The twelve factors:",
      "  1. Codebase — one codebase tracked in Git, deployed to many environments.",
      "  2. Dependencies — declare them explicitly (e.g. `package.json` + lockfile), never rely on globally installed tools.",
      "  3. Config — store config (DB URLs, API keys) in environment variables, not in code.",
      "  4. Backing services — treat databases, caches and queues as attached resources you can swap by changing a URL.",
      "  5. Build, release, run — strictly separate building the artifact, combining it with config (release) and running it.",
      "  6. Processes — run the app as stateless processes; keep state in a database or cache, not in memory or local disk.",
      "  7. Port binding — the app serves HTTP by listening on a port itself (e.g. `PORT=3000`).",
      "  8. Concurrency — scale out by running more processes, not by making one huge process.",
      "  9. Disposability — start fast and shut down gracefully on SIGTERM (the polite stop signal).",
      "  10. Dev/prod parity — keep development, staging and production as similar as possible.",
      "  11. Logs — write logs to stdout as an event stream; let the platform collect them.",
      "  12. Admin processes — run one-off tasks (migrations) as separate processes using the same code and config.",
      "# How it works",
      "In practice with Node and Docker:",
      "  The same Docker image is built once and promoted from staging to production (factors 1, 5, 10).",
      "  Each environment injects different environment variables, e.g. a different `DATABASE_URL` (factors 3, 4).",
      "  Kubernetes runs several identical replicas behind a Service and kills/replaces them freely (factors 6, 8, 9).",
      "  Logs printed with `console.log` go to stdout and are shipped by the platform to a log system (factor 11).",
      "  `npm run migrate` runs as a one-off Job before the new version starts (factor 12).",
      "# Example walkthrough",
      "The `code` is a tiny Node server that follows several factors.",
      "It reads `PORT` and `DATABASE_URL` from `process.env` instead of hard-coding them (config factor).",
      "It listens on its own port (port binding) and logs to stdout with `console.log` (logs factor).",
      "It handles `SIGTERM` by closing the server, then exiting, so the platform can stop it gracefully (disposability).",
      "Running `PORT=4000 node server.js` prints `listening on 4000`.",
      "# Why it matters / when to use",
      "Twelve-factor apps fit perfectly into containers, Kubernetes and PaaS platforms (Heroku, Render, Cloud Run).",
      "They are easy to scale horizontally and to deploy repeatedly without surprises.",
      "Good checklist when reviewing a backend service for production readiness.",
      "# Common mistakes",
      "Committing `.env` files with real secrets to Git instead of injecting config at runtime.",
      "Storing sessions or uploaded files in process memory or local disk, which breaks when you run two replicas.",
      "Writing logs to local files inside the container, where they are lost and hard to search.",
      "# Say this in the interview",
      "The Twelve-Factor App is a methodology from Heroku for building portable, scalable cloud-native services. Key ideas are one codebase per app, explicit dependencies, config in environment variables, stateless processes with backing services as attached resources, strict build-release-run separation, fast startup and graceful shutdown, dev/prod parity, and logs as event streams to stdout. These map directly onto how containers and Kubernetes expect apps to behave.",
      "Follow-up: Why keep processes stateless?",
      "  So any replica can serve any request and instances can be added, removed or restarted without losing data.",
      "Follow-up: Is the methodology still relevant?",
      "  Yes; it was open-sourced and updated, and its ideas are baked into container platforms today.",
    ],
    code: `// server.js — a small twelve-factor style Node service (Node 22)
import http from 'node:http';

const port = Number(process.env.PORT ?? 3000);   // factor 3: config from env
const dbUrl = process.env.DATABASE_URL;           // factor 4: attached resource

const server = http.createServer((req, res) => {
  console.log(JSON.stringify({ method: req.method, url: req.url })); // factor 11: logs to stdout
  res.end('ok');
});

server.listen(port, () => {
  console.log(\`listening on \${port}\`);           // factor 7: port binding
});
// PORT=4000 node server.js  → listening on 4000

process.on('SIGTERM', () => {                     // factor 9: disposability
  console.log('SIGTERM received, closing');
  server.close(() => process.exit(0));            // finish in-flight requests, then exit
});`,
  },
  {
    id: 'pets-vs-cattle',
    group: 'DevOps & SDLC Concepts',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does "pets vs cattle" mean in infrastructure?',
    a: [
      "# ELI5",
      "A pet dog has a name, you know its habits, and if it gets sick you take it to the vet and nurse it back to health.",
      "A large farm's herd of cattle has numbers, not names; they are all treated the same, and the farm keeps running if one is replaced.",
      "Old-style servers were treated like pets; modern cloud servers are treated like cattle.",
      "In software: a 'pet' is a hand-built server you cannot lose; 'cattle' are identical instances created by automation and replaced freely.",
      "# What it is",
      "Pets — servers with unique names (e.g. `zeus`, `db-main-old`), set up and fixed by hand, often for years. If one breaks, people log in and repair it.",
      "Cattle — servers or containers created automatically from the same image or template, named with numbers or random IDs (e.g. `api-7d9f-x2k`). If one is unhealthy, you delete it and a new one replaces it.",
      "Comparison:",
      "  Creation — pets: manual setup. Cattle: automated (IaC, images, auto-scaling).",
      "  Identity — pets: unique and important. Cattle: interchangeable.",
      "  Failure handling — pets: repair in place. Cattle: replace automatically.",
      "  Scaling — pets: scale up (bigger machine). Cattle: scale out (more machines).",
      "The analogy, popularised by Bill Baker and Randy Bias around 2012, underpins cloud-native design.",
      "# How it works",
      "Treating servers as cattle requires:",
      "  An image or template so every instance starts identical (immutable infrastructure).",
      "  An auto-scaling group or orchestrator (Kubernetes) that keeps the desired number of instances running.",
      "  Health checks that detect a sick instance and trigger replacement.",
      "  Stateless apps, so losing an instance loses no data.",
      "Stateful systems such as databases are harder; they are handled with managed services (e.g. AWS RDS) or Kubernetes StatefulSets that give stable identity and storage.",
      "# Example walkthrough",
      "The `code` shows cattle-style handling in Kubernetes.",
      "`kubectl get pods` lists three replicas with random suffixes — no one cares which is which.",
      "`kubectl delete pod api-7d9f-x2k` kills one; the ReplicaSet immediately creates a new pod with a new name to keep three running.",
      "Contrast with the pet approach in the comments: SSH-ing into a named server to fix it by hand.",
      "# Why it matters / when to use",
      "Cattle-style infrastructure heals itself, scales automatically and is reproducible from code.",
      "It reduces 3 a.m. pages, because a failed instance is replaced without human action.",
      "Use it for stateless web/API tiers by default; give extra care (backups, replication) to the stateful parts.",
      "# Common mistakes",
      "Running containers but still SSH-ing in to fix them, turning cattle back into pets.",
      "Storing important data on an instance's local disk, so replacing it causes data loss.",
      "Assuming databases can be treated exactly like stateless cattle without backups and replication.",
      "# Say this in the interview",
      "Pets are hand-configured, uniquely named servers that you nurse back to health when they break; cattle are identical instances created by automation that you simply replace when unhealthy. Modern cloud and Kubernetes infrastructure treats servers as cattle using images, auto-scaling groups and health checks, which makes systems self-healing and easy to scale. Stateful systems like databases still need extra care, usually via managed services or StatefulSets.",
      "Follow-up: What enables treating servers as cattle?",
      "  Immutable images, Infrastructure as Code, health checks, orchestration and stateless application design.",
    ],
    code: `# Cattle: pods are numbered/random and replaced automatically
kubectl get pods -l app=api
# → api-7d9f-x2k   Running
# → api-7d9f-m8q   Running
# → api-7d9f-p4z   Running

kubectl delete pod api-7d9f-x2k        # "shoot" one sick instance
kubectl get pods -l app=api
# → api-7d9f-m8q   Running
# → api-7d9f-p4z   Running
# → api-7d9f-t6w   ContainerCreating   ← ReplicaSet made a fresh one

# Pet style (avoid): a named server fixed by hand
# ssh admin@zeus.prod.internal
# sudo systemctl restart myapp && sudo vim /etc/myapp.conf
#   → undocumented change, server becomes a one-off "snowflake"`,
  },
  {
    id: 'devops-vs-agile',
    group: 'DevOps & SDLC Concepts',
    stars: 1,
    difficulty: 'Easy',
    q: 'How does DevOps relate to Agile?',
    a: [
      "# ELI5",
      "Imagine writing a storybook. Agile is like writing one short chapter at a time and showing it to your friends for feedback before writing the next.",
      "But if the printing press takes three months to print each chapter, your friends still wait forever.",
      "DevOps is like getting a fast, automatic printing press, so each chapter reaches readers the same day.",
      "Agile helps you create small pieces; DevOps helps you deliver and run those pieces quickly.",
      "# What it is",
      "Agile — a way of developing software in short iterations (sprints, usually 1–2 weeks) with close collaboration between business people and developers, and frequent feedback.",
      "Agile frameworks include Scrum (sprints, stand-ups, retrospectives) and Kanban (a board of tasks flowing through columns).",
      "DevOps — extends that collaboration to operations, covering building, testing, deploying and running software in production.",
      "Comparison:",
      "  Focus — Agile: how we plan and build. DevOps: how we deliver and operate.",
      "  Collaboration — Agile: business + developers. DevOps: developers + operations (+ security).",
      "  Key practices — Agile: sprints, user stories, backlogs. DevOps: CI/CD, IaC, monitoring.",
      "  Feedback — Agile: from customers on features. DevOps: from production systems and users on every release.",
      "They are complementary, not competing: Agile produces small increments; DevOps ships them to production fast and safely.",
      "# How it works",
      "A combined flow:",
      "  The team plans a sprint and picks small user stories (Agile).",
      "  Each story is coded on a branch and merged through a CI pipeline (DevOps).",
      "  Merged code is deployed automatically, maybe behind a feature flag (DevOps).",
      "  Monitoring and user analytics give feedback that shapes the next sprint's backlog (both).",
      "# Example walkthrough",
      "The `code` shows a sprint story moving through a DevOps pipeline using Git commands.",
      "The branch name references the story ID from the Agile board (`STORY-142`).",
      "Pushing and merging triggers CI/CD, so the finished story reaches production the same day instead of waiting for a quarterly release.",
      "# Why it matters / when to use",
      "Without DevOps, Agile teams can finish features every two weeks that still wait months for a release window.",
      "Together they shorten the full idea-to-user cycle and improve feedback quality.",
      "# Common mistakes",
      "Doing 'Agile' sprints but releasing only quarterly — the speed gained in development is lost in delivery.",
      "Treating DevOps as only tools and Agile as only meetings; both are mainly about culture and feedback.",
      "# Say this in the interview",
      "Agile focuses on iterative development and collaboration between the business and developers, producing small working increments. DevOps extends that collaboration to operations and automates the path to production with CI/CD, infrastructure as code and monitoring. Agile makes small increments possible, and DevOps makes shipping and running those increments fast and safe, so they complement each other.",
      "Follow-up: Can you do DevOps without Agile?",
      "  Technically yes, but DevOps works best with small, frequent changes, which Agile naturally produces.",
    ],
    code: `# An Agile story flowing through a DevOps pipeline
git switch -c feature/STORY-142-reset-password   # story from the sprint board
# ...write code + tests...
git commit -am "STORY-142: add password reset endpoint"
git push -u origin feature/STORY-142-reset-password
# → CI runs lint + tests on the pull request automatically

# after review, merge to main
git switch main && git merge --no-ff feature/STORY-142-reset-password
git push origin main
# → CD pipeline deploys to production the same day
# → monitoring/analytics feed back into the next sprint planning`,
  },

  // ───────────────────────── Linux & Networking ─────────────────────────
  {
    id: 'url-request-flow',
    group: 'Linux & Networking',
    stars: 5,
    difficulty: 'Medium',
    q: 'What happens when you type a URL into the browser and press Enter?',
    a: [
      "# ELI5",
      "Imagine you want to visit your friend 'Sam' but you only know his name, not his address.",
      "First you look in your notebook; if he is not there you ask the town's information desk, which tells you his street address (that is DNS).",
      "You walk to his house, knock and agree on a secret handshake so nobody can eavesdrop (TCP + TLS).",
      "You ask, 'Can I see your drawing?', he hands it over, and you look at it piece by piece (HTTP request, response and rendering).",
      "# What it is",
      "A URL (Uniform Resource Locator) like `https://shop.example.com/cart` has a scheme (`https`), a host (`shop.example.com`) and a path (`/cart`).",
      "Computers find each other by IP address (e.g. `93.184.215.14`), not names, so the name must be translated first.",
      "The whole journey involves several protocols (agreed rules for communication):",
      "  DNS (Domain Name System) — the internet's phone book, mapping names to IP addresses.",
      "  TCP (Transmission Control Protocol) — sets up a reliable connection between two machines.",
      "  TLS (Transport Layer Security) — encrypts the connection; the 'S' in HTTPS.",
      "  HTTP (HyperText Transfer Protocol) — the request/response language of the web.",
      "# How it works",
      "Step 1 — DNS lookup:",
      "  The browser checks its own cache, then the OS cache and the hosts file.",
      "  If not found, it asks a recursive resolver (usually your ISP's or 1.1.1.1 / 8.8.8.8).",
      "  The resolver asks a root server, which points to the `.com` TLD (top-level domain) server, which points to the domain's authoritative name server, which returns the IP.",
      "  The answer is cached for its TTL (time to live — how many seconds it may be reused).",
      "Step 2 — TCP 3-way handshake to the IP on port 443: client sends SYN, server replies SYN-ACK, client sends ACK. Now a connection exists.",
      "  With HTTP/3, the browser uses QUIC over UDP instead, combining connection and encryption setup.",
      "Step 3 — TLS handshake: the server sends its certificate (a digital ID signed by a trusted certificate authority); the browser verifies it matches the domain; both sides agree on session keys for encryption.",
      "Step 4 — HTTP request: the browser sends something like `GET /cart` with headers (cookies, accepted formats).",
      "  On the way it usually hits a CDN (Content Delivery Network — servers near the user that cache content), then a load balancer, then a reverse proxy like Nginx, then the app server (e.g. Node).",
      "Step 5 — Response: the server returns a status code (200 OK), headers and a body (HTML).",
      "Step 6 — Rendering: the browser parses HTML into the DOM, downloads CSS, JS and images (more requests, often on the same connection), runs JavaScript, and paints pixels on screen.",
      "# Example walkthrough",
      "The `code` reproduces the steps from a terminal.",
      "`dig +short example.com` shows only the IP address that DNS returned.",
      "`curl -v https://example.com` prints the connection (`Connected to ... port 443`), the TLS handshake details, the request line `GET / HTTP/2`, and the response status `HTTP/2 200`.",
      "`curl -w` with timing variables shows how long DNS, TCP connect, TLS and the first byte each took — very useful for debugging slow sites.",
      "# Why it matters / when to use",
      "It is the classic interview question that tests whether you understand the whole web stack end to end.",
      "Debugging production issues needs this map: a DNS problem, a certificate error, a load balancer 502 and a slow app look very different.",
      "Performance work (CDNs, keep-alive connections, HTTP/2 and HTTP/3, DNS TTLs) targets specific steps.",
      "# Common mistakes",
      "Skipping DNS caching layers or the TLS handshake entirely in the answer.",
      "Forgetting that real traffic passes through CDNs, load balancers and proxies before reaching the app server.",
      "Mixing up the order — the TCP connection must exist before TLS, and TLS before any HTTP data is sent (over TCP).",
      "# Say this in the interview",
      "First the browser resolves the domain to an IP through DNS, checking browser and OS caches and then a recursive resolver that walks root, TLD and authoritative servers. It then opens a TCP connection with a three-way handshake on port 443, or QUIC over UDP for HTTP/3, and performs a TLS handshake to verify the certificate and agree on encryption keys. The HTTP request usually passes through a CDN, load balancer and reverse proxy to the app server, which returns a response, and the browser parses the HTML, fetches CSS, JavaScript and images, and renders the page.",
      "Follow-up: What is a TTL in DNS?",
      "  The number of seconds a DNS answer can be cached before it must be looked up again.",
      "Follow-up: Why is HTTP/3 faster on bad networks?",
      "  QUIC runs over UDP, combines connection and TLS setup into fewer round trips, and a lost packet does not block other streams.",
    ],
    code: `# 1. DNS: name → IP
dig +short example.com
# → 93.184.215.14

# 2-5. TCP connect, TLS handshake, HTTP request/response (verbose)
curl -v https://example.com -o /dev/null
# → *   Trying 93.184.215.14:443...
# → * Connected to example.com (93.184.215.14) port 443
# → * SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
# → * Server certificate: subject: CN=www.example.org ...
# → > GET / HTTP/2
# → < HTTP/2 200

# Timing of each step (seconds since start)
curl -s -o /dev/null https://example.com -w "dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} first_byte=%{time_starttransfer}\\n"
# → dns=0.012 tcp=0.031 tls=0.068 first_byte=0.112`,
  },
  {
    id: 'tcp-vs-udp',
    group: 'Linux & Networking',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between TCP and UDP?',
    a: [
      "# ELI5",
      "TCP is like sending a parcel by registered mail: the post office numbers each box, gets a signature for each one, and resends any box that gets lost.",
      "UDP is like shouting messages across a playground: very fast, no waiting for replies, but if someone misses a word, it is gone.",
      "Registered mail is reliable but slower; shouting is quick but might lose bits.",
      "In networking, TCP guarantees every byte arrives in order; UDP just fires packets and hopes for the best.",
      "# What it is",
      "Both are transport-layer protocols (layer 4 of the OSI model — the layer that moves data between programs on two machines, identified by ports).",
      "A port is a number (0–65535) that identifies which program on a machine should receive the data, e.g. 443 for HTTPS.",
      "TCP (Transmission Control Protocol) — connection-oriented and reliable.",
      "UDP (User Datagram Protocol) — connectionless and best-effort.",
      "Comparison:",
      "  Connection — TCP: 3-way handshake (SYN, SYN-ACK, ACK) before data. UDP: none, just send.",
      "  Reliability — TCP: acknowledgements and retransmission of lost packets. UDP: no guarantee a packet arrives.",
      "  Ordering — TCP: bytes delivered in order. UDP: packets (datagrams) can arrive out of order.",
      "  Flow and congestion control — TCP: slows down when the receiver or network is overloaded. UDP: none built in.",
      "  Overhead — TCP: bigger header (20+ bytes) and more round trips. UDP: tiny 8-byte header, lower latency.",
      "  Data model — TCP: continuous byte stream. UDP: separate messages (datagrams).",
      "Typical TCP uses: HTTP/1.1 and HTTP/2, SSH, database connections (Postgres 5432), SMTP email.",
      "Typical UDP uses: DNS queries, video and voice calls, online games, metrics (StatsD), and QUIC — the protocol under HTTP/3, which builds its own reliability on top of UDP.",
      "# How it works",
      "TCP:",
      "  Handshake establishes a connection and initial sequence numbers.",
      "  Each segment carries a sequence number; the receiver sends ACKs (acknowledgements).",
      "  Missing ACKs trigger retransmission; the receiver reorders segments before handing data to the app.",
      "  Connection closes with FIN/ACK exchanges.",
      "UDP:",
      "  The app hands a datagram to the OS, which sends it immediately with source and destination ports.",
      "  No ACK, no retry, no ordering — the application must handle loss itself if it cares.",
      "# Example walkthrough",
      "The `code` uses Node's built-in `node:dgram` (UDP) and `node:net` (TCP) modules.",
      "The UDP server binds port 41234; the client calls `send` with no connection setup, and the server logs `udp got: hello` — if the packet were lost, nobody would know.",
      "The TCP server listens on 41235; `net.connect` performs the handshake first, then `write` sends data on a reliable stream and the server logs `tcp got: hello`.",
      "# Why it matters / when to use",
      "Choose TCP when every byte must arrive correctly: web APIs, file transfers, payments, databases.",
      "Choose UDP when speed matters more than perfection, or when old data is useless (a late video frame is worse than a skipped one).",
      "Understanding this helps debug firewalls and load balancers (e.g. opening UDP 53 for DNS, or why an L4 load balancer must support UDP for game servers).",
      "# Common mistakes",
      "Saying UDP is 'unreliable so never used for anything important' — DNS and HTTP/3 rely on it.",
      "Thinking TCP preserves message boundaries; it is a byte stream, so apps must frame messages (e.g. newline or length prefix).",
      "Forgetting that firewalls and security groups have separate rules for TCP and UDP ports.",
      "# Say this in the interview",
      "TCP is connection-oriented: it does a three-way handshake and guarantees reliable, ordered delivery with acknowledgements, retransmission, flow control and congestion control. UDP is connectionless and best-effort, with no delivery or ordering guarantees, so it has less overhead and lower latency. TCP fits HTTP, SSH and databases, while UDP fits DNS, real-time voice and video, gaming and QUIC, which powers HTTP/3 by adding reliability on top of UDP.",
      "Follow-up: Why does DNS use UDP?",
      "  Queries are tiny and a single request/response; a lost query is simply retried. It falls back to TCP for large responses and zone transfers.",
      "Follow-up: Why did HTTP/3 move to UDP?",
      "  To avoid TCP head-of-line blocking and to combine transport and TLS handshakes for faster connections.",
    ],
    code: `// tcp-udp.mjs — run with: node tcp-udp.mjs   (Node 20+)
import dgram from 'node:dgram';
import net from 'node:net';

// UDP: no connection, just send a datagram
const udpServer = dgram.createSocket('udp4');
udpServer.on('message', (msg) => {
  console.log('udp got:', msg.toString());   // → udp got: hello
  udpServer.close();
});
udpServer.bind(41234, () => {
  const client = dgram.createSocket('udp4');
  client.send('hello', 41234, '127.0.0.1', () => client.close()); // fire and forget
});

// TCP: handshake first, then a reliable ordered stream
const tcpServer = net.createServer((socket) => {
  socket.on('data', (d) => {
    console.log('tcp got:', d.toString());   // → tcp got: hello
    socket.end();
    tcpServer.close();
  });
});
tcpServer.listen(41235, () => {
  const c = net.connect(41235, '127.0.0.1', () => c.write('hello')); // after SYN/SYN-ACK/ACK
});`,
  },
  {
    id: 'linux-high-cpu-troubleshooting',
    group: 'Linux & Networking',
    stars: 4,
    difficulty: 'Medium',
    q: 'A Linux server is slow / at high CPU. How do you troubleshoot?',
    a: [
      "# ELI5",
      "Imagine a restaurant kitchen is running slow. Before blaming the chef, you check: are too many orders coming in, is the fridge full, is the sink blocked, is the delivery door jammed?",
      "Then you find exactly which cook is struggling and watch what they are doing.",
      "Troubleshooting a slow server is the same: check CPU, memory, disk and network one by one, then zoom into the guilty process.",
      "The 'kitchen' is the server, the 'cooks' are processes, and the 'fridge, sink, door' are memory, disk and network.",
      "# What it is",
      "A methodical approach to find why a Linux machine is slow, rather than guessing or rebooting.",
      "Key terms:",
      "  Load average — average number of processes running or waiting to run (and, on Linux, waiting on disk) over 1, 5 and 15 minutes. Compare it to the number of CPU cores (`nproc`).",
      "  CPU time categories — `us` (user code), `sy` (kernel/system), `wa` (iowait — CPU idle while waiting for disk), `st` (steal — time taken by the hypervisor for other VMs).",
      "  Swap — disk space used as overflow memory; heavy swapping makes everything very slow.",
      "  OOM killer — the kernel's Out-Of-Memory killer, which kills a process when RAM runs out.",
      "A common framework is the USE method: for each resource, check Utilization, Saturation (queueing) and Errors.",
      "# How it works",
      "Step 1 — Overall load: `uptime` shows load averages; if load is much higher than core count, work is queuing.",
      "Step 2 — CPU hogs: `top` or `htop` (press P to sort by CPU), or `ps aux --sort=-%cpu | head`.",
      "  High `us` → application code is busy (hot loop, heavy computation, too much traffic).",
      "  High `sy` → lots of system calls or context switches.",
      "  High `wa` → the disk is the bottleneck, not the CPU.",
      "  High `st` → noisy neighbours on a shared VM; consider a bigger or dedicated instance.",
      "Step 3 — Memory: `free -h` for used/available memory and swap; `vmstat 1` shows `si`/`so` (swap in/out) each second.",
      "  Check OOM kills with `dmesg -T | grep -i oom` or `journalctl -k`.",
      "Step 4 — Disk I/O: `iostat -x 1` (look at `%util` and `await` latency) and `iotop` to see which process does the I/O.",
      "Step 5 — Network: `ss -tulpn` (listening sockets and owning processes), `ss -s` (connection counts), `iftop` for bandwidth.",
      "Step 6 — Drill into the guilty process:",
      "  Read its logs (`journalctl -u myapp`, container logs).",
      "  `strace -p <pid>` shows the system calls it is making right now.",
      "  `lsof -p <pid>` lists its open files and sockets.",
      "  Use language profilers: for Node, `node --cpu-prof` or `--inspect` with Chrome DevTools; for Java, thread dumps with `jstack`.",
      "Step 7 — Fix and prevent: fix the code, add capacity, add limits, and set alerts on CPU, memory and disk.",
      "# Example walkthrough",
      "The `code` is a triage session.",
      "`nproc` returns 4 cores; `uptime` shows a load of 7.9, meaning about twice as much work as the CPUs can handle.",
      "`ps aux --sort=-%cpu | head -5` reveals a `node` process at 380% CPU — nearly all 4 cores.",
      "`vmstat 1 3` shows `wa` near 0, so the disk is not the problem; it is pure CPU work.",
      "`top -H -p <pid>` shows threads inside that process, and a CPU profile then pinpoints the hot function.",
      "# Why it matters / when to use",
      "On-call engineers face this regularly; a calm, ordered approach shortens outages.",
      "It shows interviewers you can reason from symptoms to root cause instead of 'just restart it'.",
      "In containers and Kubernetes the same ideas apply via `kubectl top pod`, `docker stats` and cgroup limits.",
      "# Common mistakes",
      "Rebooting immediately and destroying the evidence; capture data first if the system is still usable.",
      "Blaming the CPU when the real issue is iowait or swapping caused by memory pressure.",
      "Ignoring CPU steal on cloud VMs or CPU throttling from container limits.",
      "# Say this in the interview",
      "I start broad and narrow down. I check load with uptime against the core count, then use top or ps sorted by CPU to find the top consumers, and look at the CPU breakdown to see whether it is user time, system time, iowait or steal. I check memory and swap with free and vmstat, OOM kills in dmesg, disk with iostat and iotop, and network with ss. Once I find the process, I dig in with its logs, strace, lsof and a profiler, then fix the root cause and add alerting.",
      "Follow-up: Load average is 8 on an 8-core box. Is that bad?",
      "  Not necessarily; it means the CPUs are roughly fully used. It is a problem if latency is high or load keeps rising above the core count.",
      "Follow-up: What does high iowait mean?",
      "  The CPU is idle waiting for disk I/O, so storage (or memory pressure causing swap) is the bottleneck.",
    ],
    code: `nproc
# → 4                                   (CPU cores)
uptime
# → 10:42:01 up 12 days, load average: 7.90, 6.80, 4.10   (≈2x the cores → queueing)

ps aux --sort=-%cpu | head -5
# → USER   PID   %CPU %MEM COMMAND
# → app    2314  380  12.1 node server.js         ← the hog

vmstat 1 3                              # us/sy/wa/st columns, si/so = swap
# → us 92  sy 6  id 1  wa 0  st 1      → pure CPU, not disk or swap

free -h                                 # memory + swap usage
dmesg -T | grep -i oom                  # any OOM kills?
iostat -x 1 3                           # disk %util and await
ss -s                                   # connection counts

top -H -p 2314                          # per-thread CPU in that process
node --cpu-prof server.js               # Node: writes a .cpuprofile to open in DevTools`,
  },
  {
    id: 'linux-file-permissions',
    group: 'Linux & Networking',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain Linux file permissions and chmod.',
    a: [
      "# ELI5",
      "Imagine a diary with three groups of people: you (the owner), your family (the group), and everyone else.",
      "For each group you decide three things: can they read it, can they write in it, and (for a game or recipe) can they 'run' it.",
      "So you might say: I can read and write, family can only read, strangers can do nothing.",
      "Linux permissions are exactly these three yes/no switches for three groups of people.",
      "# What it is",
      "Every file and directory has an owner (a user), a group, and a permission set.",
      "Three classes: `u` = user/owner, `g` = group, `o` = others (everyone else).",
      "Three permission bits per class:",
      "  `r` read = 4 — view file contents, or list a directory's names.",
      "  `w` write = 2 — modify the file, or create/delete/rename entries inside a directory.",
      "  `x` execute = 1 — run the file as a program, or enter (`cd` into) a directory.",
      "Add the numbers to get one digit per class: rwx = 4+2+1 = 7, r-x = 5, rw- = 6, r-- = 4.",
      "`ls -l` shows them as a 10-character string, e.g. `-rwxr-xr-x`: first char is the type (`-` file, `d` directory, `l` link), then three groups of rwx.",
      "`chmod` (change mode) changes permissions; `chown` (change owner) changes owner and group.",
      "Common values:",
      "  `755` — owner rwx, group and others r-x (scripts, directories).",
      "  `644` — owner rw, others read-only (normal files).",
      "  `600` — owner read/write only (SSH private keys, secrets).",
      "Special bits:",
      "  setuid (4xxx) — an executable runs with the file owner's privileges (e.g. `passwd`).",
      "  setgid (2xxx) — runs with the group's privileges; on directories, new files inherit the group.",
      "  sticky bit (1xxx) — on a directory, only a file's owner can delete it (`/tmp` is `1777`).",
      "# How it works",
      "When a process opens a file, the kernel checks:",
      "  If the process's user is the file owner, the owner bits apply.",
      "  Otherwise, if the user is in the file's group, the group bits apply.",
      "  Otherwise, the 'others' bits apply.",
      "  The root user bypasses most checks.",
      "To reach a file, you also need `x` on every directory in its path.",
      "New files get default permissions minus the umask (a mask of bits to remove, often `022`, giving 644 files and 755 directories).",
      "# Example walkthrough",
      "The `code` creates a script and inspects its permissions.",
      "Initially `ls -l` shows `-rw-r--r--` (644), so `./deploy.sh` fails with 'Permission denied' because nobody has `x`.",
      "`chmod u+x deploy.sh` adds execute for the owner only — the symbolic form — producing `-rwxr--r--`.",
      "`chmod 600 id_ed25519` makes the SSH key readable only by the owner; SSH refuses keys that others can read.",
      "`chown app:app` changes owner and group, and `stat -c '%a'` prints the numeric mode.",
      "# Why it matters / when to use",
      "Security: secrets, keys and config should not be readable by other users or compromised services.",
      "Containers: running as a non-root user means files copied into the image must be owned by or readable to that user.",
      "Deploy scripts, cron jobs and CI runners often fail with 'Permission denied' due to missing `x` or wrong ownership.",
      "# Common mistakes",
      "Using `chmod 777` to 'fix' an error — it makes the file writable by everyone and is a security hole.",
      "Forgetting directories need `x` to be entered, so a 644 directory cannot be used.",
      "Changing permissions but not ownership when an app runs as a different user.",
      "# Say this in the interview",
      "Linux permissions have three classes — owner, group and others — each with read, write and execute bits worth 4, 2 and 1. So chmod 755 gives the owner full access and everyone else read and execute, while 600 means only the owner can read and write, which is required for SSH keys. You can also use symbolic form like chmod u+x, change ownership with chown, and there are special bits like setuid, setgid and the sticky bit used on /tmp.",
      "Follow-up: What does execute mean on a directory?",
      "  Permission to enter it and access files inside by name; read only lets you list names.",
      "Follow-up: What is umask?",
      "  A mask of permission bits removed from new files by default; umask 022 yields 644 files and 755 directories.",
    ],
    code: `echo 'echo "deploying..."' > deploy.sh
ls -l deploy.sh
# → -rw-r--r-- 1 dev dev 22 Nov 10 10:00 deploy.sh   (644: no execute)

./deploy.sh
# → bash: ./deploy.sh: Permission denied

chmod u+x deploy.sh                 # symbolic: add execute for owner
ls -l deploy.sh
# → -rwxr--r-- 1 dev dev 22 ... deploy.sh            (744)
./deploy.sh
# → deploying...

chmod 755 deploy.sh                 # numeric: rwx r-x r-x
stat -c '%a %U:%G' deploy.sh
# → 755 dev:dev

chmod 600 ~/.ssh/id_ed25519         # private key: owner read/write only
sudo chown app:app /srv/app/config.json   # change owner and group
ls -ld /tmp
# → drwxrwxrwt ... /tmp              (1777: 't' = sticky bit)`,
  },
  {
    id: 'load-balancer-l4-vs-l7',
    group: 'Linux & Networking',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a load balancer? L4 vs L7?',
    a: [
      "# ELI5",
      "Picture a supermarket with ten checkout lanes and a helper at the entrance pointing each shopper to a free lane.",
      "If a lane's cashier goes on break, the helper stops sending people there.",
      "A simple helper only looks at how many people are in each lane (L4). A smart helper also looks inside your basket: 'only 5 items? express lane; buying medicine? pharmacy lane' (L7).",
      "The helper is the load balancer, the lanes are servers, and the basket is the HTTP request.",
      "# What it is",
      "A load balancer (LB) sits in front of several backend servers and spreads incoming traffic across them.",
      "Goals: scalability (handle more traffic by adding servers) and availability (if one server dies, others keep serving).",
      "Health checks — the LB regularly pings each backend (e.g. `GET /healthz`) and stops sending traffic to unhealthy ones.",
      "L4 and L7 refer to layers of the OSI model (a 7-layer model of networking): layer 4 is transport (TCP/UDP), layer 7 is application (HTTP).",
      "Comparison:",
      "  What it sees — L4: only IP addresses and ports. L7: full HTTP request — host, path, headers, cookies.",
      "  Routing — L4: forward the connection to a backend. L7: route `/api` to one service and `/images` to another, or by hostname.",
      "  Speed — L4: very fast, low overhead. L7: more CPU because it parses HTTP.",
      "  Protocols — L4: any TCP/UDP (databases, gRPC, games). L7: HTTP/HTTPS, gRPC, WebSockets.",
      "  Features — L4: basic. L7: TLS termination (decrypting HTTPS at the LB), sticky sessions, header rewriting, caching, auth, WAF (web application firewall).",
      "  Examples — L4: AWS NLB, HAProxy in TCP mode, Kubernetes Services via kube-proxy. L7: AWS ALB, Nginx, Envoy, Traefik.",
      "# How it works",
      "Request flow:",
      "  The client connects to the LB's public IP or DNS name.",
      "  The LB picks a healthy backend with an algorithm.",
      "  L4: it forwards the TCP connection (packets) as-is. L7: it terminates the connection, reads the HTTP request, then opens or reuses a connection to the chosen backend.",
      "  The backend responds through the LB back to the client.",
      "Common algorithms:",
      "  Round robin — take turns: server 1, 2, 3, 1, 2, 3...",
      "  Least connections — pick the server with the fewest active connections.",
      "  IP hash — the same client IP always goes to the same server.",
      "  Weighted — bigger servers get a larger share.",
      "Sticky sessions (session affinity) — the LB uses a cookie to keep a user on the same backend; better to avoid by keeping apps stateless.",
      "# Example walkthrough",
      "The `code` is an Nginx config acting as an L7 load balancer.",
      "`upstream api_servers` lists three backends; `least_conn` picks the least busy one.",
      "`max_fails=3 fail_timeout=30s` marks a backend as down after 3 failures for 30 seconds (passive health check).",
      "`location /api/` routes API paths to the pool, while `location /static/` serves files directly — routing by path is an L7 feature.",
      "The `stream` block at the bottom is Nginx in L4 mode, forwarding raw TCP on port 5432 to Postgres replicas without understanding the protocol.",
      "# Why it matters / when to use",
      "Every production web service sits behind at least one load balancer.",
      "Use L7 for HTTP APIs and websites needing path/host routing and TLS termination; use L4 for non-HTTP protocols or extreme performance.",
      "In Kubernetes, a Service is an L4 balancer; Ingress or Gateway API provides L7 routing.",
      "# Common mistakes",
      "No health checks (or checking only that the port is open), so traffic goes to broken backends.",
      "Relying on sticky sessions to hide in-memory state, which breaks when a backend dies.",
      "Forgetting the backend sees the LB's IP; use the `X-Forwarded-For` header (L7) or proxy protocol (L4) to get the real client IP.",
      "# Say this in the interview",
      "A load balancer distributes traffic across healthy backends for scalability and availability, using health checks to remove failing servers. An L4 load balancer works at the transport layer, routing by IP and port, so it is very fast and protocol-agnostic, like AWS NLB. An L7 load balancer understands HTTP, so it can route by host, path or headers, terminate TLS and do sticky sessions, like AWS ALB or Nginx. Common algorithms are round robin, least connections, IP hash and weighted.",
      "Follow-up: Where does TLS terminate with an L4 LB?",
      "  Usually on the backends, since the LB just passes encrypted bytes through (some L4 LBs like NLB can also terminate TLS).",
      "Follow-up: How does a backend know the client's real IP behind an L7 LB?",
      "  From the `X-Forwarded-For` header set by the load balancer.",
    ],
    code: `# /etc/nginx/nginx.conf — Nginx as an L7 (HTTP) load balancer
http {
  upstream api_servers {
    least_conn;                                   # pick the least busy backend
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.13:3000 weight=2;               # bigger box, double share
  }

  server {
    listen 80;
    location /api/ {                              # L7: route by path
      proxy_pass http://api_servers;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # real client IP
    }
    location /static/ { root /var/www; }          # served directly, no backend
  }
}

# L4 (TCP) mode: forwards raw bytes, knows nothing about the protocol
stream {
  upstream pg { server 10.0.2.21:5432; server 10.0.2.22:5432; }
  server { listen 5432; proxy_pass pg; }
}
# curl http://lb/api/users  → answered by 10.0.1.11, .12 or .13`,
  },
  {
    id: 'forward-vs-reverse-proxy',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Easy',
    q: 'Forward proxy vs reverse proxy?',
    a: [
      "# ELI5",
      "Forward proxy: you ask your older sibling to buy sweets for you; the shop sees your sibling, not you. The sibling works for the buyer.",
      "Reverse proxy: you phone a big company and a receptionist answers and passes you to the right department; you never learn the staff's direct numbers. The receptionist works for the company.",
      "Both are 'middle people', but they work for different sides.",
      "A forward proxy acts for clients; a reverse proxy acts for servers.",
      "# What it is",
      "A proxy is a server that sits between a client and another server and passes requests along.",
      "Forward proxy — sits in front of clients and makes requests to the internet on their behalf. The destination server sees the proxy's IP.",
      "  Uses: corporate egress control (filtering which sites employees can reach), caching, logging, anonymity, reaching the internet from private networks.",
      "  Examples: Squid, corporate web proxies, configured via `HTTP_PROXY` / `HTTPS_PROXY` env vars.",
      "Reverse proxy — sits in front of servers and receives requests from clients on their behalf. The client thinks the proxy is the server.",
      "  Uses: load balancing, TLS termination, caching, compression (gzip/brotli), rate limiting, hiding backend IPs, routing many apps behind one domain.",
      "  Examples: Nginx, HAProxy, Envoy, Traefik, Caddy, cloud load balancers, CDNs like Cloudflare.",
      "Comparison:",
      "  Who configures it — forward: the client side (browser or OS settings). Reverse: the server owner (DNS points to it).",
      "  Who is hidden — forward: the client. Reverse: the backend servers.",
      "  Who knows about it — forward: client knows; server usually does not. Reverse: server owner knows; client usually does not.",
      "# How it works",
      "Forward proxy flow:",
      "  The client is configured to send all requests to `proxy.corp:3128`.",
      "  The proxy checks rules (blocked sites, auth), then fetches the URL from the internet.",
      "  The proxy returns the response to the client and may cache it.",
      "Reverse proxy flow:",
      "  DNS for `api.example.com` points to the reverse proxy.",
      "  It accepts the client connection, terminates TLS, inspects the request and forwards it to an internal backend like `127.0.0.1:3000`.",
      "  It returns the backend's response, perhaps compressed or cached.",
      "# Example walkthrough",
      "The `code` first uses a forward proxy: `curl -x` (or the `HTTPS_PROXY` variable) sends the request through `proxy.corp:3128`, and the website sees the proxy's IP.",
      "The Nginx block is a reverse proxy: it listens on 443 with a certificate, then `proxy_pass` forwards to a Node app on `localhost:3000` that is not exposed publicly.",
      "`X-Forwarded-For` and `X-Forwarded-Proto` headers tell the Node app the real client IP and that the original request was HTTPS.",
      "# Why it matters / when to use",
      "Almost every Node/Python backend in production runs behind a reverse proxy rather than being exposed directly.",
      "Forward proxies appear in corporate networks and CI runners; tools like npm and Docker must be configured with proxy env vars there.",
      "# Common mistakes",
      "Mixing up the two terms in the interview — remember 'forward = for the client, reverse = for the server'.",
      "Not trusting proxy headers correctly in the app (e.g. Express `app.set('trust proxy', 1)`), so logs and rate limits see the proxy IP instead of the user.",
      "Exposing the backend port publicly as well, bypassing the reverse proxy's TLS and rate limits.",
      "# Say this in the interview",
      "A forward proxy sits in front of clients and makes requests on their behalf, which is used for corporate egress control, filtering, caching and anonymity. A reverse proxy sits in front of servers and receives requests on their behalf, like Nginx, HAProxy or Envoy, and is used for load balancing, TLS termination, caching, compression, rate limiting and hiding backends. The key difference is which side it represents: forward for clients, reverse for servers.",
      "Follow-up: Is a load balancer a reverse proxy?",
      "  An L7 load balancer is a kind of reverse proxy that focuses on distributing traffic across backends.",
    ],
    code: `# Forward proxy: the CLIENT routes its traffic through a proxy
curl -x http://proxy.corp:3128 https://api.ipify.org
# → 203.0.113.50        (the website sees the proxy's IP, not yours)
export HTTPS_PROXY=http://proxy.corp:3128   # npm, curl, docker pull respect this

# Reverse proxy: /etc/nginx/conf.d/api.conf — Nginx in FRONT of a Node app
server {
  listen 443 ssl;
  server_name api.example.com;
  ssl_certificate     /etc/ssl/api.crt;            # TLS terminates here
  ssl_certificate_key /etc/ssl/api.key;

  location / {
    proxy_pass http://127.0.0.1:3000;              # Node app, not public
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }
}
# curl https://api.example.com/health  → served by Node on :3000 via Nginx`,
  },
  {
    id: 'disk-full-troubleshooting',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Medium',
    q: 'The disk is full on a server. How do you investigate?',
    a: [
      "# ELI5",
      "Your bedroom cupboard is full and you cannot put anything else in. First you check which shelf is full, then which box on that shelf is the biggest.",
      "Sometimes the cupboard says 'full' even though the boxes look small, because you have thousands of tiny marbles taking every slot.",
      "Sometimes you threw a toy in the bin but your brother is still holding it, so it still takes space.",
      "Disk troubleshooting is finding the full 'shelf' (filesystem), the biggest 'box' (directory), the 'marbles' (inodes) and the 'held' items (deleted-but-open files).",
      "# What it is",
      "When a disk fills up, apps fail to write logs, databases crash, and deploys break with 'No space left on device'.",
      "Key terms:",
      "  Filesystem — a formatted disk or partition mounted at a path, e.g. `/` or `/var`.",
      "  Inode — a small record storing a file's metadata (owner, size, location). Each filesystem has a fixed number; millions of tiny files can exhaust inodes even with free space.",
      "  Deleted-but-open file — if a process still has a file open, deleting it removes the name but the space is not freed until the process closes it.",
      "Common culprits: huge log files, old Docker images and containers, build caches, core dumps, database WAL or temp files, backups left on the server.",
      "# How it works",
      "Step 1 — Find which filesystem is full: `df -h` (human-readable sizes).",
      "Step 2 — Check inodes: `df -i`; if IUse% is 100%, look for directories with huge numbers of small files (sessions, mail queues, cache).",
      "Step 3 — Find the big directories: `du -xsh /* 2>/dev/null | sort -h` then drill down level by level; `-x` stays on one filesystem. `ncdu` is a friendly interactive alternative.",
      "Step 4 — Find big files directly: `find / -xdev -type f -size +500M`.",
      "Step 5 — Check deleted-but-open files: `lsof +L1` lists open files with zero links; restart the process or truncate via `/proc/<pid>/fd/<n>`.",
      "Step 6 — Clean safely:",
      "  Truncate a huge active log with `truncate -s 0 file.log` (or `: > file.log`) instead of `rm`, so the writing process keeps a valid file.",
      "  `docker system prune` removes stopped containers, unused networks, dangling images and build cache; add `-a` to remove all unused images.",
      "  `journalctl --vacuum-size=500M` shrinks systemd journal logs.",
      "Step 7 — Fix the root cause: configure logrotate, Docker log size limits, retention policies, and alerts at e.g. 80% usage.",
      "# Example walkthrough",
      "The `code` walks through a real incident.",
      "`df -h` shows `/` at 100%; `df -i` shows inodes are fine (12%), so it is size, not file count.",
      "`du -xsh /var/* | sort -h` reveals `/var/lib/docker` at 38G and `/var/log` at 9G.",
      "`lsof +L1` finds a `node` process holding a deleted 6G log file — the space is not freed until it restarts.",
      "`docker system prune -af` and truncating the log bring usage back down.",
      "# Why it matters / when to use",
      "Disk-full outages are among the most common, and most preventable, production incidents.",
      "Knowing these commands lets you recover quickly without deleting the wrong data.",
      "# Common mistakes",
      "Running `rm` on a log file still being written, which does not free space; truncate instead or restart the process.",
      "Deleting random files under `/var/lib` (e.g. database files) in a panic.",
      "Fixing the symptom only, without adding log rotation and disk alerts, so it happens again next week.",
      "# Say this in the interview",
      "I run df -h to find which filesystem is full and df -i to rule out inode exhaustion. Then I use du with sort, or ncdu, to drill into the largest directories, which are usually logs, Docker images, core dumps or backups. I also check lsof +L1 for deleted files still held open by a process, since their space is not freed until the process restarts. After cleaning up safely, I fix the root cause with logrotate, Docker log limits, retention policies and disk usage alerts.",
      "Follow-up: df says the disk is full but du shows much less. Why?",
      "  Usually deleted-but-open files, or files hidden under a mount point; check `lsof +L1`.",
      "Follow-up: How do you stop Docker logs filling the disk?",
      "  Set the json-file log driver options `max-size` and `max-file`, or ship logs elsewhere.",
    ],
    code: `df -h /
# → Filesystem  Size  Used Avail Use% Mounted on
# → /dev/sda1    50G   50G     0 100% /

df -i /
# → /dev/sda1  3.2M  390K  2.8M  12% /        (inodes fine → it is file size)

sudo du -xsh /var/* 2>/dev/null | sort -h | tail -3
# → 2.1G  /var/cache
# → 9.0G  /var/log
# → 38G   /var/lib/docker

sudo lsof +L1 | grep deleted
# → node 2314 app 7w REG 8,1 6442450944 0 /var/log/app.log (deleted)
#   ↑ 6G still held open; restart the process to free it

docker system prune -af                 # remove unused images/containers/cache
# → Total reclaimed space: 31.4GB
sudo truncate -s 0 /var/log/app-debug.log   # empty a live log safely
sudo journalctl --vacuum-size=500M      # shrink systemd journal
df -h /
# → /dev/sda1    50G   12G   38G  24% /`,
  },
  {
    id: 'http-status-codes',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Easy',
    q: 'Explain the common HTTP status code classes.',
    a: [
      "# ELI5",
      "When you order at a restaurant, the waiter answers with a short code.",
      "'Here's your food' is a success (2xx). 'We moved, go to the other branch' is a redirect (3xx).",
      "'You ordered something not on the menu' is your mistake (4xx). 'The kitchen is on fire' is the restaurant's mistake (5xx).",
      "HTTP status codes are these 3-digit replies a server gives to every request, and the first digit tells you whose problem it is.",
      "# What it is",
      "Every HTTP response starts with a status code (a 3-digit number) telling the client what happened.",
      "1xx informational — rarely seen directly, e.g. `101 Switching Protocols` (upgrading to WebSocket), `103 Early Hints`.",
      "2xx success:",
      "  `200 OK` — normal success with a body.",
      "  `201 Created` — a new resource was created (typical for POST), often with a `Location` header.",
      "  `204 No Content` — success with no body (typical for DELETE).",
      "3xx redirection:",
      "  `301 Moved Permanently` / `308 Permanent Redirect` — the URL changed for good; search engines update links.",
      "  `302 Found` / `307 Temporary Redirect` — temporary move; 307/308 keep the original method (POST stays POST).",
      "  `304 Not Modified` — your cached copy is still valid (used with `ETag` / `If-None-Match`).",
      "4xx client errors (the request is wrong):",
      "  `400 Bad Request` — malformed input, validation failed.",
      "  `401 Unauthorized` — really means unauthenticated: no or invalid credentials.",
      "  `403 Forbidden` — authenticated but not allowed.",
      "  `404 Not Found`, `405 Method Not Allowed`, `409 Conflict` (e.g. duplicate), `422 Unprocessable Content` (semantically invalid data).",
      "  `429 Too Many Requests` — rate limited; often with a `Retry-After` header.",
      "5xx server errors (the server or something behind it failed):",
      "  `500 Internal Server Error` — unhandled exception in the app.",
      "  `502 Bad Gateway` — a proxy/LB got an invalid response or connection error from the upstream (backend).",
      "  `503 Service Unavailable` — overloaded, in maintenance, or no healthy backends.",
      "  `504 Gateway Timeout` — the proxy/LB waited too long for the backend.",
      "# How it works",
      "The client sends a request; the server (or a proxy in between) sets the status in the response's first line, e.g. `HTTP/1.1 404 Not Found`.",
      "Clients and tools react to the class: browsers follow 3xx redirects, caches use 304, retry logic usually retries 502/503/504 and 429 but not 4xx.",
      "Monitoring dashboards track the rate of 5xx responses as a key error signal.",
      "# Example walkthrough",
      "The `code` is a small Express-style handler in plain Node returning several statuses, then curl commands to see them.",
      "`curl -i` prints the status line and headers: creating a user gives `201 Created`, an unknown path gives `404`.",
      "The comment shows that if the Node process is down, the Nginx in front returns `502 Bad Gateway`, and if it is too slow, `504 Gateway Timeout`.",
      "# Why it matters / when to use",
      "Correct codes make APIs predictable for clients and monitoring.",
      "During incidents, 502/504 from a load balancer quickly tell you the backend is down, crashing or too slow, while 4xx spikes may point to a bad client release or an attack.",
      "# Common mistakes",
      "Returning `200 OK` with `{ error: ... }` in the body, which hides failures from monitoring and clients.",
      "Mixing up 401 and 403: 401 means 'who are you?', 403 means 'I know you, but no'.",
      "Using 500 for validation errors that should be 400 or 422.",
      "# Say this in the interview",
      "Status codes are grouped by the first digit: 2xx success like 200, 201 and 204; 3xx redirects like 301, 302, 307 and 304 Not Modified; 4xx client errors like 400, 401 unauthenticated, 403 forbidden, 404 and 429 rate limited; and 5xx server errors like 500, 502, 503 and 504. From an operations view, a 502 or 504 from a load balancer usually means the backend is down, crashing or too slow, so I would check the backend health and logs first.",
      "Follow-up: 502 vs 504?",
      "  502: the upstream returned an invalid response or refused/reset the connection. 504: the upstream did not answer within the proxy's timeout.",
      "Follow-up: Which errors should a client retry?",
      "  Usually 429 (after Retry-After), 502, 503 and 504, with backoff; not most 4xx errors.",
    ],
    code: `// status.mjs — node status.mjs   (Node 20+)
import http from 'node:http';

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/users') {
    res.writeHead(201, { Location: '/users/42' });     // created
    return res.end('{"id":42}');
  }
  if (req.url === '/old')  { res.writeHead(301, { Location: '/new' }); return res.end(); }
  if (req.url === '/admin') { res.writeHead(403); return res.end('forbidden'); }
  if (req.url === '/boom') { res.writeHead(500); return res.end('oops'); }
  res.writeHead(404);
  res.end('not found');
}).listen(3000);

// curl -i -X POST localhost:3000/users  → HTTP/1.1 201 Created
// curl -i localhost:3000/old            → HTTP/1.1 301 Moved Permanently
// curl -i localhost:3000/nope           → HTTP/1.1 404 Not Found
// With Nginx in front: app stopped      → 502 Bad Gateway
//                      app too slow     → 504 Gateway Timeout`,
  },
  {
    id: 'process-signals',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are SIGTERM, SIGKILL and SIGHUP?',
    a: [
      "# ELI5",
      "SIGTERM is like a teacher saying 'Class is over, please pack your bags' — you finish your sentence, pack up and leave.",
      "SIGKILL is like the fire alarm forcing everyone out instantly — no packing, no finishing.",
      "SIGHUP is like the teacher saying 'The timetable changed, please re-read it' — you stay, but reload your plans.",
      "In Linux, signals are short messages the operating system sends to a running program to tell it to stop, die or reload.",
      "# What it is",
      "A signal is a small, numbered notification the kernel delivers to a process (a running program). A process can 'catch' most signals with a handler function.",
      "Main signals:",
      "  SIGTERM (15) — polite termination request. The process can catch it, clean up and exit. Default for `kill <pid>`, `docker stop`, and Kubernetes when deleting a pod.",
      "  SIGKILL (9) — immediate kill by the kernel. Cannot be caught or ignored; no cleanup at all. Used by `kill -9` and after a grace period expires.",
      "  SIGINT (2) — interrupt, sent when you press Ctrl+C in a terminal.",
      "  SIGHUP (1) — 'hangup', originally when a terminal disconnected. Many daemons (nginx, etc.) reuse it to mean 'reload your config'.",
      "  Others: SIGQUIT (3, Ctrl+\\), SIGUSR1/SIGUSR2 (app-defined), SIGCHLD (a child process exited).",
      "Graceful shutdown — on SIGTERM, stop accepting new work, finish in-flight requests, close DB connections, then exit with code 0.",
      "Exit codes for killed processes are 128 + signal number: 137 = killed by SIGKILL (often OOM), 143 = terminated by SIGTERM.",
      "# How it works",
      "Stopping a container (`docker stop`) or Kubernetes pod:",
      "  The runtime sends SIGTERM to the container's main process (PID 1).",
      "  It waits a grace period — 10 seconds in Docker, `terminationGracePeriodSeconds` (default 30) in Kubernetes.",
      "  If the process is still running, it sends SIGKILL and the process dies instantly.",
      "In Kubernetes, the pod is removed from Service endpoints around the same time, so a well-behaved app should keep serving briefly, then drain.",
      "# Example walkthrough",
      "The `code` is a Node server with graceful shutdown.",
      "`process.on('SIGTERM', ...)` registers a handler; without it, Node exits immediately on SIGTERM, dropping in-flight requests.",
      "`server.close()` stops accepting new connections and calls back when existing ones finish; then we close the DB pool and `process.exit(0)`.",
      "A safety timer forces exit after 10 seconds so the process never hangs forever.",
      "The shell commands show `kill -TERM` printing the shutdown log, while `kill -9` kills it with no log at all.",
      "# Why it matters / when to use",
      "Zero-downtime deploys depend on graceful shutdown; otherwise every rollout cuts off users' requests.",
      "Understanding exit codes 137 and 143 is key to debugging crashed containers.",
      "Reloading config with SIGHUP (`nginx -s reload`) avoids dropping connections.",
      "# Common mistakes",
      "Using `kill -9` as the first option, which skips cleanup and can corrupt data or leave locks.",
      "Starting the app via a shell script or `npm start`, so the signal goes to the shell or npm and never reaches Node.",
      "Not handling SIGTERM, so Docker waits the full grace period and then SIGKILLs the app (slow, ungraceful stops).",
      "# Say this in the interview",
      "SIGTERM is a polite request to terminate that a process can catch to clean up; it is what kill, docker stop and Kubernetes send by default. SIGKILL is sent by the kernel and cannot be caught, so the process dies immediately without cleanup, which is what happens after the grace period runs out. SIGHUP originally meant terminal hangup, and daemons like nginx use it to reload configuration. Graceful shutdown means handling SIGTERM by stopping new work, draining in-flight requests and closing connections before exiting.",
      "Follow-up: What does exit code 137 mean?",
      "  128 + 9: the process was killed by SIGKILL, very often by the OOM killer or after a failed graceful stop.",
      "Follow-up: Can you catch SIGKILL?",
      "  No; SIGKILL and SIGSTOP cannot be caught, blocked or ignored.",
    ],
    code: `// graceful.mjs — node graceful.mjs
import http from 'node:http';

const server = http.createServer((req, res) => {
  setTimeout(() => res.end('done\\n'), 2000);      // simulate a 2s request
}).listen(3000, () => console.log('pid', process.pid));
// → pid 4242

process.on('SIGTERM', () => {
  console.log('SIGTERM: draining...');            // polite stop requested
  server.close(() => {                            // stop accepting, finish in-flight
    console.log('closed cleanly');                // (close DB pools etc. here)
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // safety net
});

// kill -TERM 4242  → SIGTERM: draining...  → closed cleanly   (exit code 0)
// kill -HUP  4242  → Node's default: exits (unless you add a handler to reload config)
// kill -9    4242  → (nothing printed; killed instantly, exit code 137)`,
  },
  {
    id: 'ssh-key-auth',
    group: 'Linux & Networking',
    stars: 2,
    difficulty: 'Easy',
    q: 'How does SSH key-based authentication work?',
    a: [
      "# ELI5",
      "Imagine you give your friend's house a special padlock, but you keep the only key that opens it.",
      "When you visit, your friend snaps a padlock on a box with a secret note inside; only your key can open it, so if you read the note back, they know it is really you.",
      "You never handed your key to anyone — you just proved you have it.",
      "With SSH keys, the server holds your 'padlock' (public key) and you keep the 'key' (private key).",
      "# What it is",
      "SSH (Secure Shell) is a protocol for securely logging into and running commands on remote machines, usually on port 22.",
      "Key-based authentication uses public-key cryptography (asymmetric crypto) — a pair of mathematically linked keys:",
      "  Private key — stays secret on your computer (e.g. `~/.ssh/id_ed25519`). Never share it.",
      "  Public key — safe to share (e.g. `~/.ssh/id_ed25519.pub`); placed on servers you want to access.",
      "Something signed with the private key can be verified with the public key, but the public key cannot be used to create signatures.",
      "The server lists allowed public keys in the user's `~/.ssh/authorized_keys` file.",
      "Ed25519 is the modern recommended key type (small, fast, secure); RSA 3072+ bits is the older alternative.",
      "# How it works",
      "Login flow:",
      "  The client connects; the server proves its own identity with its host key, which your client checks against `~/.ssh/known_hosts` (that is the 'authenticity of host' prompt the first time).",
      "  Client and server agree on an encrypted session using a key exchange.",
      "  The client says 'I want to log in as `deploy` with this public key'.",
      "  If the key is in `authorized_keys`, the server asks for proof; the client signs data unique to the session with its private key.",
      "  The server verifies the signature with the public key. Valid → you are logged in. The private key never leaves your machine.",
      "A passphrase can encrypt the private key on disk; `ssh-agent` keeps it unlocked in memory so you do not retype it.",
      "# Example walkthrough",
      "The `code` generates an Ed25519 key with a comment, copies the public half to the server with `ssh-copy-id`, then logs in with no password.",
      "`chmod 600` on the private key is required; with looser permissions SSH prints 'UNPROTECTED PRIVATE KEY FILE' and refuses the key.",
      "The `sshd_config` lines harden the server: no passwords, no direct root login.",
      "`~/.ssh/config` defines a shortcut host and a jump host (bastion) via `ProxyJump`.",
      "# Why it matters / when to use",
      "Passwords can be guessed or brute-forced; keys are effectively impossible to guess.",
      "CI/CD systems and Git hosting (GitHub deploy keys) use SSH keys for automated, passwordless access.",
      "Hardening practices: disable password and root login, use a bastion/jump host or AWS SSM Session Manager instead of exposing SSH publicly, rotate and remove old keys.",
      "# Common mistakes",
      "Sharing or committing the private key (e.g. into a Git repo or Docker image).",
      "Wrong permissions on `~/.ssh` (should be 700) or the key file (600), making SSH ignore it.",
      "Blindly accepting changed host key warnings, which could indicate a man-in-the-middle attack.",
      "# Say this in the interview",
      "You generate a key pair, for example with ssh-keygen -t ed25519, keep the private key on your machine and put the public key in the server user's authorized_keys file. When you connect, the server challenges the client, and the client proves it owns the private key by signing session data, without ever sending the key. For hardening, I disable password and root login, use a bastion or SSM instead of exposing port 22, and rotate keys. The private key must have 600 permissions or SSH will refuse to use it.",
      "Follow-up: What is known_hosts for?",
      "  It stores servers' host keys so your client can detect if a server's identity changes, protecting against man-in-the-middle attacks.",
    ],
    code: `# 1. Create a key pair (Ed25519 is the modern default)
ssh-keygen -t ed25519 -C "dev@laptop" -f ~/.ssh/id_ed25519
# → creates ~/.ssh/id_ed25519 (private) and ~/.ssh/id_ed25519.pub (public)
chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519

# 2. Put the PUBLIC key on the server (appends to ~/.ssh/authorized_keys)
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@10.0.1.20

# 3. Log in — no password asked
ssh deploy@10.0.1.20
# → deploy@web-1:~$

# Server hardening: /etc/ssh/sshd_config
#   PasswordAuthentication no
#   PermitRootLogin no
# sudo systemctl reload ssh

# ~/.ssh/config — reach a private server through a bastion host
# Host web-1
#   HostName 10.0.1.20
#   User deploy
#   ProxyJump bastion.example.com
# ssh web-1   → connects via the bastion automatically`,
  },
  {
    id: 'cidr-subnetting',
    group: 'Linux & Networking',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is CIDR notation and how do you compute subnet size?',
    a: [
      "# ELI5",
      "Think of a street address like '42 Maple Street'. The street name says which neighbourhood; the house number says which home.",
      "An IP address works the same: the first part names the network (street) and the rest names the device (house).",
      "CIDR's '/number' just tells you how many digits are the street name. Fewer street digits means more house numbers on that street.",
      "So `/16` is a long street with 65,536 houses, and `/24` is a short lane with 256 houses.",
      "# What it is",
      "An IPv4 address is 32 bits (binary digits), written as four numbers 0–255 separated by dots, e.g. `10.0.1.25`. Each number is 8 bits (an 'octet').",
      "CIDR (Classless Inter-Domain Routing) notation writes a network as `address/prefix`, e.g. `10.0.0.0/16`.",
      "The prefix length says how many leading bits are the network part; the remaining bits identify hosts (devices) inside it.",
      "Number of addresses = 2^(32 − prefix):",
      "  /8 → 2^24 = 16,777,216 addresses.",
      "  /16 → 2^16 = 65,536.",
      "  /24 → 2^8 = 256.",
      "  /28 → 2^4 = 16.",
      "  /32 → exactly 1 address (a single host).",
      "Each step of +1 in the prefix halves the size; −1 doubles it.",
      "Subnet mask is the older way to write the same thing: /24 = `255.255.255.0`, /16 = `255.255.0.0`.",
      "Private ranges (RFC 1918, not routable on the public internet): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.",
      "Usable hosts: in classic networks, the first address (network) and last (broadcast) are reserved, so /24 gives 254 usable. AWS reserves 5 per subnet, so a /24 gives 251.",
      "# How it works",
      "To check if an IP belongs to a subnet, compare the first 'prefix' bits:",
      "  `10.0.1.25` in `10.0.0.0/16`? The first 16 bits (`10.0`) match → yes.",
      "  `10.1.0.5` in `10.0.0.0/16`? The second octet differs → no.",
      "Splitting a network into subnets: a VPC (Virtual Private Cloud — your private network in the cloud) of `10.0.0.0/16` can be cut into 256 subnets of `/24`: `10.0.0.0/24`, `10.0.1.0/24`, ... `10.0.255.0/24`.",
      "Typical cloud layout: public subnets for load balancers, private subnets for apps and databases, spread across availability zones.",
      "# Example walkthrough",
      "The `code` uses Python's built-in `ipaddress` module from the shell to do the maths.",
      "`num_addresses` for `/16`, `/24` and `/28` prints 65536, 256 and 16, matching 2^(32 − prefix).",
      "The membership test prints `True` for `10.0.1.25` and `False` for `10.1.0.5`.",
      "`subnets(new_prefix=24)` splits the /16 into /24 blocks, and we print the first three.",
      "# Why it matters / when to use",
      "Designing VPCs, subnets, Kubernetes pod/service ranges and firewall rules all require CIDR.",
      "Overlapping CIDRs block VPC peering and VPN connections, so plan non-overlapping ranges across environments and accounts.",
      "Security groups and firewalls use CIDRs like `0.0.0.0/0` (anywhere) or `203.0.113.10/32` (one IP).",
      "# Common mistakes",
      "Choosing a tiny VPC (e.g. /24) and running out of IPs once Kubernetes assigns an IP to every pod.",
      "Reusing `10.0.0.0/16` in every environment, making later peering impossible.",
      "Opening a port to `0.0.0.0/0` when you meant a single office IP `/32`.",
      "# Say this in the interview",
      "CIDR notation like 10.0.0.0/16 means the first 16 bits are the network part and the remaining bits are for hosts. The number of addresses is 2 to the power of 32 minus the prefix, so a /16 has 65,536 addresses, a /24 has 256 and a /28 has 16. The private ranges are 10/8, 172.16/12 and 192.168/16. In AWS, five IPs per subnet are reserved, and I plan VPC ranges so they do not overlap, because overlap breaks peering and VPNs.",
      "Follow-up: How many /24 subnets fit in a /16?",
      "  2^(24 − 16) = 256.",
    ],
    code: `# CIDR maths with Python's standard library (works anywhere python3 exists)
python3 - <<'EOF'
import ipaddress as ip

for cidr in ["10.0.0.0/16", "10.0.1.0/24", "10.0.1.0/28"]:
    print(cidr, ip.ip_network(cidr).num_addresses)
# → 10.0.0.0/16 65536
# → 10.0.1.0/24 256
# → 10.0.1.0/28 16

vpc = ip.ip_network("10.0.0.0/16")
print(ip.ip_address("10.0.1.25") in vpc)   # → True
print(ip.ip_address("10.1.0.5") in vpc)    # → False
print(vpc.netmask)                         # → 255.255.0.0

subnets = list(vpc.subnets(new_prefix=24))
print(len(subnets), subnets[:3])
# → 256 [IPv4Network('10.0.0.0/24'), IPv4Network('10.0.1.0/24'), IPv4Network('10.0.2.0/24')]
EOF`,
  },
  {
    id: 'hard-vs-soft-link',
    group: 'Linux & Networking',
    stars: 2,
    difficulty: 'Easy',
    q: 'Hard link vs soft (symbolic) link?',
    a: [
      "# ELI5",
      "Imagine a toy box in your room. A hard link is like giving the same box a second name tag; both tags are glued directly to the box.",
      "Remove one tag and the box is still there, because the other tag still points to it.",
      "A soft link is like a sticky note on the wall saying 'the toys are in the box called Blue'. If someone throws away 'Blue', the note points to nothing.",
      "Hard link = another name for the same data; soft link = a shortcut that stores a path.",
      "# What it is",
      "In Linux, a file's data and metadata are stored in an inode (index node — a record with size, owner, permissions and where the data blocks are). A filename is just a directory entry pointing to an inode.",
      "Hard link — an additional directory entry pointing to the same inode. Both names are equal; neither is 'the original'.",
      "  The data is only deleted when the link count (number of names) drops to zero and no process has it open.",
      "  Cannot cross filesystems (inode numbers are per filesystem) and normally cannot point to directories.",
      "Soft link (symbolic link, symlink) — a small separate file whose content is a path to the target.",
      "  Can point to directories and to other filesystems.",
      "  If the target is moved or deleted, the symlink 'dangles' (is broken).",
      "Comparison:",
      "  Inode — hard: same inode as target. Soft: its own inode.",
      "  Survives deleting the target name — hard: yes. Soft: no, it breaks.",
      "  Directories — hard: no. Soft: yes.",
      "  Across filesystems — hard: no. Soft: yes.",
      "  Shown in `ls -l` — hard: looks like a normal file, link count > 1. Soft: `l` type with `link -> target`.",
      "# How it works",
      "`ln target linkname` creates a hard link; `ln -s target linkname` creates a symlink.",
      "Opening a symlink makes the kernel read the stored path and follow it to the real file.",
      "Opening a hard link goes directly to the inode — no extra step.",
      "`ls -i` shows inode numbers, so you can see hard links share one.",
      "# Example walkthrough",
      "The `code` creates `a.txt`, then a hard link `hard.txt` and a soft link `soft.txt`.",
      "`ls -li` shows `a.txt` and `hard.txt` with the same inode number (1234) and link count 2, while `soft.txt` has its own inode and an arrow.",
      "After `rm a.txt`, `cat hard.txt` still prints `hello` because the data still has one name.",
      "`cat soft.txt` fails with 'No such file or directory' because the path it stores no longer exists.",
      "# Why it matters / when to use",
      "Symlinks are everywhere in ops: `/etc/nginx/sites-enabled/` links to `sites-available/`, and release directories use a `current -> releases/2026-11-10` symlink for instant switching and rollback.",
      "Hard links are used by backup tools (e.g. rsync `--link-dest`) to store unchanged files once across many snapshots.",
      "# Common mistakes",
      "Using relative symlink targets and then moving the link, so the relative path no longer resolves.",
      "Expecting a hard link to work across disks or for a directory.",
      "Deleting what you think is 'just a link' with `rm -rf link/` (trailing slash) and deleting the target directory's contents.",
      "# Say this in the interview",
      "A hard link is another directory entry pointing to the same inode, so both names refer to the same data and it survives deleting the original name; hard links cannot cross filesystems or point to directories. A soft or symbolic link is a separate small file that stores a path to the target, created with ln -s; it can point to directories and other filesystems, but it breaks if the target is removed or moved.",
      "Follow-up: How do you find broken symlinks?",
      "  `find . -xtype l` lists symlinks whose targets do not exist.",
    ],
    code: `echo hello > a.txt
ln a.txt hard.txt          # hard link: same inode
ln -s a.txt soft.txt       # soft link: stores the path "a.txt"

ls -li
# → 1234 -rw-r--r-- 2 dev dev 6 a.txt                ← inode 1234, link count 2
# → 1234 -rw-r--r-- 2 dev dev 6 hard.txt             ← same inode
# → 5678 lrwxrwxrwx 1 dev dev 5 soft.txt -> a.txt     ← own inode, points to path

rm a.txt
cat hard.txt               # → hello          (data still has a name)
cat soft.txt               # → cat: soft.txt: No such file or directory  (dangling)

# Real-world: zero-downtime release switch with a symlink
ln -sfn /srv/app/releases/2026-11-10 /srv/app/current
readlink /srv/app/current  # → /srv/app/releases/2026-11-10`,
  },

  // ───────────────────────── Git & Version Control ─────────────────────────
  {
    id: 'merge-vs-rebase',
    group: 'Git & Version Control',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between git merge and git rebase?',
    a: [
      "# ELI5",
      "Two kids write a story together. One wrote chapters 4 and 5 at home while the other added chapter 4b at school.",
      "Merge: you staple both versions together and add a note 'combined here' — the true history of who wrote what, when, is kept.",
      "Rebase: you rewrite your chapters as if you had started after reading 4b, so the story reads in one neat straight line, but your pages are freshly rewritten copies.",
      "In Git, merge joins histories with a merge commit; rebase replays your commits on top of the other branch.",
      "# What it is",
      "A commit is a saved snapshot of the project with a unique ID (a SHA hash) and a pointer to its parent commit(s).",
      "A branch is just a movable label pointing to a commit.",
      "Both merge and rebase integrate changes from one branch into another, but they shape history differently.",
      "git merge:",
      "  Creates a new merge commit with two parents, tying the two histories together.",
      "  Preserves history exactly as it happened; existing commits are untouched.",
      "  If the target has no new commits, Git does a fast-forward (just moves the label), unless you pass `--no-ff`.",
      "git rebase:",
      "  Takes your branch's commits and re-applies them one by one on top of another branch's latest commit.",
      "  Produces new commits with new SHAs (because their parent changed) — history is rewritten into a straight line.",
      "Comparison:",
      "  History shape — merge: branchy, true record. Rebase: linear, cleaner to read.",
      "  Commit IDs — merge: unchanged. Rebase: rewritten.",
      "  Conflicts — merge: resolved once in the merge commit. Rebase: may be resolved per replayed commit.",
      "  Safety on shared branches — merge: safe. Rebase: dangerous if others already have those commits.",
      "Golden rule: never rebase commits that are already pushed and shared with others — they will have the old SHAs and histories diverge.",
      "Interactive rebase (`git rebase -i HEAD~3`) lets you squash (combine), reorder, reword or drop commits before sharing.",
      "# How it works",
      "Merge `feature` into `main`:",
      "  Git finds the common ancestor (merge base) of both branches.",
      "  It combines changes from both sides since that ancestor (a 3-way merge).",
      "  It creates a merge commit on `main` with parents = old main tip and feature tip.",
      "Rebase `feature` onto `main`:",
      "  Git finds commits on feature that are not on main.",
      "  It temporarily removes them, moves feature to main's tip, then re-applies each commit as a new commit.",
      "  If a commit conflicts, Git pauses; you fix files, `git add`, then `git rebase --continue`.",
      "# Example walkthrough",
      "The `code` starts with main having commit C and feature having commits D and E, both branching from B.",
      "`git merge feature` on main creates merge commit M with parents C and E; `git log --graph` shows a fork and join.",
      "Alternatively, `git rebase main` on feature rewrites D and E into D' and E' on top of C, giving a straight line A-B-C-D'-E'.",
      "After rebasing, merging into main is a simple fast-forward.",
      "If feature had already been pushed, you would need `git push --force-with-lease`, which is why rebasing shared branches is risky.",
      "# Why it matters / when to use",
      "Common team flow: rebase your local feature branch on main to stay current and keep a clean history, then merge (or squash-merge) via a pull request.",
      "Use merge for integrating shared or long-lived branches where true history matters.",
      "Clean, linear history makes `git log`, `git bisect` and code review easier.",
      "# Common mistakes",
      "Rebasing a shared branch and force-pushing, overwriting teammates' work.",
      "Using `git push --force` instead of `--force-with-lease`, which refuses to overwrite if the remote changed unexpectedly.",
      "Panicking in the middle of a conflicted rebase; `git rebase --abort` returns to the starting state.",
      "# Say this in the interview",
      "Merge integrates two branches by creating a merge commit, preserving the full history exactly as it happened. Rebase replays my commits on top of another branch, giving them new hashes and producing a linear history. The golden rule is never to rebase commits that others already have. My usual flow is to rebase my local feature branch onto main to stay up to date and tidy commits with interactive rebase, then merge or squash-merge through a pull request.",
      "Follow-up: What is a squash merge?",
      "  All commits of a PR are combined into one commit on main — linear and tidy, but individual commit history is lost.",
      "Follow-up: How do you recover from a bad rebase?",
      "  Use `git reflog` to find the commit before the rebase and `git reset --hard <sha>` to go back.",
    ],
    code: `# Starting point:
#   main:     A---B---C
#                  \\
#   feature:        D---E

# Option 1: MERGE (keeps true history)
git switch main
git merge --no-ff feature -m "Merge feature"
git log --oneline --graph
# → *   M Merge feature
# → |\\
# → | * E
# → | * D
# → * | C
# → |/
# → * B

# Option 2: REBASE (rewrite feature on top of main, then fast-forward)
git switch feature
git rebase main                 # D,E replayed as D',E' (new SHAs)
git switch main && git merge feature   # fast-forward, no merge commit
git log --oneline
# → E' / D' / C / B / A         (straight line)

# If feature was already pushed, rebasing requires a force push:
git push --force-with-lease     # safer than --force`,
  },
  {
    id: 'branching-strategies',
    group: 'Git & Version Control',
    stars: 4,
    difficulty: 'Medium',
    q: 'Compare Git branching strategies: GitFlow, GitHub Flow, trunk-based.',
    a: [
      "# ELI5",
      "Imagine a class writing a shared book.",
      "GitFlow: there is a 'final book', a 'draft book', and separate notebooks for each chapter, plus a special notebook for each printing — very organised but lots of copying.",
      "GitHub Flow: there is one book that is always ready to print; you write a chapter in your notebook, the teacher checks it, and it goes straight into the book.",
      "Trunk-based: everyone writes directly into the one book every day in tiny pieces, hiding unfinished chapters behind a 'coming soon' sticker.",
      "These are three ways to organise Git branches so a team can work together without chaos.",
      "# What it is",
      "A branching strategy is a team agreement about which branches exist, how long they live, and how code flows to production.",
      "GitFlow:",
      "  Long-lived `main` (released code) and `develop` (integration of upcoming work).",
      "  Short-lived `feature/*` from develop, `release/*` branches to stabilise a version, and `hotfix/*` from main for urgent fixes.",
      "  Suits software with versioned, scheduled releases (desktop apps, libraries, mobile apps); heavy process and long-lived branches cause merge pain.",
      "GitHub Flow:",
      "  Only `main`, which is always deployable.",
      "  Create a short-lived feature branch, open a pull request, get review and CI checks, merge, then deploy.",
      "  Simple and great for web apps and SaaS with continuous deployment.",
      "Trunk-based development:",
      "  Everyone integrates into the trunk (`main`) at least once a day, either directly or with very short-lived branches (hours to a day or two).",
      "  Unfinished features are hidden with feature flags (config switches that turn code paths on or off at runtime).",
      "  Releases are cut from trunk, sometimes with release branches for hotfixes only.",
      "  Strongly supports CI/CD; DORA research associates it with high-performing teams.",
      "Comparison:",
      "  Long-lived branches — GitFlow: main + develop + release. GitHub Flow: main only. Trunk-based: main only.",
      "  Branch lifetime — GitFlow: days to weeks. GitHub Flow: days. Trunk-based: hours to a day.",
      "  Release style — GitFlow: scheduled versions. GitHub Flow and Trunk-based: continuous.",
      "  Merge conflicts — GitFlow: frequent and large. Trunk-based: small and rare.",
      "  Needs — GitFlow: process discipline. Trunk-based: strong automated tests and feature flags.",
      "# How it works",
      "GitHub Flow / trunk-based day:",
      "  `git switch -c feat/search` from up-to-date main.",
      "  Make a small change, push, open a PR; CI runs tests.",
      "  Reviewer approves; PR is merged (often squash-merged) into main.",
      "  CD deploys main automatically; the feature stays off behind a flag until ready.",
      "GitFlow release:",
      "  Features merge into develop; a `release/1.4` branch is cut for testing and bug fixes.",
      "  Release is merged into main and tagged `v1.4.0`, then merged back into develop.",
      "# Example walkthrough",
      "The `code` shows both flows side by side.",
      "In GitFlow, `develop` and a `release/1.4` branch exist, and the release is tagged after merging to main.",
      "In trunk-based, the feature branch lives briefly, merges into main the same day, and the code checks a feature flag (`if (flags.newSearch)`) so users do not see half-done work.",
      "# Why it matters / when to use",
      "Choose GitFlow only if you truly ship numbered versions on a schedule and support several at once.",
      "Choose GitHub Flow or trunk-based for web services with CI/CD — most modern backend teams.",
      "Your strategy directly affects lead time, merge pain and how easily you can deploy many times a day.",
      "# Common mistakes",
      "Using GitFlow for a web app that deploys daily, adding pointless overhead.",
      "Calling it trunk-based but keeping feature branches open for weeks.",
      "Doing trunk-based without good automated tests or feature flags, so main breaks often.",
      "# Say this in the interview",
      "GitFlow uses long-lived main and develop branches plus feature, release and hotfix branches; it suits versioned scheduled releases but adds heavy process. GitHub Flow keeps main always deployable, with short-lived feature branches merged through pull requests and deployed after merge. Trunk-based development has everyone integrating into trunk at least daily with tiny branches and feature flags hiding unfinished work; it best supports CI/CD and is what DORA research links to high performers.",
      "Follow-up: What are feature flags?",
      "  Runtime switches that enable or disable code paths, letting you deploy incomplete or risky code safely and roll it out gradually.",
    ],
    code: `# ── GitFlow ──────────────────────────────────────────────
git switch develop
git switch -c feature/invoices          # feature from develop
# ...work, PR into develop...
git switch -c release/1.4 develop       # stabilise a version
git switch main && git merge --no-ff release/1.4
git tag v1.4.0                          # → tagged release
git switch develop && git merge --no-ff release/1.4   # bring fixes back

# ── Trunk-based / GitHub Flow ───────────────────────────
git switch main && git pull
git switch -c feat/new-search           # lives hours, not weeks
git commit -am "Add new search behind flag"
git push -u origin feat/new-search      # PR → CI → squash-merge same day
# → main auto-deploys; feature hidden until the flag is turned on

# In the code (TypeScript):
#   if (flags.newSearch) { return newSearch(q); }
#   return oldSearch(q);`,
  },
  {
    id: 'git-reset-vs-revert',
    group: 'Git & Version Control',
    stars: 4,
    difficulty: 'Medium',
    q: 'git reset vs git revert?',
    a: [
      "# ELI5",
      "You wrote a wrong sentence in your diary.",
      "Revert is like writing a new line underneath: 'Ignore the previous sentence.' Everyone reading the diary sees both and nothing is torn out.",
      "Reset is like tearing out the last pages and pretending they were never written. Fine for your private notebook, but terrible if friends already copied those pages.",
      "In Git, revert adds an 'undo commit'; reset moves the branch back in time, rewriting history.",
      "# What it is",
      "HEAD — Git's pointer to the commit you are currently on (usually via your current branch).",
      "Staging area (index) — the list of changes prepared for the next commit (`git add` puts changes there).",
      "Working directory — the actual files on disk.",
      "git revert <sha>:",
      "  Creates a NEW commit that applies the exact opposite of the given commit's changes.",
      "  History is preserved and only grows, so it is safe for shared, pushed branches like main.",
      "git reset <target>:",
      "  Moves the current branch pointer back to an older commit, so later commits disappear from the branch (rewriting history).",
      "  Three modes for what happens to the changes from the removed commits:",
      "  `--soft` — keep them staged (ready to re-commit). Great for squashing your last few commits.",
      "  `--mixed` (default) — keep them in your files but unstaged.",
      "  `--hard` — throw them away entirely; files are reset to the target commit. Dangerous.",
      "  Use only on local, unpushed commits.",
      "Comparison:",
      "  History — revert: adds a commit. Reset: removes commits from the branch.",
      "  Safe after push — revert: yes. Reset: no (needs force push, breaks others).",
      "  Typical use — revert: undo a bad change in production. Reset: clean up local work.",
      "Recovery: `git reflog` records where HEAD has been, so even after `reset --hard` you can find and restore the lost commit (until garbage collection, typically 30–90 days).",
      "# How it works",
      "Revert:",
      "  Git computes the diff of the target commit and applies its inverse.",
      "  If later commits touched the same lines, you may need to resolve conflicts.",
      "  You commit the result (Git pre-fills the message 'Revert ...').",
      "  Reverting a merge commit needs `-m 1` to say which parent is the mainline.",
      "Reset:",
      "  Git moves the branch label to the target commit.",
      "  Depending on the mode, it updates the staging area and working files to match.",
      "# Example walkthrough",
      "The `code` has history A, B (bug), C on main, already pushed.",
      "`git revert <B>` adds a new commit 'Revert B'; `git log` shows A, B, C, Revert-B — safe to push normally.",
      "In a local-only scenario, `git reset --soft HEAD~2` moves back two commits but keeps their changes staged, so one `git commit` squashes them.",
      "`git reset --hard HEAD~1` deletes the last commit and its changes; `git reflog` then shows the old SHA, and `git reset --hard <sha>` restores it.",
      "# Why it matters / when to use",
      "Production incidents: reverting the bad commit on main and redeploying is the standard, safe rollback.",
      "Local cleanup before opening a PR: reset (soft/mixed) or interactive rebase to tidy commits.",
      "Knowing reflog saves you from 'I lost my work' panic.",
      "# Common mistakes",
      "Using `git reset --hard` on main after pushing and force-pushing, erasing teammates' commits.",
      "Running `reset --hard` with uncommitted changes you wanted to keep — those were never committed, so reflog cannot save them.",
      "Confusing `git revert` with `git restore`/`git checkout -- file`, which discard uncommitted file changes.",
      "# Say this in the interview",
      "git revert creates a new commit that undoes a previous commit, so history is preserved and it is safe for shared, pushed branches. git reset moves the branch pointer back, rewriting history, so I only use it on local unpushed commits. Reset has three modes: soft keeps the changes staged, mixed keeps them unstaged, and hard discards them. If I lose something after a hard reset, git reflog shows previous HEAD positions so I can recover it.",
      "Follow-up: How do you undo a pushed merge commit?",
      "  `git revert -m 1 <merge-sha>` creates a commit that undoes the merge, keeping parent 1 (the mainline).",
    ],
    code: `# History on main (already pushed):  A -- B(bug) -- C
git revert 4b2e9c1                  # 4b2e9c1 = B
# → [main 9f1d3aa] Revert "B: add buggy discount logic"
git log --oneline
# → 9f1d3aa Revert "B: add buggy discount logic"
# → 7c0aa11 C
# → 4b2e9c1 B: add buggy discount logic
# → 1a2b3c4 A
git push                            # safe: history only grew

# Local-only cleanup: squash last 2 commits into one
git reset --soft HEAD~2             # changes stay staged
git commit -m "Add search endpoint"

# Throw away the last local commit entirely
git reset --hard HEAD~1             # commit + changes gone from branch
git reflog
# → 3e4f5a6 HEAD@{0}: reset: moving to HEAD~1
# → 8d7c6b5 HEAD@{1}: commit: WIP experiment
git reset --hard 8d7c6b5            # → recovered!`,
  },
  {
    id: 'git-fetch-vs-pull',
    group: 'Git & Version Control',
    stars: 3,
    difficulty: 'Easy',
    q: 'git fetch vs git pull?',
    a: [
      "# ELI5",
      "Fetch is like checking your mailbox and bringing the letters inside, but leaving them unopened on the table.",
      "Pull is like bringing the letters in AND immediately opening them and mixing them into your notes.",
      "Fetching is always safe; pulling changes what you are working on.",
      "In Git, fetch downloads new commits; pull downloads and integrates them into your current branch.",
      "# What it is",
      "Remote — a copy of the repository on another server, usually called `origin` (e.g. on GitHub).",
      "Remote-tracking branch — your local read-only copy of a remote branch's position, e.g. `origin/main`. It updates only when you fetch.",
      "git fetch:",
      "  Downloads new commits, branches and tags from the remote.",
      "  Updates remote-tracking branches like `origin/main`.",
      "  Does NOT change your local branches or your working files. Always safe.",
      "git pull:",
      "  Runs `git fetch` and then integrates `origin/<branch>` into your current branch.",
      "  By default it merges (possibly creating a merge commit); with `--rebase` (or config `pull.rebase=true`) it rebases your local commits on top instead.",
      "  Recent Git versions require you to choose a strategy if branches have diverged; `--ff-only` refuses anything but a fast-forward.",
      "Comparison:",
      "  Network download — both: yes.",
      "  Changes your branch — fetch: no. Pull: yes.",
      "  Can cause conflicts — fetch: never. Pull: yes.",
      "  Use when — fetch: you want to inspect first. Pull: you want to update now.",
      "# How it works",
      "Fetch then inspect then integrate:",
      "  `git fetch origin` updates `origin/main`.",
      "  `git log main..origin/main` lists commits on the remote you do not have yet.",
      "  `git diff main origin/main` shows what changed.",
      "  `git merge origin/main` or `git rebase origin/main` integrates when you are ready.",
      "Pull does those last steps automatically in one command.",
      "# Example walkthrough",
      "The `code` fetches, inspects incoming commits, and then integrates with a rebase.",
      "`git status` after fetch says 'Your branch is behind origin/main by 2 commits' — you know without changing anything.",
      "`git pull --rebase` replays your local unpushed commit on top of the two new ones, avoiding a noisy merge commit.",
      "Setting `git config --global pull.rebase true` makes that the default.",
      "# Why it matters / when to use",
      "Use fetch in CI scripts and before risky operations to see what is coming.",
      "Use pull (often with rebase) to keep your local branch up to date during daily work.",
      "# Common mistakes",
      "Pulling into a branch with uncommitted changes and getting confusing conflicts; commit or stash first.",
      "Creating lots of useless 'Merge branch main of origin' commits by default merge pulls.",
      "Thinking `origin/main` is live — it is only as fresh as your last fetch.",
      "# Say this in the interview",
      "git fetch downloads new commits from the remote and updates remote-tracking branches like origin/main without touching my local branches or working files, so it is always safe. git pull is a fetch followed by a merge, or a rebase if I use --rebase or set pull.rebase, into my current branch. I fetch first when I want to inspect incoming changes before integrating them.",
      "Follow-up: What does `git pull --ff-only` do?",
      "  Only updates if a fast-forward is possible; otherwise it fails instead of creating a merge.",
    ],
    code: `git fetch origin                    # download only; your files untouched
git status
# → Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.

git log --oneline main..origin/main # what is coming in?
# → a91c2d3 Fix login redirect
# → 6e5f4b2 Bump express to 5.1.0
git diff --stat main origin/main
# → src/auth.ts | 4 ++--   package.json | 2 +-

git pull --rebase origin main       # = fetch + rebase my local commits on top
# → Successfully rebased and updated refs/heads/main.

git config --global pull.rebase true   # make rebase the default for pull
git pull --ff-only                  # or: only fast-forward, fail otherwise`,
  },
  {
    id: 'resolve-merge-conflict',
    group: 'Git & Version Control',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you resolve a merge conflict?',
    a: [
      "# ELI5",
      "Two friends edit the same sentence in a shared story: one writes 'the cat was black', the other 'the cat was ginger'.",
      "The computer cannot know which one is right, so it shows both versions side by side and asks a human to decide.",
      "You pick one, or write a new combined sentence, and then tell the computer 'done'.",
      "That is a merge conflict: Git asking you to choose when two branches changed the same lines.",
      "# What it is",
      "A merge conflict happens when Git cannot automatically combine changes, usually because both branches changed the same lines of a file, or one branch deleted a file the other modified.",
      "Git pauses the merge (or rebase, cherry-pick, stash pop) and marks the conflicting parts in the file with conflict markers:",
      "  `<<<<<<< HEAD` — start of your current branch's version.",
      "  `=======` — separator.",
      "  `>>>>>>> feature` — end of the incoming branch's version.",
      "Files with conflicts are listed as 'both modified' in `git status`.",
      "A 3-way merge view shows the base (common ancestor), yours and theirs; setting `merge.conflictStyle zdiff3` adds the base to the markers, which makes decisions easier.",
      "# How it works",
      "Steps to resolve:",
      "  Run `git status` to see which files are conflicted.",
      "  Open each file (or use your IDE's merge editor) and decide the correct final content — keep yours, theirs, or combine them.",
      "  Delete all the conflict marker lines.",
      "  Run tests or at least build, to make sure the combined code works.",
      "  `git add <file>` marks it as resolved.",
      "  Finish with `git commit` (for a merge) or `git rebase --continue` (for a rebase).",
      "To give up and go back to before the operation: `git merge --abort` or `git rebase --abort`.",
      "For whole-file choices: `git checkout --ours file` or `git checkout --theirs file` (note that during a rebase 'ours' and 'theirs' are swapped).",
      "# Example walkthrough",
      "The `code` merges a feature branch that changed the same line in `config.js` as main.",
      "Git prints 'CONFLICT (content): Merge conflict in config.js'.",
      "The file shows main's `timeout: 5000` and feature's `timeout: 10000` between markers.",
      "We edit it to the intended `timeout: 8000`, remove the markers, `git add`, and `git commit` to finish the merge.",
      "# Why it matters / when to use",
      "Conflicts are a daily reality in team work; resolving them carefully avoids silently losing a teammate's change.",
      "Prevention: small PRs, frequent syncing with main (trunk-based), clear code ownership, and auto-formatters so whitespace does not cause conflicts.",
      "# Common mistakes",
      "Committing files that still contain `<<<<<<<` markers; search for them or use a pre-commit check.",
      "Blindly choosing 'ours' or 'theirs' for everything, discarding needed changes.",
      "Not running tests after resolving — the merged code can compile but still be logically wrong.",
      "# Say this in the interview",
      "Conflicts happen when both branches change the same lines, and Git marks them with <<<<<<<, ======= and >>>>>>> markers. I use git status to list conflicted files, edit each one to the intended result in a 3-way merge view, remove the markers, run the tests, git add the files, and then commit or continue the rebase. If needed I can abort with git merge --abort or git rebase --abort. To prevent conflicts, I keep PRs small and sync with main frequently.",
      "Follow-up: During a rebase, what do 'ours' and 'theirs' mean?",
      "  They are swapped: 'ours' is the branch you are rebasing onto, 'theirs' is your commit being replayed.",
    ],
    code: `git switch main
git merge feature/timeouts
# → Auto-merging config.js
# → CONFLICT (content): Merge conflict in config.js
# → Automatic merge failed; fix conflicts and then commit the result.

git status
# → both modified:   config.js

cat config.js
# → module.exports = {
# → <<<<<<< HEAD
# →   timeout: 5000,
# → =======
# →   timeout: 10000,
# → >>>>>>> feature/timeouts
# → };

# Edit the file to the intended result (markers removed):
printf 'module.exports = {\\n  timeout: 8000,\\n};\\n' > config.js
npm test                           # make sure it still works
git add config.js                  # mark resolved
git commit --no-edit               # → [main 5d6e7f8] Merge branch 'feature/timeouts'
# Gave up instead?  git merge --abort`,
  },
  {
    id: 'git-cherry-pick-stash',
    group: 'Git & Version Control',
    stars: 2,
    difficulty: 'Easy',
    q: 'What do git cherry-pick and git stash do?',
    a: [
      "# ELI5",
      "Cherry-pick: your friend's recipe book has one great cookie recipe; instead of copying the whole book, you copy just that one page into your own book.",
      "Stash: you are halfway through a drawing when mum calls you for dinner; you put the drawing in a drawer, use the table for dinner, then take the drawing back out afterwards.",
      "Cherry-pick copies one specific commit; stash temporarily shelves your unfinished work.",
      "# What it is",
      "git cherry-pick <sha>:",
      "  Applies the changes from one specific existing commit onto your current branch as a new commit (new SHA, same changes and message).",
      "  Typical use: backport a hotfix from main to a `release/1.4` branch, or rescue a commit made on the wrong branch.",
      "  Ranges work too: `git cherry-pick A^..B` picks A through B. `-x` appends '(cherry picked from commit ...)' to the message for traceability.",
      "git stash:",
      "  Saves your uncommitted changes (staged and unstaged) onto a stack and restores a clean working directory.",
      "  `git stash pop` reapplies the latest stash and removes it from the stack; `git stash apply` reapplies but keeps it.",
      "  `git stash list` shows entries like `stash@{0}`, `stash@{1}`; `git stash apply stash@{1}` applies a specific one.",
      "  `-u` (or `--include-untracked`) also stashes new files not yet tracked by Git; `git stash push -m 'msg'` names it.",
      "# How it works",
      "Cherry-pick:",
      "  Git computes the diff introduced by the chosen commit (compared to its parent).",
      "  It applies that diff to your current HEAD and creates a new commit.",
      "  If it conflicts, resolve, `git add`, then `git cherry-pick --continue` (or `--abort`).",
      "Stash:",
      "  Git records your working changes as special commits stored under `refs/stash`.",
      "  It resets your files to match HEAD.",
      "  Later, pop/apply re-applies those changes, possibly with conflicts if the files changed meanwhile.",
      "# Example walkthrough",
      "The `code` first shows stash: you are mid-feature, a bug report arrives, you `git stash push -u`, switch to main, fix, then come back and `git stash pop`.",
      "Then cherry-pick: the hotfix commit `c0ffee1` on main is copied to `release/1.4` with `git cherry-pick -x`, creating a new commit there.",
      "`git log` on the release branch shows the message with '(cherry picked from commit c0ffee1)'.",
      "# Why it matters / when to use",
      "Release branch maintenance relies on cherry-picking fixes without bringing unrelated features.",
      "Stash lets you context-switch quickly without making messy 'WIP' commits.",
      "# Common mistakes",
      "Cherry-picking many commits between long-lived branches, creating duplicates that later conflict; prefer merging when possible.",
      "Forgetting stashes exist and losing track of work; name them and clean up with `git stash drop`.",
      "Forgetting `-u`, so new untracked files are left behind (and get carried to the other branch).",
      "# Say this in the interview",
      "git cherry-pick applies a specific commit onto the current branch as a new commit, which is handy for backporting a hotfix to a release branch. git stash shelves uncommitted changes so I can switch branches with a clean working tree, and git stash pop reapplies them. I can manage several stashes with git stash list and apply a specific one, and use -u to include untracked files.",
      "Follow-up: pop vs apply?",
      "  pop applies the stash and deletes it; apply keeps it on the stack (useful to apply on several branches).",
    ],
    code: `# ── stash: pause unfinished work ──
git status --short
# → M src/search.ts
# → ?? src/new-filter.ts
git stash push -u -m "search WIP"   # -u includes untracked files
git status --short                  # → (clean)
git switch main                     # ...fix an urgent bug, commit, push...
git switch feature/search
git stash list
# → stash@{0}: On feature/search: search WIP
git stash pop                       # changes back, stash removed

# ── cherry-pick: copy one commit to another branch ──
git log --oneline main -1
# → c0ffee1 Fix null crash in checkout
git switch release/1.4
git cherry-pick -x c0ffee1
# → [release/1.4 d00d123] Fix null crash in checkout
git log -1 --format=%B
# → Fix null crash in checkout
# → (cherry picked from commit c0ffee1...)`,
  },
  {
    id: 'git-bisect',
    group: 'Git & Version Control',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is git bisect?',
    a: [
      "# ELI5",
      "Think of the 'guess my number between 1 and 100' game. You do not guess 1, 2, 3...; you guess 50, then 25 or 75, halving the range each time.",
      "Within about 7 guesses you find any number.",
      "git bisect plays that game with your commit history to find the exact commit that broke something.",
      "# What it is",
      "git bisect performs a binary search (repeatedly halving the search range) over your commit history to find the first 'bad' commit that introduced a bug.",
      "You give it one known bad commit (e.g. current HEAD) and one known good commit (e.g. last release tag).",
      "Git checks out the commit halfway between; you test it and mark it `good` or `bad`; Git halves the range again.",
      "It finishes in about log2(N) steps: 1,000 commits need only about 10 tests.",
      "`git bisect run <script>` automates it — the script's exit code decides: 0 = good, 1–127 (except 125) = bad, 125 = skip (cannot test this commit).",
      "# How it works",
      "Steps:",
      "  `git bisect start` begins a session.",
      "  `git bisect bad` marks the current commit as broken.",
      "  `git bisect good v1.4.0` marks a known working commit.",
      "  Git checks out a commit in the middle and prints how many steps remain.",
      "  You test and run `git bisect good` or `git bisect bad`; repeat.",
      "  Git prints '<sha> is the first bad commit' with its details.",
      "  `git bisect reset` returns you to where you started.",
      "# Example walkthrough",
      "The `code` creates a small test script that exits 1 if the bug is present.",
      "`git bisect run ./test.sh` lets Git test each midpoint automatically.",
      "The output ends with the guilty commit, e.g. 'e4f5a6b is the first bad commit — Switch date parsing to UTC'.",
      "`git bisect reset` restores your original branch.",
      "# Why it matters / when to use",
      "Great for regressions — bugs where 'it used to work' — especially when many commits landed since the last good version.",
      "Works best with small, focused commits that each build and pass tests, another reason to keep commits clean.",
      "# Common mistakes",
      "Marking commits incorrectly once, which sends the search in the wrong direction; `git bisect log` and `git bisect replay` help fix it.",
      "Forgetting `git bisect reset` and staying in a detached HEAD state.",
      "Using a test script that fails for unrelated reasons (e.g. a build break); exit 125 to skip those commits.",
      "# Say this in the interview",
      "git bisect binary-searches the commit history to find the commit that introduced a bug. I start it, mark a bad commit and a known good one, and then test each commit Git checks out, marking it good or bad. It can be fully automated with git bisect run and a test script, and it finishes in about log2 of N steps, so even a thousand commits take around ten tests.",
      "Follow-up: What exit code skips a commit in bisect run?",
      "  125.",
    ],
    code: `# test.sh — exit 0 if good, 1 if the bug is present
cat > /tmp/test.sh <<'EOF'
#!/bin/sh
npm ci --silent || exit 125            # cannot build → skip this commit
node -e "const d=require('./src/date');process.exit(d.format('2026-01-01')==='01/01/2026'?0:1)"
EOF
chmod +x /tmp/test.sh

git bisect start
git bisect bad HEAD                    # broken now
git bisect good v1.4.0                 # worked at the last release
# → Bisecting: 63 revisions left to test after this (roughly 6 steps)
git bisect run /tmp/test.sh
# → ...
# → e4f5a6b is the first bad commit
# → commit e4f5a6b  "Switch date parsing to UTC"
git bisect reset                       # back to where you started`,
  },

  // ───────────────────────── Docker & Containers ─────────────────────────
  {
    id: 'container-vs-vm',
    group: 'Docker & Containers',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between a container and a virtual machine?',
    a: [
      "# ELI5",
      "A virtual machine is like building separate houses on one big plot of land: each house has its own foundations, plumbing and electricity. Very separate, but heavy and slow to build.",
      "A container is like flats in one apartment building: they share the same foundation and main pipes, but each flat has its own locked door and rooms.",
      "Flats are quicker and cheaper to set up; houses are more isolated from each other.",
      "In computing, the 'foundation' is the operating system kernel: VMs each bring their own, containers share the host's.",
      "# What it is",
      "Kernel — the core of the operating system that talks to hardware and manages processes, memory, files and networking.",
      "Virtual machine (VM):",
      "  A hypervisor (software like KVM, VMware, Hyper-V, or AWS's Nitro) emulates hardware so several full operating systems can run on one physical machine.",
      "  Each VM has its own guest OS and kernel, so it is gigabytes in size and takes tens of seconds to minutes to boot.",
      "Container:",
      "  A normal process (or group of processes) on the host, isolated using Linux kernel features, sharing the host's kernel.",
      "  Namespaces control what the process can see (its own process list, network, filesystem, hostname).",
      "  cgroups (control groups) control how much it can use (CPU, memory, I/O).",
      "  Packaged as an image containing only the app and its libraries, usually megabytes; starts in milliseconds to a second.",
      "Comparison:",
      "  Isolation — VM: strong, hardware-level, separate kernel. Container: process-level, shared kernel (weaker boundary).",
      "  Size — VM: GBs. Container: MBs.",
      "  Startup — VM: seconds to minutes. Container: milliseconds to seconds.",
      "  Density — VM: tens per host. Container: hundreds per host.",
      "  OS flexibility — VM: any OS (Windows on a Linux host). Container: must match the host kernel type (Linux containers need a Linux kernel; Docker Desktop on Mac/Windows runs a small Linux VM under the hood).",
      "  Best for — VM: strong multi-tenant isolation, different OSes, legacy apps. Container: microservices, CI jobs, fast scaling.",
      "They are often combined: containers run on cloud VMs; sandboxes like Firecracker microVMs and gVisor add VM-like isolation to containers.",
      "# How it works",
      "Starting a VM: the hypervisor allocates virtual CPU/RAM/disk, boots firmware, the guest kernel boots, init starts services, then your app starts.",
      "Starting a container (`docker run`):",
      "  The runtime (containerd + runc) unpacks the image layers into a filesystem.",
      "  It creates new namespaces and a cgroup with limits.",
      "  It starts your app process directly inside them — no OS boot needed.",
      "# Example walkthrough",
      "The `code` compares both from the terminal.",
      "`time docker run --rm alpine echo hi` prints `hi` and finishes in well under a second, because only a process starts.",
      "`uname -r` inside the container prints the same kernel version as the host, proving the kernel is shared.",
      "`docker images` shows alpine at about 8 MB, while a typical Ubuntu VM disk image is a few GB.",
      "`--memory` and `--cpus` set cgroup limits on the container.",
      "# Why it matters / when to use",
      "Containers made microservices, CI/CD and Kubernetes practical: identical images run on a laptop, in CI and in production.",
      "Use VMs when you need strong isolation between untrusted tenants, a different OS, or kernel customisation.",
      "In cloud reality you usually run containers on VMs and get the benefits of both.",
      "# Common mistakes",
      "Saying containers are 'lightweight VMs' without mentioning the shared kernel.",
      "Assuming containers are a strong security boundary; running as root or privileged inside a container can endanger the host.",
      "Treating containers like VMs: SSH-ing into them and installing software by hand.",
      "# Say this in the interview",
      "A VM virtualises hardware through a hypervisor and runs a full guest operating system with its own kernel, so it gives strong isolation but is gigabytes in size and slow to boot. A container is an isolated process that shares the host kernel, using Linux namespaces for isolation and cgroups for resource limits, so it starts in milliseconds and is megabytes in size. VMs give stronger isolation, while containers are denser and better suited to microservices and CI, and in practice we often run containers on top of VMs.",
      "Follow-up: How does Docker run Linux containers on a Mac?",
      "  Docker Desktop runs a lightweight Linux VM and the containers run inside it.",
      "Follow-up: How can you make containers more isolated?",
      "  Run as non-root, drop capabilities, use seccomp/AppArmor, or sandboxed runtimes like gVisor or Kata/Firecracker microVMs.",
    ],
    code: `# Containers start fast because no OS boots — just a process
time docker run --rm alpine echo hi
# → hi
# → real 0m0.45s

# Same kernel as the host (shared kernel)
uname -r                                  # on the Linux host
# → 6.8.0-45-generic
docker run --rm alpine uname -r
# → 6.8.0-45-generic

# Tiny image size compared to a VM disk (GBs)
docker images alpine
# → alpine  latest  ...  7.8MB

# Own process view (pid namespace): the app is PID 1 inside
docker run --rm alpine ps
# → PID USER COMMAND
# →   1 root ps

# Resource limits via cgroups
docker run --rm --memory=256m --cpus=0.5 node:22-alpine node -e "console.log('limited')"
# → limited`,
  },
  {
    id: 'dockerfile-best-practices',
    group: 'Docker & Containers',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are Dockerfile best practices?',
    a: [
      "# ELI5",
      "A Dockerfile is a recipe for packing a lunch box that will be copied thousands of times.",
      "Good recipes use fresh, known ingredients (pinned base images), pack the things that rarely change first (so you do not redo them), leave the kitchen knives out of the box (build tools), and never hide your house key inside (secrets).",
      "A lean, safe lunch box is quicker to carry, cheaper to store and less dangerous if stolen.",
      "In Docker, these rules make images small, fast to build and secure.",
      "# What it is",
      "A Dockerfile is a text file of instructions (`FROM`, `COPY`, `RUN`, `CMD`...) that Docker executes in order to build an image.",
      "Each instruction that changes the filesystem creates a layer; Docker caches layers to speed up rebuilds.",
      "Best practices:",
      "  Small, pinned base images — e.g. `node:22-alpine`, `node:22-slim` or distroless, pinned to a version (or digest `@sha256:...`), never `latest`, so builds are reproducible.",
      "  Order for caching — put rarely-changing steps first; copy `package.json`/`package-lock.json` and install dependencies before `COPY . .`.",
      "  Multi-stage builds — compile/build in one stage and copy only the output to a slim runtime stage.",
      "  `.dockerignore` — exclude `node_modules`, `.git`, `.env`, logs and build output from the build context (the files sent to Docker).",
      "  Non-root user — add `USER node` (or create a user) so a compromised app is not root inside the container.",
      "  No secrets in layers — do not `COPY .env` or pass tokens with `ARG`/`ENV`; use BuildKit secrets (`RUN --mount=type=secret`) and runtime env vars.",
      "  Deterministic installs — `npm ci` uses the lockfile exactly; `--omit=dev` skips devDependencies in production.",
      "  Combine and clean RUN steps — e.g. `apt-get update && apt-get install -y --no-install-recommends ... && rm -rf /var/lib/apt/lists/*` in one RUN so caches do not persist in a layer.",
      "  Exec form `CMD [\"node\", \"server.js\"]` — so your app is PID 1 and receives SIGTERM.",
      "  One main process per container; add `HEALTHCHECK` where the orchestrator does not do it, plus `EXPOSE` and `LABEL` for documentation.",
      "  Scan images (e.g. Trivy, Docker Scout) in CI for known vulnerabilities.",
      "# How it works",
      "`docker build` sends the build context to BuildKit (Docker's modern build engine).",
      "BuildKit executes instructions top to bottom; for each one it checks if a cached layer exists for the same instruction and inputs.",
      "If the cache matches, it reuses the layer; once one step changes, every later step is rebuilt.",
      "The final image is the stack of layers plus metadata (CMD, USER, ENV, EXPOSE).",
      "# Example walkthrough",
      "The `code` is a production-style Node Dockerfile with two stages.",
      "`# syntax=docker/dockerfile:1` enables the latest Dockerfile features such as cache mounts.",
      "Stage `deps` copies only the package files, then runs `npm ci` with a cache mount so npm's download cache is reused across builds.",
      "Stage `build` copies the source and runs `npm run build` (e.g. TypeScript to JavaScript).",
      "Stage `runtime` starts from a clean `node:22-alpine`, sets `NODE_ENV=production`, installs only production dependencies, copies the compiled `dist`, switches to `USER node`, and starts with exec-form CMD.",
      "Changing only a `.ts` file reuses the cached dependency layers, so rebuilds take seconds.",
      "# Why it matters / when to use",
      "Smaller images download and start faster, which speeds up deploys and autoscaling.",
      "Fewer packages mean fewer vulnerabilities (smaller attack surface).",
      "Good caching makes CI builds minutes faster on every commit.",
      "# Common mistakes",
      "`COPY . .` before `npm ci`, so every code change reinstalls all dependencies.",
      "Forgetting `.dockerignore`, accidentally copying `.env` secrets and a huge local `node_modules` into the image.",
      "Running as root and using `latest` tags, making builds insecure and non-reproducible.",
      "Starting with `CMD npm start` (shell form via npm), so SIGTERM never reaches Node and shutdowns are not graceful.",
      "# Say this in the interview",
      "I use small, pinned base images like node:22-alpine or distroless instead of latest, and order instructions from least to most frequently changing, copying the dependency manifests and installing before copying the source so the cache is reused. I use multi-stage builds so build tools never reach the final image, run as a non-root user, add a .dockerignore, and never bake secrets into layers, using BuildKit secrets instead. I also combine RUN steps and clean package caches, use exec-form CMD so the app receives signals, keep one main process per container, and scan images in CI.",
      "Follow-up: Why is `npm ci` preferred over `npm install` in images?",
      "  It installs exactly what the lockfile says, fails if it is out of sync, and is faster and reproducible.",
      "Follow-up: How do you pass a private npm token during build safely?",
      "  With a BuildKit secret mount: `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci`, so it never lands in a layer.",
    ],
    code: `# syntax=docker/dockerfile:1
# ---------- deps: install all dependencies (cached unless lockfile changes)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build: compile TypeScript
FROM deps AS build
COPY . .
RUN npm run build                     # → writes dist/

# ---------- runtime: small, non-root, prod deps only
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node                             # never run as root
EXPOSE 3000
HEALTHCHECK CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["node", "dist/server.js"]        # exec form → node is PID 1, gets SIGTERM

# .dockerignore:  node_modules  .git  .env  dist  *.log
# docker build -t myorg/api:1.5.0 .   → image ~150MB instead of ~1GB`,
  },
  {
    id: 'image-vs-container',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between a Docker image and a container?',
    a: [
      "# ELI5",
      "An image is like a cake recipe printed in a cookbook: it never changes and you can use it as many times as you like.",
      "A container is an actual cake baked from that recipe. You can bake ten cakes from one recipe, decorate each differently, and eat one without affecting the recipe.",
      "Throw a cake away and the recipe is still in the book.",
      "In Docker: the image is the read-only template; a container is a running instance made from it.",
      "# What it is",
      "Docker image:",
      "  An immutable (unchangeable), read-only template containing a filesystem (OS libraries, runtime, your app) plus metadata (default command, env vars, exposed ports, user).",
      "  Built from a Dockerfile as a stack of layers; layers are shared between images to save space.",
      "  Identified by a name and tag (`myorg/api:1.5.0`) or by an immutable digest (`myorg/api@sha256:...`).",
      "  Stored and shared via registries — servers that host images, such as Docker Hub, Amazon ECR, GitHub Container Registry (GHCR).",
      "Docker container:",
      "  A running (or stopped) instance of an image — an isolated process with its own namespaces and resource limits.",
      "  Gets a thin writable layer on top of the image's read-only layers; any files it writes go there (copy-on-write).",
      "  Has its own ID, name, network settings and state (created, running, exited).",
      "Comparison:",
      "  Nature — image: static template. Container: live process.",
      "  Mutability — image: read-only. Container: writable top layer.",
      "  Count — one image → many containers.",
      "  Lifecycle — image: build, push, pull. Container: create, start, stop, remove.",
      "  Commands — image: `docker build`, `docker images`, `docker push`. Container: `docker run`, `docker ps`, `docker logs`, `docker rm`.",
      "Data written in a container's layer is lost when the container is removed; use volumes for data that must persist.",
      "# How it works",
      "`docker run nginx:1.27`:",
      "  Docker pulls the image from the registry if it is not already local.",
      "  It creates a container: adds a writable layer on the image layers using an overlay filesystem (overlay2).",
      "  It sets up namespaces, cgroups and networking, then starts the image's default command.",
      "Running the same command again creates a second, independent container from the same image.",
      "# Example walkthrough",
      "The `code` pulls one image and starts two containers from it.",
      "`docker ps` lists both containers with different names and ports but the same image.",
      "Writing a file in `web1` with `docker exec` does not appear in `web2` — each has its own writable layer.",
      "`docker rm -f web1` deletes that container and its written file, but `docker images` still shows the nginx image.",
      "# Why it matters / when to use",
      "This is the foundation of container deployment: you build and ship images, and orchestrators run containers from them.",
      "Understanding the writable layer explains why containers must be stateless and why volumes exist.",
      "Pinning by digest guarantees every container runs the exact same bytes.",
      "# Common mistakes",
      "Storing important data inside the container instead of a volume, then losing it when the container is recreated.",
      "Using `docker commit` to 'save' manual changes as an image instead of updating the Dockerfile — unreproducible.",
      "Confusing removing a container (`docker rm`) with removing an image (`docker rmi`).",
      "# Say this in the interview",
      "An image is an immutable, layered, read-only template — a filesystem plus metadata — built from a Dockerfile and stored in a registry, identified by a tag or digest. A container is a running or stopped instance of that image, with a thin writable layer on top. Many containers can run from one image, and data written in the container layer is lost when it is removed, which is why we use volumes for persistent data.",
      "Follow-up: Tag vs digest?",
      "  A tag like `1.5.0` is a movable label; a digest `sha256:...` is a content hash that always refers to the exact same image.",
    ],
    code: `docker pull nginx:1.27                       # get the IMAGE (template)
docker images nginx
# → nginx  1.27  a1b2c3d4e5f6  ...  192MB

docker run -d --name web1 -p 8081:80 nginx:1.27   # CONTAINER #1
docker run -d --name web2 -p 8082:80 nginx:1.27   # CONTAINER #2, same image
docker ps --format "{{.Names}}  {{.Image}}  {{.Ports}}"
# → web2  nginx:1.27  0.0.0.0:8082->80/tcp
# → web1  nginx:1.27  0.0.0.0:8081->80/tcp

docker exec web1 sh -c "echo hi > /tmp/note.txt"   # writes to web1's layer only
docker exec web2 cat /tmp/note.txt
# → cat: can't open '/tmp/note.txt': No such file or directory

docker rm -f web1                            # container + its writes gone
docker images nginx                          # image still there
# → nginx  1.27  a1b2c3d4e5f6  ...  192MB`,
  },
  {
    id: 'multi-stage-builds',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are multi-stage builds and why use them?',
    a: [
      "# ELI5",
      "When you build a model aeroplane, your desk is covered with glue, knives, paint and scraps.",
      "When you give the plane to a friend, you only hand over the finished plane, not the whole messy desk.",
      "A multi-stage build does the messy building in one 'workshop' image, then copies only the finished product into a clean 'gift box' image.",
      "# What it is",
      "A multi-stage build is a Dockerfile with several `FROM` instructions; each `FROM` starts a new stage with its own base image.",
      "Stages can be named (`FROM golang:1.23 AS build`) and later stages can copy files from earlier ones with `COPY --from=build`.",
      "Only the last stage (or the one you pick with `--target`) becomes the final image; earlier stages are discarded.",
      "Why it helps:",
      "  Compilers, SDKs, devDependencies and source code stay in the build stage and never ship.",
      "  The final image is much smaller (often 10x or more), pulls faster and starts faster.",
      "  Fewer packages means a smaller attack surface (fewer things to exploit) and fewer vulnerability alerts.",
      "  One Dockerfile replaces old 'builder' scripts that used two Dockerfiles.",
      "Common patterns:",
      "  Go/Rust: build a static binary, run it on `scratch` or `distroless/static` (no shell, no package manager).",
      "  Java: build with Maven/Gradle in a JDK image, run the JAR on a JRE image.",
      "  Node/TypeScript: install all deps and compile in one stage, then copy `dist` + production deps only.",
      "  React/Vite frontends: build static files with Node, serve them from an `nginx` image.",
      "# How it works",
      "BuildKit reads the Dockerfile and builds a graph of stages.",
      "It only builds stages that the target stage depends on, and can build independent stages in parallel.",
      "`COPY --from=<stage>` pulls specific files from a stage's filesystem into the current stage.",
      "`docker build --target build .` stops at a named stage — handy for running tests in CI.",
      "# Example walkthrough",
      "The `code` builds a Go API.",
      "Stage `build` uses the full `golang:1.23` image (about 800 MB), copies `go.mod`/`go.sum` first for caching, downloads modules, copies the source and compiles.",
      "`CGO_ENABLED=0` makes a fully static binary that needs no C libraries, so it can run on a minimal base.",
      "Stage 2 starts from `gcr.io/distroless/static`, copies only the `/app` binary and runs as the non-root user.",
      "`docker images` shows the final image around 10 MB instead of 800+ MB.",
      "# Why it matters / when to use",
      "Use it for any compiled or transpiled app: Go, Java, TypeScript, React, Rust.",
      "Smaller images mean faster deploys, faster autoscaling and lower registry storage costs.",
      "Security scanners report far fewer issues on distroless or slim runtime images.",
      "# Common mistakes",
      "Copying the whole `/src` or `node_modules` from the build stage instead of only the needed outputs.",
      "Using a distroless/scratch final image for a binary that needs libc (forgetting `CGO_ENABLED=0`), causing 'not found' errors.",
      "Not realising distroless images have no shell, so `docker exec sh` will not work for debugging (use a `:debug` variant or ephemeral debug containers).",
      "# Say this in the interview",
      "A multi-stage build has several FROM stages in one Dockerfile, and later stages copy only the artifacts they need from earlier ones with COPY --from. That means compilers, dev dependencies and source code never ship, so the final image is much smaller and has less attack surface. It is common for Go, Java, Node and React: build in a full SDK image, then run on alpine or distroless.",
      "Follow-up: How do you run tests in a multi-stage build?",
      "  Add a test stage and build it with `docker build --target test .` in CI, or run tests in the build stage so a failure stops the build.",
    ],
    code: `# syntax=docker/dockerfile:1
# ---------- Stage 1: build (big image with the Go toolchain)
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download                      # cached until go.mod/go.sum change
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd/api   # static binary, no libc needed

# ---------- Stage 2: runtime (tiny, no shell, no compiler)
FROM gcr.io/distroless/static:nonroot
COPY --from=build /app /app              # ONLY the binary crosses over
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app"]

# docker build -t myorg/api:1.0 .
# docker images
# → golang      1.23   ...  830MB    (build stage base, not shipped)
# → myorg/api   1.0    ...   12MB    (final image)`,
  },
  {
    id: 'cmd-vs-entrypoint',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Medium',
    q: 'CMD vs ENTRYPOINT (and RUN)?',
    a: [
      "# ELI5",
      "Think of a coffee machine. RUN is what happens in the factory while building the machine (installing the pipes).",
      "ENTRYPOINT is what the machine always does when switched on: make coffee.",
      "CMD is the default choice on the screen: 'medium, with milk'. You can press other buttons to change the size, but it is still a coffee machine.",
      "RUN = build time; ENTRYPOINT = the fixed program; CMD = default arguments you can override.",
      "# What it is",
      "RUN:",
      "  Executes a command while building the image (e.g. `RUN npm ci`) and saves the result as a new layer.",
      "  Never runs when a container starts.",
      "ENTRYPOINT:",
      "  Defines the executable that always runs when a container starts.",
      "  Arguments passed to `docker run image <args>` are appended to it.",
      "  Can only be replaced with the explicit `docker run --entrypoint ...` flag.",
      "CMD:",
      "  Provides the default command, or default arguments to the ENTRYPOINT if one exists.",
      "  Replaced entirely by any arguments given after the image name in `docker run`.",
      "Combinations:",
      "  Only CMD `[\"node\", \"server.js\"]` — runs node server.js; `docker run img sh` runs sh instead.",
      "  ENTRYPOINT `[\"python\", \"app.py\"]` + CMD `[\"--port\", \"8080\"]` — default `python app.py --port 8080`; `docker run img --port 9000` gives `python app.py --port 9000`.",
      "  Only the last CMD and last ENTRYPOINT in a Dockerfile take effect.",
      "Exec form vs shell form:",
      "  Exec form — JSON array `CMD [\"node\", \"server.js\"]`: runs the program directly, so it becomes PID 1 and receives signals like SIGTERM.",
      "  Shell form — `CMD node server.js`: wrapped as `/bin/sh -c \"node server.js\"`; the shell is PID 1 and may not forward SIGTERM, so shutdowns are not graceful. Shell form does allow variable expansion and pipes.",
      "  If ENTRYPOINT uses shell form, CMD and run arguments are ignored.",
      "In Kubernetes, the container spec's `command` overrides ENTRYPOINT and `args` overrides CMD.",
      "# How it works",
      "At container start, Docker builds the final command line = ENTRYPOINT + (run arguments if given, otherwise CMD).",
      "If there is no ENTRYPOINT, the command line is just the run arguments or CMD.",
      "A common pattern is an entrypoint script that does setup (e.g. wait for DB, render config) and ends with `exec \"$@\"` to hand control to the CMD as PID 1.",
      "# Example walkthrough",
      "The `code` builds an image with `ENTRYPOINT [\"node\", \"cli.js\"]` and `CMD [\"--help\"]`.",
      "`docker run tool` runs `node cli.js --help` and prints the help text.",
      "`docker run tool greet Sam` replaces CMD, so it runs `node cli.js greet Sam` and prints `Hello, Sam`.",
      "`docker run --entrypoint sh tool -c \"ls\"` replaces the entrypoint itself, useful for debugging.",
      "`RUN npm ci` only ran once at build time.",
      "# Why it matters / when to use",
      "Use CMD alone for typical app images where people might want to run a different command (shell, migrations).",
      "Use ENTRYPOINT + CMD for images that behave like a CLI tool, with sensible default flags.",
      "Always prefer exec form so Kubernetes and Docker can stop your app gracefully.",
      "# Common mistakes",
      "Using shell form, so SIGTERM is not forwarded and `docker stop` takes 10 seconds then SIGKILLs.",
      "Putting runtime actions (like `RUN node server.js`) in RUN — the build hangs because the server never exits.",
      "An entrypoint script that forgets `exec \"$@\"`, leaving the shell as PID 1.",
      "# Say this in the interview",
      "RUN executes at build time and creates an image layer, while CMD and ENTRYPOINT define what runs when the container starts. ENTRYPOINT sets the fixed executable, and CMD provides default arguments that docker run arguments override, for example ENTRYPOINT python app.py with CMD --port 8080. I prefer the exec form, a JSON array, so my process is PID 1 and receives signals; the shell form wraps the command in /bin/sh -c, which can swallow SIGTERM.",
      "Follow-up: How do Kubernetes fields map to these?",
      "  `command` overrides ENTRYPOINT and `args` overrides CMD.",
    ],
    code: `# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev                  # BUILD time only → creates a layer
ENTRYPOINT ["node", "cli.js"]          # always runs (exec form → PID 1)
CMD ["--help"]                         # default args, easy to override

# docker build -t tool .
# docker run --rm tool
#   → runs: node cli.js --help         → Usage: cli.js greet <name>
# docker run --rm tool greet Sam
#   → runs: node cli.js greet Sam      → Hello, Sam
# docker run --rm --entrypoint sh tool -c "ls"
#   → replaces ENTRYPOINT              → cli.js  node_modules  package.json

# entrypoint script pattern (docker-entrypoint.sh):
#   #!/bin/sh
#   set -e
#   echo "running migrations..."
#   exec "$@"                          # hand off to CMD as PID 1`,
  },
  {
    id: 'docker-layer-caching',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do Docker image layers and build caching work?',
    a: [
      "# ELI5",
      "Imagine building a tall sandwich in a café that remembers every sandwich it made.",
      "If today's order is the same as yesterday's up to the cheese, the café reuses yesterday's half-sandwich and only adds the new top.",
      "But if you change the bread at the bottom, everything above it must be made fresh.",
      "Docker layers are the sandwich slices, and the build cache is the café's memory.",
      "# What it is",
      "An image is a stack of read-only layers. Each instruction that changes files (`RUN`, `COPY`, `ADD`) creates a new layer containing only the differences from the layer below.",
      "Layers are content-addressed (identified by a hash of their contents), so identical layers are stored once and shared between images; e.g. ten images based on `node:22-alpine` share its layers on disk and in the registry.",
      "Build cache — when rebuilding, Docker reuses a previously built layer if the instruction and its inputs are unchanged.",
      "Cache rules:",
      "  For `RUN`, the cache key is the command text (and the parent layer) — Docker does NOT notice if the internet changed (e.g. `apt-get update` getting new packages).",
      "  For `COPY`/`ADD`, the key includes a checksum of the copied files' contents.",
      "  Once one instruction misses the cache, every instruction after it is rebuilt (the cache is invalidated down the chain).",
      "BuildKit (Docker's default builder) adds extra features:",
      "  Cache mounts — `RUN --mount=type=cache,target=/root/.npm` keeps package manager caches between builds without storing them in a layer.",
      "  Exportable cache — `--cache-to` and `--cache-from` store cache in a registry or GitHub Actions cache so fresh CI runners can reuse it.",
      "# How it works",
      "For each instruction in order:",
      "  Docker computes the cache key from the parent layer + instruction + input file checksums.",
      "  If a matching layer exists, it prints `CACHED` and moves on.",
      "  If not, it executes the instruction, stores a new layer, and from now on all following steps run fresh.",
      "That is why ordering matters: put slow, rarely-changing steps (OS packages, dependency install) before frequently-changing ones (your source code).",
      "# Example walkthrough",
      "The `code` contrasts a bad and a good order for a Node app.",
      "Bad: `COPY . .` before `npm ci` — changing one line of `server.js` changes the COPY checksum, so `npm ci` reruns every build (slow).",
      "Good: copy only `package.json` and `package-lock.json`, run `npm ci`, then `COPY . .` — code changes leave the install layer `CACHED`.",
      "The CI command uses `docker buildx build` with `--cache-from` and `--cache-to type=gha` so GitHub Actions runners reuse layers between runs.",
      "# Why it matters / when to use",
      "Good caching turns 5-minute builds into 20-second builds, speeding up every CI run and deploy.",
      "Shared layers reduce disk and network usage when pulling many images on Kubernetes nodes.",
      "Knowing the rules prevents subtle bugs like stale packages from cached `apt-get update` layers.",
      "# Common mistakes",
      "Running `apt-get update` in a separate RUN from `apt-get install`; the cached update layer becomes stale. Combine them in one RUN.",
      "Deleting files in a later layer to 'shrink' the image — the data still exists in the earlier layer. Delete in the same RUN that created it.",
      "Not using a `.dockerignore`, so changing an irrelevant file (like a log or `.git`) busts the `COPY . .` cache.",
      "# Say this in the interview",
      "Each Dockerfile instruction like RUN, COPY or ADD creates a layer, and layers are content-addressed and shared between images. On rebuild, Docker reuses cached layers until an instruction or its input files change, and everything after that point is rebuilt. So I copy package.json and the lockfile and install dependencies before copying the source, to avoid reinstalling on every code change. In CI I use BuildKit cache exports with --cache-to and --cache-from, backed by a registry or the GitHub Actions cache, to persist cache across runs.",
      "Follow-up: How do you force a clean build?",
      "  `docker build --no-cache .`, or bust a specific step by changing a build arg used in it.",
      "Follow-up: How do you inspect layers?",
      "  `docker history <image>` shows each layer, its size and the instruction that created it; tools like dive show contents.",
    ],
    code: `# BAD order: any code change re-runs npm ci
# FROM node:22-alpine
# WORKDIR /app
# COPY . .
# RUN npm ci

# GOOD order: dependencies cached until the lockfile changes
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]

# Rebuild after editing server.js only:
# docker build -t api .
# → [2/5] WORKDIR /app                      CACHED
# → [3/5] COPY package.json package-lock... CACHED
# → [4/5] RUN npm ci --omit=dev             CACHED   ← no reinstall
# → [5/5] COPY . .                          0.2s

# CI: persist cache between fresh runners (GitHub Actions)
# docker buildx build --cache-from type=gha --cache-to type=gha,mode=max -t api .
# docker history api   → lists each layer with its size and instruction`,
  },
  {
    id: 'docker-volumes',
    group: 'Docker & Containers',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you persist data in Docker? Volumes vs bind mounts?',
    a: [
      "# ELI5",
      "A container is like a hotel room: when you check out, housekeeping wipes everything you left behind.",
      "A volume is like a locker the hotel manages for you; your stuff stays safe between stays, and you do not need to know where the locker is.",
      "A bind mount is like bringing your own suitcase from home and opening it in the room; the room uses your exact things, live.",
      "tmpfs is like a whiteboard in the room: handy for scribbles, wiped when you leave.",
      "In Docker, these are three ways to store data outside the container's throwaway layer.",
      "# What it is",
      "A container's writable layer is ephemeral (temporary): when the container is removed, everything written there is lost. It is also slower than normal disk.",
      "To persist data, you mount storage from outside into a path inside the container.",
      "Named volumes:",
      "  Storage created and managed by Docker (usually under `/var/lib/docker/volumes/` on Linux).",
      "  Syntax: `-v pgdata:/var/lib/postgresql/data` or `--mount type=volume,src=pgdata,dst=/var/lib/postgresql/data`.",
      "  Portable, independent of host folder layout, easy to back up, work well on Docker Desktop. Preferred for databases.",
      "  If empty, Docker pre-fills them with whatever the image had at that path.",
      "Bind mounts:",
      "  Map an exact host path into the container: `-v \"$(pwd)\":/app`.",
      "  Changes are visible instantly on both sides — perfect for local development with hot reload.",
      "  Depend on the host's directory structure and file permissions, so they are less portable.",
      "tmpfs mounts:",
      "  Stored only in the host's memory: `--tmpfs /tmp`. Never written to disk; good for sensitive or scratch data.",
      "Comparison:",
      "  Managed by — volume: Docker. Bind: you (any host path). tmpfs: memory.",
      "  Persists after container removal — volume: yes. Bind: yes (it is a host folder). tmpfs: no.",
      "  Best for — volume: databases and app data. Bind: dev source code and config files. tmpfs: secrets and temp files.",
      "In Kubernetes the equivalent ideas are PersistentVolumes/PersistentVolumeClaims, hostPath and `emptyDir` (with `medium: Memory` for tmpfs).",
      "# How it works",
      "When the container starts, Docker mounts the volume or host directory onto the given path inside the container's filesystem.",
      "Reads and writes to that path go directly to the volume/host folder, bypassing the copy-on-write container layer.",
      "Removing the container (`docker rm`) does not delete named volumes; you must run `docker volume rm` (or `docker compose down -v`).",
      "# Example walkthrough",
      "The `code` runs Postgres with a named volume `pgdata`, creates a table, deletes the container and starts a new one using the same volume — the table is still there.",
      "Next, a bind mount runs a Node dev server with the current folder mapped to `/app`, so editing files on your laptop changes them in the container immediately.",
      "Finally a tmpfs mount gives the container an in-memory `/scratch` directory.",
      "# Why it matters / when to use",
      "Without volumes, a database container would lose all data on every redeploy.",
      "Bind mounts give a fast local development loop with containers.",
      "Choosing the right mount type affects performance, portability and security.",
      "# Common mistakes",
      "Running a database container without any volume and losing data on `docker compose down`.",
      "Using `docker compose down -v` casually, which deletes named volumes and all data in them.",
      "Bind-mounting over `/app` in dev and hiding the `node_modules` installed in the image; add an extra anonymous volume for `/app/node_modules`.",
      "File permission mismatches between host user IDs and the container's user with bind mounts.",
      "# Say this in the interview",
      "The container's writable layer is ephemeral, so data that must survive is stored outside it. Named volumes are managed by Docker, portable and preferred for databases, for example -v pgdata:/var/lib/postgresql/data. Bind mounts map a host path into the container, which is great for local development hot reload but depends on the host. tmpfs mounts keep data only in memory for sensitive or scratch data.",
      "Follow-up: How do you back up a named volume?",
      "  Run a temporary container that mounts the volume and archives it, e.g. `docker run --rm -v pgdata:/data -v \"$(pwd)\":/backup alpine tar czf /backup/pg.tgz -C /data .` — or use the database's own dump tool.",
    ],
    code: `# Named volume: data survives container removal
docker volume create pgdata
docker run -d --name db -e POSTGRES_PASSWORD=pw -v pgdata:/var/lib/postgresql/data postgres:16
docker exec db psql -U postgres -c "CREATE TABLE notes(id int);"
docker rm -f db                                   # container gone...
docker run -d --name db2 -e POSTGRES_PASSWORD=pw -v pgdata:/var/lib/postgresql/data postgres:16
docker exec db2 psql -U postgres -c "\\dt"
# → public | notes | table | postgres              ← ...data still there

# Bind mount: live-edit code from the host (dev only)
docker run --rm -it -p 3000:3000 -v "$(pwd)":/app -v /app/node_modules -w /app node:22-alpine npm run dev
# edit ./src/server.ts on your laptop → container sees it instantly

# tmpfs: in-memory only, wiped when the container stops
docker run --rm --tmpfs /scratch alpine sh -c "echo temp > /scratch/x && cat /scratch/x"
# → temp

docker volume ls
# → local  pgdata`,
  },
  {
    id: 'docker-networking',
    group: 'Docker & Containers',
    stars: 3,
    difficulty: 'Medium',
    q: 'Explain Docker networking modes.',
    a: [
      "# ELI5",
      "Imagine containers as flats in a building.",
      "Bridge network: each flat has its own internal phone line, and the building's front desk forwards outside calls to the right flat number (port publishing).",
      "A user-defined bridge is like giving flats a shared directory, so they can call each other by name instead of by number.",
      "Host network: the flat uses the building's main phone line directly — no front desk at all. None: the flat has no phone.",
      "Overlay: several buildings in different streets share one private phone network.",
      "# What it is",
      "Docker networking decides how containers get IP addresses and how they reach each other, the host and the internet. Each mode is provided by a network driver.",
      "bridge (default):",
      "  Docker creates a private virtual network on the host (the default one is called `bridge`, interface `docker0`, often `172.17.0.0/16`).",
      "  Containers get private IPs and reach the internet via NAT (Network Address Translation — the host rewrites addresses so traffic appears to come from the host).",
      "  Outsiders can only reach a container if you publish a port: `-p 8080:80` maps host port 8080 to container port 80.",
      "User-defined bridge (`docker network create mynet`):",
      "  Like bridge, but with built-in DNS, so containers can reach each other by container or service name (e.g. `db:5432`).",
      "  Better isolation: only containers on the same network can talk. Docker Compose creates one automatically per project.",
      "  The default `bridge` network does NOT provide name-based DNS.",
      "host:",
      "  The container shares the host's network stack directly: no separate IP, no port mapping, no network isolation.",
      "  Slightly faster; useful for network tools or apps needing many ports. Fully supported on Linux.",
      "none:",
      "  Only a loopback interface; no external networking. For isolated batch jobs or security.",
      "overlay:",
      "  Spans multiple Docker hosts (used by Docker Swarm), so containers on different machines share a virtual network.",
      "macvlan / ipvlan:",
      "  Gives a container its own MAC/IP address directly on the physical LAN, so it looks like a separate physical machine — used for legacy apps expecting that.",
      "# How it works",
      "Bridge internals:",
      "  Docker creates a virtual switch (Linux bridge) and a veth pair (a virtual cable) for each container, one end inside the container's network namespace, the other on the bridge.",
      "  iptables/nftables rules handle NAT for outbound traffic and port forwarding for published ports.",
      "  On user-defined networks, Docker's embedded DNS server at `127.0.0.11` resolves container names to IPs.",
      "Kubernetes uses a different model: every pod gets its own routable IP via a CNI plugin, and Services provide stable names.",
      "# Example walkthrough",
      "The `code` creates a user-defined network `appnet` and starts Postgres named `db` on it.",
      "An API container on the same network connects to `db:5432` — the name resolves via Docker DNS (`getent hosts db` prints the IP).",
      "On the default bridge, the same lookup fails because there is no name resolution.",
      "`-p 8080:3000` publishes the API; `curl localhost:8080` works from the host while `db` is not exposed at all.",
      "`--network host` and `--network none` show the other two modes.",
      "# Why it matters / when to use",
      "Correct networking keeps databases private while exposing only the public-facing service.",
      "Most local multi-container setups (Compose) rely on user-defined bridges and service-name DNS.",
      "Debugging 'cannot connect to database' errors in containers almost always comes down to networks, names and ports.",
      "# Common mistakes",
      "Using `localhost` inside a container to reach another container; `localhost` means the container itself. Use the service name.",
      "Publishing database ports to `0.0.0.0` unnecessarily, exposing them to the internet; publish to `127.0.0.1:5432:5432` if needed locally.",
      "Expecting containers on the default bridge to resolve each other by name.",
      "# Say this in the interview",
      "The default bridge driver puts containers on a private network on the host, and you publish ports with -p 8080:80 to reach them from outside. User-defined bridge networks add built-in DNS so containers reach each other by name, which is what Compose uses. Host mode shares the host network stack with no isolation or port mapping, none disables networking, overlay connects containers across multiple hosts in Swarm, and macvlan gives a container its own MAC and IP on the LAN.",
      "Follow-up: How does a container reach a service running on the host?",
      "  Use `host.docker.internal` (built into Docker Desktop; on Linux add `--add-host=host.docker.internal:host-gateway`).",
    ],
    code: `docker network create appnet                         # user-defined bridge (has DNS)
docker run -d --name db --network appnet -e POSTGRES_PASSWORD=pw postgres:16
docker run --rm --network appnet alpine getent hosts db
# → 172.18.0.2      db                                ← name resolves via Docker DNS

docker run --rm alpine getent hosts db               # default bridge
# → (no output: no name-based DNS on the default bridge)

# Publish only the API; the DB stays private on appnet
docker run -d --name api --network appnet -p 8080:3000 -e DATABASE_URL=postgres://postgres:pw@db:5432/postgres myorg/api:1.5.0
curl -s localhost:8080/healthz                       # → ok

docker run --rm --network host nginx:1.27            # shares host ports directly (Linux)
docker run --rm --network none alpine ip addr        # → only "lo" (loopback)

docker network ls
# → bridge  host  none  appnet`,
  },
  {
    id: 'docker-compose',
    group: 'Docker & Containers',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is Docker Compose used for?',
    a: [
      "# ELI5",
      "Imagine setting up a birthday party: you need a cake, balloons, music and games, and the cake must arrive before candles are lit.",
      "Instead of phoning each supplier separately every time, you write one party plan and hand it to a party organiser who sets everything up with one command.",
      "Docker Compose is that party plan for containers: one file describes the app, database and cache, and one command starts them all.",
      "# What it is",
      "Docker Compose is a tool for defining and running multi-container applications from a single YAML file, usually `compose.yaml` (older name: `docker-compose.yml`).",
      "Compose v2 is built into the Docker CLI as `docker compose` (with a space); the old Python `docker-compose` (hyphen) is deprecated.",
      "The file declares:",
      "  services — each container to run (image or build context, ports, env vars, command).",
      "  networks — Compose creates a default user-defined network per project, so services reach each other by service name.",
      "  volumes — named volumes for persistent data.",
      "  environment and `env_file` — configuration values.",
      "  healthcheck — a command that tells Docker whether the service is healthy.",
      "  depends_on — start order; with `condition: service_healthy` it waits until a dependency's healthcheck passes.",
      "  profiles — optional groups of services you enable only when needed.",
      "Ideal for local development, demos and integration tests in CI; for production orchestration at scale, teams usually use Kubernetes, ECS or similar.",
      "# How it works",
      "`docker compose up -d`:",
      "  Reads `compose.yaml` (plus `compose.override.yaml` if present) and the `.env` file for variable substitution.",
      "  Creates a project network and named volumes.",
      "  Builds images for services with `build:` (if needed) and pulls the rest.",
      "  Starts containers in dependency order, in the background (`-d` = detached).",
      "Other commands:",
      "  `docker compose ps` — status of services.",
      "  `docker compose logs -f api` — follow logs.",
      "  `docker compose exec db psql -U app` — run a command inside a running service.",
      "  `docker compose down` — stop and remove containers and networks (add `-v` to also delete volumes).",
      "  `docker compose watch` — sync file changes into containers for a live dev loop.",
      "# Example walkthrough",
      "The `code` defines `api` (built from the local Dockerfile) and `db` (Postgres 16).",
      "`api` reaches the database at host `db` — the service name — through Compose's network.",
      "`db` has a healthcheck using `pg_isready`; `api` uses `depends_on` with `condition: service_healthy`, so it starts only after Postgres accepts connections.",
      "The `pgdata` named volume keeps data across `down`/`up` cycles.",
      "Running `docker compose up -d` prints that the network, volume and both containers were created.",
      "# Why it matters / when to use",
      "New developers can start the whole stack with one command instead of following a long setup doc.",
      "CI pipelines spin up real databases and queues for integration tests, then tear them down.",
      "The file documents the app's dependencies and configuration in one place, versioned with the code.",
      "# Common mistakes",
      "Relying on plain `depends_on` and assuming the database is ready; it only waits for the container to start, not for the service to be healthy.",
      "Committing real secrets in `compose.yaml` or `.env`; use placeholder values locally and a secret manager in production.",
      "Using `localhost` in connection strings instead of the service name.",
      "# Say this in the interview",
      "Docker Compose defines and runs multi-container applications from a single YAML file, compose.yaml. It declares services, networks, volumes, environment variables, healthchecks and depends_on ordering, and everything starts with docker compose up -d and stops with docker compose down. It is ideal for local development and integration tests, but not for production orchestration at scale, where we would use Kubernetes or a managed container service.",
      "Follow-up: How do you make a service wait until the database is actually ready?",
      "  Add a healthcheck to the database and use `depends_on` with `condition: service_healthy`, plus retry logic in the app.",
    ],
    code: `# compose.yaml
services:
  api:
    build: .                              # build from ./Dockerfile
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app   # "db" = service name
    depends_on:
      db:
        condition: service_healthy        # wait until Postgres is ready

  db:
    image: postgres:16
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: app }
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10

volumes:
  pgdata:

# docker compose up -d
# → Network myapp_default  Created
# → Volume  myapp_pgdata   Created
# → Container myapp-db-1   Healthy
# → Container myapp-api-1  Started
# docker compose logs -f api   |   docker compose down   (add -v to wipe data)`,
  },
  {
    id: 'copy-vs-add',
    group: 'Docker & Containers',
    stars: 2,
    difficulty: 'Easy',
    q: 'COPY vs ADD in a Dockerfile?',
    a: [
      "# ELI5",
      "COPY is a simple helper who carries the boxes you point to into the new house, exactly as they are.",
      "ADD is a helper who also opens boxes automatically and can go shopping on the internet for you.",
      "Sometimes that is handy, but surprises happen: you did not want that box unpacked, or the shop sold you something different today.",
      "So use the simple helper (COPY) unless you specifically need the extra tricks.",
      "# What it is",
      "Both instructions put files into the image, creating a new layer.",
      "COPY:",
      "  Copies local files or directories from the build context (the folder you send to `docker build`) into the image.",
      "  Simple, predictable, and recommended for almost everything.",
      "  Supports `--chown=user:group` to set ownership and `--from=<stage>` to copy from another build stage in multi-stage builds.",
      "ADD:",
      "  Does everything COPY does, plus two extra behaviours:",
      "  Automatically extracts local tar archives (`.tar`, `.tar.gz`, etc.) into the destination directory.",
      "  Can download files from remote URLs (and modern BuildKit also supports Git repositories and `--checksum` for verifying downloads).",
      "  Remote URL downloads are not auto-extracted.",
      "Best practice (from Docker's own docs): prefer COPY; use ADD only when you specifically want local tar auto-extraction or a remote source with a checksum.",
      "For downloads, many teams prefer `RUN curl ... && verify && extract && clean up` in one layer, for full control.",
      "# How it works",
      "Both read files from the build context (respecting `.dockerignore`), compute a checksum for caching, and write them into a new layer at the destination path.",
      "ADD additionally checks if the source is a recognised local archive and unpacks it, or fetches the URL at build time.",
      "# Example walkthrough",
      "The `code` copies `package.json` and source with COPY — exactly what you see is what lands in the image.",
      "`ADD vendor.tar.gz /opt/vendor/` unpacks the archive, so `/opt/vendor/` contains the extracted files, not the `.tar.gz`.",
      "`COPY vendor.tar.gz /tmp/` copies the archive file as-is, without extracting.",
      "`ADD --checksum=sha256:... https://...` downloads a file and fails the build if its hash does not match.",
      "# Why it matters / when to use",
      "Using COPY makes Dockerfiles easier to read and avoids accidental extraction or unverified downloads.",
      "Remote downloads with ADD without a checksum can pull changed or malicious content and also break caching.",
      "# Common mistakes",
      "Using ADD everywhere out of habit and being surprised when an archive gets extracted.",
      "Downloading files with ADD from URLs without checksum verification.",
      "Forgetting `.dockerignore`, so COPY or ADD sends secrets or huge folders into the build context.",
      "# Say this in the interview",
      "COPY copies local files and directories from the build context into the image and is simple and predictable. ADD can do the same but also auto-extracts local tar archives and can fetch remote URLs. Best practice is to prefer COPY and use ADD only when I specifically need tar extraction, or a remote file verified with a checksum.",
      "Follow-up: Can COPY copy from another image?",
      "  Yes, `COPY --from=<stage or image> src dst`, which is how multi-stage builds work.",
    ],
    code: `# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app

# COPY: plain, predictable copy from the build context
COPY --chown=node:node package.json package-lock.json ./
COPY src/ ./src/

# ADD with a LOCAL tar: auto-extracts
ADD vendor.tar.gz /opt/vendor/          # → /opt/vendor/lib/..., not the .tar.gz

# COPY with a tar: copied as-is
COPY vendor.tar.gz /tmp/                # → /tmp/vendor.tar.gz

# ADD from a URL with integrity check (BuildKit)
ADD --checksum=sha256:24454f830cdb571e2c4ad15481119c43b3cafd48dd869a9b2945d1036d1dc68d \\
    https://example.com/tool.bin /usr/local/bin/tool
# → build fails if the downloaded file's hash does not match

CMD ["node", "src/server.js"]`,
  },
  {
    id: 'namespaces-cgroups',
    group: 'Docker & Containers',
    stars: 2,
    difficulty: 'Hard',
    q: 'What Linux features make containers possible?',
    a: [
      "# ELI5",
      "Imagine kids in a big classroom. Namespaces are like giving each kid blinders and headphones so they think they are alone in the room — they cannot see others' desks or hear others' conversations.",
      "cgroups are like the teacher's rules: 'you get only 2 crayons and 10 minutes on the computer', so no kid can hog everything.",
      "Layered filesystems are like tracing paper over a shared colouring book: each kid draws on their own sheet while the book underneath stays clean.",
      "Containers are just normal programs wearing these blinders, following these rules and drawing on their own tracing paper.",
      "# What it is",
      "A container is not a special kernel object; it is a regular Linux process combined with several kernel features.",
      "Namespaces — isolate what a process can SEE:",
      "  pid — its own process ID numbering; the app sees itself as PID 1 and cannot see host processes.",
      "  net — its own network interfaces, IP addresses, ports and routing table.",
      "  mnt — its own view of mounted filesystems (its own root `/`).",
      "  uts — its own hostname.",
      "  ipc — its own inter-process communication objects (shared memory, semaphores).",
      "  user — maps user IDs, so root inside the container can be an unprivileged user on the host (rootless containers).",
      "  cgroup — its own view of the cgroup hierarchy (and newer: time namespace).",
      "cgroups (control groups) — limit and account how much a process can USE:",
      "  CPU (shares, quotas like `--cpus=1`), memory (`--memory=512m`; exceeding it triggers the OOM killer), block I/O, and number of processes (`--pids-limit`).",
      "  cgroup v2 is the modern unified version used by current distros, Docker and Kubernetes.",
      "Union / overlay filesystem (overlay2 driver):",
      "  Stacks read-only image layers with a thin writable layer on top; changes use copy-on-write (a file is copied up only when modified).",
      "Security layers on top:",
      "  Capabilities — root's powers split into small pieces (e.g. `NET_BIND_SERVICE`); Docker drops most by default.",
      "  seccomp — filters which system calls (requests to the kernel) a process may make.",
      "  AppArmor / SELinux — mandatory access control policies restricting file and resource access.",
      "  Rootless containers — run the whole container engine without root.",
      "# How it works",
      "When `runc` (the low-level runtime used by Docker and containerd) starts a container:",
      "  It calls `clone()`/`unshare()` with namespace flags to create new namespaces.",
      "  It creates a cgroup and writes limits into files like `memory.max` and `cpu.max`, then puts the process in it.",
      "  It sets up the overlay filesystem and pivots the process's root into it (`pivot_root`).",
      "  It drops capabilities, applies seccomp and AppArmor/SELinux profiles.",
      "  It executes your app's command.",
      "# Example walkthrough",
      "The `code` first uses `unshare` (a Linux tool) to create pid and mount namespaces by hand: `ps` inside shows only a couple of processes, with bash as PID 1 — a 'container' without Docker.",
      "Then a Docker container with `--memory=64m --cpus=0.5` shows the cgroup files: `memory.max` is 67108864 bytes (64 MB) and `cpu.max` is `50000 100000` (50 ms of CPU per 100 ms = half a core).",
      "`docker inspect` shows the `overlay2` storage driver layers.",
      "# Why it matters / when to use",
      "Explains container behaviour: why limits cause OOMKilled (exit 137), why processes see PID 1, and why containers share the host kernel.",
      "Helps you reason about container security and why running privileged containers is dangerous.",
      "Kubernetes requests and limits are implemented directly as cgroup settings.",
      "# Common mistakes",
      "Thinking containers are fully isolated like VMs; a kernel bug or privileged container can affect the host.",
      "Running with `--privileged`, which disables most of these protections.",
      "Not setting memory limits, letting one container starve the host.",
      "# Say this in the interview",
      "Containers are built from Linux kernel features. Namespaces isolate what a process can see — pid, net, mnt, uts, ipc, user and cgroup namespaces. cgroups limit and account resources like CPU, memory, I/O and pids, which is what flags like --memory=512m and --cpus=1 set. Union filesystems like overlay2 stack read-only image layers with a writable top layer, and security is added with capabilities, seccomp profiles, AppArmor or SELinux, and rootless containers.",
      "Follow-up: What happens when a container exceeds its memory limit?",
      "  The kernel OOM killer kills a process in that cgroup; the container exits with code 137 (OOMKilled).",
    ],
    code: `# A "container" by hand: new PID + mount namespaces (Linux, needs root)
sudo unshare --pid --fork --mount-proc bash -c "ps -e"
# →   PID TTY          TIME CMD
# →     1 pts/0    00:00:00 bash          ← PID 1 inside its own namespace
# →     2 pts/0    00:00:00 ps

# cgroup v2 limits set by Docker flags
docker run --rm --memory=64m --cpus=0.5 alpine sh -c "cat /sys/fs/cgroup/memory.max /sys/fs/cgroup/cpu.max"
# → 67108864                 (64 MiB memory limit)
# → 50000 100000             (50ms per 100ms = half a CPU)

# Own hostname (uts namespace)
docker run --rm --hostname box1 alpine hostname
# → box1

# Overlay filesystem layers
docker inspect -f "{{.GraphDriver.Name}}" nginx:1.27
# → overlay2

# Exceed memory → OOM killed
docker run --rm --memory=32m node:22-alpine node -e "const a=[];for(;;)a.push(new Array(1e6).fill(1))"
echo $?
# → 137                       (128 + SIGKILL 9)`,
  },
  {
    id: 'container-pid1',
    group: 'Docker & Containers',
    stars: 2,
    difficulty: 'Hard',
    q: 'Why does PID 1 matter inside a container?',
    a: [
      "# ELI5",
      "In a school, the head teacher has special jobs: listening to the fire alarm and taking care of kids whose parents have left.",
      "If someone who never learned those jobs becomes head teacher, the fire alarm may be ignored and lost kids pile up in the hallway.",
      "Inside a container, your app becomes the 'head teacher' (PID 1), so it must handle stop signals and clean up finished child processes.",
      "# What it is",
      "Every process has a PID (process ID). On a normal Linux system, PID 1 is the init system (e.g. systemd), the ancestor of all processes.",
      "In a container's pid namespace, the container's main process becomes PID 1.",
      "PID 1 is special in two ways:",
      "  Signal handling — the kernel does not apply default actions to PID 1 for signals it has not registered a handler for. So if your app does not explicitly handle SIGTERM, it simply ignores it (instead of dying, as a normal process would).",
      "  Zombie reaping — when a child process exits, its parent must 'reap' it (collect its exit status with `wait()`). Orphaned processes are re-parented to PID 1. If PID 1 never reaps them, they become zombies (dead entries filling the process table).",
      "Consequence: `docker stop` sends SIGTERM, waits the grace period (10 seconds by default), and then sends SIGKILL — so a PID 1 that ignores SIGTERM causes slow, ungraceful shutdowns and dropped requests.",
      "Shell form `CMD npm start` makes `/bin/sh` PID 1; the shell (and npm) may not forward SIGTERM to your Node process.",
      "Note: Node does not install a default SIGTERM handler that exits when it is PID 1, so you must add `process.on('SIGTERM', ...)`.",
      "# How it works",
      "Fixes, from simplest to most robust:",
      "  Use exec form: `CMD [\"node\", \"server.js\"]` so Node itself is PID 1 (not a shell or npm).",
      "  Handle SIGTERM (and SIGINT) in your app to shut down gracefully.",
      "  Use a tiny init process as PID 1: `docker run --init` (uses tini built into Docker) or install `tini`/`dumb-init` and set it as the ENTRYPOINT. It forwards signals to your app and reaps zombies.",
      "  In entrypoint shell scripts, end with `exec \"$@\"` so the script is replaced by your app instead of staying as PID 1.",
      "In Kubernetes, the same rules apply; `terminationGracePeriodSeconds` (default 30) controls how long before SIGKILL. Setting `shareProcessNamespace: true` makes the pause container PID 1 instead.",
      "# Example walkthrough",
      "The `code` first shows the problem: an image with shell-form `CMD npm start`. `docker stop` takes about 10 seconds and the exit code is 137, meaning it was SIGKILLed.",
      "The fixed Dockerfile uses `tini` as ENTRYPOINT and exec-form CMD; the app logs 'SIGTERM received' and exits with 0 in well under a second.",
      "`docker run --init` is the no-Dockerfile-change alternative, and `ps` inside shows `tini` (or `docker-init`) as PID 1 with node as its child.",
      "# Why it matters / when to use",
      "Rolling deploys in Kubernetes stop old pods constantly; without proper PID 1 handling, every deploy drops in-flight requests and takes 30 extra seconds per pod.",
      "Apps that spawn child processes (shell scripts, headless browsers, workers) can leak zombies without an init.",
      "# Common mistakes",
      "Starting with `npm start` or a shell script without `exec`, so signals never reach the app.",
      "Assuming 'Node exits on SIGTERM by default' — not when it is PID 1 without a handler.",
      "Fixing signals but forgetting zombie reaping in containers that spawn many child processes.",
      "# Say this in the interview",
      "The container's main process runs as PID 1, which the kernel treats specially: it gets no default signal actions, so unless it handles SIGTERM it ignores it, and docker stop waits the 10-second grace period and then sends SIGKILL. PID 1 is also responsible for reaping zombie child processes. The fixes are to use exec-form CMD so the app is PID 1 rather than a shell, handle SIGTERM in the app, or run a tiny init like tini via docker run --init that forwards signals and reaps zombies.",
      "Follow-up: What is a zombie process?",
      "  A process that has exited but whose parent has not yet collected its exit status; it occupies a slot in the process table.",
    ],
    code: `# ---- Problem: shell form → sh/npm is PID 1, SIGTERM is not forwarded
# CMD npm start
# time docker stop api   → real 0m10.3s  (waited, then SIGKILL)
# docker inspect -f "{{.State.ExitCode}}" api   → 137

# ---- Fix: tiny init + exec form
FROM node:22-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY . .
ENTRYPOINT ["/sbin/tini", "--"]        # tini = PID 1: forwards signals, reaps zombies
CMD ["node", "server.js"]              # exec form, node is tini's child

# server.js must still handle the signal:
#   process.on('SIGTERM', () => server.close(() => process.exit(0)));

# time docker stop api   → SIGTERM received ... real 0m0.4s, exit code 0

# Alternative without changing the Dockerfile:
# docker run --init myorg/api
# docker exec api ps
# →  PID  COMMAND
# →    1  /sbin/docker-init -- node server.js
# →    7  node server.js`,
  },

  // ───────────────────────── Kubernetes ─────────────────────────
  {
    id: 'k8s-architecture',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain the Kubernetes architecture.',
    a: [
      "# ELI5",
      "Imagine a big shipping port. There is a head office (the control plane) and many cranes on the docks (worker nodes).",
      "The head office has a front desk where all requests go (API server), a filing cabinet with the master plan (etcd), a planner who decides which crane handles each container (scheduler), and supervisors who keep checking the plan matches reality (controllers).",
      "At each crane, a foreman (kubelet) follows the head office's orders and a traffic guide (kube-proxy) directs trucks to the right spot.",
      "You never tell cranes what to do directly; you tell the head office what you want, and it keeps making it true.",
      "# What it is",
      "Kubernetes (K8s) is a container orchestrator — a system that runs containers across many machines, keeps them healthy, scales them and connects them.",
      "A cluster has two parts: the control plane (the brain) and worker nodes (the machines that run your apps).",
      "Control plane components:",
      "  kube-apiserver — the front door. Every change (from `kubectl`, CI tools, or other components) goes through this REST API, which validates requests, authenticates, and stores state.",
      "  etcd — a distributed, consistent key-value store holding the entire cluster state (all objects and their desired state). Only the API server talks to it. Back it up!",
      "  kube-scheduler — watches for new pods with no node assigned and picks the best node based on resource requests, affinity rules, taints and tolerations.",
      "  kube-controller-manager — runs many controllers (reconcile loops) like the Deployment, ReplicaSet, Node and Job controllers.",
      "  cloud-controller-manager — integrates with the cloud provider (creating load balancers, managing node lifecycle) on managed clusters.",
      "Worker node components:",
      "  kubelet — an agent on every node that receives pod specs from the API server and makes sure those containers are running and healthy (runs probes, reports status).",
      "  Container runtime — software that actually runs containers via the CRI (Container Runtime Interface), e.g. containerd or CRI-O (Docker Engine itself is no longer used directly since v1.24).",
      "  kube-proxy — programs iptables/IPVS rules so Service virtual IPs route to the right pods (some CNIs like Cilium replace it with eBPF).",
      "Add-ons: CoreDNS (cluster DNS, e.g. `api.default.svc.cluster.local`), a CNI plugin (Container Network Interface — gives pods IPs and networking, e.g. Calico, Cilium), an ingress controller or Gateway API implementation, and metrics-server (CPU/memory metrics for autoscaling).",
      "Declarative model: you describe the desired state in YAML ('3 replicas of api:1.5'); controllers continuously compare it with the actual state and act to close the gap — this is called reconciliation.",
      "# How it works",
      "What happens on `kubectl apply -f deployment.yaml`:",
      "  kubectl sends the Deployment to the API server, which authenticates, authorises (RBAC) and validates it, then stores it in etcd.",
      "  The Deployment controller notices it and creates a ReplicaSet; the ReplicaSet controller creates 3 Pod objects.",
      "  The scheduler sees 3 unscheduled pods and assigns each to a node (writes `nodeName`).",
      "  The kubelet on each chosen node sees a pod assigned to it, tells containerd to pull the image and start containers, and sets up networking via the CNI.",
      "  The kubelet reports pod status back to the API server; once ready, the pod's IP is added to matching Service endpoints, and kube-proxy updates routing.",
      "  If a pod dies later, the ReplicaSet controller sees 2 instead of 3 and creates a replacement — self-healing.",
      "All components communicate through the API server using a watch mechanism (they subscribe to changes) rather than talking to each other directly.",
      "# Example walkthrough",
      "The `code` explores a cluster with kubectl.",
      "`kubectl get nodes` lists one control-plane node and two workers.",
      "`kubectl get pods -n kube-system` shows the control plane and add-on components themselves running as pods (etcd, apiserver, scheduler, controller-manager, coredns, kube-proxy).",
      "Creating a deployment and watching events (`kubectl get events`) shows the chain: ScalingReplicaSet, then Scheduled (scheduler), Pulling and Started (kubelet).",
      "Deleting a pod shows a replacement appearing immediately — the controller reconciling.",
      "# Why it matters / when to use",
      "Understanding the components lets you debug: Pending pods point to the scheduler (no capacity), ImagePullBackOff to the kubelet/runtime, and API errors to the apiserver or RBAC.",
      "Managed services (EKS, GKE, AKS) run the control plane for you, but you still need to understand it to use and troubleshoot the cluster.",
      "# Common mistakes",
      "Thinking you tell nodes what to do directly — everything goes through the API server.",
      "Forgetting etcd backups in self-managed clusters; losing etcd means losing the cluster state.",
      "Saying Kubernetes 'uses Docker' — modern clusters use containerd or CRI-O (images built with Docker still work, as they are OCI images).",
      "# Say this in the interview",
      "Kubernetes has a control plane and worker nodes. The control plane has the kube-apiserver, the front door through which every state change goes; etcd, the key-value store of cluster state; the scheduler, which assigns pods to nodes; and the controller manager, which runs reconcile loops for Deployments, nodes and so on. Each worker node runs the kubelet, which runs pods through a container runtime like containerd, and kube-proxy for Service networking. The model is declarative: I submit the desired state, and controllers continuously reconcile the actual state toward it. Add-ons include CoreDNS, a CNI plugin, an ingress controller and metrics-server.",
      "Follow-up: What happens if the control plane goes down?",
      "  Running pods keep running on nodes, but no new scheduling, scaling or self-healing happens until it is back.",
      "Follow-up: Why is etcd so important?",
      "  It is the single source of truth for all cluster state; it uses the Raft consensus algorithm and is usually run with 3 or 5 members for high availability.",
    ],
    code: `kubectl get nodes
# → NAME            STATUS  ROLES           VERSION
# → control-plane   Ready   control-plane   v1.31.2
# → worker-1        Ready   <none>          v1.31.2
# → worker-2        Ready   <none>          v1.31.2

kubectl get pods -n kube-system
# → etcd-control-plane                      Running   ← cluster state store
# → kube-apiserver-control-plane            Running   ← front door
# → kube-scheduler-control-plane            Running   ← places pods
# → kube-controller-manager-control-plane   Running   ← reconcile loops
# → coredns-7db6d8ff4d-abcde                Running   ← cluster DNS
# → kube-proxy-x2k9p                        Running   ← one per node

kubectl create deployment web --image=nginx:1.27 --replicas=3
kubectl get events --sort-by=.lastTimestamp | tail -4
# → ScalingReplicaSet  Scaled up replica set web-5d8f to 3     (controller)
# → Scheduled          Assigned default/web-5d8f-abc to worker-1 (scheduler)
# → Pulling            Pulling image "nginx:1.27"              (kubelet)
# → Started            Started container nginx                 (kubelet)

kubectl delete pod -l app=web --wait=false | head -1
kubectl get pods -l app=web   # → new pods already being created (self-healing)`,
  },
  {
    id: 'pod-deployment-service',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are a Pod, ReplicaSet, Deployment and Service?',
    a: [
      "# ELI5",
      "Think of a pizza chain.",
      "A Pod is one delivery scooter with its rider and pizza box — the smallest unit that actually does work. Scooters come and go.",
      "A ReplicaSet is the rule 'we must always have 3 scooters on the road'; if one breaks down, another is sent out.",
      "A Deployment is the manager who, when the menu changes, swaps old scooters for new ones gradually and can switch back if the new menu is bad.",
      "A Service is the shop's single phone number: customers call one number, and the call is passed to whichever scooter is free.",
      "# What it is",
      "Pod:",
      "  The smallest deployable unit in Kubernetes: one or more containers that are always scheduled together on the same node.",
      "  Containers in a pod share a network namespace (same IP address, can talk via `localhost`) and can share volumes.",
      "  Usually one main container per pod, sometimes with helpers (sidecars — e.g. a log shipper or proxy; init containers — run once before the main container).",
      "  Ephemeral: pods are not repaired; if one dies or its node fails, it is replaced by a new pod with a new name and IP.",
      "ReplicaSet:",
      "  A controller that keeps a specified number of identical pod replicas running, using a label selector (e.g. `app=api`) to count them.",
      "  You rarely create ReplicaSets directly; Deployments create them.",
      "Deployment:",
      "  Manages ReplicaSets for stateless apps, adding rolling updates (replace pods gradually), rollbacks (go back to a previous ReplicaSet), scaling and revision history.",
      "  Each change to the pod template creates a new ReplicaSet; the old one is scaled down as the new one scales up.",
      "Service:",
      "  A stable virtual IP (ClusterIP) and DNS name (e.g. `api.default.svc.cluster.local`, or just `api` in the same namespace) that load-balances traffic to all pods matching its label selector.",
      "  Needed because pod IPs change whenever pods are replaced.",
      "  Kubernetes tracks the current pod IPs behind a Service in EndpointSlice objects; only ready pods are included.",
      "Labels — key/value tags on objects (`app: api`); selectors are how Deployments, ReplicaSets and Services find 'their' pods.",
      "# How it works",
      "The ownership chain is: Deployment → ReplicaSet → Pods, with a Service pointing at the pods by labels (not owning them).",
      "You apply a Deployment with `replicas: 3` and a pod template labelled `app: api`.",
      "  The Deployment controller creates ReplicaSet `api-6c9f`.",
      "  The ReplicaSet creates 3 pods `api-6c9f-xxxxx` with label `app: api`.",
      "You apply a Service with `selector: app: api` and `port: 80 → targetPort: 3000`.",
      "  Kubernetes fills its EndpointSlice with the 3 pod IPs.",
      "  Other pods call `http://api` → DNS resolves to the Service IP → kube-proxy rules forward to one of the pod IPs on port 3000.",
      "# Example walkthrough",
      "The `code` contains a Deployment and a Service in one YAML file (separated by `---`).",
      "The Deployment's `selector.matchLabels` must match the pod template's labels (`app: api`), otherwise the API server rejects it.",
      "Resources and a readiness probe are included as good practice.",
      "The Service's selector matches the same label and maps port 80 to container port 3000.",
      "The kubectl commands show 1 Deployment, 1 ReplicaSet, 3 Pods and the Service's endpoints listing 3 pod IPs; a curl from a temporary pod reaches `http://api`.",
      "# Why it matters / when to use",
      "These four objects are the foundation of running almost any stateless web app or API on Kubernetes.",
      "Using a Deployment (not bare pods) gives self-healing, scaling and zero-downtime updates.",
      "Using a Service gives a stable address so clients never track pod IPs.",
      "# Common mistakes",
      "Creating bare Pods in production; if they die, nothing recreates them.",
      "Mismatched labels between the Service selector and pod labels, so the Service has no endpoints and requests fail.",
      "Wrong `targetPort` (the container's port) vs `port` (the Service's port).",
      "# Say this in the interview",
      "A Pod is the smallest deployable unit: one or more containers sharing a network namespace, so the same IP, and volumes; pods are ephemeral. A ReplicaSet keeps N identical pod replicas running. A Deployment manages ReplicaSets and adds rolling updates, rollbacks and scaling for stateless apps. A Service provides a stable virtual IP and DNS name that load-balances to the pods selected by its labels, since pod IPs change all the time.",
      "Follow-up: Why not create ReplicaSets directly?",
      "  Deployments add rolling updates and rollback history on top; ReplicaSets alone cannot update pods gradually.",
      "Follow-up: When would you put two containers in one pod?",
      "  When they are tightly coupled and must share network or files, like an app plus a sidecar proxy or log shipper.",
    ],
    code: `# app.yaml — kubectl apply -f app.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3                            # ReplicaSet keeps 3 pods alive
  selector: { matchLabels: { app: api } }
  template:                              # the Pod template
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: myorg/api:1.4.2
          ports: [{ containerPort: 3000 }]
          resources: { requests: { cpu: 100m, memory: 128Mi } }
          readinessProbe: { httpGet: { path: /ready, port: 3000 } }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }                 # finds pods by label
  ports: [{ port: 80, targetPort: 3000 }]

# kubectl get deploy,rs,pods -l app=api
# → deployment.apps/api   3/3
# → replicaset.apps/api-6c9f   3   3   3
# → pod/api-6c9f-a1b2c  Running   (x3)
# kubectl get endpointslices -l kubernetes.io/service-name=api
# → 10.244.1.5,10.244.2.7,10.244.1.9   3000
# kubectl run tmp --rm -it --image=curlimages/curl -- curl -s http://api/healthz   → ok`,
  },
  {
    id: 'k8s-service-types',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are the Kubernetes Service types?',
    a: [
      "# ELI5",
      "Imagine an office building with different ways to reach a department.",
      "ClusterIP is an internal phone extension: only people inside the building can dial it.",
      "NodePort is like a special side door on every floor with the same door number, which outsiders can knock on.",
      "LoadBalancer is a proper main entrance with a receptionist outside the building, handing visitors to the department.",
      "ExternalName is a sticky note saying 'for Payroll, call this outside company's number'. Headless is a list of every employee's direct desk number instead of one reception number.",
      "# What it is",
      "A Service gives a stable network identity to a set of pods. The `type` field controls how and from where it can be reached.",
      "ClusterIP (default):",
      "  A virtual IP reachable only inside the cluster, plus DNS name `<service>.<namespace>.svc.cluster.local`.",
      "  Used for internal service-to-service communication (e.g. API calling a cache).",
      "NodePort:",
      "  Everything ClusterIP does, plus opens the same static port (range 30000–32767 by default) on every node's IP.",
      "  Traffic to `<any-node-IP>:<nodePort>` is forwarded to the Service's pods.",
      "  Simple but awkward for production: odd port numbers, and you must know node IPs.",
      "LoadBalancer:",
      "  Everything NodePort does, plus asks the cloud provider (via the cloud controller) to create an external load balancer (e.g. AWS NLB, GCP LB) pointing at the nodes/pods.",
      "  You get a public IP or hostname in `EXTERNAL-IP`. Each LoadBalancer Service usually costs money as a separate cloud LB.",
      "  On bare metal, you need something like MetalLB to provide this.",
      "ExternalName:",
      "  No proxying or IP; DNS for the Service returns a CNAME to an external hostname (e.g. `my-db.abc.rds.amazonaws.com`). Lets in-cluster apps use a local name for an outside service.",
      "Headless Service (`clusterIP: None`):",
      "  No virtual IP and no load balancing; DNS returns the individual pod IPs directly.",
      "  Used by StatefulSets (stable per-pod DNS like `db-0.db`) and client-side load balancing (e.g. gRPC, databases with their own clustering).",
      "Comparison:",
      "  Reachable from — ClusterIP: inside the cluster. NodePort: node IP + port. LoadBalancer: internet/VPC via cloud LB. ExternalName: n/a (DNS alias). Headless: inside, per pod.",
      "  Typical use — ClusterIP: internal APIs. NodePort: dev/testing, or behind your own LB. LoadBalancer: exposing one service publicly. ExternalName: alias to managed DB. Headless: StatefulSets.",
      "For HTTP, exposing many services through one entry point with host/path routing is done with Ingress or the newer Gateway API, rather than one LoadBalancer per service.",
      "# How it works",
      "Each type builds on the previous: LoadBalancer creates a NodePort, which creates a ClusterIP.",
      "kube-proxy on each node programs iptables/IPVS rules so traffic to the ClusterIP or NodePort is DNAT'ed (destination rewritten) to a healthy pod IP.",
      "CoreDNS answers DNS queries for Service names; for headless Services it returns multiple A records (one per ready pod).",
      "`externalTrafficPolicy: Local` on NodePort/LoadBalancer keeps traffic on the receiving node and preserves the client IP.",
      "# Example walkthrough",
      "The `code` defines the same app exposed three ways, plus a headless Service and an ExternalName.",
      "`kubectl get svc` shows `api-internal` with only a CLUSTER-IP, `api-nodeport` with `80:30080/TCP`, and `api-public` with an EXTERNAL-IP from the cloud.",
      "`nslookup db-headless` from inside the cluster returns several pod IPs, while `nslookup api-internal` returns one virtual IP.",
      "`nslookup orders-db` returns a CNAME to the RDS hostname.",
      "# Why it matters / when to use",
      "Choosing the right type controls exposure and cost: keep most services ClusterIP and expose only what must be public.",
      "Commonly asked because it tests understanding of Kubernetes networking layers.",
      "# Common mistakes",
      "Creating a LoadBalancer for every microservice, leading to many costly cloud LBs; use one Ingress/Gateway instead.",
      "Exposing databases with NodePort or LoadBalancer to the internet.",
      "Expecting ClusterIP Services to be reachable from your laptop; use `kubectl port-forward` for debugging.",
      "# Say this in the interview",
      "ClusterIP is the default and gives an internal virtual IP reachable only inside the cluster. NodePort additionally exposes the Service on a static port between 30000 and 32767 on every node, and LoadBalancer provisions a cloud load balancer pointing at the Service. ExternalName is a DNS CNAME to an external host, and a headless Service with clusterIP None makes DNS return the pod IPs directly, which StatefulSets use. For HTTP routing of many services behind one load balancer, I would use Ingress or Gateway API instead of many LoadBalancer Services.",
      "Follow-up: How do you reach a ClusterIP service from your laptop for debugging?",
      "  `kubectl port-forward svc/api-internal 8080:80`, then call `localhost:8080`.",
    ],
    code: `# services.yaml — the same pods (app: api) exposed different ways
apiVersion: v1
kind: Service
metadata: { name: api-internal }
spec: { selector: { app: api }, ports: [{ port: 80, targetPort: 3000 }] }   # ClusterIP (default)
---
apiVersion: v1
kind: Service
metadata: { name: api-nodeport }
spec:
  type: NodePort
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000, nodePort: 30080 }]
---
apiVersion: v1
kind: Service
metadata: { name: api-public }
spec: { type: LoadBalancer, selector: { app: api }, ports: [{ port: 80, targetPort: 3000 }] }
---
apiVersion: v1
kind: Service
metadata: { name: db-headless }
spec: { clusterIP: None, selector: { app: db }, ports: [{ port: 5432 }] }   # headless
---
apiVersion: v1
kind: Service
metadata: { name: orders-db }
spec: { type: ExternalName, externalName: orders.abc123.eu-west-1.rds.amazonaws.com }

# kubectl get svc
# → api-internal  ClusterIP     10.96.12.4    <none>         80/TCP
# → api-nodeport  NodePort      10.96.40.9    <none>         80:30080/TCP
# → api-public    LoadBalancer  10.96.77.1    34.120.10.25   80:31544/TCP
# → db-headless   ClusterIP     None          <none>         5432/TCP`,
  },
  {
    id: 'liveness-readiness-probes',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Liveness vs readiness vs startup probes?',
    a: [
      "# ELI5",
      "Think of a shop worker.",
      "Readiness: 'Are you ready to serve customers?' If the worker is restocking shelves, the manager stops sending customers to them for a while, but does not fire them.",
      "Liveness: 'Are you still awake?' If the worker has fallen asleep and will not wake up, the manager replaces them with a fresh worker.",
      "Startup: 'Have you finished your training?' Until the new worker finishes training, nobody asks the other two questions.",
      "Kubernetes asks your containers these three questions with probes.",
      "# What it is",
      "A probe is a periodic health check the kubelet (the node agent) runs against a container.",
      "Readiness probe — 'can this container serve traffic right now?'",
      "  Failing: the pod is marked NotReady and removed from Service endpoints (no traffic), but the container is NOT restarted.",
      "  Use for: warming caches, waiting for dependencies at startup, temporary overload, graceful shutdown.",
      "Liveness probe — 'is this container still alive and able to make progress?'",
      "  Failing (after `failureThreshold` tries): the kubelet kills and restarts the container.",
      "  Use for: detecting deadlocks or hung processes that will never recover on their own.",
      "Startup probe — 'has the app finished starting?'",
      "  While it runs, liveness and readiness probes are disabled. Once it succeeds, they begin.",
      "  If it never succeeds within `failureThreshold × periodSeconds`, the container is restarted.",
      "  Use for: slow-starting apps (e.g. large Java apps, migrations) so liveness does not kill them during boot.",
      "Probe mechanisms:",
      "  `httpGet` — success if HTTP status is 200–399.",
      "  `tcpSocket` — success if a TCP connection opens.",
      "  `exec` — runs a command inside the container; success if exit code 0.",
      "  `grpc` — uses the standard gRPC health checking protocol.",
      "Tuning fields: `initialDelaySeconds`, `periodSeconds` (how often), `timeoutSeconds`, `failureThreshold` (failures before acting), `successThreshold`.",
      "Comparison:",
      "  On failure — readiness: stop sending traffic. Liveness: restart container. Startup: restart container if it never starts.",
      "  Runs — readiness: whole lifetime. Liveness: whole lifetime (after startup). Startup: only during boot.",
      "# How it works",
      "Lifecycle of a pod with all three:",
      "  Container starts; the startup probe runs every `periodSeconds` until it succeeds.",
      "  Then readiness and liveness probes start running periodically.",
      "  When readiness passes, the pod IP is added to Service endpoints and receives traffic.",
      "  If readiness later fails 3 times, traffic stops; when it passes again, traffic resumes.",
      "  If liveness fails 3 times, the kubelet restarts the container (the restart count increases; repeated restarts lead to CrashLoopBackOff).",
      "Readiness also gates rolling updates: a Deployment only continues when new pods become ready.",
      "# Example walkthrough",
      "The `code` has a small Node server with `/healthz` (liveness — just 'the process responds') and `/ready` (readiness — 'DB is connected and we are not shutting down').",
      "On SIGTERM it sets `shuttingDown = true`, so `/ready` returns 503 and Kubernetes stops sending new traffic before the process exits.",
      "The YAML sets a startup probe allowing up to 30 × 2 = 60 seconds to boot, a readiness probe every 5 seconds, and a liveness probe that restarts after 3 failures, 10 seconds apart.",
      "# Why it matters / when to use",
      "Without readiness probes, users get errors during deploys and startup because traffic hits pods that are not ready.",
      "Without liveness probes, a deadlocked app stays 'Running' forever while serving nothing.",
      "Well-tuned probes are essential for zero-downtime deployments.",
      "# Common mistakes",
      "Making liveness depend on external dependencies (database, other services): if the DB blips, every pod restarts at once — a cascading failure. Keep liveness shallow.",
      "Using the same endpoint and settings for liveness and readiness.",
      "Too aggressive liveness timeouts on slow-starting apps, causing endless restart loops; use a startup probe.",
      "Heavy health check handlers that themselves overload the app.",
      "# Say this in the interview",
      "A liveness probe asks whether the container is alive; if it fails, the kubelet restarts the container, which handles deadlocks and hung processes. A readiness probe asks whether it can serve traffic; if it fails, the pod is removed from the Service endpoints but not restarted. A startup probe protects slow-starting apps, because liveness and readiness only begin after it succeeds. Probes can be httpGet, tcpSocket, exec or grpc, and I never make liveness depend on external dependencies, because that causes cascading restarts.",
      "Follow-up: Should readiness check the database?",
      "  It can, carefully — a pod that truly cannot work without the DB should stop taking traffic — but avoid making all pods unready for brief blips; use sensible thresholds.",
    ],
    code: `// server.mjs — health endpoints for probes
import http from 'node:http';
let dbConnected = false, shuttingDown = false;
setTimeout(() => { dbConnected = true; }, 3000);           // pretend DB connects after 3s

http.createServer((req, res) => {
  if (req.url === '/healthz') return res.end('ok');        // liveness: process is responsive
  if (req.url === '/ready') {                              // readiness: can serve traffic?
    const ok = dbConnected && !shuttingDown;
    res.writeHead(ok ? 200 : 503); return res.end(ok ? 'ready' : 'not ready');
  }
  res.end('hello');
}).listen(3000);
process.on('SIGTERM', () => { shuttingDown = true; setTimeout(() => process.exit(0), 5000); });

/* deployment snippet (YAML)
  startupProbe:   { httpGet: { path: /healthz, port: 3000 }, periodSeconds: 2, failureThreshold: 30 }  # up to 60s to boot
  readinessProbe: { httpGet: { path: /ready,   port: 3000 }, periodSeconds: 5 }
  livenessProbe:  { httpGet: { path: /healthz, port: 3000 }, periodSeconds: 10, failureThreshold: 3 }
*/
// curl localhost:3000/ready   (t=1s) → not ready   (503: no traffic yet)
// curl localhost:3000/ready   (t=4s) → ready       (200: added to Service)`,
  },
  {
    id: 'configmap-vs-secret',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Easy',
    q: 'ConfigMap vs Secret?',
    a: [
      "# ELI5",
      "A ConfigMap is like the notice board in a classroom: the timetable and rules, which anyone may read.",
      "A Secret is like the teacher's locked drawer with the exam answers and keys: same idea of 'information for the class', but handled more carefully.",
      "But a cheap drawer is only closed, not truly locked, unless you add a real lock — Kubernetes Secrets need extra protection to be truly safe.",
      "Both let you change settings without rebuilding the app's image.",
      "# What it is",
      "Both are Kubernetes objects that store configuration as key/value pairs, separate from the container image, so the same image runs in dev, staging and prod with different settings.",
      "ConfigMap — for non-sensitive data: feature toggles, URLs, log levels, whole config files (e.g. `nginx.conf`).",
      "Secret — for sensitive data: passwords, API keys, TLS certificates, registry credentials.",
      "  Values are stored base64-encoded. Base64 is just an encoding (a way to represent bytes as text), NOT encryption — anyone with read access can decode it.",
      "  Secret types include `Opaque` (generic), `kubernetes.io/tls`, and `kubernetes.io/dockerconfigjson` (image pull credentials).",
      "  Kubernetes treats Secrets slightly more carefully: kubelet keeps mounted secrets in memory (tmpfs) rather than on disk, and RBAC can restrict them separately.",
      "Ways to consume both in a pod:",
      "  As environment variables — `env.valueFrom.configMapKeyRef / secretKeyRef`, or `envFrom` to import all keys.",
      "  As files — mount as a volume; each key becomes a file.",
      "Update behaviour:",
      "  Mounted files are updated automatically (after a short delay, typically up to about a minute) when the ConfigMap/Secret changes (except when using `subPath`).",
      "  Environment variables are read only at container start, so they need a pod restart (e.g. `kubectl rollout restart`).",
      "Securing Secrets properly:",
      "  Enable encryption at rest for etcd (EncryptionConfiguration, or the cloud KMS option on EKS/GKE/AKS).",
      "  Restrict access with RBAC (who can `get`/`list` secrets).",
      "  Use external secret stores: HashiCorp Vault, AWS Secrets Manager via External Secrets Operator or the Secrets Store CSI Driver, or Sealed Secrets/SOPS to store encrypted secrets safely in Git.",
      "# How it works",
      "You create the object (`kubectl create configmap/secret` or YAML), it is stored in etcd via the API server.",
      "When a pod referencing it starts, the kubelet fetches the values and injects them as env vars or files.",
      "If a referenced key or object is missing, the pod fails to start (CreateContainerConfigError) unless marked `optional: true`.",
      "# Example walkthrough",
      "The `code` creates a ConfigMap with `LOG_LEVEL` and an `app.json` file, and a Secret with `DB_PASSWORD`.",
      "`kubectl get secret ... -o jsonpath` shows the base64 value, and `base64 -d` decodes it instantly — proof it is not encrypted.",
      "The pod spec imports `LOG_LEVEL` via `envFrom`, reads `DB_PASSWORD` via `secretKeyRef`, and mounts the ConfigMap at `/etc/app`.",
      "Inside the pod, `echo $LOG_LEVEL` prints `info` and `cat /etc/app/app.json` prints the file.",
      "# Why it matters / when to use",
      "Keeps secrets out of images and Git, and lets you change configuration without rebuilding.",
      "Common interview trap: knowing that Secrets are only base64-encoded by default shows real-world security awareness.",
      "# Common mistakes",
      "Committing Secret YAML with base64 values to Git, thinking it is encrypted.",
      "Changing a ConfigMap and expecting env vars to update without restarting pods.",
      "Giving broad RBAC permissions like `list secrets` across namespaces to apps or CI tokens.",
      "# Say this in the interview",
      "Both ConfigMaps and Secrets decouple configuration from images and can be injected as environment variables or mounted as files. ConfigMaps are for non-sensitive config like feature toggles and URLs, while Secrets are for sensitive data, but by default Secrets are only base64-encoded, not encrypted. To really secure them I enable etcd encryption at rest, restrict access with RBAC, or use external stores like Vault, External Secrets or Sealed Secrets. Mounted files update when the object changes, but environment variables require a pod restart.",
      "Follow-up: How do you roll pods when a ConfigMap changes?",
      "  `kubectl rollout restart deployment/api`, or add a checksum annotation of the config to the pod template (Helm does this) so changes trigger a rollout.",
    ],
    code: `kubectl create configmap app-config --from-literal=LOG_LEVEL=info --from-file=app.json
kubectl create secret generic db-creds --from-literal=DB_PASSWORD='s3cr3t!'

kubectl get secret db-creds -o jsonpath="{.data.DB_PASSWORD}"
# → czNjcjN0IQ==
kubectl get secret db-creds -o jsonpath="{.data.DB_PASSWORD}" | base64 -d
# → s3cr3t!          ← base64 is encoding, NOT encryption

# pod.yaml (excerpt)
#   containers:
#     - name: api
#       image: myorg/api:1.5.0
#       envFrom:
#         - configMapRef: { name: app-config }          # LOG_LEVEL env var
#       env:
#         - name: DB_PASSWORD
#           valueFrom: { secretKeyRef: { name: db-creds, key: DB_PASSWORD } }
#       volumeMounts: [{ name: cfg, mountPath: /etc/app, readOnly: true }]
#   volumes:
#     - name: cfg
#       configMap: { name: app-config }                 # files update live

kubectl exec deploy/api -- sh -c 'echo $LOG_LEVEL; ls /etc/app'
# → info
# → LOG_LEVEL  app.json
kubectl rollout restart deployment/api   # needed for env var changes`,
  },
  {
    id: 'requests-limits',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are resource requests and limits?',
    a: [
      "# ELI5",
      "Imagine booking a table at a restaurant. The request is your reservation: 'I need at least 4 seats' — the restaurant only seats you where 4 seats are guaranteed.",
      "The limit is the maximum: 'You may use up to 6 seats, never more.'",
      "If you try to take a 7th seat for food (CPU), the waiter just makes you wait; if you pile up too many coats (memory), you get kicked out.",
      "In Kubernetes, requests guarantee resources for placement; limits cap usage.",
      "# What it is",
      "Every container can declare CPU and memory needs in its `resources` section.",
      "Units:",
      "  CPU — in cores or millicores: `1` = one full core, `250m` = a quarter of a core.",
      "  Memory — in bytes with suffixes: `256Mi` (mebibytes), `1Gi` (gibibytes).",
      "Requests:",
      "  The amount the container is guaranteed. The scheduler only places a pod on a node with enough unreserved (allocatable minus already requested) capacity.",
      "  Also used for CPU share weighting under contention and by the HPA to compute utilisation percentages.",
      "Limits:",
      "  The maximum the container may use, enforced by cgroups.",
      "  CPU over the limit → throttled (slowed down), not killed; this shows up as higher latency.",
      "  Memory over the limit → the container is OOMKilled (exit code 137) and restarted.",
      "QoS (Quality of Service) classes, assigned automatically:",
      "  Guaranteed — every container has requests equal to limits for both CPU and memory. Evicted last.",
      "  Burstable — at least one request or limit set, but not Guaranteed. Middle priority.",
      "  BestEffort — no requests or limits at all. Evicted first when the node runs low on memory.",
      "Namespace policies:",
      "  LimitRange — sets default and min/max requests/limits for containers in a namespace.",
      "  ResourceQuota — caps the total CPU, memory, pods etc. a whole namespace can use.",
      "# How it works",
      "Scheduling: the scheduler sums the requests of pods already on each node and only picks nodes where the new pod's requests fit. A pod that fits nowhere stays Pending.",
      "Runtime: the kubelet translates requests and limits into cgroup settings (`cpu.weight`, `cpu.max`, `memory.max`).",
      "Node pressure: if a node runs out of memory, the kubelet evicts pods, starting with BestEffort, then Burstable pods using more than their requests.",
      "Common practice: set memory request = memory limit (memory is not compressible), set a CPU request, and often omit or loosen the CPU limit to avoid needless throttling.",
      "# Example walkthrough",
      "The `code` sets requests of `250m` CPU and `256Mi` memory and a `512Mi` memory limit — a Burstable pod.",
      "`kubectl describe node` shows allocated requests on the node, which is what the scheduler counts.",
      "`kubectl top pod` shows real usage (needs metrics-server).",
      "If the app leaks memory past 512Mi, `kubectl describe pod` shows `Last State: Terminated, Reason: OOMKilled, Exit Code: 137`.",
      "The LimitRange gives defaults to containers that forget to set resources.",
      "# Why it matters / when to use",
      "Without requests, the scheduler overpacks nodes and pods fight for resources, causing random slowness and evictions.",
      "Without memory limits, one leaking pod can destabilise a whole node.",
      "Requests are required for HPA CPU-based autoscaling and drive cluster cost (cluster autoscaler sizes nodes by requests).",
      "# Common mistakes",
      "Setting requests far higher than real usage, wasting money; base them on observed metrics.",
      "Tight CPU limits on latency-sensitive services, causing throttling even when the node is idle.",
      "Node.js apps with a memory limit but default V8 heap settings; set `--max-old-space-size` below the limit (or rely on Node 20+'s container-aware defaults) to avoid OOMKills.",
      "# Say this in the interview",
      "A request is the guaranteed amount of CPU and memory that the scheduler uses to place the pod on a node, and a limit is the maximum allowed. Exceeding the CPU limit causes throttling, while exceeding the memory limit gets the container OOMKilled. Based on these, pods get a QoS class: Guaranteed when requests equal limits, Burstable, or BestEffort when nothing is set, which is evicted first. I enforce defaults per namespace with a LimitRange and cap total usage with a ResourceQuota.",
      "Follow-up: Why might you not set a CPU limit?",
      "  CPU is compressible; with good requests, avoiding limits lets pods use idle CPU and avoids throttling latency spikes. Memory limits should still be set.",
    ],
    code: `# deployment excerpt
containers:
  - name: api
    image: myorg/api:1.5.0
    resources:
      requests: { cpu: 250m, memory: 256Mi }   # used for scheduling (guaranteed)
      limits:   { memory: 512Mi }              # >512Mi → OOMKilled; no CPU limit → no throttling
---
apiVersion: v1
kind: LimitRange                                 # defaults for pods that forget
metadata: { name: defaults, namespace: team-a }
spec:
  limits:
    - type: Container
      defaultRequest: { cpu: 100m, memory: 128Mi }
      default:        { memory: 256Mi }

# kubectl describe node worker-1 | grep -A3 "Allocated resources"
# → cpu      1850m (46%)    memory  3Gi (39%)      ← sum of requests
# kubectl top pod -l app=api
# → api-6c9f-a1b2c   120m   300Mi                  ← actual usage
# kubectl get pod api-6c9f-a1b2c -o jsonpath="{.status.qosClass}"
# → Burstable
# kubectl describe pod api-6c9f-a1b2c | grep -A2 "Last State"
# → Terminated  Reason: OOMKilled  Exit Code: 137`,
  },
  {
    id: 'crashloopbackoff-debug',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'A pod is in CrashLoopBackOff. How do you debug it?',
    a: [
      "# ELI5",
      "Imagine a toy car that keeps crashing into the wall right after you switch it on. You keep restarting it, but each time you wait a bit longer before trying again.",
      "To fix it, you look at what happened just before the crash (the logs), check the toy's report card (describe), and look for obvious causes: dead battery, wrong wheels, missing part.",
      "CrashLoopBackOff is Kubernetes saying 'this container keeps crashing, so I am waiting longer and longer between restarts'.",
      "# What it is",
      "CrashLoopBackOff is a pod status (not an error by itself): the container starts, exits (crashes or finishes), and the kubelet keeps restarting it with exponential back-off.",
      "Exponential back-off — the wait between restarts doubles each time: 10s, 20s, 40s... up to a 5-minute cap, then resets after the container runs fine for 10 minutes.",
      "Exit code — the number a process returns when it stops; it hints at the cause:",
      "  `0` — the process finished successfully but Kubernetes expects a long-running server (e.g. wrong command, or a script that just exits).",
      "  `1` (or other small numbers) — application error: unhandled exception, bad config, failed DB connection.",
      "  `137` — killed by SIGKILL (128 + 9): usually OOMKilled (memory limit exceeded) or killed after failed liveness probes.",
      "  `143` — terminated by SIGTERM (128 + 15).",
      "  `126`/`127` — command not executable / command not found (wrong entrypoint or missing binary).",
      "Common causes:",
      "  Bad configuration or missing env vars; a referenced Secret or ConfigMap key missing.",
      "  App cannot reach a dependency (database down, wrong hostname) and exits.",
      "  Failing liveness probe (wrong path/port, too-short timeouts) causing restarts.",
      "  Wrong command/args, or an image built for the wrong CPU architecture ('exec format error').",
      "  OOMKilled due to a low memory limit or memory leak.",
      "  Permission problems (non-root user cannot write a directory, read-only filesystem).",
      "Related states you should also recognise:",
      "  ImagePullBackOff / ErrImagePull — wrong image name or tag, or missing registry credentials (imagePullSecrets).",
      "  Pending — not scheduled: insufficient CPU/memory on nodes, unbound PersistentVolumeClaim, node selectors or taints that no node satisfies.",
      "  CreateContainerConfigError — a referenced ConfigMap/Secret does not exist.",
      "# How it works",
      "A systematic debugging flow:",
      "  `kubectl get pods` — confirm status and the RESTARTS count.",
      "  `kubectl describe pod <pod>` — read the Events section (probe failures, OOMKilled, pull errors) and 'Last State' with Reason and Exit Code.",
      "  `kubectl logs <pod> --previous` — logs from the crashed (previous) container instance, which usually contain the actual error. Add `-c <container>` for multi-container pods.",
      "  `kubectl get events --sort-by=.lastTimestamp` — cluster events in order.",
      "  Check config: `kubectl get deploy <name> -o yaml` for env, command, probes, resources; verify Secrets/ConfigMaps exist.",
      "  Reproduce interactively: `kubectl debug` with an ephemeral container, or run a copy of the pod with the command overridden to `sleep` so you can exec in and investigate.",
      "  Fix the root cause, then roll out again and watch `kubectl rollout status`.",
      "# Example walkthrough",
      "The `code` follows that flow.",
      "`kubectl get pods` shows `CrashLoopBackOff` with 5 restarts.",
      "`describe` shows `Last State: Terminated, Reason: Error, Exit Code: 1` and a back-off event.",
      "`logs --previous` reveals `Error: DATABASE_URL is not defined` — a missing env var.",
      "`kubectl set env` adds the value from a Secret, triggering a new rollout, and the pod becomes `Running`.",
      "The second case shows `Reason: OOMKilled, Exit Code: 137`, fixed by raising the memory limit or fixing the leak.",
      "# Why it matters / when to use",
      "This is one of the most common real-world Kubernetes problems and a very common interview scenario.",
      "A calm, step-by-step approach (describe, previous logs, config, resources) solves most cases in minutes.",
      "# Common mistakes",
      "Running `kubectl logs` without `--previous`, seeing only the new, still-starting container's empty logs.",
      "Deleting the pod repeatedly hoping it fixes itself — the new pod has the same broken spec.",
      "Making the liveness probe check the database, so a DB blip puts every pod into a restart loop.",
      "# Say this in the interview",
      "CrashLoopBackOff means the container keeps exiting and the kubelet restarts it with exponential back-off. I run kubectl describe pod to see the events and the last exit code — 137 means OOMKilled or SIGKILL, 1 is an application error — and kubectl logs with --previous to see the logs of the crashed container. Common causes are bad config or env vars, a missing Secret, a failing liveness probe, a wrong command, OOM or a dependency being down. I also distinguish it from ImagePullBackOff, which is a wrong image or registry auth, and Pending, which is insufficient resources, an unbound PVC or taints.",
      "Follow-up: How do you debug a container that crashes too fast to exec into?",
      "  Use `kubectl debug` to create a copy of the pod with a different command (e.g. `sleep infinity`) or attach an ephemeral debug container.",
    ],
    code: `kubectl get pods
# → api-7c9d-x2k   0/1   CrashLoopBackOff   5 (40s ago)   4m

kubectl describe pod api-7c9d-x2k | grep -A4 "Last State"
# → Last State:  Terminated
# →   Reason:    Error
# →   Exit Code: 1
# → Warning  BackOff  Back-off restarting failed container api

kubectl logs api-7c9d-x2k --previous          # logs of the CRASHED instance
# → Error: DATABASE_URL is not defined
# →     at loadConfig (/app/dist/config.js:12:11)

kubectl set env deployment/api --from=secret/db-creds   # inject missing env
kubectl rollout status deployment/api
# → deployment "api" successfully rolled out

# Another case: memory
kubectl describe pod worker-5f6b-q9z | grep -A3 "Last State"
# → Reason: OOMKilled   Exit Code: 137    → raise memory limit or fix the leak

# Crashes too fast to inspect? Debug a copy with a sleep command
kubectl debug api-7c9d-x2k -it --copy-to=api-debug --container=api -- sh`,
  },
  {
    id: 'k8s-ingress',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is an Ingress?',
    a: [
      "# ELI5",
      "Think of a large shopping mall with one main entrance and a directory board.",
      "Visitors all come through the same door, and the board says 'Shoes → floor 1, Food → floor 2, Cinema → floor 3'.",
      "The Ingress is that directory board (the rules), and the Ingress controller is the security guard at the door who actually reads the board and points people to the right floor.",
      "Without a guard, the board alone does nothing.",
      "# What it is",
      "An Ingress is a Kubernetes API object that defines L7 (HTTP/HTTPS) routing rules from outside the cluster to Services inside it.",
      "Rules can match on:",
      "  Host — e.g. `api.example.com` vs `shop.example.com`.",
      "  Path — e.g. `/api` → api Service, `/` → frontend Service. `pathType` is `Prefix`, `Exact` or `ImplementationSpecific`.",
      "TLS — the `tls` section names a Secret holding a certificate, so the Ingress terminates HTTPS (decrypts traffic at the edge).",
      "cert-manager — a popular add-on that automatically requests and renews certificates (e.g. free ones from Let's Encrypt) into those Secrets.",
      "Ingress controller — the actual software that watches Ingress objects and implements them as a reverse proxy/load balancer. Kubernetes does not include one by default.",
      "  Examples: ingress-nginx (community NGINX-based controller), Traefik, HAProxy, AWS Load Balancer Controller (creates an ALB), GKE Ingress.",
      "  `ingressClassName` selects which controller should handle an Ingress when several are installed.",
      "Main benefit: one external load balancer and IP can front many services, instead of one costly LoadBalancer Service per app.",
      "Gateway API — the newer, more expressive successor (GA since 2023), with separate resources: `GatewayClass`, `Gateway` (the entry point, owned by platform teams) and `HTTPRoute`/`GRPCRoute` (routes owned by app teams). It supports header matching, traffic splitting and more without vendor-specific annotations.",
      "Note: the Ingress API is stable but frozen (no new features), and the community ingress-nginx project has announced retirement, so new setups increasingly use Gateway API.",
      "# How it works",
      "Flow of a request:",
      "  DNS for `api.example.com` points to the controller's external load balancer.",
      "  The request reaches the controller's pods (e.g. NGINX), which terminate TLS.",
      "  The controller matches host and path against all Ingress rules it manages.",
      "  It forwards the request to the matching Service's pod endpoints.",
      "Whenever you create or change an Ingress, the controller notices (it watches the API server) and updates its proxy configuration automatically.",
      "# Example walkthrough",
      "The `code` defines an Ingress for two hostnames.",
      "`ingressClassName: nginx` assigns it to the ingress-nginx controller.",
      "The `cert-manager.io/cluster-issuer` annotation asks cert-manager to obtain a Let's Encrypt certificate into Secret `example-tls`.",
      "Requests to `shop.example.com/api/...` go to Service `api` port 80; other paths on that host go to `web`.",
      "The equivalent Gateway API `HTTPRoute` at the bottom shows the newer style.",
      "`kubectl get ingress` shows the external ADDRESS where DNS should point.",
      "# Why it matters / when to use",
      "Use Ingress or Gateway API whenever you expose several HTTP services publicly from one cluster.",
      "Centralises TLS, routing, and often rate limiting and authentication at the edge.",
      "Saves money compared with creating many cloud load balancers.",
      "# Common mistakes",
      "Creating an Ingress without installing an Ingress controller, then wondering why nothing happens (no ADDRESS).",
      "Wrong `pathType` or forgetting that path matching rules differ between controllers.",
      "Relying heavily on controller-specific annotations, making migration hard.",
      "# Say this in the interview",
      "An Ingress is an API object that defines layer 7 HTTP and HTTPS routing rules, by host and path, from outside the cluster to Services. It needs an Ingress controller, such as ingress-nginx, Traefik or the AWS Load Balancer Controller, to actually implement it. It handles TLS termination, often with cert-manager for certificates, and lets one load balancer front many services. The Gateway API is the newer, more expressive successor, with Gateway and HTTPRoute resources.",
      "Follow-up: Ingress vs LoadBalancer Service?",
      "  A LoadBalancer Service exposes one Service at L4; an Ingress gives L7 host/path routing and TLS for many Services behind one entry point.",
    ],
    code: `# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt     # auto TLS certificate
spec:
  ingressClassName: nginx                           # handled by ingress-nginx
  tls:
    - hosts: [shop.example.com]
      secretName: example-tls
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: web, port: { number: 80 } } }

# kubectl get ingress shop
# → NAME  CLASS  HOSTS             ADDRESS        PORTS
# → shop  nginx  shop.example.com  34.120.10.25   80, 443
# curl https://shop.example.com/api/health  → served by Service "api"

# Gateway API equivalent route (newer style):
# kind: HTTPRoute
# spec: { parentRefs: [{ name: public-gw }], hostnames: [shop.example.com],
#         rules: [{ matches: [{ path: { type: PathPrefix, value: /api } }],
#                   backendRefs: [{ name: api, port: 80 }] }] }`,
  },
  {
    id: 'hpa-autoscaling',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does autoscaling work in Kubernetes?',
    a: [
      "# ELI5",
      "Picture an ice-cream shop on a hot day.",
      "When the queue gets long, the manager calls in more servers (more pods). When it is quiet, they go home.",
      "Sometimes instead, one server gets a bigger scoop and more counter space (bigger pod resources).",
      "And if the shop itself is full of staff with no room, the owner rents the shop next door (more nodes).",
      "Kubernetes has an autoscaler for each of these: HPA, VPA and the Cluster Autoscaler/Karpenter.",
      "# What it is",
      "Autoscaling automatically adjusts capacity to match demand, saving money when quiet and protecting performance when busy.",
      "HPA (Horizontal Pod Autoscaler) — changes the NUMBER of pod replicas in a Deployment or StatefulSet.",
      "  Uses metrics such as CPU or memory utilisation (from metrics-server), or custom metrics (requests per second via Prometheus Adapter) and external metrics (queue length).",
      "  Utilisation is measured relative to the pod's resource requests, so requests must be set.",
      "VPA (Vertical Pod Autoscaler) — changes the SIZE of pods: it recommends or sets CPU/memory requests and limits based on actual usage.",
      "  Traditionally applies changes by recreating pods; newer Kubernetes versions support in-place pod resizing.",
      "  Do not let HPA and VPA both act on the same metric (CPU/memory) for the same workload.",
      "Cluster Autoscaler / Karpenter — change the number of NODES (machines).",
      "  Adds nodes when pods are Pending because nothing has room; removes underused nodes after moving their pods.",
      "  Karpenter (originally AWS, now a CNCF/Kubernetes SIG project) picks the best instance types quickly and consolidates nodes to cut cost.",
      "KEDA (Kubernetes Event-Driven Autoscaling) — scales based on event sources like queue length, Kafka lag or cron schedules, and can scale to zero.",
      "# How it works",
      "HPA control loop (every 15 seconds by default):",
      "  Read current metric values for all pods (e.g. average CPU = 140% of requests).",
      "  Compute desired replicas = ceil(currentReplicas × currentValue / targetValue). Example: 3 × 140 / 70 = 6.",
      "  Clamp between `minReplicas` and `maxReplicas`, apply scaling `behavior` (e.g. a 5-minute stabilisation window before scaling down, to avoid flapping).",
      "  Update the Deployment's replica count; the Deployment creates or removes pods.",
      "If new pods cannot fit on existing nodes, they stay Pending, which triggers the Cluster Autoscaler or Karpenter to add a node; then the scheduler places them.",
      "When load drops, HPA reduces replicas, nodes become underused, and the node autoscaler removes them.",
      "# Example walkthrough",
      "The `code` creates an HPA for Deployment `api` targeting 70% average CPU, between 2 and 10 replicas, both with the quick `kubectl autoscale` command and the full `autoscaling/v2` YAML.",
      "The YAML's `behavior.scaleDown.stabilizationWindowSeconds: 300` makes scale-down cautious.",
      "Generating load with a busybox loop raises CPU; `kubectl get hpa -w` shows TARGETS going from `20%/70%` to `140%/70%` and REPLICAS from 2 up to 4 or more.",
      "When the load stops, replicas slowly return to 2.",
      "# Why it matters / when to use",
      "Handles traffic spikes (sales, marketing campaigns) automatically without manual intervention.",
      "Cuts cloud costs by scaling down at night and on weekends.",
      "Queue workers scale with backlog via KEDA, even to zero when idle.",
      "# Common mistakes",
      "No resource requests set, so the HPA cannot compute CPU utilisation (`<unknown>` targets).",
      "metrics-server not installed, so HPA has no data.",
      "Setting `minReplicas: 1` for important services — no redundancy if that pod dies.",
      "Apps with slow startup, so new pods arrive too late; use readiness probes, a higher minimum, or scale on leading indicators.",
      "# Say this in the interview",
      "The Horizontal Pod Autoscaler scales the number of pod replicas based on CPU or memory from metrics-server, or custom and external metrics. The Vertical Pod Autoscaler adjusts pods' requests and limits to match real usage, and the Cluster Autoscaler or Karpenter adds or removes nodes when pods are unschedulable or nodes are underused. HPA needs resource requests to be set, and KEDA enables event-driven scaling, for example on queue length, including scaling to zero.",
      "Follow-up: How does HPA calculate desired replicas?",
      "  desired = ceil(current replicas × current metric / target metric), then clamped to min/max with stabilisation windows.",
    ],
    code: `# Quick way
kubectl autoscale deployment api --cpu-percent=70 --min=2 --max=10

# Full autoscaling/v2 spec
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
  behavior:
    scaleDown: { stabilizationWindowSeconds: 300 }   # wait 5 min before shrinking

# Generate load, then watch
# kubectl run load --rm -it --image=busybox -- sh -c "while true; do wget -qO- http://api; done"
# kubectl get hpa api -w
# → NAME  TARGETS   MINPODS  MAXPODS  REPLICAS
# → api   20%/70%   2        10       2
# → api   140%/70%  2        10       4      ← 2 × 140/70 = 4
# → api   65%/70%   2        10       4`,
  },
  {
    id: 'rolling-update-rollback',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do rolling updates and rollbacks work for a Deployment?',
    a: [
      "# ELI5",
      "Imagine replacing the old light bulbs in a hallway with new ones while people are walking through.",
      "You do not switch off all the lights at once; you replace one bulb, check it works, then the next, so the hallway is never dark.",
      "If the new bulbs flicker, you put the old ones back.",
      "A rolling update replaces pods a few at a time; a rollback puts the previous version back.",
      "# What it is",
      "A rolling update is the default Deployment strategy (`RollingUpdate`): old pods are gradually replaced with new ones, so the app stays available during a deploy.",
      "Any change to the pod template (image tag, env vars, resources) triggers a rollout; changing only `replicas` does not.",
      "Each rollout creates a new ReplicaSet; old ReplicaSets are kept (scaled to 0) as revision history, up to `revisionHistoryLimit` (default 10). That history is what makes rollback possible.",
      "Key settings:",
      "  `maxSurge` — how many extra pods above the desired count may exist during the rollout (number or percent, default 25%).",
      "  `maxUnavailable` — how many pods may be unavailable during the rollout (default 25%). Setting it to 0 means capacity never drops.",
      "  `minReadySeconds` — how long a new pod must be ready before it counts as available.",
      "  `progressDeadlineSeconds` — if the rollout makes no progress in this time (default 600), it is marked as failed (but not automatically rolled back).",
      "Readiness probes gate progress: a new pod only counts once it passes readiness, so broken versions stall instead of taking down the app.",
      "Alternative strategy: `Recreate` — kill all old pods, then start new ones. Causes downtime but guarantees two versions never run together (needed for some DB schema or singleton cases).",
      "Advanced strategies such as canary and blue-green are done with tools like Argo Rollouts, Flagger or a service mesh.",
      "# How it works",
      "Example with 4 replicas, maxSurge 1, maxUnavailable 0:",
      "  The Deployment controller creates a new ReplicaSet (v2) and scales it to 1 → 5 pods total.",
      "  When the v2 pod is ready, it scales the old ReplicaSet (v1) down by 1 → back to 4.",
      "  Repeat until v2 has 4 pods and v1 has 0.",
      "  Old pods receive SIGTERM and are removed from Service endpoints, so graceful shutdown matters.",
      "Rollback:",
      "  `kubectl rollout undo deployment/api` scales the previous ReplicaSet back up and the current one down, using the same rolling process.",
      "  `--to-revision=N` picks a specific revision from `kubectl rollout history`.",
      "  In GitOps setups (Argo CD, Flux), you roll back by reverting the Git commit instead, so Git stays the source of truth.",
      "# Example walkthrough",
      "The `code` sets `maxSurge: 1` and `maxUnavailable: 0` for zero-capacity-loss rollouts.",
      "`kubectl set image` changes the image to `1.5.0` and `kubectl annotate` records a change cause for history.",
      "`kubectl rollout status` shows pods being replaced one by one until 'successfully rolled out'.",
      "`kubectl rollout history` lists revisions; `kubectl rollout undo` returns to the previous one.",
      "If v1.5.0 failed readiness, `rollout status` would hang and eventually report the progress deadline exceeded, while old pods keep serving.",
      "# Why it matters / when to use",
      "Enables zero-downtime deployments many times a day.",
      "Fast rollback limits the impact of bad releases, improving the DORA 'time to restore' metric.",
      "# Common mistakes",
      "No readiness probe, so Kubernetes considers pods ready instantly and sends traffic to broken or still-starting pods.",
      "Using the `latest` tag, so changing the image does not change the pod template and nothing rolls out (or rollbacks are meaningless).",
      "Assuming Kubernetes auto-rolls back failed rollouts — it does not; you or your tooling must undo it.",
      "Database migrations that are not backward compatible, breaking old pods still running during the rollout.",
      "# Say this in the interview",
      "Changing a Deployment's pod template creates a new ReplicaSet, and pods are replaced gradually. maxSurge controls how many extra pods are allowed during the rollout and maxUnavailable how many may be down, and readiness probes gate progress so traffic only reaches healthy new pods. I use kubectl rollout status, history and undo to watch, inspect and roll back. The alternative Recreate strategy kills all old pods before starting new ones, which causes downtime.",
      "Follow-up: How would you do a canary release?",
      "  Use Argo Rollouts or Flagger, or a service mesh/Gateway API traffic split, to send a small percentage of traffic to the new version and promote it based on metrics.",
    ],
    code: `# deployment strategy excerpt
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }   # never drop below 4 ready pods
  minReadySeconds: 5

# Deploy a new version
kubectl set image deployment/api api=myorg/api:1.5.0
kubectl annotate deployment/api kubernetes.io/change-cause="release 1.5.0"
kubectl rollout status deployment/api
# → Waiting for deployment "api" rollout to finish: 1 out of 4 new replicas have been updated...
# → Waiting for deployment "api" rollout to finish: 3 out of 4 new replicas have been updated...
# → deployment "api" successfully rolled out

kubectl rollout history deployment/api
# → REVISION  CHANGE-CAUSE
# → 3         release 1.4.2
# → 4         release 1.5.0

kubectl rollout undo deployment/api                 # back to revision 3
kubectl rollout undo deployment/api --to-revision=2 # or a specific one
kubectl get rs -l app=api
# → api-6c9f (1.4.2)  4 4 4     api-8d1a (1.5.0)  0 0 0`,
  },
  {
    id: 'statefulset-vs-deployment',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'StatefulSet vs Deployment?',
    a: [
      "# ELI5",
      "A Deployment is like a group of identical taxi drivers: any driver can take any customer, and if one goes home, a new one with a random name takes over.",
      "A StatefulSet is like a football team with numbered shirts: player #1 is always the goalkeeper with their own locker, and if they get injured, the replacement wears the same #1 shirt and uses the same locker.",
      "Order matters too: the team lines up #0, then #1, then #2.",
      "Deployments are for interchangeable, stateless apps; StatefulSets are for apps where each member has an identity and its own data.",
      "# What it is",
      "Stateless — the app keeps no important data locally; any instance can handle any request (web APIs, frontends).",
      "Stateful — instances store data or have roles (primary/replica) that must survive restarts (databases, Kafka, ZooKeeper, Elasticsearch).",
      "Deployment:",
      "  Pods are interchangeable with random names (`api-6c9f-x2k`).",
      "  All pods share the same PersistentVolumeClaim if any (usually none), or use external storage.",
      "  Pods are created, deleted and updated in parallel, in any order.",
      "StatefulSet:",
      "  Stable, ordered identities: pods are named `<name>-0`, `<name>-1`, `<name>-2`, and a replacement keeps the same name.",
      "  Stable network identity via a headless Service (`clusterIP: None`): each pod gets its own DNS name like `db-0.db.default.svc.cluster.local`.",
      "  Per-pod storage via `volumeClaimTemplates`: each pod gets its own PersistentVolumeClaim (PVC — a request for a disk) such as `data-db-0`, which follows the pod even if it is rescheduled to another node.",
      "  Ordered operations by default: created 0 → 1 → 2 (each must be ready first), scaled down in reverse 2 → 1 → 0, and rolling updates go from the highest ordinal down. `podManagementPolicy: Parallel` relaxes start-up ordering.",
      "  Deleting or scaling down a StatefulSet does not delete its PVCs by default (data safety); `persistentVolumeClaimRetentionPolicy` controls this.",
      "Comparison:",
      "  Pod names — Deployment: random. StatefulSet: stable ordinal (`db-0`).",
      "  Network identity — Deployment: via a Service only. StatefulSet: per-pod DNS via a headless Service.",
      "  Storage — Deployment: shared or none. StatefulSet: one PVC per pod.",
      "  Ordering — Deployment: parallel. StatefulSet: ordered.",
      "  Use for — Deployment: APIs, web servers, workers. StatefulSet: databases, Kafka, ZooKeeper, Redis clusters.",
      "# How it works",
      "Creating a StatefulSet `db` with 3 replicas:",
      "  Kubernetes creates PVC `data-db-0` and pod `db-0`, waits until it is Running and Ready.",
      "  Then `data-db-1` and `db-1`, then `db-2`.",
      "  The headless Service gives DNS records so `db-1` can find `db-0` as its primary at `db-0.db`.",
      "If node failure kills `db-1`, a new `db-1` is created (possibly on another node) and reattaches PVC `data-db-1` with the same data.",
      "The app itself still handles replication and failover; Kubernetes only provides identity and storage. Operators (e.g. CloudNativePG, Strimzi for Kafka) add that database-specific logic.",
      "# Example walkthrough",
      "The `code` defines a headless Service `db` and a StatefulSet `db` with 3 replicas of Postgres.",
      "`serviceName: db` links the StatefulSet to the headless Service for per-pod DNS.",
      "`volumeClaimTemplates` requests a 10Gi disk per pod.",
      "`kubectl get pods` shows `db-0`, `db-1`, `db-2` created in order; `kubectl get pvc` shows `data-db-0..2`.",
      "Deleting `db-1` brings back a new pod with the same name and the same PVC; `nslookup db-0.db` returns that pod's IP.",
      "# Why it matters / when to use",
      "Use a Deployment for anything stateless — the vast majority of backend services.",
      "Use a StatefulSet when each instance needs a stable identity or its own persistent data.",
      "In production many teams prefer managed databases (RDS, Cloud SQL) over running databases in Kubernetes, or use mature operators.",
      "# Common mistakes",
      "Running a database as a Deployment with a single shared volume, causing data corruption or scheduling failures when replicas > 1.",
      "Forgetting the headless Service, so pods do not get stable DNS names.",
      "Expecting StatefulSets to provide replication or backups automatically — they do not.",
      "Deleting the StatefulSet and assuming data is gone (PVCs remain) or, worse, deleting PVCs and losing data.",
      "# Say this in the interview",
      "A Deployment manages interchangeable stateless pods with random names and shared or no storage. A StatefulSet gives each pod a stable identity, like db-0 and db-1, with stable DNS through a headless Service, and each pod gets its own PersistentVolumeClaim from volumeClaimTemplates that follows it if it is rescheduled. Creation, scaling and updates are ordered and one at a time, which suits databases, Kafka and ZooKeeper.",
      "Follow-up: Does a StatefulSet make a database highly available?",
      "  No; it gives identity and storage, but replication and failover come from the database itself or an operator.",
    ],
    code: `apiVersion: v1
kind: Service
metadata: { name: db }
spec: { clusterIP: None, selector: { app: db }, ports: [{ port: 5432 }] }   # headless
---
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: db }
spec:
  serviceName: db                       # per-pod DNS: db-0.db, db-1.db ...
  replicas: 3
  selector: { matchLabels: { app: db } }
  template:
    metadata: { labels: { app: db } }
    spec:
      containers:
        - name: postgres
          image: postgres:16
          env: [{ name: POSTGRES_PASSWORD, value: example }]
          volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]
  volumeClaimTemplates:                 # one PVC per pod
    - metadata: { name: data }
      spec: { accessModes: [ReadWriteOnce], resources: { requests: { storage: 10Gi } } }

# kubectl get pods -l app=db    → db-0, db-1, db-2   (created in order)
# kubectl get pvc               → data-db-0, data-db-1, data-db-2
# kubectl delete pod db-1       → a NEW db-1 appears, reattached to data-db-1
# kubectl run t --rm -it --image=busybox -- nslookup db-0.db
# → Address: 10.244.1.12        (stable name for pod db-0)`,
  },
];
