import type { BankQuestion } from './types';

export const DEVOPS: BankQuestion[] = [
  // ───────────────────────── DevOps & SDLC Concepts ─────────────────────────
  {
    id: 'what-is-devops',
    group: 'DevOps & SDLC Concepts',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is DevOps and why do teams adopt it?',
    a: [
      'A culture + set of practices that unites development and operations to ship software faster and more reliably.',
      'Core practices: CI/CD, Infrastructure as Code, automated testing, monitoring/observability, fast feedback loops.',
      'Breaks silos: the team that builds a service also runs it ("you build it, you run it").',
      'Goals: shorter lead time, frequent small releases, lower change-failure rate, faster recovery (MTTR).',
      'Not a job title or a tool; tools (Docker, k8s, Terraform, Jenkins) only enable the culture.',
    ],
  },
  {
    id: 'microservices-vs-monolith',
    group: 'DevOps & SDLC Concepts',
    stars: 5,
    difficulty: 'Medium',
    q: 'Monolith vs microservices: what are the trade-offs?',
    a: [
      'Monolith: one deployable unit; simple to develop, test and deploy early on, but scales and releases as a whole.',
      'Microservices: small, independently deployable services owning their data, communicating over HTTP/gRPC/queues.',
      'Pros of microservices: independent scaling and deploys, team autonomy, fault isolation, polyglot tech.',
      'Cons: distributed-system complexity (network failures, eventual consistency), harder debugging, ops overhead.',
      'Needs mature DevOps: CI/CD per service, containers/orchestration, tracing, service discovery, API versioning.',
      'Common advice: start with a modular monolith, split out services when team/scale boundaries are clear.',
    ],
  },
  {
    id: 'dora-metrics',
    group: 'DevOps & SDLC Concepts',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are the DORA metrics?',
    a: [
      'Four key metrics from the DevOps Research and Assessment team for measuring delivery performance.',
      'Deployment frequency: how often you release to production.',
      'Lead time for changes: time from commit to running in production.',
      'Change failure rate: % of deployments causing a failure needing remediation.',
      'Time to restore service (MTTR): how fast you recover from an incident.',
      'First two measure throughput, last two measure stability; elite teams do well on both.',
    ],
  },
  {
    id: 'shift-left',
    group: 'DevOps & SDLC Concepts',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does "shift left" mean?',
    a: [
      'Move testing, security and quality checks earlier in the SDLC (left on the timeline), close to the developer.',
      'Examples: unit tests + linting in pre-commit/CI, SAST and dependency scans on every PR, IaC policy checks.',
      'Bugs found earlier are much cheaper and faster to fix than bugs found in staging or production.',
      'Complemented by "shift right": testing in production via canaries, feature flags, observability.',
    ],
  },
  {
    id: 'immutable-infrastructure',
    group: 'DevOps & SDLC Concepts',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is immutable infrastructure?',
    a: [
      'Servers/containers are never modified after deploy; to change anything you build a new image and replace the old one.',
      'Avoids configuration drift and "snowflake" servers that nobody can reproduce.',
      'Implemented with baked images (Docker images, AMIs via Packer) + IaC + rolling/blue-green replacement.',
      'Rollback = redeploy the previous image version; every environment is reproducible.',
    ],
  },
  {
    id: 'twelve-factor-app',
    group: 'DevOps & SDLC Concepts',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is the Twelve-Factor App methodology?',
    a: [
      'A set of principles for building cloud-native, portable, scalable services.',
      'Key factors: one codebase per app, explicit dependencies, config in environment variables, stateless processes.',
      'Backing services (DB, cache) as attached resources; strict build/release/run separation.',
      'Port binding, scale out via processes, fast startup + graceful shutdown (disposability).',
      'Dev/prod parity, logs as event streams to stdout, admin tasks as one-off processes.',
    ],
  },
  {
    id: 'pets-vs-cattle',
    group: 'DevOps & SDLC Concepts',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does "pets vs cattle" mean in infrastructure?',
    a: [
      'Pets: hand-named, hand-configured servers that are nursed back to health when sick.',
      'Cattle: identical, numbered instances created from automation; if one is unhealthy, replace it.',
      'Modern cloud/k8s infra treats servers as cattle: auto-scaling groups, pods, immutable images.',
      'Stateful systems (databases) still need extra care, often via managed services or StatefulSets.',
    ],
  },
  {
    id: 'devops-vs-agile',
    group: 'DevOps & SDLC Concepts',
    stars: 1,
    difficulty: 'Easy',
    q: 'How does DevOps relate to Agile?',
    a: [
      'Agile focuses on iterative development and collaboration between business and developers.',
      'DevOps extends that collaboration to operations, covering build, deploy and run.',
      'Agile makes small increments possible; DevOps makes shipping those increments to production fast and safe.',
    ],
  },

  // ───────────────────────── Linux & Networking ─────────────────────────
  {
    id: 'url-request-flow',
    group: 'Linux & Networking',
    stars: 5,
    difficulty: 'Medium',
    q: 'What happens when you type a URL into the browser and press Enter?',
    a: [
      'DNS: browser/OS cache, then resolver queries root, TLD and authoritative servers to get the IP.',
      'TCP 3-way handshake (SYN, SYN-ACK, ACK) to the IP on port 443 (or QUIC/UDP for HTTP/3).',
      'TLS handshake: certificate validation, key exchange, session keys agreed.',
      'HTTP request sent; often hits a CDN / load balancer / reverse proxy before the app server.',
      'Server responds (status, headers, body); browser parses HTML, fetches CSS/JS/images, renders the page.',
    ],
  },
  {
    id: 'tcp-vs-udp',
    group: 'Linux & Networking',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between TCP and UDP?',
    a: [
      'TCP: connection-oriented, reliable, ordered delivery with retransmits, flow and congestion control.',
      'UDP: connectionless, no delivery/order guarantees, lower overhead and latency.',
      'TCP use cases: HTTP/1.1 and HTTP/2, SSH, databases, SMTP.',
      'UDP use cases: DNS queries, video/voice streaming, gaming, QUIC (HTTP/3 builds reliability on top of UDP).',
    ],
  },
  {
    id: 'linux-high-cpu-troubleshooting',
    group: 'Linux & Networking',
    stars: 4,
    difficulty: 'Medium',
    q: 'A Linux server is slow / at high CPU. How do you troubleshoot?',
    a: [
      'Check load and top consumers: `uptime`, `top`/`htop`, `ps aux --sort=-%cpu | head`.',
      'Memory and swap: `free -h`, `vmstat 1`; OOM kills in `dmesg -T` or `journalctl -k`.',
      'Disk I/O: `iostat -x 1`, `iotop`; high iowait means storage is the bottleneck, not CPU.',
      'Network: `ss -tulpn`, `netstat`, `iftop`; check connection counts and errors.',
      'Then drill into the process: logs, `strace -p`, `lsof -p`, thread dumps / profilers.',
    ],
  },
  {
    id: 'linux-file-permissions',
    group: 'Linux & Networking',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain Linux file permissions and chmod.',
    a: [
      'Three classes: owner (u), group (g), others (o); three bits each: read (4), write (2), execute (1).',
      '`chmod 755 file` = rwx for owner, r-x for group and others; `chmod 600` = owner read/write only (SSH keys).',
      'Symbolic form: `chmod u+x script.sh`, `chmod go-w file`.',
      '`chown user:group file` changes ownership; directories need x to be entered.',
      'Special bits: setuid, setgid, sticky bit (e.g. /tmp is 1777 so users cannot delete others files).',
    ],
  },
  {
    id: 'load-balancer-l4-vs-l7',
    group: 'Linux & Networking',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a load balancer? L4 vs L7?',
    a: [
      'Distributes traffic across healthy backends for scalability and availability, using health checks.',
      'L4 (transport): routes by IP/port, very fast, protocol-agnostic (e.g. AWS NLB).',
      'L7 (application): understands HTTP, routes by host/path/headers, TLS termination, sticky sessions (e.g. ALB, Nginx).',
      'Algorithms: round robin, least connections, IP hash, weighted.',
    ],
  },
  {
    id: 'forward-vs-reverse-proxy',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Easy',
    q: 'Forward proxy vs reverse proxy?',
    a: [
      'Forward proxy sits in front of clients and makes requests on their behalf (corporate egress, filtering, anonymity).',
      'Reverse proxy sits in front of servers and receives requests on their behalf (Nginx, HAProxy, Envoy).',
      'Reverse proxy uses: load balancing, TLS termination, caching, compression, rate limiting, hiding backends.',
    ],
  },
  {
    id: 'disk-full-troubleshooting',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Medium',
    q: 'The disk is full on a server. How do you investigate?',
    a: [
      '`df -h` to find the full filesystem; `df -i` to check inode exhaustion (many tiny files).',
      '`du -sh /* | sort -h` (or `ncdu`) to find large directories; often logs, Docker images, core dumps.',
      'Deleted-but-open files still use space: `lsof +L1`; restart or truncate the process holding them.',
      'Fix root cause: logrotate, `docker system prune`, retention policies, monitoring alerts on disk usage.',
    ],
  },
  {
    id: 'http-status-codes',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Easy',
    q: 'Explain the common HTTP status code classes.',
    a: [
      '2xx success: 200 OK, 201 Created, 204 No Content.',
      '3xx redirect: 301 permanent, 302/307 temporary, 304 Not Modified.',
      '4xx client error: 400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 429 rate limited.',
      '5xx server error: 500 internal, 502 bad gateway (upstream failed), 503 unavailable, 504 gateway timeout.',
      '502/504 from a load balancer usually means the backend is down, crashing or too slow.',
    ],
  },
  {
    id: 'process-signals',
    group: 'Linux & Networking',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are SIGTERM, SIGKILL and SIGHUP?',
    a: [
      'SIGTERM (15): polite shutdown request; process can catch it and clean up. Default for `kill` and `docker stop`.',
      'SIGKILL (9): immediate kill by the kernel; cannot be caught, no cleanup.',
      'SIGHUP (1): terminal hangup; many daemons use it to reload config (e.g. nginx).',
      'SIGINT (2): Ctrl+C. Graceful shutdown means handling SIGTERM, draining connections, then exiting.',
    ],
  },
  {
    id: 'ssh-key-auth',
    group: 'Linux & Networking',
    stars: 2,
    difficulty: 'Easy',
    q: 'How does SSH key-based authentication work?',
    a: [
      'Generate a key pair (`ssh-keygen -t ed25519`); public key goes in the server `~/.ssh/authorized_keys`.',
      'Server challenges the client, which proves it holds the private key without sending it.',
      'Harden: disable password and root login, use a bastion/jump host or SSM, rotate keys.',
      'Private key permissions must be 600 or SSH refuses to use it.',
    ],
  },
  {
    id: 'cidr-subnetting',
    group: 'Linux & Networking',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is CIDR notation and how do you compute subnet size?',
    a: [
      '`10.0.0.0/16` means the first 16 bits are the network part; remaining 16 bits are hosts.',
      'Number of addresses = 2^(32 - prefix): /16 = 65,536, /24 = 256, /28 = 16.',
      'Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
      'AWS reserves 5 IPs per subnet; plan VPC CIDRs so they do not overlap (needed for peering/VPN).',
    ],
  },
  {
    id: 'hard-vs-soft-link',
    group: 'Linux & Networking',
    stars: 2,
    difficulty: 'Easy',
    q: 'Hard link vs soft (symbolic) link?',
    a: [
      'Hard link: another directory entry pointing to the same inode; survives deletion of the original name.',
      'Hard links cannot cross filesystems or point to directories.',
      'Soft link: a separate file containing a path; breaks (dangles) if the target is removed. `ln -s target link`.',
    ],
  },

  // ───────────────────────── Git & Version Control ─────────────────────────
  {
    id: 'merge-vs-rebase',
    group: 'Git & Version Control',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between git merge and git rebase?',
    a: [
      'Merge combines branches with a merge commit; preserves full history exactly as it happened.',
      'Rebase replays your commits on top of another branch, rewriting their hashes for a linear history.',
      'Golden rule: never rebase commits that are already pushed and shared with others.',
      'Common flow: rebase your local feature branch on main to stay current, then merge (or squash-merge) via PR.',
      'Interactive rebase (`git rebase -i`) squashes, reorders or edits commits before sharing.',
    ],
  },
  {
    id: 'branching-strategies',
    group: 'Git & Version Control',
    stars: 4,
    difficulty: 'Medium',
    q: 'Compare Git branching strategies: GitFlow, GitHub Flow, trunk-based.',
    a: [
      'GitFlow: long-lived main + develop, plus feature/release/hotfix branches; suits versioned releases, heavy process.',
      'GitHub Flow: main is always deployable; short-lived feature branches merged via PR, deploy after merge.',
      'Trunk-based: everyone commits to trunk at least daily with tiny branches; unfinished work hidden by feature flags.',
      'Trunk-based best supports CI/CD and is what DORA research associates with high performers.',
    ],
  },
  {
    id: 'git-reset-vs-revert',
    group: 'Git & Version Control',
    stars: 4,
    difficulty: 'Medium',
    q: 'git reset vs git revert?',
    a: [
      '`git revert <sha>` creates a new commit that undoes a previous one; safe for shared/pushed history.',
      '`git reset` moves the branch pointer back, rewriting history; use only on local, unpushed commits.',
      '`--soft` keeps changes staged, `--mixed` (default) keeps them unstaged, `--hard` discards them.',
      'Lost something after a hard reset? `git reflog` shows previous HEAD positions to recover.',
    ],
  },
  {
    id: 'git-fetch-vs-pull',
    group: 'Git & Version Control',
    stars: 3,
    difficulty: 'Easy',
    q: 'git fetch vs git pull?',
    a: [
      '`git fetch` downloads remote commits and updates remote-tracking branches (origin/main) without touching your work.',
      '`git pull` = fetch + merge (or rebase with `--rebase` / `pull.rebase=true`) into the current branch.',
      'Fetch first when you want to inspect incoming changes before integrating them.',
    ],
  },
  {
    id: 'resolve-merge-conflict',
    group: 'Git & Version Control',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you resolve a merge conflict?',
    a: [
      'Conflicts happen when both branches change the same lines; Git marks them with <<<<<<<, =======, >>>>>>>.',
      'Edit the file to the intended result, remove markers, `git add` it, then `git commit` / `git rebase --continue`.',
      'Use `git status` to see conflicted files and a merge tool / IDE for 3-way view.',
      'Abort with `git merge --abort` or `git rebase --abort`. Prevent with small PRs and frequent syncing.',
    ],
  },
  {
    id: 'git-cherry-pick-stash',
    group: 'Git & Version Control',
    stars: 2,
    difficulty: 'Easy',
    q: 'What do git cherry-pick and git stash do?',
    a: [
      '`git cherry-pick <sha>` applies a specific commit onto the current branch (e.g. backport a hotfix to a release branch).',
      '`git stash` shelves uncommitted changes so you can switch branches; `git stash pop` reapplies them.',
      '`git stash list` / `git stash apply stash@{1}` manage multiple stashes; `-u` includes untracked files.',
    ],
  },
  {
    id: 'git-bisect',
    group: 'Git & Version Control',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is git bisect?',
    a: [
      'Binary-searches history to find the commit that introduced a bug.',
      '`git bisect start`, mark `bad` and a known `good` commit, then test each commit Git checks out.',
      '`git bisect run ./test.sh` automates it; finishes in about log2(N) steps.',
    ],
  },

  // ───────────────────────── Docker & Containers ─────────────────────────
  {
    id: 'container-vs-vm',
    group: 'Docker & Containers',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between a container and a virtual machine?',
    a: [
      'A VM virtualises hardware and runs a full guest OS on a hypervisor; a container shares the host kernel and isolates processes.',
      'Isolation: containers use Linux namespaces (pid, net, mnt…) + cgroups for resource limits.',
      'Containers start in milliseconds and are MBs in size; VMs take longer to boot and are GBs.',
      'VMs give stronger isolation (separate kernel); containers are denser and better for microservices / CI.',
    ],
  },
  {
    id: 'dockerfile-best-practices',
    group: 'Docker & Containers',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are Dockerfile best practices?',
    a: [
      'Use small, pinned base images (`node:22-alpine`, distroless, or a digest) instead of `latest`.',
      'Order instructions from least to most frequently changing; copy dependency manifests before source for caching.',
      'Use multi-stage builds so build tools never reach the final image.',
      'Run as a non-root `USER`, add a `.dockerignore`, never bake secrets into layers (use build secrets).',
      'Combine RUN steps and clean package caches; one main process per container; add a HEALTHCHECK where useful.',
    ],
    code: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
  },
  {
    id: 'image-vs-container',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between a Docker image and a container?',
    a: [
      'Image: an immutable, layered, read-only template (filesystem + metadata) built from a Dockerfile.',
      'Container: a running (or stopped) instance of an image, with a thin writable layer on top.',
      'Many containers can run from one image; data written in the container layer is lost when it is removed.',
      'Images are stored/distributed via registries (Docker Hub, ECR, GHCR) and identified by tag or digest.',
    ],
  },
  {
    id: 'multi-stage-builds',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are multi-stage builds and why use them?',
    a: [
      'Multiple FROM stages in one Dockerfile; later stages copy only needed artifacts from earlier ones.',
      'Compilers, dev dependencies and source never ship, so images are much smaller and have less attack surface.',
      'Common for Go/Java/Node/React: build in a full SDK image, run on alpine/distroless.',
    ],
    code: `FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd/api

FROM gcr.io/distroless/static
COPY --from=build /app /app
ENTRYPOINT ["/app"]`,
  },
  {
    id: 'cmd-vs-entrypoint',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Medium',
    q: 'CMD vs ENTRYPOINT (and RUN)?',
    a: [
      'RUN executes at build time and creates a layer; CMD/ENTRYPOINT define what runs at container start.',
      'ENTRYPOINT sets the fixed executable; CMD provides default args that `docker run image <args>` overrides.',
      'Combined: `ENTRYPOINT ["python","app.py"]` + `CMD ["--port","8080"]`.',
      'Prefer exec form (JSON array) so the process is PID 1 and receives signals; shell form wraps in `/bin/sh -c`.',
    ],
  },
  {
    id: 'docker-layer-caching',
    group: 'Docker & Containers',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do Docker image layers and build caching work?',
    a: [
      'Each Dockerfile instruction (RUN, COPY, ADD) creates a layer; layers are content-addressed and shared between images.',
      'On rebuild, Docker reuses cached layers until an instruction or its input files change; everything after is rebuilt.',
      'So copy `package.json` and install deps before `COPY . .` to avoid reinstalling on every code change.',
      'In CI use BuildKit cache exports (`--cache-to/--cache-from`, registry or GHA cache) to persist cache across runs.',
    ],
  },
  {
    id: 'docker-volumes',
    group: 'Docker & Containers',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you persist data in Docker? Volumes vs bind mounts?',
    a: [
      'Container writable layer is ephemeral; persist data outside it.',
      'Named volumes: managed by Docker (`-v pgdata:/var/lib/postgresql/data`), portable, preferred for DBs.',
      'Bind mounts: map a host path (`-v $(pwd):/app`), great for local dev hot-reload, host-dependent.',
      'tmpfs mounts: in-memory, for sensitive or scratch data.',
    ],
  },
  {
    id: 'docker-networking',
    group: 'Docker & Containers',
    stars: 3,
    difficulty: 'Medium',
    q: 'Explain Docker networking modes.',
    a: [
      'bridge (default): private network on the host; publish ports with `-p 8080:80`.',
      'User-defined bridge networks provide built-in DNS so containers reach each other by name.',
      'host: container shares the host network stack (no isolation, no port mapping).',
      'none: no networking; overlay: multi-host networking (Swarm); macvlan: container gets its own MAC/IP on the LAN.',
    ],
  },
  {
    id: 'docker-compose',
    group: 'Docker & Containers',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is Docker Compose used for?',
    a: [
      'Defines and runs multi-container apps from a single YAML file (`compose.yaml`).',
      'Declares services, networks, volumes, env, healthchecks and `depends_on` ordering.',
      '`docker compose up -d` / `down`; ideal for local dev and integration tests, not production orchestration at scale.',
    ],
    code: `services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on: [db]
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:`,
  },
  {
    id: 'copy-vs-add',
    group: 'Docker & Containers',
    stars: 2,
    difficulty: 'Easy',
    q: 'COPY vs ADD in a Dockerfile?',
    a: [
      'COPY copies local files/dirs into the image; simple and predictable.',
      'ADD also auto-extracts local tar archives and can fetch remote URLs.',
      'Best practice: prefer COPY; use ADD only when you need tar extraction.',
    ],
  },
  {
    id: 'namespaces-cgroups',
    group: 'Docker & Containers',
    stars: 2,
    difficulty: 'Hard',
    q: 'What Linux features make containers possible?',
    a: [
      'Namespaces isolate what a process can see: pid, net, mnt, uts, ipc, user, cgroup.',
      'cgroups limit and account resources: CPU, memory, I/O, pids (e.g. `--memory=512m`, `--cpus=1`).',
      'Union/overlay filesystems (overlay2) stack image layers with a writable top layer.',
      'Security add-ons: capabilities, seccomp profiles, AppArmor/SELinux, rootless containers.',
    ],
  },
  {
    id: 'container-pid1',
    group: 'Docker & Containers',
    stars: 2,
    difficulty: 'Hard',
    q: 'Why does PID 1 matter inside a container?',
    a: [
      'The main process runs as PID 1, which gets no default signal handlers; it may ignore SIGTERM.',
      'If it ignores SIGTERM, `docker stop` waits the grace period (10s) and then SIGKILLs it.',
      'PID 1 must also reap zombie child processes.',
      'Fixes: exec-form CMD, handle SIGTERM in the app, or use a tiny init (`docker run --init`, tini).',
    ],
  },

  // ───────────────────────── Kubernetes ─────────────────────────
  {
    id: 'k8s-architecture',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain the Kubernetes architecture.',
    a: [
      'Control plane: kube-apiserver (front door, all state changes), etcd (key-value store of cluster state).',
      'kube-scheduler assigns pods to nodes; kube-controller-manager runs reconcile loops (Deployments, nodes...).',
      'Worker nodes: kubelet (runs pods via the container runtime), kube-proxy (Service networking), containerd/CRI-O.',
      'Declarative model: you submit desired state; controllers continuously reconcile actual state toward it.',
      'Add-ons: CoreDNS, CNI plugin (Calico, Cilium), ingress controller, metrics-server.',
    ],
  },
  {
    id: 'pod-deployment-service',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are a Pod, ReplicaSet, Deployment and Service?',
    a: [
      'Pod: smallest deployable unit; one or more containers sharing network namespace (IP) and volumes. Ephemeral.',
      'ReplicaSet: keeps N identical pod replicas running.',
      'Deployment: manages ReplicaSets, adding rolling updates, rollbacks and scaling for stateless apps.',
      'Service: stable virtual IP + DNS name that load-balances to pods selected by labels.',
    ],
    code: `apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: myorg/api:1.4.2`,
  },
  {
    id: 'k8s-service-types',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are the Kubernetes Service types?',
    a: [
      'ClusterIP (default): internal virtual IP reachable only inside the cluster.',
      'NodePort: exposes the service on a static port (30000-32767) on every node.',
      'LoadBalancer: provisions a cloud load balancer pointing at the service.',
      'ExternalName: DNS CNAME to an external host. Headless (`clusterIP: None`): DNS returns pod IPs directly.',
      'For HTTP routing of many services behind one LB, use Ingress / Gateway API instead of many LoadBalancers.',
    ],
  },
  {
    id: 'liveness-readiness-probes',
    group: 'Kubernetes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Liveness vs readiness vs startup probes?',
    a: [
      'Liveness: is the container alive? Failing restarts the container (deadlocks, hung process).',
      'Readiness: can it serve traffic? Failing removes the pod from Service endpoints, no restart.',
      'Startup: protects slow-starting apps; liveness/readiness only begin after it succeeds.',
      'Probe types: httpGet, tcpSocket, exec, grpc. Do not make liveness depend on external deps (causes cascading restarts).',
    ],
    code: `readinessProbe:
  httpGet: { path: /ready, port: 3000 }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /healthz, port: 3000 }
  initialDelaySeconds: 10
  failureThreshold: 3`,
  },
  {
    id: 'configmap-vs-secret',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Easy',
    q: 'ConfigMap vs Secret?',
    a: [
      'Both decouple configuration from images; injected as env vars or mounted files.',
      'ConfigMap: non-sensitive config (feature toggles, URLs, config files).',
      'Secret: sensitive data; only base64-encoded by default, not encrypted.',
      'Secure secrets: enable etcd encryption at rest, RBAC restrictions, or external stores (Vault, External Secrets, Sealed Secrets).',
      'Mounted files update on change; env vars require a pod restart.',
    ],
  },
  {
    id: 'requests-limits',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are resource requests and limits?',
    a: [
      'Request: guaranteed amount used by the scheduler to place the pod on a node.',
      'Limit: maximum allowed. Exceeding the CPU limit causes throttling; exceeding memory causes OOMKill.',
      'QoS classes: Guaranteed (requests = limits), Burstable, BestEffort (none set; evicted first).',
      'Enforce defaults with LimitRange and per-namespace caps with ResourceQuota.',
    ],
    code: `resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits:   { memory: 512Mi }`,
  },
  {
    id: 'crashloopbackoff-debug',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'A pod is in CrashLoopBackOff. How do you debug it?',
    a: [
      'The container keeps exiting and kubelet restarts it with exponential back-off.',
      '`kubectl describe pod` for events, exit codes (137 = OOMKilled/SIGKILL, 1 = app error).',
      '`kubectl logs <pod> --previous` to see logs of the crashed container.',
      'Common causes: bad config/env, missing secret, failing liveness probe, wrong command, OOM, dependency down.',
      'Other states: ImagePullBackOff (wrong image/registry auth), Pending (insufficient resources, unbound PVC, taints).',
    ],
  },
  {
    id: 'k8s-ingress',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is an Ingress?',
    a: [
      'API object defining L7 HTTP(S) routing rules (host/path) from outside the cluster to Services.',
      'Needs an Ingress controller to implement it (ingress-nginx, Traefik, AWS Load Balancer Controller).',
      'Handles TLS termination (often with cert-manager) and lets one load balancer front many services.',
      'Gateway API is the newer, more expressive successor (Gateway, HTTPRoute).',
    ],
  },
  {
    id: 'hpa-autoscaling',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does autoscaling work in Kubernetes?',
    a: [
      'HPA: scales pod replicas based on CPU/memory (via metrics-server) or custom/external metrics.',
      'VPA: adjusts pod requests/limits to match actual usage.',
      'Cluster Autoscaler / Karpenter: add or remove nodes when pods are unschedulable or nodes underused.',
      'HPA needs resource requests set; KEDA enables event-driven scaling (queue length, to zero).',
    ],
    code: `kubectl autoscale deployment api --cpu-percent=70 --min=2 --max=10`,
  },
  {
    id: 'rolling-update-rollback',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do rolling updates and rollbacks work for a Deployment?',
    a: [
      'Changing the pod template creates a new ReplicaSet; pods are replaced gradually.',
      '`maxSurge` = extra pods allowed during rollout, `maxUnavailable` = pods that may be down.',
      'Readiness probes gate progress so traffic only reaches healthy new pods.',
      '`kubectl rollout status|history|undo deployment/api` to watch, inspect and roll back.',
      'Alternative strategy: Recreate (kill all, then start new; causes downtime).',
    ],
  },
  {
    id: 'statefulset-vs-deployment',
    group: 'Kubernetes',
    stars: 4,
    difficulty: 'Medium',
    q: 'StatefulSet vs Deployment?',
    a: [
      'Deployment: interchangeable stateless pods with random names, shared or no storage.',
      'StatefulSet: stable identities (db-0, db-1), stable DNS via a headless service.',
      'Each pod gets its own PersistentVolumeClaim (volumeClaimTemplates) that follows it on reschedule.',
      'Ordered, one-at-a-time creation, scaling and updates. Used for databases, Kafka, ZooKeeper.',
    ],
  },
  {
    id: 'daemonset-job-cronjob',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are DaemonSets, Jobs and CronJobs?',
    a: [
      'DaemonSet: runs one pod per (matching) node; log collectors, monitoring agents, CNI.',
      'Job: runs pods to completion with retries (backoffLimit) and parallelism; migrations, batch work.',
      'CronJob: creates Jobs on a cron schedule; backups, reports, cleanup.',
    ],
  },
  {
    id: 'pv-pvc-storageclass',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Medium',
    q: 'Explain PersistentVolume, PersistentVolumeClaim and StorageClass.',
    a: [
      'PV: a piece of storage in the cluster (EBS, NFS...), lifecycle independent of pods.',
      'PVC: a pod request for storage (size, access mode); binds to a matching PV.',
      'StorageClass: enables dynamic provisioning; PVC creation automatically creates a PV via a CSI driver.',
      'Access modes: ReadWriteOnce, ReadOnlyMany, ReadWriteMany. Reclaim policy: Retain or Delete.',
    ],
  },
  {
    id: 'helm',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is Helm?',
    a: [
      'Package manager for Kubernetes; a chart is a templated bundle of manifests plus `values.yaml`.',
      'Override values per environment: `helm upgrade --install api ./chart -f values-prod.yaml`.',
      'Tracks releases with revision history: `helm rollback api 3`.',
      'Alternative: Kustomize (template-free overlays, built into kubectl).',
    ],
  },
  {
    id: 'k8s-rbac-namespaces',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do namespaces and RBAC work in Kubernetes?',
    a: [
      'Namespaces logically partition a cluster (teams, environments); scope names, quotas and policies.',
      'RBAC: Role (namespaced) / ClusterRole (cluster-wide) list allowed verbs on resources.',
      'RoleBinding / ClusterRoleBinding grant a role to users, groups or ServiceAccounts.',
      'Pods authenticate to the API via ServiceAccounts; apply least privilege. Check with `kubectl auth can-i`.',
    ],
  },
  {
    id: 'taints-tolerations-affinity',
    group: 'Kubernetes',
    stars: 2,
    difficulty: 'Hard',
    q: 'Taints/tolerations vs node affinity?',
    a: [
      'Taints on nodes repel pods; only pods with a matching toleration may schedule there (e.g. GPU or control-plane nodes).',
      'Node affinity / nodeSelector attract pods to nodes with certain labels (required or preferred).',
      'Pod (anti-)affinity co-locates or spreads pods relative to other pods; topologySpreadConstraints spread across zones.',
      'Taints keep pods off; affinity pulls pods toward. Often used together for dedicated node pools.',
    ],
  },

  // ───────────────────────── CI/CD ─────────────────────────
  {
    id: 'cicd-pipeline-stages',
    group: 'CI/CD',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is a CI/CD pipeline and what stages does it typically have?',
    a: [
      'Automated path from commit to production, triggered by pushes/PRs.',
      'CI stages: checkout, install deps, lint/static analysis, unit tests, build, security scans.',
      'Package: build a versioned artifact/Docker image and push to a registry.',
      'CD stages: deploy to dev/staging, integration/e2e tests, approval gate (optional), deploy to prod.',
      'Post-deploy: smoke tests, monitoring, automatic rollback on failure. Fail fast: cheapest checks first.',
    ],
  },
  {
    id: 'continuous-delivery-vs-deployment',
    group: 'CI/CD',
    stars: 5,
    difficulty: 'Easy',
    q: 'Continuous Integration vs Continuous Delivery vs Continuous Deployment?',
    a: [
      'Continuous Integration: developers merge to main frequently; every change is automatically built and tested.',
      'Continuous Delivery: every change that passes is releasable; production deploy needs a manual approval.',
      'Continuous Deployment: every passing change deploys to production automatically, no human gate.',
      'Deployment requires strong automated tests, monitoring, feature flags and fast rollback.',
    ],
  },
  {
    id: 'blue-green-vs-canary',
    group: 'CI/CD',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain blue-green, canary and rolling deployments.',
    a: [
      'Blue-green: two identical environments; deploy to idle (green), switch traffic at the LB/DNS. Instant rollback, 2x cost.',
      'Canary: route a small % of traffic (1%, 10%, 50%...) to the new version, watch metrics, then promote or abort.',
      'Rolling: replace instances in batches; no extra infra, but old and new versions run side by side.',
      'Canary limits blast radius best; tools: Argo Rollouts, Flagger, service mesh, ALB weighted target groups.',
      'All require backward-compatible DB schema changes because two versions may run at once.',
    ],
  },
  {
    id: 'github-actions-basics',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain the structure of a GitHub Actions workflow.',
    a: [
      'Workflows are YAML files in `.github/workflows/`, triggered by events (`push`, `pull_request`, `schedule`, `workflow_dispatch`).',
      'A workflow has jobs (run in parallel by default, `needs:` for ordering) executing on runners.',
      'Jobs contain steps: `uses:` reusable actions or `run:` shell commands.',
      'Secrets via `secrets.*`, matrix builds for multiple versions, caching, environments with protection rules, OIDC to clouds.',
    ],
    code: `on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npm test
        env:
          API_KEY: \${{ secrets.API_KEY }}`,
  },
  {
    id: 'secrets-in-pipelines',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you handle secrets in a CI/CD pipeline?',
    a: [
      'Never commit secrets; use the CI secret store (GitHub/GitLab secrets, Jenkins credentials) which masks them in logs.',
      'Prefer short-lived credentials: OIDC federation from CI to AWS/GCP/Azure instead of static access keys.',
      'Fetch runtime secrets from Vault / AWS Secrets Manager at deploy or startup.',
      'Scope secrets per environment with approval rules; rotate regularly; run secret scanners (gitleaks, push protection).',
    ],
  },
  {
    id: 'feature-flags',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are feature flags and why are they useful?',
    a: [
      'Runtime toggles that enable/disable code paths without redeploying.',
      'Decouple deploy from release: merge unfinished work to trunk safely (trunk-based development).',
      'Enable gradual rollouts, A/B tests, per-user targeting, and instant kill switches.',
      'Downside: flag debt; remove stale flags. Tools: LaunchDarkly, Unleash, OpenFeature.',
    ],
  },
  {
    id: 'gitops-argocd',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is GitOps?',
    a: [
      'Git is the single source of truth for desired infrastructure/app state (declarative manifests).',
      'An in-cluster agent (Argo CD, Flux) pulls from Git and continuously reconciles the cluster to match.',
      'Pull-based: CI does not need cluster credentials; CI just updates the image tag in the config repo.',
      'Benefits: audit trail via PRs, easy rollback (git revert), drift detection and self-healing.',
    ],
  },
  {
    id: 'build-once-promote',
    group: 'CI/CD',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why "build once, deploy many" and how do you version artifacts?',
    a: [
      'Build the artifact/image once in CI and promote the same immutable artifact through dev, staging, prod.',
      'Rebuilding per environment risks differences; what you tested must be exactly what you ship.',
      'Inject environment differences via config/env vars/secrets, not by rebuilding.',
      'Tag images with git SHA and/or semver; deploy by digest; avoid mutable `latest` in production.',
    ],
  },
  {
    id: 'zero-downtime-db-migrations',
    group: 'CI/CD',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you deploy database schema changes without downtime?',
    a: [
      'Use expand-and-contract: make backward-compatible changes so old and new app versions both work.',
      'Expand: add new column/table (nullable), deploy code that writes both, backfill data in batches.',
      'Switch reads to new schema, then in a later release contract: drop old column.',
      'Run migrations as a separate pipeline step/Job with versioned tools (Flyway, Liquibase, Prisma); avoid long table locks.',
    ],
  },
  {
    id: 'jenkins-pipeline',
    group: 'CI/CD',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does a Jenkins pipeline work?',
    a: [
      'Pipeline-as-code in a `Jenkinsfile` stored in the repo; declarative syntax with `pipeline`, `agent`, `stages`, `steps`.',
      'Controller schedules builds; agents (static or ephemeral k8s/Docker agents) execute them.',
      'Multibranch pipelines auto-discover branches and PRs; shared libraries reuse code across repos.',
      'Credentials plugin for secrets; `post { always/failure }` for cleanup and notifications.',
    ],
    code: `pipeline {
  agent any
  stages {
    stage('Test')  { steps { sh 'npm ci && npm test' } }
    stage('Build') { steps { sh 'docker build -t app:$GIT_COMMIT .' } }
    stage('Deploy') { when { branch 'main' }
      steps { sh './deploy.sh' } }
  }
}`,
  },

  // ───────────────────────── Infrastructure as Code ─────────────────────────
  {
    id: 'what-is-iac',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is Infrastructure as Code and what are its benefits?',
    a: [
      'Managing infrastructure (networks, servers, DNS, k8s) through version-controlled code instead of manual console clicks.',
      'Benefits: reproducible environments, code review via PRs, audit history, faster provisioning, no drift.',
      'Provisioning tools: Terraform/OpenTofu, CloudFormation, Pulumi, CDK. Configuration management: Ansible, Chef, Puppet.',
      'Enables disaster recovery: rebuild an entire environment from code.',
    ],
  },
  {
    id: 'terraform-state',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is Terraform state and how should you manage it?',
    a: [
      'State (`terraform.tfstate`) maps resources in code to real-world IDs and caches attributes; used to compute diffs.',
      'Store remotely for teams: S3 backend (native S3 locking or DynamoDB), Terraform Cloud, GCS.',
      'Enable state locking to prevent concurrent applies corrupting it; enable versioning/encryption on the bucket.',
      'State can contain secrets: restrict access; never commit it to Git.',
      'Manipulate carefully with `terraform state list|mv|rm`, `import`, and `moved` blocks for refactors.',
    ],
    code: `terraform {
  backend "s3" {
    bucket       = "acme-tf-state"
    key          = "prod/network.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}`,
  },
  {
    id: 'terraform-workflow',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain the core Terraform workflow and commands.',
    a: [
      '`terraform init`: downloads providers/modules, configures backend.',
      '`terraform fmt` / `validate`: formatting and syntax checks.',
      '`terraform plan`: shows the diff between code, state and real infra; save with `-out=tfplan` for review.',
      '`terraform apply tfplan`: executes changes; `terraform destroy` removes everything managed.',
      'In CI: plan on PR (posted as a comment), apply on merge with approval.',
    ],
  },
  {
    id: 'terraform-vs-ansible',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 4,
    difficulty: 'Medium',
    q: 'Terraform vs Ansible: when do you use which?',
    a: [
      'Terraform: provisioning cloud resources (VPCs, DBs, clusters); declarative, keeps state, plans changes.',
      'Ansible: configuration management and app deploy on existing machines; procedural-ish YAML playbooks, agentless over SSH.',
      'Ansible is stateless (checks live state each run); Terraform relies on its state file.',
      'Common combo: Terraform creates servers, Ansible configures them (or bake images with Packer instead).',
    ],
  },
  {
    id: 'declarative-vs-imperative',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Easy',
    q: 'Declarative vs imperative infrastructure?',
    a: [
      'Declarative: describe the desired end state; the tool figures out the steps (Terraform, k8s YAML, CloudFormation).',
      'Imperative: write the exact steps/commands to run (shell scripts, `kubectl create`, AWS CLI).',
      'Declarative is idempotent and drift-correcting by design; imperative gives fine control but is harder to rerun safely.',
    ],
  },
  {
    id: 'terraform-modules',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are Terraform modules and how do variables/outputs work?',
    a: [
      'A module is a folder of .tf files; the root module calls child modules to reuse patterns (vpc, eks, rds).',
      'Inputs via `variable` blocks (with types, defaults, validation); results exposed via `output`.',
      'Source modules from local paths, Git tags or the Terraform Registry; pin versions.',
      'Use `locals` for computed values and `count`/`for_each` to create multiple instances.',
    ],
    code: `module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name    = "prod"
  cidr    = "10.0.0.0/16"
}
output "vpc_id" { value = module.vpc.vpc_id }`,
  },
  {
    id: 'terraform-drift',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is configuration drift and how do you handle it with Terraform?',
    a: [
      'Drift: real infrastructure differs from code, usually due to manual console changes.',
      'Detect: `terraform plan` (or `plan -refresh-only`) on a schedule in CI; alert when it shows changes.',
      'Resolve: either apply to revert to code, or update code to match the intended change.',
      'Prevent: restrict console write access, all changes via PR + pipeline, policy-as-code (OPA, Sentinel).',
    ],
  },
  {
    id: 'ansible-idempotency-playbook',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is idempotency, and how does Ansible achieve it?',
    a: [
      'Idempotent: running the same operation many times gives the same result as running it once.',
      'Ansible modules check current state first and only change when needed (reporting ok vs changed).',
      'Raw `shell`/`command` tasks are not idempotent by default; guard with `creates:`, `when:` or `changed_when:`.',
      'Structure: inventory (hosts/groups), playbooks (plays + tasks), roles for reuse, handlers for restarts, Vault for secrets.',
    ],
    code: `- hosts: web
  become: true
  tasks:
    - name: Install nginx
      ansible.builtin.apt: { name: nginx, state: present }
    - name: Ensure running
      ansible.builtin.service: { name: nginx, state: started, enabled: true }`,
  },
  {
    id: 'terraform-workspaces-envs',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you manage multiple environments (dev/staging/prod) with Terraform?',
    a: [
      'Separate directories per environment calling shared modules, each with its own backend/state (most common).',
      'Terraform workspaces: same code, separate state per workspace; fine for similar envs, less isolation.',
      'Use per-env `.tfvars` files; tools like Terragrunt reduce duplication.',
      'Isolate prod with separate cloud accounts and credentials.',
    ],
  },
  {
    id: 'terraform-import',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 1,
    difficulty: 'Medium',
    q: 'How do you bring existing resources under Terraform or force recreation?',
    a: [
      '`import` blocks (Terraform 1.5+) or `terraform import` map an existing resource into state; `plan -generate-config-out` drafts the code.',
      '`terraform apply -replace=aws_instance.web` forces recreation (replaces deprecated `taint`).',
      '`removed` blocks / `terraform state rm` stop managing a resource without destroying it.',
    ],
  },

  // ───────────────────────── Cloud (AWS) ─────────────────────────
  {
    id: 'iam-users-roles-policies',
    group: 'Cloud (AWS)',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain AWS IAM users, groups, roles and policies.',
    a: [
      'Users: long-term identities with credentials; groups attach policies to many users.',
      'Roles: assumable identities issuing temporary credentials via STS; used by EC2, Lambda, EKS pods, CI (OIDC), cross-account.',
      'Policies: JSON documents of Effect/Action/Resource/Condition; explicit Deny always wins, default is deny.',
      'Best practice: least privilege, roles over access keys, MFA, SSO (IAM Identity Center), no root usage.',
    ],
  },
  {
    id: 'iaas-paas-saas',
    group: 'Cloud (AWS)',
    stars: 4,
    difficulty: 'Easy',
    q: 'IaaS vs PaaS vs SaaS (and serverless)?',
    a: [
      'IaaS: you rent raw compute/network/storage and manage OS upward (EC2).',
      'PaaS: provider manages runtime/OS; you deploy code (Elastic Beanstalk, Heroku, App Service).',
      'SaaS: complete software consumed over the web (Gmail, Salesforce).',
      'Serverless/FaaS: run functions on demand, pay per invocation, auto-scale to zero (Lambda).',
      'Shared responsibility: the more managed the service, the less you are responsible for.',
    ],
  },
  {
    id: 'aws-vpc-subnets',
    group: 'Cloud (AWS)',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain a VPC, public vs private subnets, IGW and NAT gateway.',
    a: [
      'VPC: your isolated virtual network in a region with a CIDR range, spread across AZs via subnets.',
      'Public subnet: route table has a route to an Internet Gateway; resources can have public IPs (ALB, bastion).',
      'Private subnet: no direct internet route; outbound via NAT gateway in a public subnet (apps, DBs).',
      'VPC endpoints give private access to AWS services (S3, ECR) without NAT; peering/Transit Gateway connect VPCs.',
    ],
  },
  {
    id: 'security-group-vs-nacl',
    group: 'Cloud (AWS)',
    stars: 4,
    difficulty: 'Medium',
    q: 'Security Group vs Network ACL?',
    a: [
      'Security group: instance/ENI-level firewall, stateful (return traffic auto-allowed), allow rules only.',
      'NACL: subnet-level, stateless (must allow return/ephemeral ports explicitly), allow and deny rules, evaluated in order.',
      'SGs can reference other SGs (e.g. DB allows only the app SG).',
      'Typically SGs do most of the work; NACLs as a coarse extra layer.',
    ],
  },
  {
    id: 'regions-azs-ha',
    group: 'Cloud (AWS)',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are regions and availability zones, and how do you design for HA on AWS?',
    a: [
      'Region: geographic area with multiple isolated AZs; AZ: one or more data centres with independent power/network.',
      'HA: spread instances across 2-3 AZs behind a load balancer with an auto-scaling group.',
      'Use managed multi-AZ services (RDS Multi-AZ, S3, DynamoDB).',
      'Multi-region for DR / global latency: Route 53 failover/latency routing, cross-region replication.',
    ],
  },
  {
    id: 'ec2-autoscaling-alb',
    group: 'Cloud (AWS)',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do Auto Scaling Groups work with a load balancer?',
    a: [
      'ASG keeps min/desired/max EC2 instances from a launch template, replacing unhealthy ones.',
      'Scaling policies: target tracking (e.g. 60% CPU), step, scheduled, predictive.',
      'Instances register in ALB target groups; ALB health checks drive replacement.',
      'Instance refresh rolls out a new AMI/launch template gradually.',
    ],
  },
  {
    id: 'ecs-eks-lambda',
    group: 'Cloud (AWS)',
    stars: 3,
    difficulty: 'Medium',
    q: 'ECS vs EKS vs Lambda: how do you choose?',
    a: [
      'Lambda: event-driven functions, no servers, max 15 min per invocation, cold starts, pay per request.',
      'ECS: AWS-native container orchestration, simpler; run on EC2 or Fargate (serverless containers).',
      'EKS: managed Kubernetes; portable, huge ecosystem, more operational complexity.',
      'Choose by workload shape, team k8s skills, portability needs and cost at scale.',
    ],
  },
  {
    id: 's3-storage-classes',
    group: 'Cloud (AWS)',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are the key features of S3 and its storage classes?',
    a: [
      'Object storage with 11 nines durability; buckets + keys; strong read-after-write consistency.',
      'Classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive.',
      'Lifecycle rules move/expire objects; versioning + replication for protection.',
      'Security: Block Public Access, bucket policies, encryption (SSE-S3/KMS), presigned URLs.',
    ],
  },
  {
    id: 'rds-multiaz-read-replica',
    group: 'Cloud (AWS)',
    stars: 2,
    difficulty: 'Medium',
    q: 'RDS Multi-AZ vs read replicas?',
    a: [
      'Multi-AZ: synchronous standby in another AZ for high availability and automatic failover; not used for reads (classic mode).',
      'Read replicas: asynchronous copies for scaling reads, can be cross-region, can be promoted manually.',
      'Multi-AZ = availability; read replicas = read scalability (and DR when cross-region).',
    ],
  },
  {
    id: 'aws-cost-optimization',
    group: 'Cloud (AWS)',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you optimise cloud costs?',
    a: [
      'Right-size instances using utilisation data; scale down non-prod at night.',
      'Savings Plans / Reserved Instances for steady load; Spot for fault-tolerant batch and CI workers.',
      'Storage lifecycle policies, delete unattached volumes/old snapshots, reduce NAT and cross-AZ data transfer.',
      'Tag resources for cost allocation; budgets and anomaly alerts (FinOps).',
    ],
  },

  // ───────────────────────── Monitoring/Logging & SRE ─────────────────────────
  {
    id: 'sla-slo-sli',
    group: 'Monitoring/Logging & SRE',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are SLI, SLO, SLA and error budgets?',
    a: [
      'SLI: a measured indicator, e.g. % of requests successful or under 300 ms.',
      'SLO: internal target for an SLI, e.g. 99.9% success over 30 days.',
      'SLA: contractual promise to customers with penalties; looser than the SLO.',
      'Error budget = 1 - SLO (99.9% gives ~43 min/month); if exhausted, freeze features and focus on reliability.',
    ],
  },
  {
    id: 'monitoring-vs-observability',
    group: 'Monitoring/Logging & SRE',
    stars: 5,
    difficulty: 'Medium',
    q: 'Monitoring vs observability, and what are the three pillars?',
    a: [
      'Monitoring: watching known metrics and alerting on known failure modes ("is it broken?").',
      'Observability: ability to understand any internal state from outputs, including unknown unknowns ("why is it broken?").',
      'Pillars: metrics (aggregated numbers), logs (discrete events), traces (request path across services).',
      'OpenTelemetry is the vendor-neutral standard for emitting all three; correlate via trace IDs.',
    ],
  },
  {
    id: 'prometheus-grafana',
    group: 'Monitoring/Logging & SRE',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do Prometheus and Grafana work together?',
    a: [
      'Prometheus pulls (scrapes) metrics from `/metrics` endpoints and stores time series with labels.',
      'Exporters expose metrics for systems (node_exporter, kube-state-metrics); service discovery finds targets in k8s.',
      'PromQL queries metrics; alert rules fire to Alertmanager, which groups, silences and routes (Slack, PagerDuty).',
      'Grafana visualises dashboards from Prometheus (and Loki, Tempo, etc.). Beware high-cardinality labels.',
    ],
    code: `# 5xx error ratio over 5m
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))`,
  },
  {
    id: 'golden-signals',
    group: 'Monitoring/Logging & SRE',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the four golden signals (and RED/USE)?',
    a: [
      'Google SRE golden signals: latency, traffic, errors, saturation.',
      'RED (for services): Rate, Errors, Duration.',
      'USE (for resources): Utilisation, Saturation, Errors.',
      'Track latency as percentiles (p95/p99), not averages.',
    ],
  },
  {
    id: 'centralized-logging',
    group: 'Monitoring/Logging & SRE',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you set up centralised logging?',
    a: [
      'Apps log structured JSON to stdout; an agent (Fluent Bit, Vector, Promtail) ships logs to a central store.',
      'Stacks: ELK/EFK (Elasticsearch/OpenSearch + Kibana), Grafana Loki, CloudWatch, Datadog.',
      'Include correlation/trace IDs, levels and service names; never log secrets or PII.',
      'Set retention and sampling to control cost.',
    ],
  },
  {
    id: 'incident-postmortem',
    group: 'Monitoring/Logging & SRE',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you handle a production incident and the postmortem?',
    a: [
      'Detect (alert), triage severity, assign an incident commander, open a comms channel/status page.',
      'Mitigate first (rollback, failover, scale, feature flag off), root-cause later.',
      'Blameless postmortem: timeline, impact, root cause(s), what went well/badly, action items with owners.',
      'Track MTTD and MTTR; feed learnings into runbooks, alerts and tests.',
    ],
  },
  {
    id: 'toil',
    group: 'Monitoring/Logging & SRE',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is toil in SRE?',
    a: [
      'Manual, repetitive, automatable, reactive operational work that scales linearly with service size.',
      'Google SRE aims to keep toil under ~50% of an engineer time; the rest goes to engineering work.',
      'Reduce by automation, self-service tooling, and fixing recurring alerts at the source.',
    ],
  },

  // ───────────────────────── Security & Reliability ─────────────────────────
  {
    id: 'secrets-management',
    group: 'Security & Reliability',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you manage secrets securely across environments?',
    a: [
      'Never hardcode or commit secrets; scan repos (gitleaks, GitHub push protection) and rotate anything leaked.',
      'Central secret stores: HashiCorp Vault, AWS Secrets Manager/SSM Parameter Store, Azure Key Vault.',
      'Prefer dynamic, short-lived credentials (Vault DB creds, IAM roles, OIDC) over static keys.',
      'Encrypt at rest and in transit, least-privilege access, audit logs, automated rotation.',
      'In k8s: External Secrets Operator / CSI driver, or Sealed Secrets/SOPS for GitOps.',
    ],
  },
  {
    id: 'devsecops',
    group: 'Security & Reliability',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is DevSecOps and what security checks go into a pipeline?',
    a: [
      'Integrating security into every stage of the pipeline as a shared responsibility (shift-left security).',
      'SAST (code analysis: Semgrep, CodeQL), SCA (dependency CVEs: Dependabot, Snyk), secret scanning.',
      'Container image scanning (Trivy, Grype), IaC scanning (Checkov, tfsec), DAST against staging (OWASP ZAP).',
      'Policy-as-code gates (OPA/Kyverno), signed artifacts, and runtime security monitoring (Falco).',
    ],
  },
  {
    id: 'ha-dr-rto-rpo',
    group: 'Security & Reliability',
    stars: 4,
    difficulty: 'Medium',
    q: 'High availability vs disaster recovery? What are RTO and RPO?',
    a: [
      'HA: avoid downtime from component failures via redundancy (multi-AZ, LB, replicas, auto-healing).',
      'DR: recover from large-scale disasters (region outage, data corruption, ransomware).',
      'RTO: max acceptable downtime. RPO: max acceptable data loss, measured in time.',
      'DR strategies by cost: backup & restore, pilot light, warm standby, multi-site active-active.',
      'Test DR regularly; an untested backup is not a backup.',
    ],
  },
  {
    id: 'container-image-security',
    group: 'Security & Reliability',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you secure containers and images?',
    a: [
      'Minimal base images (distroless/alpine), pin by digest, rebuild regularly to pick up patches.',
      'Scan images in CI and in the registry; fail builds on critical CVEs.',
      'Run as non-root, read-only root filesystem, drop Linux capabilities, no privileged containers.',
      'k8s: Pod Security Admission (restricted), NetworkPolicies, sign images (cosign) and verify on admission.',
    ],
  },
  {
    id: 'least-privilege',
    group: 'Security & Reliability',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the principle of least privilege and how do you apply it?',
    a: [
      'Every user, service and process gets only the minimum permissions needed, for the minimum time.',
      'Scoped IAM policies, per-service roles/ServiceAccounts, no shared admin accounts.',
      'Just-in-time elevated access with approval; review and prune unused permissions (IAM Access Analyzer).',
      'Limits blast radius when credentials are compromised; pairs with zero-trust networking.',
    ],
  },
  {
    id: 'https-tls',
    group: 'Security & Reliability',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does HTTPS/TLS work and how are certificates managed?',
    a: [
      'TLS uses asymmetric crypto during the handshake to authenticate the server (certificate signed by a CA) and agree on session keys.',
      'Data then flows encrypted with fast symmetric ciphers; TLS 1.3 needs one round trip.',
      'Automate certificates: Let\'s Encrypt / ACME, cert-manager in k8s, AWS ACM on load balancers.',
      'mTLS authenticates both sides; common between microservices via a service mesh.',
    ],
  },
  {
    id: 'chaos-engineering',
    group: 'Security & Reliability',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is chaos engineering?',
    a: [
      'Deliberately injecting failures (kill pods/instances, add latency, drop AZ) to verify the system tolerates them.',
      'Process: define steady state, hypothesise, run controlled experiment with small blast radius, learn, fix.',
      'Tools: Chaos Monkey, LitmusChaos, Chaos Mesh, AWS Fault Injection Service; often run as game days.',
    ],
  },
  {
    id: 'software-supply-chain-sbom',
    group: 'Security & Reliability',
    stars: 1,
    difficulty: 'Hard',
    q: 'What is software supply chain security (SBOM, SLSA, signing)?',
    a: [
      'Protecting everything that goes into a build: dependencies, build systems, artifacts.',
      'SBOM: inventory of components in an artifact (SPDX/CycloneDX, generated by Syft) for fast CVE impact analysis.',
      'SLSA: framework of levels for build provenance and tamper resistance.',
      'Sign artifacts and attestations (Sigstore cosign) and verify signatures before deploy.',
    ],
  },
];
