import type { BankQuestion } from './types';

export const DEVOPS_2: BankQuestion[] = [
  // ───────────────────────── Kubernetes (continued) ─────────────────────────
  {
    id: 'daemonset-job-cronjob',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are DaemonSets, Jobs and CronJobs?',
    a: [
      "# ELI5",
      "Imagine a school with many classrooms. A DaemonSet is like putting one fire alarm in every classroom: build a new room and it automatically gets an alarm too.",
      "A Job is like asking a student to clean the board once: they do it, and when it is done, they are done. If they drop the duster, they try again.",
      "A CronJob is the weekly cleaning roster: every Friday at 4pm, someone is automatically told to clean the board.",
      "Mapping back: classrooms are nodes (machines), the alarm is a pod running on every node, and the cleaning tasks are pods that run until finished instead of forever.",
      "# What it is",
      "A pod is the smallest thing Kubernetes runs: one or more containers that share a network address. Normally pods are managed by a 'controller' — a loop that keeps reality matching what you asked for.",
      "A Deployment (the usual controller) keeps N copies of a long-running app alive, anywhere in the cluster. DaemonSet, Job and CronJob are other controllers for different shapes of work.",
      "DaemonSet: runs exactly one copy of a pod on every node (or every node matching a label). When a node joins the cluster, the pod is added there automatically; when the node leaves, its pod is removed.",
      "Job: runs one or more pods until they finish successfully (exit code 0). It retries failed pods up to `backoffLimit` times and can run several pods in parallel (`parallelism`) until `completions` successes are reached.",
      "CronJob: a Job factory. It creates a new Job on a schedule written in cron syntax — five fields: minute, hour, day-of-month, month, day-of-week (e.g. `0 2 * * *` = every day at 02:00).",
      "# How it works",
      "DaemonSet:",
      "  The DaemonSet controller watches the list of nodes.",
      "  For each node without its pod, it creates one pinned to that node; the scheduler respects taints, so add tolerations if you need it on tainted nodes too.",
      "  Updates roll out node by node (`updateStrategy: RollingUpdate`).",
      "Job:",
      "  The Job controller creates pods with `restartPolicy: Never` or `OnFailure` (never `Always` — the pod must be allowed to stop).",
      "  It counts successful completions; on failure it creates a replacement with exponential back-off delay, up to `backoffLimit` (default 6).",
      "  `activeDeadlineSeconds` kills the whole Job if it runs too long; `ttlSecondsAfterFinished` deletes it automatically afterwards.",
      "CronJob:",
      "  At each scheduled time the CronJob controller creates a Job object from its `jobTemplate`.",
      "  `concurrencyPolicy` decides what happens if the previous run is still going: `Allow`, `Forbid` (skip) or `Replace`.",
      "  `successfulJobsHistoryLimit` / `failedJobsHistoryLimit` control how many old Jobs are kept for inspection; `timeZone` sets the schedule's time zone.",
      "# Example walkthrough",
      "The first manifest is a DaemonSet named `log-agent` running Fluent Bit (a log shipper). Applying it creates one pod per node — on a 3-node cluster you see 3 pods.",
      "The toleration lets it also run on control-plane nodes, which are normally tainted to repel ordinary pods.",
      "The second manifest is a CronJob `nightly-backup` with schedule `0 2 * * *`, so every night at 02:00 Kubernetes creates a Job, which creates a pod running `pg_dump`.",
      "`concurrencyPolicy: Forbid` means if last night's backup is still running, tonight's is skipped. `backoffLimit: 2` means at most 2 retries before the Job is marked Failed.",
      "`kubectl get jobs` afterwards shows rows like `nightly-backup-28912345  1/1` — 1 of 1 completions succeeded.",
      "# Why it matters / when to use",
      "DaemonSet: node-level agents — log collectors (Fluent Bit), monitoring agents (node_exporter, Datadog agent), network plugins (CNI) and storage drivers.",
      "Job: one-off tasks that must finish — database migrations before a release, data imports, batch processing, sending a bulk email.",
      "CronJob: anything recurring — nightly backups, report generation, cleaning expired sessions, certificate checks.",
      "Using these instead of a cron daemon on a VM gives you retries, logs via `kubectl logs`, resource limits and no single 'cron box' to babysit.",
      "# Common mistakes",
      "Using a Deployment for a script that exits: the Deployment restarts it forever (CrashLoopBackOff). Use a Job.",
      "Forgetting the schedule is in UTC by default; set `timeZone: Asia/Kolkata` (or your zone) explicitly.",
      "Non-idempotent CronJob tasks: a Job can occasionally run twice or retry halfway, so make the script safe to run again (idempotent = same result if repeated).",
      "Letting finished Jobs pile up; set `ttlSecondsAfterFinished` and history limits.",
      "# Say this in the interview",
      "A DaemonSet guarantees one pod per node, which is how we run node agents like log shippers and monitoring exporters. A Job runs pods to successful completion with retries and optional parallelism, for things like migrations or batch work. A CronJob simply creates Jobs on a cron schedule, for backups or periodic cleanup, with a concurrency policy to stop runs overlapping.",
      "Follow-up: How would you stop a CronJob from overlapping with itself?",
      "  Set `concurrencyPolicy: Forbid` so a new run is skipped while the previous Job is still active, and make the task idempotent anyway.",
      "Follow-up: How do you run a DaemonSet on only some nodes?",
      "  Add a `nodeSelector` or node affinity in the pod template so only nodes with a matching label get a pod.",
    ],
    code: `# daemonset.yaml — one log-agent pod on every node
apiVersion: apps/v1
kind: DaemonSet
metadata: { name: log-agent }
spec:
  selector: { matchLabels: { app: log-agent } }
  template:
    metadata: { labels: { app: log-agent } }
    spec:
      tolerations:                       # also run on tainted control-plane nodes
        - key: node-role.kubernetes.io/control-plane
          effect: NoSchedule
      containers:
        - name: fluent-bit
          image: fluent/fluent-bit:3.1
---
# cronjob.yaml — nightly database backup at 02:00
apiVersion: batch/v1
kind: CronJob
metadata: { name: nightly-backup }
spec:
  schedule: "0 2 * * *"                # min hour day month weekday
  timeZone: "Etc/UTC"
  concurrencyPolicy: Forbid             # skip if last run still going
  jobTemplate:
    spec:
      backoffLimit: 2                   # retry at most twice
      ttlSecondsAfterFinished: 86400    # auto-delete after a day
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: postgres:16
              command: ["sh", "-c", "pg_dump $DATABASE_URL > /backup/db.sql"]
# kubectl get jobs  → nightly-backup-28912345   1/1   ...`,
  },
  {
    id: 'pv-pvc-storageclass',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Medium',
    q: 'Explain PersistentVolume, PersistentVolumeClaim and StorageClass.',
    a: [
      "# ELI5",
      "Think of a hotel. The lockers in the basement are the actual storage boxes (PersistentVolumes).",
      "A guest fills in a request slip: 'I need a medium locker I can lock myself' — that slip is a PersistentVolumeClaim.",
      "The hotel has a rule book saying 'if no locker is free, order a new one from this supplier' — that rule book is a StorageClass.",
      "Mapping back: pods are guests who come and go; the locker (disk) stays even if the guest checks out, so data is not lost when a pod dies.",
      "# What it is",
      "Containers have a temporary filesystem: when the container restarts, anything written to it is gone. Databases and file uploads need storage that survives, called persistent storage.",
      "PersistentVolume (PV): a cluster object representing a real piece of storage — an AWS EBS disk, an NFS share, a GCP persistent disk. Its lifecycle is independent of any pod.",
      "PersistentVolumeClaim (PVC): a request from an app for storage: 'I need 10Gi, ReadWriteOnce'. Kubernetes binds the claim to a matching PV, one-to-one.",
      "StorageClass: describes a 'kind' of storage (fast SSD, cheap HDD) and which provisioner creates it. With it, PVs are created on demand — called dynamic provisioning.",
      "CSI driver (Container Storage Interface): the plugin that actually talks to the cloud or storage system to create, attach and mount disks, e.g. `ebs.csi.aws.com`.",
      "Access modes: `ReadWriteOnce` (RWO, mounted read-write by one node), `ReadOnlyMany` (ROX), `ReadWriteMany` (RWX, many nodes, needs shared storage like NFS/EFS), `ReadWriteOncePod` (exactly one pod).",
      "Reclaim policy: what happens to the PV when its PVC is deleted — `Delete` (destroy the disk, default for dynamic) or `Retain` (keep it for manual recovery).",
      "# How it works",
      "Dynamic provisioning, step by step:",
      "  You create a PVC that names a StorageClass (or uses the cluster default).",
      "  The CSI provisioner sees the unbound PVC and calls the cloud API to create a disk of that size.",
      "  It creates a PV object for the disk and binds it to the PVC (status `Bound`).",
      "  A pod referencing the PVC is scheduled; the kubelet (the agent on each node) asks the CSI driver to attach and mount the disk into the container path.",
      "  If the pod moves to another node, the disk is detached and re-attached there (for RWO block disks, in the same availability zone).",
      "Static provisioning: an admin creates PVs by hand first; PVCs then bind to whichever existing PV matches size and mode.",
      "`volumeBindingMode: WaitForFirstConsumer` delays creating the disk until a pod is scheduled, so the disk is created in the same zone as the pod.",
      "# Example walkthrough",
      "The StorageClass `fast-ssd` uses the AWS EBS CSI driver with `gp3` disks, `WaitForFirstConsumer` binding, and allows later expansion.",
      "The PVC `pg-data` asks for 20Gi, RWO, from `fast-ssd`. Right after `kubectl apply`, `kubectl get pvc` shows `Pending` because no pod uses it yet.",
      "The Pod mounts the claim at `/var/lib/postgresql/data`. Once scheduled, a 20Gi EBS volume is created, the PVC becomes `Bound`, and Postgres writes its files to the disk.",
      "Deleting and recreating the pod keeps the data, because the PVC (and disk) still exist.",
      "# Why it matters / when to use",
      "Any stateful workload in Kubernetes — Postgres, MySQL, Redis with persistence, Elasticsearch, file uploads — needs PVCs.",
      "StatefulSets use `volumeClaimTemplates` to create one PVC per replica automatically.",
      "StorageClasses let platform teams offer tiers ('fast', 'standard', 'shared') without developers knowing cloud details.",
      "# Common mistakes",
      "Using `ReadWriteMany` with a block disk like EBS: it is not supported; use a shared filesystem (EFS, NFS) or redesign.",
      "Leaving the reclaim policy as `Delete` for important data: deleting the PVC destroys the disk. Use `Retain` plus backups/snapshots for production databases.",
      "PVC stuck in `Pending`: no default StorageClass, wrong class name, or a zone mismatch. Check `kubectl describe pvc` events.",
      "Thinking a PV is a backup: it is one disk. Take volume snapshots or database backups separately.",
      "# Say this in the interview",
      "A PersistentVolume is a real piece of storage in the cluster, a PersistentVolumeClaim is an app's request for storage with a size and access mode, and Kubernetes binds the two. A StorageClass enables dynamic provisioning: when a PVC is created, a CSI driver automatically creates the disk and the PV. Access modes and reclaim policy decide how many nodes can mount it and whether data survives PVC deletion.",
      "Follow-up: Why use WaitForFirstConsumer?",
      "  Zonal disks must be in the same zone as the pod; waiting until the pod is scheduled avoids creating a disk in the wrong zone.",
      "Follow-up: Can you grow a volume?",
      "  Yes, if the StorageClass has `allowVolumeExpansion: true`; edit the PVC's requested size and the CSI driver resizes it.",
    ],
    code: `# storage.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: fast-ssd }
provisioner: ebs.csi.aws.com          # CSI driver that creates the disks
parameters: { type: gp3 }
reclaimPolicy: Retain                 # keep the disk if the PVC is deleted
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: pg-data }
spec:
  storageClassName: fast-ssd
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 20Gi } }
---
apiVersion: v1
kind: Pod
metadata: { name: postgres }
spec:
  containers:
    - name: db
      image: postgres:16
      env: [{ name: POSTGRES_PASSWORD, value: example }]
      volumeMounts:
        - { name: data, mountPath: /var/lib/postgresql/data }
  volumes:
    - name: data
      persistentVolumeClaim: { claimName: pg-data }
# kubectl get pvc → pg-data   Bound   pvc-3f9c...   20Gi   RWO   fast-ssd`,
  },
  {
    id: 'helm',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is Helm?',
    a: [
      "# ELI5",
      "Imagine a cake recipe with blanks: '___ cups of sugar, ___ flavour'. You can bake a small vanilla cake or a big chocolate cake from the same recipe by filling the blanks differently.",
      "Helm charts are recipes for apps in Kubernetes, and `values.yaml` is the sheet where you fill in the blanks.",
      "Helm also keeps a diary of every cake you baked, so if today's cake is bad you can go back to yesterday's version.",
      "Mapping back: the recipe is a set of templated YAML files, the filled-in blanks are per-environment settings, and the diary is release history used for rollbacks.",
      "# What it is",
      "Helm is the package manager for Kubernetes — like npm for Node or apt for Ubuntu, but it installs whole applications made of many Kubernetes objects.",
      "Chart: a folder containing `Chart.yaml` (name, version), `values.yaml` (default settings) and a `templates/` folder of Kubernetes manifests with placeholders.",
      "Templates use Go template syntax: `{{ .Values.replicaCount }}` is replaced with the value from `values.yaml` or your override file.",
      "Release: one installed instance of a chart in a cluster, with a name (e.g. `api`). Every upgrade creates a new numbered revision.",
      "Repository: a place charts are published, either an HTTP repo or an OCI registry (the same kind of registry that stores Docker images).",
      "Helm 3 has no server component (the old Tiller was removed); it talks to the Kubernetes API with your kubeconfig and stores release data as Secrets in the namespace.",
      "# How it works",
      "`helm upgrade --install api ./chart -f values-prod.yaml`:",
      "  Helm merges values: chart defaults, then each `-f` file, then `--set` flags (later wins).",
      "  It renders every template into plain YAML manifests.",
      "  It compares them with the previous revision and applies the changes to the cluster.",
      "  It stores the new revision (rendered manifests + values) in a Secret, so history is known.",
      "`helm rollback api 3` re-applies the manifests saved for revision 3, creating a new revision.",
      "`helm template` renders locally without touching the cluster, useful for review or for GitOps tools.",
      "Charts can depend on other charts (e.g. your app chart pulls in a Redis chart) listed in `Chart.yaml`.",
      "# Example walkthrough",
      "`values.yaml` sets defaults: 2 replicas and image tag `1.0.0`. `values-prod.yaml` overrides replicas to 5.",
      "The template uses `{{ .Values.replicaCount }}` and `{{ .Values.image.tag }}`; for prod it renders `replicas: 5` and `image: myrepo/api:1.0.0`.",
      "`helm upgrade --install` installs the release the first time and upgrades it on later runs, so the same CI command works always.",
      "`helm history api` lists revisions; `helm rollback api 1` returns to the first one if the new version misbehaves.",
      "# Why it matters / when to use",
      "Installing third-party software (ingress-nginx, cert-manager, Prometheus) is usually one `helm install` command.",
      "Packaging your own service once and deploying it to dev, staging and prod with different value files.",
      "Alternative: Kustomize — template-free, uses a base YAML plus 'overlays' that patch it per environment; built into `kubectl apply -k`.",
      "GitOps tools like Argo CD and Flux can deploy Helm charts directly from Git.",
      "# Common mistakes",
      "Putting secrets in plain `values.yaml` committed to Git; use External Secrets, SOPS or sealed secrets instead.",
      "Not pinning chart versions (`--version`), so a new upstream chart release changes production unexpectedly.",
      "Editing resources with `kubectl edit` after Helm installed them; the next `helm upgrade` overwrites your manual change.",
      "Over-templating everything until charts are unreadable; keep templates simple.",
      "# Say this in the interview",
      "Helm is the package manager for Kubernetes. A chart is a set of templated manifests plus a values file, so the same chart can be deployed to every environment with different values. Helm tracks each install as a release with revision history, so upgrades and rollbacks are single commands.",
      "Follow-up: Helm vs Kustomize?",
      "  Helm uses templates and has packaging and release history; Kustomize patches plain YAML with overlays and no templating. Many teams use Helm for third-party apps and either for their own.",
      "Follow-up: Where does Helm 3 store release state?",
      "  As Kubernetes Secrets in the release's namespace; there is no server-side Tiller anymore.",
    ],
    code: `# chart/values.yaml (defaults)
replicaCount: 2
image: { repository: myrepo/api, tag: "1.0.0" }

# values-prod.yaml (override for prod)
replicaCount: 5

# chart/templates/deployment.yaml (snippet)
#   replicas: {{ .Values.replicaCount }}
#   image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

# ---- shell ----
helm upgrade --install api ./chart -f values-prod.yaml -n prod
# → Release "api" has been upgraded. REVISION: 2
helm template api ./chart -f values-prod.yaml | grep replicas
# → replicas: 5
helm history api -n prod
# → REVISION 1 superseded, REVISION 2 deployed
helm rollback api 1 -n prod
# → Rollback was a success! (creates REVISION 3)`,
  },
  {
    id: 'k8s-rbac-namespaces',
    group: 'Kubernetes',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do namespaces and RBAC work in Kubernetes?',
    a: [
      "# ELI5",
      "A big office building has floors for different teams. Namespaces are the floors: the sales team's 'printer' and the dev team's 'printer' can share a name because they live on different floors.",
      "Each employee has a keycard. A rule sheet says 'interns can open meeting rooms but not the server room' — that is a Role.",
      "Handing a specific person a keycard with that rule sheet is a RoleBinding.",
      "Mapping back: floors are namespaces, rule sheets are Roles listing allowed actions, and bindings attach those permissions to users or apps.",
      "# What it is",
      "Namespace: a logical partition inside one cluster. Names only need to be unique within a namespace, and you can attach quotas (`ResourceQuota`) and network rules per namespace.",
      "Some objects are cluster-scoped (not in any namespace): Nodes, PersistentVolumes, StorageClasses, Namespaces themselves.",
      "RBAC (Role-Based Access Control): the system that decides who can do which action on which resource in the Kubernetes API.",
      "Verbs are actions: `get`, `list`, `watch`, `create`, `update`, `patch`, `delete`. Resources are object types: `pods`, `deployments`, `secrets`, etc.",
      "Role: a list of allowed verbs on resources inside one namespace. ClusterRole: the same but usable cluster-wide or for cluster-scoped resources.",
      "RoleBinding: grants a Role (or ClusterRole) to subjects within one namespace. ClusterRoleBinding: grants a ClusterRole across the whole cluster.",
      "Subjects are users, groups (usually from your identity provider via OIDC) or ServiceAccounts — identities for programs running inside pods.",
      "RBAC is allow-only: there are no deny rules; anything not explicitly allowed is forbidden.",
      "# How it works",
      "When a request hits the API server:",
      "  Authentication: who are you? (client certificate, OIDC token, ServiceAccount token).",
      "  Authorization: RBAC checks all bindings for that identity and asks 'does any bound role allow this verb on this resource in this namespace?'.",
      "  Admission control: policies (e.g. Pod Security, Kyverno) may still reject or modify the object.",
      "  Only then is the object stored in etcd (the cluster database).",
      "Every pod runs as a ServiceAccount (`default` if not specified); a short-lived token is mounted so the pod can call the API with that identity.",
      "`kubectl auth can-i <verb> <resource> --as <subject> -n <ns>` lets you test permissions.",
      "# Example walkthrough",
      "We create namespace `team-a` and a ServiceAccount `ci-deployer` in it.",
      "The Role `deployer` allows `get, list, watch, update, patch` on Deployments only, in `team-a` only.",
      "The RoleBinding attaches that Role to the ServiceAccount.",
      "`kubectl auth can-i patch deployments -n team-a --as=system:serviceaccount:team-a:ci-deployer` prints `yes`; the same for `secrets` prints `no`, and for namespace `team-b` prints `no`.",
      "# Why it matters / when to use",
      "Multi-team clusters: each team gets a namespace, a quota and permissions only there.",
      "CI/CD pipelines should deploy with a narrowly-scoped ServiceAccount, not cluster-admin.",
      "Operators/controllers that read the API (e.g. Prometheus discovering pods) need a ServiceAccount with just `get/list/watch` on what they need.",
      "Security audits and compliance often require least-privilege RBAC.",
      "# Common mistakes",
      "Binding `cluster-admin` to everything 'to make it work'; one leaked token then owns the cluster.",
      "Thinking namespaces are a security boundary on their own; without RBAC and NetworkPolicies, pods in different namespaces can still talk to each other.",
      "Granting `get/list` on `secrets` broadly: anyone with list can read every secret value.",
      "Leaving `automountServiceAccountToken` on for pods that never call the API; turn it off to reduce risk.",
      "# Say this in the interview",
      "Namespaces logically partition a cluster for teams or environments and scope names, quotas and policies. RBAC controls API access: Roles or ClusterRoles list allowed verbs on resources, and RoleBindings or ClusterRoleBindings grant them to users, groups or ServiceAccounts. Pods use ServiceAccounts, and I follow least privilege and verify with kubectl auth can-i.",
      "Follow-up: Role vs ClusterRole?",
      "  A Role lives in one namespace; a ClusterRole is cluster-wide and can cover cluster-scoped resources. A ClusterRole can still be granted in one namespace via a RoleBinding.",
      "Follow-up: Can RBAC deny something?",
      "  No, RBAC is purely additive; you restrict by not granting. Admission policies can enforce extra denials.",
    ],
    code: `# rbac.yaml
apiVersion: v1
kind: Namespace
metadata: { name: team-a }
---
apiVersion: v1
kind: ServiceAccount
metadata: { name: ci-deployer, namespace: team-a }
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: deployer, namespace: team-a }
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: ci-deployer-binding, namespace: team-a }
subjects:
  - kind: ServiceAccount
    name: ci-deployer
    namespace: team-a
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: deployer

# kubectl auth can-i patch deployments -n team-a --as=system:serviceaccount:team-a:ci-deployer  → yes
# kubectl auth can-i get secrets -n team-a --as=system:serviceaccount:team-a:ci-deployer        → no`,
  },
  {
    id: 'taints-tolerations-affinity',
    group: 'Kubernetes',
    stars: 2,
    difficulty: 'Hard',
    q: 'Taints/tolerations vs node affinity?',
    a: [
      "# ELI5",
      "A taint is a 'Staff only' sign on a door. Most people stay out. A toleration is the staff badge that lets you ignore the sign.",
      "Node affinity is like a kid saying 'I want to sit near the window'. It pulls them toward certain seats.",
      "Having the badge does not make you go into the staff room; it just means you are allowed. Wanting a window seat does not stop others sitting there.",
      "Mapping back: taints repel pods from nodes, affinity attracts pods to nodes; to fully reserve nodes for a workload you need both.",
      "# What it is",
      "The scheduler is the Kubernetes component that picks which node (machine) each new pod runs on. These features steer its decision.",
      "Taint: a mark on a node, `key=value:effect`. Pods that do not tolerate it are kept away. Effects: `NoSchedule` (new pods not placed), `PreferNoSchedule` (avoid if possible), `NoExecute` (also evicts running pods).",
      "Toleration: a field on a pod saying 'I can tolerate taint X'. It permits the pod onto tainted nodes but does not force it there.",
      "nodeSelector: the simplest attraction — the pod only runs on nodes with all listed labels, e.g. `disktype: ssd`.",
      "Node affinity: a richer nodeSelector with operators (`In`, `NotIn`, `Exists`) and two strengths: `requiredDuringSchedulingIgnoredDuringExecution` (hard rule) and `preferredDuringSchedulingIgnoredDuringExecution` (soft, weighted).",
      "Pod affinity / anti-affinity: rules relative to other pods — 'put me near pods labelled cache' or 'never two replicas of me on the same node'.",
      "topologySpreadConstraints: spread replicas evenly across zones or nodes, controlling the maximum imbalance (`maxSkew`).",
      "# How it works",
      "For each pending pod the scheduler runs two phases:",
      "  Filtering: remove nodes that cannot run the pod — not enough CPU/memory, untolerated `NoSchedule` taints, failing required affinity.",
      "  Scoring: rank remaining nodes using preferred affinity weights, spreading, resource balance; pick the best.",
      "Taints are set on nodes with `kubectl taint nodes gpu-1 gpu=true:NoSchedule`; remove with a trailing minus: `gpu=true:NoSchedule-`.",
      "Kubernetes adds taints automatically too, e.g. `node.kubernetes.io/not-ready:NoExecute` when a node fails, which evicts pods after `tolerationSeconds` (default 300).",
      "'IgnoredDuringExecution' means if node labels change later, already-running pods are not moved.",
      "# Example walkthrough",
      "The shell command taints node `gpu-1` so ordinary pods stop landing on it, and labels it `accelerator=nvidia`.",
      "The pod `trainer` has a toleration for `gpu=true:NoSchedule`, so it is allowed onto `gpu-1`.",
      "Its required node affinity says `accelerator In [nvidia]`, so it can only run on GPU nodes, not on regular ones.",
      "Result: GPU nodes run only GPU workloads, and GPU workloads run only on GPU nodes. `kubectl get pod trainer -o wide` shows NODE `gpu-1`.",
      "# Why it matters / when to use",
      "Dedicated node pools: GPU nodes, high-memory nodes, or nodes reserved for one team or tenant.",
      "Keeping regular workloads off control-plane nodes (they carry a `NoSchedule` taint by default).",
      "High availability: anti-affinity or topology spread so replicas are not all on one node or one zone.",
      "Performance: pod affinity to co-locate an app with its cache to reduce latency.",
      "# Common mistakes",
      "Adding only a toleration and expecting the pod to go to the special node; it may land anywhere. Add affinity or nodeSelector too.",
      "Adding only affinity without a taint; other workloads can still fill up your expensive GPU nodes.",
      "Using hard anti-affinity with more replicas than nodes: extra pods stay `Pending` forever. Use preferred rules or topology spread.",
      "Typos in label keys; the pod stays Pending — check `kubectl describe pod` for 'didn't match node affinity' events.",
      "# Say this in the interview",
      "Taints are placed on nodes to repel pods, and only pods with a matching toleration may schedule there. Node affinity or nodeSelector is placed on pods to attract them to nodes with certain labels, either as hard requirements or soft preferences. Taints keep others out, affinity pulls you in, so for a dedicated GPU pool I use both, and I use pod anti-affinity or topology spread constraints for spreading replicas across nodes and zones.",
      "Follow-up: What does NoExecute do differently?",
      "  It also evicts already-running pods that do not tolerate it, optionally after `tolerationSeconds`.",
      "Follow-up: How do you spread replicas across zones?",
      "  Use `topologySpreadConstraints` with `topologyKey: topology.kubernetes.io/zone` and `maxSkew: 1`.",
    ],
    code: `# Reserve a GPU node (shell)
kubectl taint nodes gpu-1 gpu=true:NoSchedule
kubectl label nodes gpu-1 accelerator=nvidia
# → node/gpu-1 tainted, node/gpu-1 labeled

# pod.yaml — allowed on AND required to use GPU nodes
apiVersion: v1
kind: Pod
metadata: { name: trainer, labels: { app: trainer } }
spec:
  tolerations:                          # permits scheduling on the tainted node
    - { key: gpu, operator: Equal, value: "true", effect: NoSchedule }
  affinity:
    nodeAffinity:                       # forces it onto GPU-labelled nodes
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - { key: accelerator, operator: In, values: [nvidia] }
  topologySpreadConstraints:            # spread copies across zones
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: ScheduleAnyway
      labelSelector: { matchLabels: { app: trainer } }
  containers:
    - name: train
      image: pytorch/pytorch:2.4.0-cuda12.4-cudnn9-runtime
# kubectl get pod trainer -o wide  → NODE: gpu-1`,
  },

  // ───────────────────────── CI/CD ─────────────────────────
  {
    id: 'cicd-pipeline-stages',
    group: 'CI/CD',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is a CI/CD pipeline and what stages does it typically have?',
    a: [
      "# ELI5",
      "Think of a car factory assembly line. A car frame enters at one end, and at each station a worker checks or adds something: wheels, paint, brake test.",
      "If any station finds a problem, the line stops and that car never reaches the showroom.",
      "Cheap, quick checks (is the door attached?) happen early; slow, expensive ones (crash test) happen later.",
      "Mapping back: your code change is the car, each station is a pipeline stage, and the showroom is production. Bad code is stopped automatically before customers see it.",
      "# What it is",
      "A CI/CD pipeline is an automated sequence of steps that takes a code change from a developer's commit all the way to running in production.",
      "CI (Continuous Integration): automatically building and testing every change pushed to the repository, so problems are found within minutes.",
      "CD (Continuous Delivery/Deployment): automatically packaging and releasing the tested change to environments like staging and production.",
      "Trigger: an event that starts the pipeline — a `git push`, a pull request (PR), a tag, a schedule or a manual button.",
      "Artifact: the built output that gets deployed — a Docker image, a `.jar`, a zip of a Lambda function. A registry is where artifacts/images are stored (Docker Hub, ECR, GHCR).",
      "Environment: a separate copy of the system — dev, staging (a production-like rehearsal), production (real users).",
      "Pipelines are defined as code in the repo (GitHub Actions YAML, `.gitlab-ci.yml`, `Jenkinsfile`), so they are versioned and reviewed like any code.",
      "# How it works",
      "Typical CI stages, in order:",
      "  Checkout: fetch the commit's source code.",
      "  Install dependencies: e.g. `npm ci`, which installs exactly what `package-lock.json` says.",
      "  Lint and static analysis: code style, type checks (`tsc --noEmit`), find obvious bugs without running code.",
      "  Unit tests: fast tests of individual functions; produce coverage reports.",
      "  Build: compile/bundle the app and build the Docker image.",
      "  Security scans: dependency vulnerabilities (npm audit, Snyk), secret scanning, image scanning (Trivy).",
      "Package: tag the image with a version (git SHA) and push it to a registry.",
      "Typical CD stages:",
      "  Deploy to dev/staging automatically.",
      "  Integration and end-to-end (e2e) tests against that environment.",
      "  Optional manual approval gate for production.",
      "  Deploy to production, ideally gradually (rolling/canary).",
      "Post-deploy: smoke tests (a few quick checks that the main pages/APIs respond), monitoring, automatic rollback if error rates rise.",
      "Principle 'fail fast': run the cheapest, quickest checks first so developers get feedback in minutes.",
      "# Example walkthrough",
      "The workflow triggers on pushes to `main` and on PRs.",
      "Job `ci` runs lint, type-check, then tests on an Ubuntu runner (a temporary machine provided by GitHub). If lint fails, later steps are skipped and the PR shows a red X.",
      "Job `build` has `needs: ci`, so it only starts if CI passed. It builds a Docker image tagged with the commit SHA (`github.sha`) and pushes it.",
      "Job `deploy-staging` runs only on `main`, deploying that exact image; a final `curl -f` smoke test fails the job if `/health` does not return success.",
      "# Why it matters / when to use",
      "Every professional backend team uses one; it catches bugs before users do and makes releases boring and frequent (many per day).",
      "It removes 'works on my machine' issues: builds happen in a clean, repeatable environment.",
      "Faster feedback: a broken test is reported on the PR minutes after the push.",
      "DORA metrics (deployment frequency, lead time, change failure rate, time to restore) — the industry's standard delivery measures — all improve with good pipelines.",
      "# Common mistakes",
      "Slow pipelines (30+ minutes): developers stop waiting for them. Cache dependencies, run jobs in parallel, split slow e2e tests.",
      "Flaky tests (pass or fail randomly) that everyone just re-runs; fix or quarantine them, or the pipeline loses trust.",
      "Rebuilding the image separately for each environment; build once, promote the same artifact.",
      "Skipping tests on 'urgent' hotfixes; the urgent fixes are the ones most likely to break things.",
      "# Say this in the interview",
      "A CI/CD pipeline is the automated path from commit to production, triggered by pushes and pull requests. CI checks out code, installs dependencies, lints, runs unit tests, builds an artifact and runs security scans; then we package a versioned Docker image and push it to a registry. CD deploys it to staging, runs integration tests, optionally waits for approval, deploys to production gradually, and smoke-tests and monitors with automatic rollback. I order stages so the cheapest checks fail fast.",
      "Follow-up: How do you speed up a slow pipeline?",
      "  Cache dependencies and Docker layers, run independent jobs in parallel, use test sharding, and only run heavy e2e suites where needed.",
      "Follow-up: What happens if production deploy fails?",
      "  Health checks or smoke tests fail the deploy and we roll back automatically to the previous version, then investigate.",
    ],
    code: `# .github/workflows/pipeline.yml
name: pipeline
on:
  push: { branches: [main] }
  pull_request:
jobs:
  ci:                                   # stage 1: fast checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci                     # exact deps from lockfile
      - run: npm run lint               # fail fast on style issues
      - run: npx tsc --noEmit           # type-check
      - run: npm test                   # unit tests
  build:                                # stage 2: package
    needs: ci                           # only if ci passed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ghcr.io/acme/api:\${{ github.sha }} .
      # (login + docker push omitted for brevity)
  deploy-staging:                       # stage 3: deliver
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh staging \${{ github.sha }}
      - run: curl -f https://staging.acme.dev/health   # smoke test → fails job on non-2xx`,
  },
  {
    id: 'continuous-delivery-vs-deployment',
    group: 'CI/CD',
    stars: 5,
    difficulty: 'Easy',
    q: 'Continuous Integration vs Continuous Delivery vs Continuous Deployment?',
    a: [
      "# ELI5",
      "Continuous Integration: every time a chef adds an ingredient to the shared pot, someone tastes it right away, so a bad ingredient is caught immediately.",
      "Continuous Delivery: the dish is always plated and ready on the counter; the head chef just has to say 'serve it'.",
      "Continuous Deployment: there is no head chef pressing a button; as soon as a dish passes tasting, it goes straight to the customer's table.",
      "Mapping back: tasting = automated build and tests, the counter = a releasable artifact, serving = deploying to production.",
      "# What it is",
      "These are three levels of automation, each building on the previous one.",
      "Continuous Integration (CI): developers merge small changes into the main branch frequently (at least daily), and every merge is automatically built and tested.",
      "Continuous Delivery: everything in CI, plus every change that passes is automatically packaged and deployed to staging, so it is always ready to release. Going to production needs a human to click approve.",
      "Continuous Deployment: everything in Continuous Delivery, but with no human gate — every change that passes all automated checks goes to production automatically.",
      "Comparison, row by row:",
      "  Who decides to release? CI: not covered. Delivery: a human. Deployment: the pipeline.",
      "  How often to prod? Delivery: whenever the business chooses (daily, weekly). Deployment: every passing commit, often many times a day.",
      "  What it needs: CI needs good unit tests; Delivery adds automated deploys to staging; Deployment adds strong automated testing, monitoring, feature flags and auto-rollback.",
      "Trunk-based development (everyone merging small changes to one main branch, the 'trunk') is the usual companion; long-lived feature branches undermine CI.",
      "# How it works",
      "A developer opens a short-lived branch and a pull request.",
      "  CI runs build, lint and tests on the PR; merging is blocked if they fail.",
      "After merge to `main`:",
      "  Delivery/Deployment pipeline builds the image once and deploys it to staging.",
      "  Integration/e2e tests run against staging.",
      "Then the paths split:",
      "  Continuous Delivery: the pipeline pauses at an approval gate (e.g. a GitHub 'environment' with required reviewers). A person approves and the same image deploys to prod.",
      "  Continuous Deployment: no pause; the pipeline deploys to prod, often as a canary, and rolls back automatically if metrics degrade.",
      "Unfinished features are hidden behind feature flags so they can be deployed without being visible.",
      "# Example walkthrough",
      "The `deploy-prod` job uses `environment: production`.",
      "If the `production` environment in GitHub settings has 'required reviewers', the job waits for a human approval — that is Continuous Delivery.",
      "Remove the reviewers rule and the same YAML deploys automatically after staging passes — that is Continuous Deployment.",
      "The only difference is the gate; the build, test and deploy automation is identical.",
      "# Why it matters / when to use",
      "CI is essential for every team; it is the baseline for avoiding painful 'merge hell'.",
      "Continuous Delivery suits regulated industries (banking, healthcare) or businesses that release on a schedule but still want push-button releases.",
      "Continuous Deployment suits web products with strong test suites and observability, e.g. SaaS companies deploying dozens of times a day.",
      "Smaller, more frequent releases are less risky: each change is small and easy to roll back or debug.",
      "# Common mistakes",
      "Calling it 'CI' while merging long-lived branches once a month; that is not continuous integration.",
      "Confusing 'Continuous Delivery' and 'Continuous Deployment' in interviews — the key difference is the manual production gate.",
      "Turning on continuous deployment without monitoring and rollback; bugs then reach users quickly with nobody watching.",
      "Using a manual gate that nobody actually reviews — it just adds delay without safety.",
      "# Say this in the interview",
      "Continuous Integration means merging small changes to main frequently, with every change automatically built and tested. Continuous Delivery extends that so every passing change is automatically deployed to staging and is always releasable, but production needs a manual approval. Continuous Deployment removes that gate, so every passing change goes to production automatically, which requires strong tests, monitoring, feature flags and fast rollback.",
      "Follow-up: How do you deploy unfinished features with continuous deployment?",
      "  Wrap them in feature flags that are off in production, so the code ships but is not released to users.",
      "Follow-up: Which would you choose for a fintech app?",
      "  Usually continuous delivery with an approval gate and audit trail, moving toward deployment as test confidence grows.",
    ],
    code: `# The only difference between Delivery and Deployment is the gate
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh staging \${{ github.sha }}   # always automatic

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    # "production" environment configured in repo Settings → Environments:
    #   with Required reviewers   → pipeline pauses   = Continuous DELIVERY
    #   without Required reviewers → deploys at once  = Continuous DEPLOYMENT
    environment: production
    steps:
      - run: ./deploy.sh prod \${{ github.sha }}
      # → "Waiting for review: production needs approval" (delivery mode)`,
  },
  {
    id: 'blue-green-vs-canary',
    group: 'CI/CD',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain blue-green, canary and rolling deployments.',
    a: [
      "# ELI5",
      "Blue-green: a theatre has two identical stages. While the show runs on the blue stage, you build the new set on the green stage. When it is ready, you swing the audience's chairs to face green. If it looks wrong, swing them back.",
      "Canary: miners used to take a canary bird into the mine; if the air was bad the bird reacted first. You let a few customers try the new version first, and if they hit problems, you stop before everyone does.",
      "Rolling: replacing the bulbs in a long hallway one by one; the hallway is never dark, but for a while some bulbs are old and some are new.",
      "Mapping back: these are three ways to swap the old version of your app for the new one without downtime, trading off cost, safety and speed.",
      "# What it is",
      "A deployment strategy is how traffic moves from the old version (v1) of an app to the new version (v2).",
      "Load balancer (LB): a component that receives user requests and spreads them across servers. Many strategies work by changing where the LB sends traffic.",
      "Blue-green: run two full environments. Blue = current live, green = new version. Deploy and test green while blue serves users, then switch all traffic at the LB or DNS in one step.",
      "Canary: deploy v2 alongside v1 and send it a small percentage of real traffic (1%, then 10%, 50%, 100%), watching error rate and latency at each step. Promote if healthy, abort if not.",
      "Rolling: replace instances in batches (e.g. 2 at a time) until all run v2. This is Kubernetes Deployments' default.",
      "Comparison, row by row:",
      "  Extra infrastructure: blue-green needs 2x during the switch; canary needs a little; rolling needs almost none.",
      "  Rollback speed: blue-green instant (switch back); canary fast (shift weight to 0); rolling slower (roll back batch by batch).",
      "  Blast radius (how many users a bug affects): blue-green all at once after switch; canary only the small slice; rolling a growing portion.",
      "  Complexity: rolling simplest; blue-green medium; canary needs traffic splitting plus automated metric analysis.",
      "Blast radius: the share of users or systems hurt if something goes wrong. Smaller is safer.",
      "# How it works",
      "Blue-green step by step:",
      "  Green is deployed with v2 and tested privately (smoke tests on an internal URL).",
      "  The router/LB target is switched from blue to green.",
      "  Blue is kept idle for a while so you can switch back instantly; later it becomes the next 'green'.",
      "Canary step by step:",
      "  Deploy a few v2 pods; route 5% of traffic via weighted routing (service mesh, ingress weights, ALB weighted target groups).",
      "  Compare v2 metrics with v1 for some minutes (automated analysis in Argo Rollouts or Flagger).",
      "  Increase weight in steps; at 100% remove v1. If a metric breaches its threshold, route back to v1.",
      "Rolling step by step:",
      "  Start some v2 instances (`maxSurge`), wait for readiness checks, remove some v1 instances (`maxUnavailable`), repeat.",
      "In all three, old and new versions may be live at the same moment, so the database schema and APIs must be backward compatible.",
      "# Example walkthrough",
      "The Argo Rollouts manifest describes a canary for `api` with image `api:2.0.0`.",
      "Step 1 sets 10% of traffic to v2 and pauses 5 minutes; if no one aborts, step 2 goes to 50% and pauses again; then it finishes at 100%.",
      "Running `kubectl argo rollouts abort api` at any point sends all traffic back to the stable v1 pods.",
      "Switching `strategy` to `blueGreen` with `activeService` and `previewService` would instead keep two sets of pods and flip the Service in one go.",
      "# Why it matters / when to use",
      "Blue-green: when you need instant rollback and can afford double capacity briefly, e.g. a monolith on VMs or a critical payment service.",
      "Canary: high-traffic services where you want real-user validation with minimal risk, e.g. a checkout API at scale.",
      "Rolling: the default for most stateless microservices on Kubernetes; simple and cheap.",
      "Tooling: Argo Rollouts, Flagger, Istio/Linkerd service meshes, AWS CodeDeploy, ALB weighted target groups.",
      "# Common mistakes",
      "Breaking database changes (renaming a column) during a deploy; v1 still running crashes. Use expand-and-contract migrations.",
      "Running a canary without looking at metrics; it then just becomes a slow rolling deploy.",
      "Forgetting long-lived connections and sessions: users stuck on blue after the switch; drain connections and keep sessions in a shared store.",
      "Canary percentages too small for low-traffic services; 1% of 10 requests per minute tells you nothing.",
      "# Say this in the interview",
      "Blue-green keeps two identical environments; we deploy to the idle one and switch traffic at the load balancer, giving instant rollback at the cost of double infrastructure. Canary sends a small percentage of real traffic to the new version, watches metrics and gradually promotes or aborts, which minimises blast radius. Rolling replaces instances in batches with no extra infrastructure, but old and new versions run side by side, so all strategies need backward-compatible schema changes.",
      "Follow-up: How do you decide a canary is healthy?",
      "  Compare error rate, latency percentiles and saturation of canary versus stable against SLO-based thresholds, ideally automatically.",
      "Follow-up: What is the downside of blue-green with databases?",
      "  Both environments usually share one database, so schema changes must work for both versions during the switch.",
    ],
    code: `# rollout.yaml — canary with Argo Rollouts (kubectl argo rollouts plugin)
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata: { name: api }
spec:
  replicas: 10
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/api:2.0.0      # the new version
  strategy:
    canary:
      steps:
        - setWeight: 10          # 10% of traffic → v2
        - pause: { duration: 5m } # watch dashboards/analysis
        - setWeight: 50
        - pause: { duration: 5m }
        # then 100% automatically

# shell:
#   kubectl argo rollouts get rollout api    → Status: Paused, SetWeight: 10
#   kubectl argo rollouts promote api        → skip the pause, go to next step
#   kubectl argo rollouts abort api          → all traffic back to stable v1`,
  },
  {
    id: 'github-actions-basics',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain the structure of a GitHub Actions workflow.',
    a: [
      "# ELI5",
      "Imagine a to-do list taped to the fridge that says: 'When someone comes home (the event), do these chores (jobs). Each chore has small steps.'",
      "Several people can do different chores at the same time, unless a chore says 'wait until the dishes are done'.",
      "Some steps are written out by hand ('wipe the table'), others say 'use the robot vacuum' — a ready-made helper someone else built.",
      "Mapping back: the fridge note is a workflow file, the event is a git push or PR, chores are jobs run on machines, steps are shell commands or reusable actions.",
      "# What it is",
      "GitHub Actions is GitHub's built-in CI/CD system. Pipelines are called workflows and are YAML files stored in `.github/workflows/` in your repository.",
      "YAML: a human-friendly data format using indentation (like Python) for nesting; `key: value` pairs and `- item` lists.",
      "`on:` — the events that trigger the workflow: `push`, `pull_request`, `schedule` (cron), `workflow_dispatch` (manual run button), `release`, and more.",
      "`jobs:` — a map of jobs. Each job runs on a fresh runner (a virtual machine like `ubuntu-latest`, or a self-hosted machine) and jobs run in parallel unless linked with `needs:`.",
      "`steps:` — ordered list inside a job. Each step either `uses:` an action (a reusable packaged step from the Marketplace, e.g. `actions/checkout@v4`) or `run:`s shell commands.",
      "Expressions: `${{ ... }}` evaluates values, e.g. `${{ secrets.API_KEY }}`, `${{ github.sha }}` (commit id) or `${{ matrix.node }}`.",
      "Secrets: encrypted values stored in repo/org settings, injected at runtime and automatically masked (`***`) in logs.",
      "Matrix: run the same job for several combinations, e.g. Node 20 and 22 on Linux and Windows.",
      "Environments: named targets (staging, production) with their own secrets and protection rules like required reviewers.",
      "# How it works",
      "You push a commit; GitHub matches it against every workflow's `on:` filters.",
      "  For each matching workflow, GitHub queues its jobs.",
      "  Jobs without `needs:` start in parallel on separate runners; dependent jobs wait.",
      "  Each runner starts clean: no code, no dependencies. That is why `actions/checkout` is usually the first step.",
      "  Steps run in order; a failing step (non-zero exit code) fails the job and skips the remaining steps unless `if: always()` is used.",
      "  Results show as checks on the commit/PR; branch protection can require them to pass before merge.",
      "Caching (`actions/cache` or `setup-node`'s `cache: npm`) restores dependency folders between runs to save minutes.",
      "Artifacts (`actions/upload-artifact`) pass files between jobs or keep reports after the run.",
      "OIDC: a job can request a short-lived identity token (`permissions: id-token: write`) and exchange it for cloud credentials, avoiding stored access keys.",
      "# Example walkthrough",
      "`on: [push, pull_request]` — runs on every push and every PR.",
      "The `test` job uses a matrix with Node 20 and 22, so GitHub starts two parallel jobs, one per version.",
      "`actions/checkout@v4` clones the repo; `actions/setup-node@v4` installs the matrix's Node version and caches the npm folder.",
      "`npm ci && npm test` installs exact dependencies and runs tests; `API_KEY` comes from encrypted secrets and appears as `***` in logs.",
      "If tests pass for both versions, the PR shows two green checks: 'test (20)' and 'test (22)'.",
      "# Why it matters / when to use",
      "It is the most common CI for projects hosted on GitHub; no separate server to maintain.",
      "Typical uses: run tests on PRs, build and push Docker images, deploy on merge to main, nightly jobs, release automation, dependency updates.",
      "Reusable workflows (`workflow_call`) and composite actions let teams share one standard pipeline across many repos.",
      "# Common mistakes",
      "Pinning third-party actions to a moving tag like `@main`; pin to a version or, for security, to a full commit SHA.",
      "Giving the default `GITHUB_TOKEN` broad write permissions; set `permissions:` to the minimum (e.g. `contents: read`).",
      "Using `pull_request_target` with untrusted fork code; it runs with secrets and can leak them.",
      "Indentation errors in YAML; GitHub reports 'Invalid workflow file'. Use an editor with YAML validation.",
      "# Say this in the interview",
      "A workflow is a YAML file in .github/workflows triggered by events like push, pull_request, schedule or workflow_dispatch. It contains jobs, which run in parallel on runners unless ordered with needs, and each job has steps that either use reusable actions or run shell commands. On top of that we use secrets, matrix builds, caching, environments with protection rules and OIDC to get short-lived cloud credentials.",
      "Follow-up: How do you share data between jobs?",
      "  Use job `outputs` for small values and `upload-artifact`/`download-artifact` for files, since each job runs on a separate machine.",
      "Follow-up: How do you run a workflow manually?",
      "  Add `workflow_dispatch` to `on:`, optionally with inputs, then click 'Run workflow' or use `gh workflow run`.",
    ],
    code: `# .github/workflows/ci.yml
name: ci
on: [push, pull_request]          # events that trigger the workflow
permissions:
  contents: read                  # least privilege for GITHUB_TOKEN
jobs:
  test:
    runs-on: ubuntu-latest        # fresh VM per job
    strategy:
      matrix:
        node: [20, 22]            # → two parallel jobs: test (20), test (22)
    steps:
      - uses: actions/checkout@v4             # reusable action: clone repo
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm                          # restore ~/.npm between runs
      - run: npm ci && npm test               # shell commands
        env:
          API_KEY: \${{ secrets.API_KEY }}     # printed as *** in logs
  # a later job could add:  needs: test   to run only after tests pass`,
  },
  {
    id: 'secrets-in-pipelines',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you handle secrets in a CI/CD pipeline?',
    a: [
      "# ELI5",
      "Your house key should not be taped to the front door where everyone walking past can copy it.",
      "Instead, you keep it in a locked box and only hand it to the cleaner when they arrive, and you take it back when they leave.",
      "Even better: give the cleaner a key that only works today, so if they lose it, nobody can use it tomorrow.",
      "Mapping back: the key is a password or API key, the door is your Git repo, the locked box is a secret manager, and the one-day key is a short-lived credential.",
      "# What it is",
      "A secret is any value that grants access: database passwords, API keys, cloud access keys, signing keys, tokens.",
      "Pipelines need secrets to push images, deploy to the cloud, or run integration tests, which makes CI a prime target for attackers.",
      "CI secret store: GitHub Actions secrets, GitLab CI variables (masked/protected), Jenkins credentials. They are encrypted at rest and masked in logs (shown as `***`).",
      "Static credential: a long-lived key (e.g. an AWS access key) that works until someone revokes it. Dangerous if leaked.",
      "Short-lived credential: valid for minutes or an hour, issued on demand. Even if leaked, it expires quickly.",
      "OIDC federation (OpenID Connect): the CI job proves its identity to the cloud with a signed token ('I am repo acme/api, branch main') and the cloud returns temporary credentials. No stored keys at all.",
      "Secret manager: a dedicated service for storing and rotating secrets, e.g. HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault.",
      "# How it works",
      "Recommended flow:",
      "  Developers never commit secrets; pre-commit hooks and server-side scanners (gitleaks, GitHub push protection) block them.",
      "  CI uses OIDC to assume a cloud role scoped to that repo and branch, getting credentials valid for ~1 hour.",
      "  Deploy credentials are stored per environment (staging vs production) and production secrets are only exposed to jobs that passed an approval gate.",
      "  The application itself fetches its runtime secrets (DB password) from a secret manager at startup or via Kubernetes External Secrets, not baked into the image.",
      "  Secrets are rotated regularly and immediately if a leak is suspected; access is audited.",
      "Masking only hides exact matches in logs; a transformed secret (base64 encoded, split) can still leak.",
      "# Example walkthrough",
      "`permissions: id-token: write` lets the job request an OIDC token from GitHub.",
      "`aws-actions/configure-aws-credentials` exchanges that token for temporary credentials by assuming `deploy-role`, whose trust policy only accepts tokens from `repo:acme/api:ref:refs/heads/main`.",
      "No `AWS_ACCESS_KEY_ID` is stored anywhere; the credentials expire after the session.",
      "`environment: production` means only this environment's secrets are available, and only after reviewers approve.",
      "The final step reads `DB_PASSWORD` from Secrets Manager at deploy time instead of keeping it in GitHub.",
      "# Why it matters / when to use",
      "Leaked keys in public repos are found by bots within minutes and used for crypto mining or data theft.",
      "Supply-chain attacks target CI: a compromised dependency or action can read environment variables. Fewer and shorter-lived secrets limit damage.",
      "Compliance (SOC 2, ISO 27001, PCI) requires controlled, audited secret access and rotation.",
      "# Common mistakes",
      "Echoing secrets or running `set -x` / `env` in a step; they may print in logs in a way masking misses.",
      "Committing `.env` files; add them to `.gitignore` and scan history. A secret in Git history must be rotated, not just deleted.",
      "Using one all-powerful cloud key for every pipeline and environment; scope per repo and environment.",
      "Baking secrets into Docker images via `ENV` or `COPY .env`; anyone who pulls the image can read them.",
      "# Say this in the interview",
      "I never commit secrets and use the CI platform's encrypted secret store, which masks values in logs, scoped per environment with approval rules for production. For cloud access I prefer OIDC federation so the pipeline gets short-lived credentials instead of static access keys. Runtime secrets are fetched from Vault or AWS Secrets Manager, rotated regularly, and we run secret scanners like gitleaks and push protection to catch leaks.",
      "Follow-up: A secret was committed to Git; what do you do?",
      "  Rotate/revoke it immediately, then remove it from history if needed and investigate whether it was used; deleting the file alone is not enough.",
      "Follow-up: Why is OIDC better than access keys in CI?",
      "  No long-lived secret is stored, credentials expire quickly, and the cloud can restrict which repo/branch may assume the role.",
    ],
    code: `# .github/workflows/deploy.yml — no stored cloud keys, using OIDC
name: deploy
on: { push: { branches: [main] } }
permissions:
  id-token: write                 # allow requesting an OIDC token
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production       # prod-only secrets + required reviewers
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/deploy-role
          aws-region: us-east-1
        # → temporary credentials (~1h); trust policy allows only
        #   repo:acme/api:ref:refs/heads/main
      - name: Read DB password at deploy time
        run: |
          DB_PASSWORD=$(aws secretsmanager get-secret-value \\
            --secret-id prod/api/db --query SecretString --output text)
          echo "::add-mask::$DB_PASSWORD"   # make sure it is masked
          ./deploy.sh                       # never echo the value itself`,
  },
  {
    id: 'feature-flags',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are feature flags and why are they useful?',
    a: [
      "# ELI5",
      "Think of the light switches in your house. The wiring for a new lamp can be installed today, but the lamp stays off until you flip the switch.",
      "You could even flip it on only in your bedroom first, to check it works, before turning it on in every room.",
      "If the lamp sparks, you flip it off instantly — no electrician needed.",
      "Mapping back: the wiring is code deployed to production, the switch is a feature flag, and flipping it is releasing the feature without a new deploy.",
      "# What it is",
      "A feature flag (or feature toggle) is a runtime setting that turns a code path on or off without changing or redeploying the code.",
      "Runtime: while the app is running, as opposed to build time. The app checks the flag's current value on each request.",
      "Deploy vs release: deploy = putting new code on servers; release = letting users actually use the feature. Flags separate these two moments.",
      "Kinds of flags:",
      "  Release flags: hide unfinished work; short-lived.",
      "  Experiment flags: A/B tests — show variant A to some users, B to others, and measure which performs better.",
      "  Ops flags / kill switches: quickly disable an expensive or risky feature during an incident.",
      "  Permission flags: enable features for specific customers or plans (beta testers, enterprise).",
      "Targeting: flag rules can depend on user id, country, plan or a percentage, e.g. 'on for 10% of users'.",
      "Tools: LaunchDarkly, Unleash, Flagsmith, ConfigCat, AWS AppConfig; OpenFeature is a vendor-neutral standard SDK API.",
      "# How it works",
      "The developer wraps new code in a check: `if (flags.isEnabled('new-checkout', user)) { ... } else { ...old code... }`.",
      "  The code is merged to main and deployed with the flag off — users see no change.",
      "  The flag service stores rules; the SDK in your app downloads them and evaluates locally (fast, no network call per check).",
      "  Product or engineers turn it on for internal staff, then 5% of users, then 50%, watching metrics.",
      "  At 100% and stable, a developer deletes the flag check and old code path — this cleanup step is essential.",
      "For percentage rollouts the SDK hashes the user id so the same user consistently gets the same answer.",
      "# Example walkthrough",
      "The snippet uses a tiny in-memory flag store so it runs with plain Node 22.",
      "`isEnabled('new-checkout', 'user-7')` hashes the user id to a number 0–99 and returns true if it is below the rollout percent.",
      "With `rollout: 0`, every user gets the old checkout. Changing it to 100 (in a real system, via a dashboard) switches everyone with no redeploy.",
      "Because the same id always hashes the same way, a user does not flip between old and new on every request.",
      "# Why it matters / when to use",
      "Trunk-based development: developers merge unfinished work to main daily behind flags instead of keeping long-lived branches.",
      "Safer releases: gradual rollout and instant kill switch reduce the blast radius of bugs.",
      "Business control: product managers can launch a feature at a marketing event without an engineer deploying.",
      "Experiments: A/B tests to decide which version improves conversion.",
      "# Common mistakes",
      "Flag debt: hundreds of stale flags left in code, making logic confusing. Set an owner and expiry date and remove flags after rollout.",
      "Testing only one side: both flag states must be tested, since either may be live.",
      "Evaluating flags with a remote call on every request; use the SDK's local cache to avoid latency and outages.",
      "Using flags for secrets or security checks that the client can override; evaluate sensitive flags on the server.",
      "# Say this in the interview",
      "Feature flags are runtime toggles that enable or disable code paths without redeploying. They decouple deploy from release, so we can merge unfinished work to trunk safely, roll out gradually by percentage or user segment, run A/B tests and use kill switches during incidents. The downside is flag debt, so every flag needs an owner and is removed after rollout; tools include LaunchDarkly, Unleash and the OpenFeature standard.",
      "Follow-up: How do you keep a user's experience consistent in a 10% rollout?",
      "  Hash a stable identifier like the user id into a bucket so the same user always gets the same flag value.",
      "Follow-up: How do flags relate to canary deployments?",
      "  Canary splits traffic between two deployed versions at the infrastructure level; flags split behaviour inside one version at the code level. They complement each other.",
    ],
    code: `// flags.ts — minimal percentage-rollout flag (run: npx tsx flags.ts)
import { createHash } from "node:crypto";

type Flag = { enabled: boolean; rollout: number }; // rollout: 0-100 %
const flags: Record<string, Flag> = {
  "new-checkout": { enabled: true, rollout: 10 },  // normally fetched from a flag service
};

function bucket(userId: string): number {
  // stable 0-99 bucket per user, so a user never flips back and forth
  const hex = createHash("sha256").update(userId).digest("hex").slice(0, 8);
  return parseInt(hex, 16) % 100;
}

function isEnabled(name: string, userId: string): boolean {
  const f = flags[name];
  return !!f && f.enabled && bucket(userId) < f.rollout;
}

for (const id of ["user-1", "user-2", "user-3", "user-7"]) {
  const checkout = isEnabled("new-checkout", id) ? "NEW checkout" : "old checkout";
  console.log(id, "→", checkout);
}
// → roughly 10% of users see "NEW checkout"; the same user always gets the same answer
// set enabled: false → everyone instantly gets "old checkout" (kill switch)`,
  },
  {
    id: 'gitops-argocd',
    group: 'CI/CD',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is GitOps?',
    a: [
      "# ELI5",
      "Imagine a LEGO model and a picture on the box showing what it should look like.",
      "A helper robot keeps comparing the model with the picture. If your little brother pulls a brick off, the robot puts it back.",
      "If you want the model to change, you do not touch the model; you change the picture, and the robot rebuilds to match.",
      "Mapping back: the picture is your Git repository, the model is the running cluster, and the robot is Argo CD or Flux constantly syncing the two.",
      "# What it is",
      "GitOps is a way of operating infrastructure and applications where Git is the single source of truth for the desired state.",
      "Desired state: what should be running — which apps, which image versions, how many replicas — written declaratively (describe the result, not the steps) as Kubernetes YAML, Helm charts or Kustomize.",
      "Actual (live) state: what is really running in the cluster right now.",
      "Reconciliation: continuously comparing desired and actual state and fixing differences. A program that does this is a reconciler or controller.",
      "GitOps agent: a controller running inside the cluster that pulls from Git and applies changes — Argo CD and Flux are the two main ones (both CNCF graduated projects).",
      "Drift: when the live state differs from Git, e.g. someone ran `kubectl edit` by hand. GitOps detects drift and can self-heal by reverting it.",
      "Push vs pull deployment: traditional CI pushes into the cluster (needs cluster credentials). GitOps is pull-based: the in-cluster agent pulls from Git, so CI never touches the cluster.",
      "# How it works",
      "Typical flow with two repos (app code and config):",
      "  A developer merges code; CI tests it, builds image `api:abc123` and pushes it to the registry.",
      "  CI (or a bot like Argo CD Image Updater/Renovate) opens a PR in the config repo changing the image tag to `abc123`.",
      "  The PR is reviewed and merged — this merge is the deployment approval.",
      "  Argo CD notices the new commit (polling every ~3 minutes or via webhook), renders the manifests and compares with the cluster.",
      "  It applies the difference; status turns `Synced` and `Healthy` once pods are ready.",
      "Rollback = `git revert` of the config commit; the agent syncs back to the previous state.",
      "With `selfHeal: true`, manual cluster changes are reverted; with `prune: true`, resources deleted from Git are deleted from the cluster.",
      "# Example walkthrough",
      "The Argo CD `Application` points at repo `acme/k8s-config`, folder `apps/api/prod`, branch `main`.",
      "`destination` says deploy into the local cluster's `prod` namespace.",
      "`automated.prune` removes things deleted from Git; `automated.selfHeal` undoes manual `kubectl` edits.",
      "After applying, `argocd app get api-prod` shows `Sync Status: Synced`, `Health Status: Healthy`. If someone scales the deployment by hand, it shows `OutOfSync` briefly and then returns to the Git value.",
      "# Why it matters / when to use",
      "Audit trail: every production change is a Git commit with author, reviewer and timestamp.",
      "Easy rollback and disaster recovery: rebuild a whole cluster by pointing a new agent at the repo.",
      "Security: CI has no cluster admin credentials; only the agent inside the cluster can change it.",
      "Multi-cluster: one config repo can drive dozens of clusters consistently.",
      "# Common mistakes",
      "Storing plain Kubernetes Secrets in Git; use Sealed Secrets, SOPS or External Secrets Operator.",
      "Mixing manual `kubectl apply` with GitOps; the agent will fight you or the change will be lost.",
      "Putting app code and environment config in one repo, so every code commit triggers config syncs; many teams separate them.",
      "Forgetting that GitOps covers deploy, not build: you still need CI to test and build images.",
      "# Say this in the interview",
      "GitOps makes Git the single source of truth for the desired state of infrastructure and apps, as declarative manifests. An in-cluster agent like Argo CD or Flux pulls from Git and continuously reconciles the cluster to match. It is pull-based, so CI only builds images and updates the tag in the config repo without needing cluster credentials. Benefits are an audit trail via PRs, rollback with git revert, and drift detection with self-healing.",
      "Follow-up: How do you roll back in GitOps?",
      "  Revert the commit in the config repo; the agent syncs the cluster back to the previous manifests.",
      "Follow-up: How are secrets handled?",
      "  Encrypt them in Git with SOPS or Sealed Secrets, or reference an external secret manager via External Secrets Operator.",
    ],
    code: `# argocd-app.yaml — Argo CD keeps prod in sync with Git
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/acme/k8s-config.git
    targetRevision: main
    path: apps/api/prod                 # manifests / kustomize / helm chart
  destination:
    server: https://kubernetes.default.svc
    namespace: prod
  syncPolicy:
    automated:
      prune: true                       # delete what was removed from Git
      selfHeal: true                    # revert manual kubectl changes
    syncOptions: [CreateNamespace=true]

# CI only edits the config repo, e.g.:
#   kustomize edit set image ghcr.io/acme/api=ghcr.io/acme/api:abc123 && git commit && git push
# argocd app get api-prod  → Sync Status: Synced   Health Status: Healthy
# rollback:  git revert <commit> && git push`,
  },
  {
    id: 'build-once-promote',
    group: 'CI/CD',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why "build once, deploy many" and how do you version artifacts?',
    a: [
      "# ELI5",
      "A bakery bakes one cake, a taster checks it, and then that exact same cake goes to the customer.",
      "It would be silly to bake a fresh cake for the customer after tasting a different one: the new cake might have too much salt.",
      "The cake gets a sticker with a unique number so everyone knows which cake was tasted.",
      "Mapping back: the cake is your Docker image, the taster is staging tests, the customer is production, and the sticker is an immutable version tag or digest.",
      "# What it is",
      "Build once, deploy many: build the artifact (e.g. Docker image) exactly once in CI, then promote that same unchanged artifact through dev, staging and production.",
      "Promote: move the already-built artifact to the next environment, rather than rebuilding it.",
      "Immutable artifact: once published, it never changes. If you need a change, you build a new version.",
      "Why rebuilding is risky: a rebuild can pull different dependency versions, a newer base image, or use different build flags, so what reaches production is not what you tested.",
      "Environment differences (database URL, feature flags, log level) are injected at runtime through environment variables, config files or secrets — not baked into the image.",
      "This idea is factor III of the Twelve-Factor App methodology: 'store config in the environment'.",
      "Versioning options:",
      "  Git SHA tag (`api:3f9c2ab`): uniquely links an image to the exact commit.",
      "  Semantic version (`api:2.4.1`, MAJOR.MINOR.PATCH): human-friendly releases.",
      "  Digest (`api@sha256:9b1e...`): a hash of the image content; guaranteed immutable even if a tag is moved.",
      "`latest` is a mutable tag (it moves to whatever was pushed last), so it should never be used to deploy production.",
      "# How it works",
      "CI on merge to main builds `api:<git-sha>` once and pushes it to the registry.",
      "  Deploy to staging with that tag; run integration tests.",
      "  On approval, deploy the same tag (or digest) to production — no build step in this job.",
      "  Optionally add a semver tag to the same image (`docker buildx imagetools create` or `crane tag`) when releasing; it is the same digest.",
      "Config per environment is supplied by Kubernetes ConfigMaps/Secrets, Helm values, or the platform's env vars.",
      "Registries can enforce tag immutability (ECR 'immutable tags') so nobody can overwrite `2.4.1` later.",
      "# Example walkthrough",
      "The build job tags the image with `github.sha` and pushes it. This is the only `docker build` in the pipeline.",
      "The staging and production jobs both reference the same `IMAGE` value; they only differ in `APP_ENV`/config.",
      "`docker inspect --format '{{index .RepoDigests 0}}'` prints the digest, e.g. `ghcr.io/acme/api@sha256:9b1e...`; deploying by digest guarantees bytes are identical.",
      "If staging tests fail, production never runs, and nothing needs rebuilding.",
      "# Why it matters / when to use",
      "Confidence: the exact bytes you tested are what users run.",
      "Traceability: from a running pod you can find the image tag, then the commit, then the PR.",
      "Speed and cost: no repeated builds per environment.",
      "Easy rollback: redeploy the previous immutable tag.",
      "# Common mistakes",
      "Baking environment-specific values (API URLs) into a frontend bundle at build time, forcing per-env builds; load config at runtime instead.",
      "Using `latest` or a reused tag like `staging`, so you cannot tell which code is running.",
      "Overwriting a version tag after a hotfix instead of publishing a new version.",
      "Not pinning base images and dependencies, so even the 'once' build is not reproducible later.",
      "# Say this in the interview",
      "We build the artifact or image once in CI and promote that same immutable artifact through dev, staging and prod, because rebuilding per environment risks differences between what was tested and what ships. Environment differences come from config, environment variables and secrets at runtime. Images are tagged with the git SHA and semver for releases, deployed by digest where possible, and we avoid the mutable latest tag in production.",
      "Follow-up: What is an image digest?",
      "  A SHA-256 hash of the image manifest; it identifies the exact content and cannot be changed, unlike a tag.",
      "Follow-up: How do you handle a frontend that needs a different API URL per environment?",
      "  Serve a runtime config file or inject values at container start, instead of compiling them into the bundle.",
    ],
    code: `# .github/workflows/release.yml (sketch)
env:
  IMAGE: ghcr.io/acme/api:\${{ github.sha }}     # one immutable tag per commit
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t "$IMAGE" . && docker push "$IMAGE"   # the ONLY build
  staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: kubectl -n staging set image deploy/api api="$IMAGE"
      - run: ./run-integration-tests.sh staging
  production:
    needs: staging
    environment: production                       # approval gate
    runs-on: ubuntu-latest
    steps:
      - run: kubectl -n prod set image deploy/api api="$IMAGE"   # same bytes, no rebuild

# get the content digest for deploy-by-digest:
#   docker inspect --format '{{index .RepoDigests 0}}' "$IMAGE"
#   → ghcr.io/acme/api@sha256:9b1e4c...
# config differs per env via ConfigMap/Secret, e.g. DATABASE_URL, LOG_LEVEL`,
  },
  {
    id: 'zero-downtime-db-migrations',
    group: 'CI/CD',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you deploy database schema changes without downtime?',
    a: [
      "# ELI5",
      "Imagine a town renaming 'Old Street' to 'New Street'. If they swap the sign overnight, every delivery driver with an old map gets lost.",
      "Instead they put up both signs for a while. Drivers update their maps at their own pace. Only when nobody uses the old name do they remove the old sign.",
      "Mapping back: the street is a database column, the drivers are app versions still running, and 'both signs' is keeping old and new columns during a transition.",
      "# What it is",
      "A schema is the structure of the database: tables, columns, types, indexes, constraints. A migration is a versioned script that changes the schema (e.g. `ALTER TABLE ... ADD COLUMN`).",
      "Zero downtime means users never see errors during the change. The difficulty: during a rolling or canary deploy, the old and new app versions run at the same time against the same database.",
      "Backward compatible change: the old app still works after the schema changes. Forward compatible: the new app works with the old schema. You need both during a deploy.",
      "Expand-and-contract (also called parallel change): split one breaking change into several safe, compatible steps across multiple releases.",
      "Backfill: copying or computing data for existing rows into a new column, usually in small batches.",
      "Table lock: some `ALTER` operations block reads or writes on a table while they run; on a big table that can mean minutes of outage.",
      "# How it works",
      "Example: rename column `name` to `full_name`.",
      "  Release 1 — Expand: add `full_name` as a nullable column (fast, no rewrite). Old app ignores it.",
      "  Release 2 — Dual write: app writes to both `name` and `full_name`, still reads `name`.",
      "  Backfill: a batch job copies `name` into `full_name` for old rows, e.g. 1,000 rows at a time to avoid long locks.",
      "  Release 3 — Switch reads: app reads `full_name` (still writes both, so rollback is safe).",
      "  Release 4 — Contract: stop writing `name`, then in a later migration drop the column.",
      "Run migrations as a separate pipeline step or Kubernetes Job before the app rollout, using a versioned tool (Flyway, Liquibase, Prisma Migrate, Knex, Alembic) that records which migrations have run.",
      "Postgres-specific safety: create indexes with `CREATE INDEX CONCURRENTLY` (no write lock); add NOT NULL constraints via `CHECK ... NOT VALID` then `VALIDATE CONSTRAINT`; set `lock_timeout` so a migration fails fast rather than queueing behind long transactions.",
      "# Example walkthrough",
      "Migration 001 adds the nullable column — instant in Postgres, existing app keeps working.",
      "The backfill loop updates 1,000 rows per statement until no rows remain; `UPDATE 1000` repeats, then `UPDATE 0` ends it.",
      "Migration 002 builds an index concurrently so writes continue during the build.",
      "Migration 003, deployed weeks later after all app versions read `full_name`, drops `name`.",
      "`SET lock_timeout = '5s'` makes any step abort instead of freezing traffic if it cannot get a lock quickly.",
      "# Why it matters / when to use",
      "Any system with rolling/canary/blue-green deploys and real users: e-commerce, SaaS, payments.",
      "Allows rolling back the application without rolling back the database (database rollbacks are risky and can lose data).",
      "Large tables (millions of rows) make naive migrations cause real outages.",
      "# Common mistakes",
      "Renaming or dropping a column in the same release that changes the code; the still-running old pods immediately crash.",
      "Adding a NOT NULL column with a volatile default or building an index without CONCURRENTLY on a huge table, locking writes.",
      "Running migrations automatically on every app container start; ten replicas race to migrate at once. Run them once, as a dedicated step.",
      "Backfilling all rows in one giant transaction, which holds locks and bloats the database.",
      "# Say this in the interview",
      "I use expand-and-contract so every schema change is backward compatible with both the old and new app versions running during a deploy. First expand by adding a nullable column or new table, deploy code that writes to both, backfill in batches, then switch reads, and only in a later release contract by dropping the old column. Migrations run as a separate versioned step with tools like Flyway or Prisma, and I avoid long locks with concurrent index creation and lock timeouts.",
      "Follow-up: How do you roll back if the new release is bad?",
      "  Roll back the app only; because the schema change is backward compatible, the old version still works with the expanded schema.",
      "Follow-up: Why not run migrations on app startup?",
      "  Multiple replicas would race, startup slows down, and a failing migration would crash-loop every pod; a single Job or pipeline step is safer.",
    ],
    code: `-- 001_expand.sql — safe: nullable column, no table rewrite
SET lock_timeout = '5s';               -- fail fast instead of blocking traffic
ALTER TABLE users ADD COLUMN full_name text;

-- backfill.sql — run repeatedly (e.g. from a Job) until it reports UPDATE 0
UPDATE users SET full_name = name
WHERE id IN (
  SELECT id FROM users WHERE full_name IS NULL LIMIT 1000
);
-- → UPDATE 1000 ... UPDATE 1000 ... UPDATE 0  (done)

-- 002_index.sql — build index without blocking writes (cannot run inside a transaction)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_full_name ON users (full_name);

-- app release N  : writes name AND full_name, reads name
-- app release N+1: writes both, reads full_name
-- app release N+2: writes full_name only

-- 003_contract.sql — weeks later, when no running version uses "name"
SET lock_timeout = '5s';
ALTER TABLE users DROP COLUMN name;`,
  },
  {
    id: 'jenkins-pipeline',
    group: 'CI/CD',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does a Jenkins pipeline work?',
    a: [
      "# ELI5",
      "Jenkins is like a restaurant manager with a recipe book. The manager does not cook; they read the recipe and assign each dish to a cook in the kitchen.",
      "The recipe is written in the kitchen's own notebook (your repo), so whenever the recipe changes, everyone uses the new one automatically.",
      "After every meal, whether it went well or badly, the manager makes sure the kitchen is cleaned and the boss gets a message.",
      "Mapping back: the manager is the Jenkins controller, cooks are agents, the recipe is the `Jenkinsfile`, and the cleanup is the `post` section.",
      "# What it is",
      "Jenkins is an open-source, self-hosted automation server, one of the oldest and most widely used CI/CD tools, extended through thousands of plugins.",
      "Pipeline as code: the pipeline is defined in a file named `Jenkinsfile` stored in the repository, so it is versioned and reviewed like code.",
      "Declarative syntax (the recommended style) uses fixed blocks: `pipeline { agent ... stages { stage('X') { steps { ... } } } post { ... } }`. Scripted syntax is plain Groovy code, more flexible but harder to read.",
      "Groovy: a JVM programming language Jenkins uses for pipeline files.",
      "Controller: the main Jenkins server — it stores configuration, schedules builds and shows the web UI. It should not run builds itself.",
      "Agent: a machine or container that actually executes build steps. Can be static VMs or ephemeral ones created per build (Kubernetes plugin pods, Docker agents).",
      "Multibranch pipeline: Jenkins scans a repo, creates a pipeline for each branch and PR that has a Jenkinsfile, and removes them when branches are deleted.",
      "Shared library: reusable Groovy functions stored in a separate repo and imported by many Jenkinsfiles (`@Library('my-lib') _`).",
      "Credentials plugin: stores secrets (passwords, SSH keys, tokens) and injects them into steps with `credentials()` or `withCredentials`, masking them in logs.",
      "# How it works",
      "A push triggers a webhook to Jenkins (or Jenkins polls SCM).",
      "  The controller checks out the Jenkinsfile and parses it.",
      "  It allocates an agent matching the `agent` directive (any, a label, a Docker image, or a Kubernetes pod).",
      "  Stages run in order; each step (e.g. `sh 'npm test'`) runs on the agent. `parallel` blocks run stages concurrently.",
      "  `when` conditions skip stages, e.g. deploy only on `main`. `input` can pause for human approval.",
      "  The `post` section runs after stages: `always` (cleanup), `success`, `failure` (notify Slack), etc.",
      "  Build logs, test reports (`junit`) and artifacts are archived on the controller.",
      "# Example walkthrough",
      "`agent any` runs on any available agent.",
      "`environment` pulls a credential called `registry-creds`; Jenkins exposes it as `REGISTRY_USR` / `REGISTRY_PSW` variables, masked in logs.",
      "Stage Test runs `npm ci && npm test`; stage Build builds an image tagged with `GIT_COMMIT` (Jenkins provides this variable).",
      "Stage Deploy has `when { branch 'main' }`, so on a feature branch the log shows 'Stage \"Deploy\" skipped due to when conditional'.",
      "`post { failure { ... } }` sends a notification only if something failed; `always { cleanWs() }` wipes the workspace.",
      "# Why it matters / when to use",
      "Very common in enterprises and on-premises setups where code cannot leave the company network.",
      "Extremely flexible: integrates with almost anything via plugins.",
      "Trade-off: you must run, secure, back up and upgrade it yourself, and plugins can conflict; many teams moving to GitHub Actions/GitLab CI cite this.",
      "# Common mistakes",
      "Running builds on the controller; a malicious or heavy build can take down Jenkins. Use agents and set controller executors to 0.",
      "Configuring jobs by clicking in the UI instead of Jenkinsfiles; changes are untracked and hard to reproduce.",
      "Printing credentials in `sh` steps with string interpolation in double-quoted Groovy strings; use single quotes so the shell, not Groovy, expands secrets.",
      "Letting plugins go years without updates, leaving known vulnerabilities.",
      "# Say this in the interview",
      "A Jenkins pipeline is defined as code in a Jenkinsfile in the repo, usually in declarative syntax with pipeline, agent, stages and steps. The controller schedules builds and agents, often ephemeral Kubernetes or Docker agents, execute them. Multibranch pipelines discover branches and PRs automatically, shared libraries reuse logic across repos, the Credentials plugin injects secrets, and the post section handles cleanup and notifications.",
      "Follow-up: How do you run stages in parallel?",
      "  Use a `parallel { stage('A') {...} stage('B') {...} }` block inside a stage.",
      "Follow-up: How do you add a manual approval?",
      "  Use an `input` step or stage-level `input` directive, ideally with a timeout so it does not hold an agent forever.",
    ],
    code: `// Jenkinsfile (declarative)
pipeline {
  agent any
  environment {
    REGISTRY = credentials('registry-creds')   // → REGISTRY_USR / REGISTRY_PSW, masked
  }
  stages {
    stage('Test') {
      steps { sh 'npm ci && npm test' }
    }
    stage('Build') {
      // single quotes: the shell (not Groovy) expands $GIT_COMMIT
      steps { sh 'docker build -t acme/api:$GIT_COMMIT .' }
    }
    stage('Deploy') {
      when { branch 'main' }                    // skipped on feature branches
      steps { sh './deploy.sh $GIT_COMMIT' }
    }
  }
  post {
    failure { echo 'Build failed, notify the team' }   // e.g. slackSend(...)
    always  { cleanWs() }                              // wipe workspace
  }
}
// feature branch log → Stage "Deploy" skipped due to when conditional`,
  },

  // ───────────────────────── Infrastructure as Code ─────────────────────────
  {
    id: 'what-is-iac',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is Infrastructure as Code and what are its benefits?',
    a: [
      "# ELI5",
      "Imagine building a LEGO castle from memory every time. Each castle comes out a bit different, and if it breaks you cannot remember exactly how it looked.",
      "Now imagine you have the instruction booklet. Anyone can build the exact same castle, as many times as they want, and you can see what changed between booklet versions.",
      "Mapping back: the castle is your servers, networks and databases, and the instruction booklet is code. Infrastructure as Code means writing the booklet instead of building by hand in a web console.",
      "# What it is",
      "Infrastructure: everything your app runs on — virtual machines, networks (VPCs, subnets), load balancers, databases, DNS records, Kubernetes clusters, IAM permissions.",
      "Infrastructure as Code (IaC): defining and managing that infrastructure through text files that are stored in version control (Git), reviewed, tested and applied by tools, instead of clicking around a cloud console ('ClickOps').",
      "Two families of tools:",
      "  Provisioning tools create and manage cloud resources: Terraform and its open-source fork OpenTofu, AWS CloudFormation, Pulumi (real programming languages), AWS CDK.",
      "  Configuration management tools set up software inside existing machines: Ansible, Chef, Puppet, Salt.",
      "Declarative style (most IaC): you describe the desired end state ('2 servers of this size') and the tool works out what to create, change or delete.",
      "Idempotent: applying the same code twice gives the same result; the second run changes nothing.",
      "Drift: when real infrastructure no longer matches the code, usually because someone changed it manually.",
      "# How it works",
      "Typical IaC workflow (Terraform example):",
      "  Write `.tf` files describing resources.",
      "  Open a pull request; CI runs formatting, validation, security scans (Checkov, tfsec) and `terraform plan` to show what would change.",
      "  Teammates review the code and the plan.",
      "  After merge, the pipeline runs `terraform apply`, which calls cloud APIs to make reality match the code.",
      "  The tool records what it manages (Terraform's state file) so future runs know what exists.",
      "The same modules are reused for dev, staging and prod with different input variables, so environments stay consistent.",
      "# Example walkthrough",
      "The `provider` block tells Terraform to use AWS in `us-east-1`.",
      "The `aws_s3_bucket` resource declares a bucket named `acme-uploads-prod` with tags.",
      "`terraform plan` prints `+ resource \"aws_s3_bucket\" \"uploads\"` and `Plan: 1 to add, 0 to change, 0 to destroy.`",
      "`terraform apply` creates it. Running `apply` again prints `No changes. Your infrastructure matches the configuration.` — that is idempotency.",
      "Deleting the block and applying would delete the bucket, because the code is the source of truth.",
      "# Why it matters / when to use",
      "Reproducible environments: spin up an identical staging or a new region from the same code.",
      "Code review and audit history: every infrastructure change has a PR, author and reason.",
      "Speed and fewer mistakes: no forgotten checkbox in a console.",
      "Disaster recovery: if an account or region is lost, rebuild from code (plus data backups).",
      "Self-service: developers can request infrastructure through PRs instead of tickets.",
      "# Common mistakes",
      "Mixing IaC with manual console changes; the next apply may revert or conflict with them.",
      "Committing secrets (passwords, keys) in `.tf` files or variables files; use a secret manager or encrypted variables.",
      "One giant configuration for everything; a small change requires planning the whole world and risks unrelated resources. Split by component/environment.",
      "Not pinning provider and module versions, so the same code behaves differently next month.",
      "# Say this in the interview",
      "Infrastructure as Code means managing infrastructure such as networks, servers, DNS and Kubernetes clusters through version-controlled code instead of manual console clicks. That gives reproducible environments, code review through PRs, audit history, faster provisioning and less drift, and it enables disaster recovery because you can rebuild an environment from code. I'd use Terraform or OpenTofu for provisioning and Ansible for configuration management.",
      "Follow-up: Declarative vs imperative IaC?",
      "  Declarative describes the end state and the tool computes the steps (Terraform); imperative scripts list exact commands (bash + CLI).",
      "Follow-up: How do you test IaC?",
      "  `fmt`/`validate`, linters and security scanners in CI, reviewed plans, `terraform test` or Terratest, and applying to a sandbox first.",
    ],
    code: `# main.tf — a whole S3 bucket defined as code
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }   # pin versions
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "uploads" {
  bucket = "acme-uploads-prod"
  tags = {
    team = "backend"
    env  = "prod"
  }
}

# $ terraform init && terraform plan
#   + resource "aws_s3_bucket" "uploads" { ... }
#   Plan: 1 to add, 0 to change, 0 to destroy.
# $ terraform apply      → Apply complete! Resources: 1 added.
# $ terraform apply      → No changes. Your infrastructure matches the configuration.`,
  },
  {
    id: 'terraform-state',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is Terraform state and how should you manage it?',
    a: [
      "# ELI5",
      "Imagine you lend toys to friends and write in a notebook: 'red car — with Sam, blue truck — with Priya'.",
      "When you want your toys back, you check the notebook to know who has what. Without the notebook, you would not know which toys are yours.",
      "If two people scribble in the notebook at the same time, it gets messed up, so you put a 'someone is writing' sign on it.",
      "Mapping back: the notebook is Terraform state, mapping your code's resources to real cloud objects; the sign is state locking.",
      "# What it is",
      "Terraform state is a JSON file (`terraform.tfstate`) where Terraform records every resource it manages, mapping each address in code (e.g. `aws_instance.web`) to the real-world ID (e.g. `i-0abc123`).",
      "It also caches resource attributes (IPs, ARNs) and dependency information, and Terraform uses it to compute the plan — the difference between code and reality.",
      "Without state, Terraform would not know that `aws_instance.web` is that specific server, and might try to create a duplicate.",
      "Local state: the file sits on your laptop. Fine for experiments, terrible for teams — others cannot see it and it can be lost.",
      "Remote backend: state stored in a shared place, e.g. an S3 bucket, Google Cloud Storage, Azure Blob, or HCP Terraform (Terraform Cloud).",
      "State locking: while one person runs `apply`, a lock prevents anyone else from writing the state at the same time, avoiding corruption. With S3, newer Terraform (1.10+) supports a native lock file (`use_lockfile = true`); the older method used a DynamoDB table.",
      "Sensitive data: state stores attribute values in plain text, including database passwords and private keys generated by Terraform.",
      "# How it works",
      "On `terraform plan`:",
      "  Terraform acquires the lock and reads the state.",
      "  It refreshes: asks the cloud provider for the current attributes of each resource in state.",
      "  It compares the refreshed state with your code and builds a plan (create/update/delete).",
      "On `terraform apply` it executes the plan, writes the new state back to the backend and releases the lock.",
      "Safe state manipulation commands:",
      "  `terraform state list` — show managed resources.",
      "  `terraform state mv` or, better, `moved {}` blocks in code — rename/move a resource without destroying it.",
      "  `terraform state rm` or `removed {}` blocks — stop managing a resource without deleting it.",
      "  `import {}` blocks or `terraform import` — adopt an existing resource into state.",
      "Splitting state per environment and component (network, database, app) keeps each plan small and limits blast radius.",
      "# Example walkthrough",
      "The `backend \"s3\"` block stores state in bucket `acme-tf-state` under key `prod/network.tfstate`.",
      "`use_lockfile = true` creates a `.tflock` object next to the state during operations, so a second concurrent `apply` fails with 'Error acquiring the state lock'.",
      "`encrypt = true` enables server-side encryption of the state object.",
      "The `moved` block tells Terraform that `aws_instance.web` is now `aws_instance.api`; the plan shows 'has moved to' rather than destroy and recreate.",
      "# Why it matters / when to use",
      "Every real Terraform team uses remote state with locking; it is the first thing interviewers check you understand.",
      "Incorrect state handling leads to duplicated resources, accidental deletions, or two people's applies overwriting each other.",
      "Separate state files per environment mean a mistake in dev cannot touch prod.",
      "Other configurations can read outputs from a state via `terraform_remote_state` or, preferably, data sources.",
      "# Common mistakes",
      "Committing `terraform.tfstate` to Git: secrets leak and merges corrupt it. Add `*.tfstate*` to `.gitignore`.",
      "Not enabling versioning on the state bucket; a corrupted state then cannot be restored.",
      "Hand-editing the JSON file; use the `state` subcommands or `moved/removed/import` blocks.",
      "Using `-lock=false` or `force-unlock` casually; only unlock when sure no other run is active.",
      "# Say this in the interview",
      "Terraform state maps resources in code to real-world IDs and caches their attributes, and Terraform uses it to compute diffs. For teams it must be stored in a remote backend like S3 or Terraform Cloud with locking enabled, plus versioning and encryption on the bucket. State can contain secrets, so access is restricted and it is never committed to Git. For refactors I use moved, import and removed blocks rather than editing state by hand.",
      "Follow-up: What happens if two people apply at once without locking?",
      "  Both read the same old state and each writes its own result, so one overwrites the other and state no longer matches reality.",
      "Follow-up: How do you rename a resource without recreating it?",
      "  Add a `moved { from = ... to = ... }` block (or `terraform state mv`), so Terraform updates the address in state only.",
    ],
    code: `# backend.tf — shared, locked, encrypted remote state
terraform {
  backend "s3" {
    bucket       = "acme-tf-state"          # bucket with versioning enabled
    key          = "prod/network.tfstate"   # one state per env + component
    region       = "us-east-1"
    use_lockfile = true                     # native S3 locking (Terraform 1.10+)
    encrypt      = true
  }
}

# refactor safely: rename without destroy/recreate
moved {
  from = aws_instance.web
  to   = aws_instance.api
}

# $ terraform state list
#   aws_instance.api
#   aws_vpc.main
# $ terraform plan   → aws_instance.web has moved to aws_instance.api
# concurrent apply  → Error acquiring the state lock

# .gitignore
#   *.tfstate
#   *.tfstate.*
#   .terraform/`,
  },
  {
    id: 'terraform-workflow',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain the core Terraform workflow and commands.',
    a: [
      "# ELI5",
      "Planning a trip: first you pack your bag with everything you will need (init).",
      "Then you check your list is neat and makes sense (fmt and validate).",
      "Then you write down the route and show it to your parents: 'we will drive here, stop there' (plan).",
      "Only after they approve do you actually drive (apply). At the end of the holiday you pack up and go home (destroy).",
      "Mapping back: these are the Terraform commands, in the same order, and the 'show your parents' step is the reviewed plan.",
      "# What it is",
      "`terraform init`: prepares a working directory. Downloads providers (plugins that talk to a specific API like AWS, Cloudflare or GitHub), downloads modules, configures the backend where state lives, and writes a lock file `.terraform.lock.hcl` recording exact provider versions.",
      "`terraform fmt`: rewrites files into the standard style. `fmt -check` fails CI if formatting is wrong.",
      "`terraform validate`: checks syntax and internal consistency (wrong attribute names, missing variables) without calling cloud APIs.",
      "`terraform plan`: compares your code, the state and the real infrastructure and prints what would be added (+), changed (~) or destroyed (-). `-out=tfplan` saves the exact plan to a file.",
      "`terraform apply`: makes the changes. `terraform apply tfplan` applies exactly the saved, reviewed plan with no surprises.",
      "`terraform destroy`: deletes everything managed by this configuration. Useful for temporary environments.",
      "Other handy commands: `terraform output` (print outputs), `terraform console` (try expressions), `terraform show` (inspect state/plan), `terraform test` (run test files).",
      "# How it works",
      "Local development loop: edit `.tf` files → `fmt` → `validate` → `plan` → read the plan carefully.",
      "Team/CI flow:",
      "  On a pull request: CI runs `init`, `fmt -check`, `validate`, security scanners, and `plan -out=tfplan`; the plan summary is posted as a PR comment (tools: Atlantis, HCP Terraform, or a GitHub Action).",
      "  Reviewers check both code and plan.",
      "  On merge (often with a manual approval for prod): CI runs `apply tfplan` or re-plans and applies.",
      "Plan symbols to recognise: `+` create, `-` destroy, `~` update in place, `-/+` destroy and recreate (watch out — this can mean downtime or data loss).",
      "# Example walkthrough",
      "`terraform init` prints 'Terraform has been successfully initialized!' after installing the AWS provider.",
      "`terraform fmt -check` exits 0 if files are already formatted; non-zero fails the CI job.",
      "`terraform plan -out=tfplan` prints e.g. `Plan: 2 to add, 1 to change, 0 to destroy.` and saves the plan.",
      "`terraform apply tfplan` applies without asking again (the review already happened) and prints `Apply complete! Resources: 2 added, 1 changed, 0 destroyed.`",
      "# Why it matters / when to use",
      "This is the daily workflow of any engineer using Terraform; interviews often ask you to describe it end to end.",
      "Reviewing plans catches dangerous changes, like a `-/+` replacement of a production database, before they happen.",
      "Saved plans guarantee that what was approved is exactly what gets applied.",
      "# Common mistakes",
      "Running `apply` without reading the plan, especially `-auto-approve` in production.",
      "Not committing `.terraform.lock.hcl`; different machines then use different provider versions.",
      "Applying from laptops with personal credentials; centralise applies in CI for audit and consistency.",
      "Ignoring `-/+` lines; check which attribute forces replacement and use `lifecycle { prevent_destroy = true }` for critical resources.",
      "# Say this in the interview",
      "The core workflow is init to download providers and modules and configure the backend, fmt and validate for formatting and syntax, plan to see the diff between code, state and real infrastructure, and apply to execute it; destroy removes everything. In CI we plan on the pull request and post it as a comment, then apply the saved plan on merge with an approval for production.",
      "Follow-up: Why save the plan with -out?",
      "  So the apply executes exactly the reviewed changes even if code or infrastructure changes in between.",
      "Follow-up: What does -/+ mean in a plan?",
      "  The resource will be destroyed and recreated because an attribute that cannot be updated in place changed.",
    ],
    code: `# Terraform day-to-day workflow (shell)
terraform init                 # providers, modules, backend
# → Terraform has been successfully initialized!

terraform fmt -check -recursive   # exit 1 if any file is badly formatted
terraform validate
# → Success! The configuration is valid.

terraform plan -out=tfplan
# → + aws_security_group.api        (create)
# → ~ aws_instance.api              (update in-place)
# → Plan: 1 to add, 1 to change, 0 to destroy.

terraform apply tfplan          # applies exactly the reviewed plan
# → Apply complete! Resources: 1 added, 1 changed, 0 destroyed.

terraform output api_url
# → "https://api.acme.dev"

terraform destroy               # tear down (e.g. a temporary preview env)
# → Destroy complete! Resources: 2 destroyed.`,
  },
  {
    id: 'terraform-vs-ansible',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 4,
    difficulty: 'Medium',
    q: 'Terraform vs Ansible: when do you use which?',
    a: [
      "# ELI5",
      "Building a new house: Terraform is the construction company that builds the walls, roof, plumbing and wiring.",
      "Ansible is the interior team that comes in afterwards to paint the rooms, install the furniture and set up the TV.",
      "You can ask either to do a bit of the other's job, but each is best at its own.",
      "Mapping back: Terraform creates cloud resources (servers, networks, databases); Ansible configures what runs inside the servers.",
      "# What it is",
      "Terraform (or OpenTofu): a provisioning tool. It creates, updates and deletes cloud and SaaS resources by calling their APIs. Written in HCL (HashiCorp Configuration Language).",
      "Ansible: a configuration management and automation tool. It connects to existing machines (usually over SSH) and runs tasks: install packages, write config files, start services, deploy apps. Written as YAML 'playbooks'.",
      "Agentless: Ansible needs nothing installed on target servers except SSH and Python. Chef/Puppet, by contrast, run an agent on each server.",
      "Comparison, row by row:",
      "  Main job: Terraform = provision infrastructure; Ansible = configure servers and orchestrate tasks.",
      "  Style: Terraform is declarative (desired end state); Ansible tasks are ordered steps, though each module is mostly declarative ('package present').",
      "  State: Terraform keeps a state file and plans changes against it; Ansible is stateless and checks live state each run.",
      "  Preview: Terraform `plan`; Ansible `--check --diff` (dry run, less reliable for some modules).",
      "  Deletion: removing a resource from Terraform code destroys it; removing a task from Ansible does nothing — you must write a task with `state: absent`.",
      "  Typical targets: Terraform → VPCs, EKS, RDS, DNS, IAM; Ansible → packages, users, nginx config, OS hardening, rolling app deploys on VMs.",
      "# How it works",
      "Common combined workflow:",
      "  Terraform creates VMs, network and load balancer, and outputs their IP addresses.",
      "  An inventory (list of hosts and groups) for Ansible is generated from those outputs or from a dynamic inventory plugin (e.g. `amazon.aws.aws_ec2`) that queries the cloud.",
      "  Ansible playbooks connect over SSH and install and configure software on those VMs.",
      "Alternative 'immutable' approach: bake a machine image with Packer (often using Ansible inside), then Terraform launches servers from that image — no configuring after boot.",
      "In container/Kubernetes setups, Ansible's role shrinks: images are built by Dockerfiles and deployed via Kubernetes manifests.",
      "# Example walkthrough",
      "The Terraform part creates one EC2 instance with a `role = web` tag and outputs its public IP.",
      "The inventory file lists that IP under group `web`.",
      "The playbook targets `web`, uses `become: true` (sudo), installs nginx with the `apt` module and ensures the service is started.",
      "First Ansible run reports `changed=2`; a second run reports `changed=0` because nginx is already installed and running.",
      "# Why it matters / when to use",
      "Use Terraform for anything you create through a cloud API, especially when you want a plan and lifecycle management.",
      "Use Ansible to configure fleets of VMs or bare-metal servers, run one-off operations (patch all servers, rotate a file), or network device configuration.",
      "Many teams use both, with a clear boundary: Terraform owns 'what exists', Ansible owns 'what is inside'.",
      "# Common mistakes",
      "Using Ansible to create cloud resources at scale; it lacks state, so deletions and drift are hard to manage.",
      "Using Terraform `remote-exec` provisioners to configure servers; HashiCorp calls provisioners a last resort — prefer cloud-init, Packer or Ansible.",
      "Writing Ansible with raw `shell` commands everywhere, losing idempotency.",
      "Letting both tools manage the same resource, causing them to fight.",
      "# Say this in the interview",
      "Terraform is for provisioning cloud resources like VPCs, databases and clusters; it is declarative, keeps state and shows a plan. Ansible is for configuration management and app deployment on existing machines, using YAML playbooks that run agentless over SSH, and it checks live state on each run instead of keeping a state file. A common combination is Terraform creating the servers and Ansible configuring them, or baking images with Packer instead.",
      "Follow-up: Can Ansible be declarative?",
      "  Most modules are declarative and idempotent ('ensure package present'), but playbooks run tasks in order and do not track resources to delete.",
      "Follow-up: What would you use in a fully Kubernetes setup?",
      "  Terraform for the cluster and cloud resources, then Helm/Kustomize and GitOps for workloads; Ansible is rarely needed.",
    ],
    code: `# 1) Terraform: create the server (main.tf)
resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.small"
  tags          = { role = "web" }
}
output "web_ip" { value = aws_instance.web.public_ip }
# terraform apply  → web_ip = "54.12.34.56"

# 2) Ansible inventory (inventory.ini)
# [web]
# 54.12.34.56 ansible_user=ubuntu

# 3) Ansible: configure the server (site.yml)
- hosts: web
  become: true
  tasks:
    - name: Install nginx
      ansible.builtin.apt: { name: nginx, state: present, update_cache: true }
    - name: Start nginx
      ansible.builtin.service: { name: nginx, state: started, enabled: true }
# ansible-playbook -i inventory.ini site.yml
# → 1st run: changed=2   2nd run: changed=0 (idempotent)`,
  },
  {
    id: 'declarative-vs-imperative',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Easy',
    q: 'Declarative vs imperative infrastructure?',
    a: [
      "# ELI5",
      "Imperative is telling a taxi driver every turn: 'left here, straight two blocks, right at the bakery'.",
      "Declarative is just giving the address: 'take me to 10 Park Street', and the driver figures out the route.",
      "If you are already at Park Street, the declarative driver says 'we are here, nothing to do'. The imperative instructions would still make you drive the whole route again.",
      "Mapping back: imperative scripts list commands; declarative tools are told the desired end state and compute the steps themselves.",
      "# What it is",
      "Imperative infrastructure: you write the exact sequence of commands to run, e.g. a bash script calling `aws ec2 run-instances`, or `kubectl create deployment`, `kubectl scale`.",
      "Declarative infrastructure: you describe what should exist, e.g. a Terraform file saying 'there is one instance of size t3.small', or Kubernetes YAML saying 'replicas: 3'. The tool compares desired vs current state and acts.",
      "Idempotent: running the same thing again leaves the system in the same state, doing nothing if already correct. Declarative tools are idempotent by design; imperative scripts are not unless you add checks.",
      "Drift correction: because declarative tools compare against reality, re-applying fixes manual changes.",
      "Comparison, row by row:",
      "  You write: imperative = steps (how); declarative = end state (what).",
      "  Re-running: imperative may fail ('already exists') or duplicate; declarative makes no change if already correct.",
      "  Deletions: imperative needs an explicit delete command; declarative deletes things removed from the definition (Terraform, `kubectl apply --prune`, GitOps).",
      "  Control: imperative gives fine-grained ordering; declarative hides steps behind the tool.",
      "  Examples: imperative = shell scripts, AWS CLI, `kubectl run/create/scale`; declarative = Terraform, CloudFormation, Kubernetes manifests with `kubectl apply`, Helm.",
      "Pulumi and AWS CDK use real programming languages (imperative code) to build a declarative model, which an engine then reconciles — a hybrid.",
      "# How it works",
      "Declarative engine loop:",
      "  Read the desired state from your files.",
      "  Read the current state (from APIs or a state file).",
      "  Compute the difference (a plan).",
      "  Execute just the needed create/update/delete operations, in dependency order.",
      "Kubernetes does this continuously: controllers keep reconciling, so a deleted pod is recreated automatically.",
      "Imperative script loop: run command 1, then 2, then 3 — the script has no idea what already exists unless you program checks.",
      "# Example walkthrough",
      "The imperative commands create a deployment and scale it to 3. Running `kubectl create` a second time fails with 'AlreadyExists'.",
      "The declarative YAML says `replicas: 3`. `kubectl apply -f deploy.yaml` the first time prints 'created', the second time 'unchanged'.",
      "If someone runs `kubectl scale --replicas=1`, re-applying the YAML sets it back to 3 — drift corrected.",
      "# Why it matters / when to use",
      "Declarative is the default for long-lived infrastructure and Kubernetes workloads: reviewable, repeatable, GitOps-friendly.",
      "Imperative is fine for one-off tasks, debugging, or quick experiments (`kubectl run debug --image=busybox`).",
      "Imperative scripts still have a place for orchestration glue (e.g. 'run migration, then flip traffic') in pipelines.",
      "# Common mistakes",
      "Mixing both on the same resources: manual `kubectl scale` gets overwritten by the next apply or GitOps sync.",
      "Writing long bash scripts to manage infrastructure that should be declarative; they break on re-runs.",
      "Assuming declarative means order never matters; dependencies (e.g. a namespace before its pods) still need to exist, though tools usually handle it.",
      "# Say this in the interview",
      "Declarative infrastructure describes the desired end state and lets the tool figure out the steps, as with Terraform, CloudFormation or Kubernetes YAML. Imperative means writing the exact commands, like shell scripts, the AWS CLI or kubectl create. Declarative is idempotent and corrects drift by design, while imperative gives fine control but is harder to rerun safely, so I use declarative for real infrastructure and imperative for one-off tasks.",
      "Follow-up: Is Ansible declarative or imperative?",
      "  A mix: modules declare states, but the playbook runs tasks in order and does not track what to delete.",
      "Follow-up: Is kubectl apply declarative?",
      "  Yes; it sends the full desired object and Kubernetes merges and reconciles it, unlike create/scale/set which are imperative.",
    ],
    code: `# IMPERATIVE: you list the steps
kubectl create deployment api --image=nginx:1.27
kubectl scale deployment api --replicas=3
kubectl create deployment api --image=nginx:1.27
# → Error from server (AlreadyExists): deployments.apps "api" already exists

# DECLARATIVE: you describe the end state (deploy.yaml)
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers: [{ name: api, image: "nginx:1.27" }]

# kubectl apply -f deploy.yaml   → deployment.apps/api created
# kubectl apply -f deploy.yaml   → deployment.apps/api unchanged   (idempotent)
# kubectl scale deploy api --replicas=1 ; kubectl apply -f deploy.yaml
#                                → back to 3 replicas (drift corrected)`,
  },
  {
    id: 'terraform-modules',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are Terraform modules and how do variables/outputs work?',
    a: [
      "# ELI5",
      "A module is like a cookie cutter. You design the shape once, then press out as many cookies as you like.",
      "Variables are the dough choices you pass in: chocolate or vanilla, big or small.",
      "Outputs are what you get back: 'here are 12 cookies, and this one is the biggest'.",
      "Mapping back: a module is reusable Terraform code (e.g. 'a VPC'), variables are its inputs, outputs are values it returns for other code to use.",
      "# What it is",
      "Module: any folder of `.tf` files. The folder where you run `terraform` is the root module; folders it calls with a `module` block are child modules.",
      "Modules work like functions in programming: inputs (variables), a body (resources), and return values (outputs).",
      "`variable` block: declares an input with a `type` (string, number, bool, list, map, object), optional `default`, `description`, `sensitive = true` (hide in output) and `validation` rules.",
      "`output` block: exposes a value from a module, e.g. a VPC id, so the caller can reference it as `module.vpc.vpc_id`.",
      "`locals` block: named intermediate values computed inside a module, like local variables, e.g. a common tags map.",
      "`count` and `for_each`: create multiple copies of a resource or module. `for_each` over a map or set is preferred because each copy is keyed by name, not position.",
      "Module sources: a local path (`./modules/vpc`), a Git URL with a tag (`git::https://...?ref=v1.2.0`), the public Terraform Registry (`terraform-aws-modules/vpc/aws`), or a private registry.",
      "# How it works",
      "When you call a module:",
      "  `terraform init` downloads its source into `.terraform/modules`.",
      "  The arguments in the `module` block are assigned to the child's variables; missing required variables cause an error.",
      "  Resources inside get addresses like `module.vpc.aws_vpc.this[0]` in state.",
      "  Outputs flow back up; the root module can pass them into other modules, creating dependencies automatically.",
      "Variable values can come from: defaults, `terraform.tfvars` / `*.auto.tfvars` files, `-var-file=prod.tfvars`, `-var` flags, or `TF_VAR_name` environment variables (later sources override earlier ones; CLI flags win).",
      "Version constraints like `version = \"~> 5.0\"` allow 5.x upgrades but not 6.0.",
      "# Example walkthrough",
      "The root module calls the public VPC module pinned to `~> 5.0` and passes `name`, `cidr`, zones and subnets.",
      "It calls a local `./modules/service` module twice using `for_each` over a map of services, giving `module.service[\"api\"]` and `module.service[\"worker\"]`.",
      "The local module declares `variable \"name\"` with a validation that rejects uppercase letters, and outputs a computed `full_name`.",
      "`terraform output` after apply prints `vpc_id = \"vpc-0a1b2c...\"` and the service names map.",
      "# Why it matters / when to use",
      "Avoid copy-paste: one tested module for a VPC, EKS cluster or RDS database, reused across teams and environments.",
      "Encode standards: a company 'service' module can enforce tags, encryption and logging by default.",
      "Smaller, readable root configurations that just wire modules together.",
      "# Common mistakes",
      "Not pinning module versions; an upstream release changes your infrastructure on the next init.",
      "Using `count` for named things; removing one from the middle of a list shifts indexes and recreates others. Use `for_each`.",
      "Over-abstracting: a module with 80 variables wrapping a single resource adds complexity without value.",
      "Forgetting `sensitive = true` on secret variables/outputs, so they print in plan output.",
      "# Say this in the interview",
      "A module is a folder of Terraform files; the root module calls child modules to reuse patterns like a VPC, EKS or RDS setup. Inputs are declared with variable blocks that have types, defaults and validation, and results are exposed with output blocks, referenced as module.name.output. I source modules from local paths, Git tags or the registry with pinned versions, use locals for computed values, and for_each to create multiple instances.",
      "Follow-up: count vs for_each?",
      "  count creates a list indexed by number, so removing an item shifts others; for_each uses stable keys, so only the removed item is destroyed.",
      "Follow-up: How do you pass different values per environment?",
      "  Per-environment `.tfvars` files or separate root modules per environment that call the same shared modules.",
    ],
    code: `# main.tf (root module)
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"                       # pinned: 5.x only
  name    = "prod"
  cidr    = "10.0.0.0/16"
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
}

module "service" {
  source   = "./modules/service"
  for_each = { api = 3, worker = 2 }       # → module.service["api"], ["worker"]
  name     = each.key
  replicas = each.value
}

output "vpc_id"   { value = module.vpc.vpc_id }
output "services" { value = { for k, m in module.service : k => m.full_name } }

# modules/service/variables.tf + outputs.tf
variable "name" {
  type = string
  validation {
    condition     = can(regex("^[a-z-]+$", var.name))
    error_message = "name must be lowercase letters and dashes."
  }
}
variable "replicas" {
  type    = number
  default = 1
}
locals { full_name = "acme-\${var.name}" }
output "full_name" { value = local.full_name }

# terraform output → vpc_id = "vpc-0a1b2c..."  services = { api = "acme-api", worker = "acme-worker" }`,
  },
  {
    id: 'terraform-drift',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is configuration drift and how do you handle it with Terraform?',
    a: [
      "# ELI5",
      "You arrange your bedroom exactly as shown in a photo on the wall. While you are at school, your sibling moves the chair to the window.",
      "When you come home you compare the room with the photo and notice the chair is in the wrong place.",
      "You either move the chair back, or decide the window spot is better and take a new photo.",
      "Mapping back: the photo is your Terraform code, the room is real infrastructure, and the moved chair is drift — a manual change nobody wrote down.",
      "# What it is",
      "Configuration drift: when the real infrastructure no longer matches what the code (and state) says it should be.",
      "Causes: someone edits a security group in the AWS console during an incident, an autoscaler or another tool changes settings, a script modifies resources, or the cloud provider changes defaults.",
      "Why it is bad: the code is no longer the truth, the next `apply` may unexpectedly revert an emergency fix, environments stop being reproducible, and audits fail.",
      "Refresh: Terraform reading the current real attributes of each resource from the provider's API.",
      "`terraform plan -refresh-only`: shows only what changed outside Terraform, without proposing changes from your code. `apply -refresh-only` accepts those real values into state.",
      "Policy as code: rules written as code that are checked automatically, e.g. OPA (Open Policy Agent)/Conftest, HashiCorp Sentinel, or AWS SCPs to block certain actions.",
      "# How it works",
      "Detect:",
      "  Run `terraform plan -detailed-exitcode` on a schedule (e.g. nightly CI). Exit code 0 = no changes, 2 = changes present (drift or unapplied code), 1 = error.",
      "  Alert the team (Slack/issue) when exit code is 2. HCP Terraform and tools like Spacelift/env0 have built-in drift detection.",
      "  AWS Config or CloudTrail can also show who changed what and when.",
      "Resolve, case by case:",
      "  The manual change was wrong or temporary → run `terraform apply` to revert reality to the code.",
      "  The manual change was right → update the code to match, then plan should show 'No changes'.",
      "Prevent:",
      "  Remove console write access in production for humans (read-only roles, break-glass access for emergencies).",
      "  All changes through PR + pipeline; policy checks in CI.",
      "  Use `lifecycle { ignore_changes = [...] }` only for attributes legitimately managed elsewhere (e.g. desired count changed by an autoscaler).",
      "# Example walkthrough",
      "The script runs a plan with `-detailed-exitcode` and captures the exit code.",
      "If the exit code is 2, it prints 'Drift detected' and could post to Slack; 0 prints 'No drift'.",
      "In the example output, someone opened port 22 in the console, so the plan shows `~ ingress` changes on `aws_security_group.api`.",
      "The `ignore_changes` block shows how to tell Terraform not to fight an autoscaler over `desired_capacity`.",
      "# Why it matters / when to use",
      "Keeps production predictable: the next deploy will not surprise you by undoing hidden changes.",
      "Security: drift often means someone opened a port or broadened a permission.",
      "Compliance frameworks expect changes to be tracked and approved.",
      "# Common mistakes",
      "Blindly running `apply` to 'fix' drift and reverting an emergency fix that was keeping production alive; investigate first.",
      "Overusing `ignore_changes` to silence noisy plans, hiding real drift.",
      "Only checking drift when someone happens to run plan; schedule it.",
      "# Say this in the interview",
      "Drift is when real infrastructure differs from the code, usually from manual console changes. I detect it by running terraform plan, or plan -refresh-only, on a schedule in CI with -detailed-exitcode and alerting when changes appear. To resolve it, either apply to revert to the code or update the code if the change was intended. To prevent it, restrict console write access, push all changes through PRs and the pipeline, and add policy as code with OPA or Sentinel.",
      "Follow-up: What does -refresh-only do?",
      "  It shows or records changes made outside Terraform into state, without applying any changes from your configuration.",
      "Follow-up: When is ignore_changes appropriate?",
      "  When another system legitimately owns that attribute, such as an autoscaler adjusting desired capacity.",
    ],
    code: `#!/usr/bin/env bash
# drift-check.sh — run nightly in CI
set -uo pipefail
terraform init -input=false > /dev/null
terraform plan -detailed-exitcode -input=false -no-color > plan.txt
code=$?
if [ "$code" -eq 2 ]; then
  echo "Drift detected:"; grep -E '^\\s+[~+-]' plan.txt | head -20
  # e.g. → ~ resource "aws_security_group" "api"  (ingress port 22 added in console)
  # curl -X POST "$SLACK_WEBHOOK" -d '{"text":"Terraform drift in prod"}'
  exit 1
elif [ "$code" -eq 0 ]; then
  echo "No drift"                       # → No drift
else
  echo "plan failed"; exit 1
fi

# In the .tf code: let the autoscaler own this attribute
# resource "aws_autoscaling_group" "api" {
#   ...
#   lifecycle { ignore_changes = [desired_capacity] }
# }`,
  },
  {
    id: 'ansible-idempotency-playbook',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is idempotency, and how does Ansible achieve it?',
    a: [
      "# ELI5",
      "A lift button is idempotent: pressing 'floor 5' once or ten times still takes you to floor 5 once.",
      "A vending machine button is not: press it ten times and you may get ten chocolates (and pay ten times).",
      "Ansible tries to be the lift button: 'make sure nginx is installed' does nothing if it is already installed.",
      "Mapping back: idempotent operations can be safely repeated; running a playbook twice should leave servers exactly as one run would.",
      "# What it is",
      "Idempotency: an operation that gives the same result whether you run it once or many times. In automation it means re-running does not break or duplicate anything.",
      "Ansible: an agentless automation tool that connects to servers over SSH and runs tasks defined in YAML.",
      "Key Ansible terms:",
      "  Inventory: the list of hosts, grouped (e.g. `[web]`, `[db]`), as an INI/YAML file or a dynamic plugin that asks the cloud.",
      "  Playbook: a YAML file with one or more plays; each play maps a host group to a list of tasks.",
      "  Task: one call to a module, e.g. `ansible.builtin.apt` to manage packages.",
      "  Module: a small program Ansible copies to the host and runs; modules check state before acting.",
      "  Handler: a task that runs only when notified by a changed task, e.g. restart nginx only if its config changed.",
      "  Role: a reusable bundle of tasks, handlers, templates and defaults with a standard folder layout.",
      "  Ansible Vault: encrypts secret variables files so they can live in Git.",
      "Each task reports `ok` (already correct, nothing done), `changed` (it changed something), `failed` or `skipped`.",
      "# How it works",
      "For a task like `apt: name=nginx state=present`:",
      "  The module checks whether nginx is installed.",
      "  If yes → returns `ok` without doing anything. If no → installs it and returns `changed`.",
      "Modules like `template`/`copy` compare checksums of the file; `service` checks if it is running; `user` checks if the user exists.",
      "`command` and `shell` modules just run whatever you write, so Ansible cannot know if it is safe to repeat. They report `changed` every time unless you guard them:",
      "  `creates: /path` — skip if this file already exists.",
      "  `when:` — run only if a condition is true.",
      "  `changed_when:` — decide yourself when to report changed (e.g. based on output).",
      "`--check --diff` runs a dry run showing what would change.",
      "# Example walkthrough",
      "The play targets the `web` group with `become: true` (run as root via sudo).",
      "Task 1 ensures nginx is installed; Task 2 renders a config from a Jinja2 template and notifies the handler if the file changed.",
      "Task 3 runs a one-time script but has `creates:` so it is skipped once the marker file exists.",
      "First run: `changed=3` and the handler restarts nginx. Second run: `ok=4 changed=0` and the handler does not run.",
      "# Why it matters / when to use",
      "Safe re-runs: you can run the same playbook across 200 servers nightly to enforce the correct configuration.",
      "Recovery: if a run fails halfway, just run it again.",
      "Predictable deployments and less config drift on long-lived VMs.",
      "# Common mistakes",
      "Using `shell: apt-get install -y nginx` instead of the `apt` module; it always reports changed and hides real changes.",
      "Appending to files with `shell: echo ... >> file`; each run adds another line. Use `lineinfile` or `template`.",
      "Restarting services in every run via a normal task instead of a handler, causing needless downtime.",
      "Storing plaintext passwords in group_vars; use Ansible Vault or an external secret manager lookup.",
      "# Say this in the interview",
      "Idempotent means running an operation many times has the same result as running it once. Ansible modules achieve this by checking the current state first and only changing what is needed, reporting ok or changed. Raw shell and command tasks are not idempotent by default, so I guard them with creates, when or changed_when. I structure work with an inventory, playbooks, roles for reuse, handlers for restarts, and Vault for secrets.",
      "Follow-up: How do you test a playbook safely?",
      "  Run with `--check --diff` first, and test roles in containers/VMs with Molecule.",
      "Follow-up: What is a handler?",
      "  A task that runs once at the end of the play only if some task notified it with a change, typically a service restart.",
    ],
    code: `# site.yml
- hosts: web
  become: true                         # sudo
  tasks:
    - name: Install nginx
      ansible.builtin.apt: { name: nginx, state: present, update_cache: true }

    - name: Deploy nginx config
      ansible.builtin.template: { src: nginx.conf.j2, dest: /etc/nginx/nginx.conf }
      notify: Restart nginx            # only triggers if the file changed

    - name: One-time setup script (guarded to be idempotent)
      ansible.builtin.command: /opt/app/init.sh
      args: { creates: /opt/app/.initialized }   # skip if marker exists

    - name: Ensure nginx running
      ansible.builtin.service: { name: nginx, state: started, enabled: true }

  handlers:
    - name: Restart nginx
      ansible.builtin.service: { name: nginx, state: restarted }

# ansible-playbook -i inventory.ini site.yml
# 1st run → PLAY RECAP web1 : ok=5 changed=4   (handler ran)
# 2nd run → PLAY RECAP web1 : ok=4 changed=0   (nothing to do)`,
  },
  {
    id: 'terraform-workspaces-envs',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you manage multiple environments (dev/staging/prod) with Terraform?',
    a: [
      "# ELI5",
      "Three siblings each get their own copy of the same colouring book. Same pictures, but each colours their own copy with different crayons.",
      "If one sibling scribbles all over their book, the others' books are fine.",
      "Mapping back: the pictures are shared Terraform modules, each sibling's book is an environment with its own state, and the crayons are per-environment variables.",
      "# What it is",
      "Environments are separate copies of your infrastructure: dev (experiments), staging (production-like testing), prod (real users). They should look alike but differ in size and settings.",
      "Goal: reuse the same code, keep each environment's state separate, and make it impossible for a dev change to accidentally touch prod.",
      "Approach 1 — directory per environment (most common): `envs/dev`, `envs/staging`, `envs/prod`, each a small root module with its own backend config that calls shared modules from `modules/`.",
      "Approach 2 — Terraform CLI workspaces: one configuration, multiple named states (`terraform workspace new prod`). `terraform.workspace` can be used in code. Simple, but all environments share the same backend and code version, so less isolation.",
      "Approach 3 — tooling: Terragrunt (a wrapper that keeps backend and inputs DRY — Don't Repeat Yourself — across many folders), HCP Terraform workspaces, Spacelift, env0.",
      "`.tfvars` files: plain files of variable values, e.g. `prod.tfvars` setting larger instance sizes.",
      "Account isolation: putting prod in a separate cloud account/project with different credentials is the strongest guard.",
      "# How it works",
      "Directory-per-env flow:",
      "  `modules/app` contains the real resources.",
      "  `envs/prod/main.tf` calls `module \"app\"` with prod values and its own backend key, e.g. `prod/app.tfstate`.",
      "  CI runs plan/apply separately per folder; prod's job requires approval and uses prod-only credentials.",
      "  Promoting a change = merging the module change, applying dev, then staging, then prod (optionally pinning module versions per env).",
      "Workspaces flow: `terraform workspace select prod` then `terraform apply -var-file=prod.tfvars`; state is stored under a workspace-specific key.",
      "# Example walkthrough",
      "The tree shows shared `modules/app` and three env folders.",
      "`envs/prod/main.tf` sets backend key `prod/app.tfstate` and passes `instance_count = 4`, `instance_type = \"m6i.large\"`.",
      "`envs/dev/main.tf` would pass `instance_count = 1`, `t3.small`, and use key `dev/app.tfstate`.",
      "Running `terraform -chdir=envs/prod plan` only plans prod; a mistake in dev's folder cannot change prod's state.",
      "# Why it matters / when to use",
      "Interviewers want to hear that prod is isolated and changes are promoted through environments.",
      "Directory-per-env scales well and makes differences explicit; workspaces suit short-lived, nearly identical environments (e.g. per-PR previews).",
      "# Common mistakes",
      "Using workspaces for dev and prod with the same credentials; a wrong `workspace select` destroys prod.",
      "Copy-pasting whole configurations per environment instead of sharing modules, so environments slowly diverge.",
      "Putting all environments in one state file, so every plan touches prod.",
      "# Say this in the interview",
      "The most common approach is a separate directory per environment that calls shared modules, each with its own backend and state, plus per-environment tfvars or inputs. Terraform workspaces give separate state from the same code and suit similar short-lived environments, but offer less isolation. Tools like Terragrunt reduce duplication, and I isolate prod further with separate cloud accounts and credentials and an approval gate in the pipeline.",
      "Follow-up: Why not use workspaces for prod?",
      "  They share code, backend and usually credentials, so a mistake in one workspace can easily affect another; separate folders and accounts give stronger isolation.",
    ],
    code: `# Layout
# infra/
#   modules/app/            ← shared resources (variables: instance_count, instance_type)
#   envs/dev/main.tf
#   envs/staging/main.tf
#   envs/prod/main.tf

# envs/prod/main.tf
terraform {
  backend "s3" {
    bucket       = "acme-tf-state-prod"   # separate bucket/account for prod
    key          = "prod/app.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
module "app" {
  source         = "../../modules/app"
  instance_count = 4
  instance_type  = "m6i.large"
}

# shell
#   terraform -chdir=envs/prod init
#   terraform -chdir=envs/prod plan     → only prod resources
#
# workspace alternative:
#   terraform workspace new staging      → Created and switched to workspace "staging"!
#   terraform apply -var-file=staging.tfvars`,
  },
  {
    id: 'terraform-import',
    group: 'Infrastructure as Code (Terraform/Ansible)',
    stars: 1,
    difficulty: 'Medium',
    q: 'How do you bring existing resources under Terraform or force recreation?',
    a: [
      "# ELI5",
      "Import: you find a bike in the garage that nobody registered. You add it to the family register so you can look after it like the others.",
      "Replace: a bike is wobbly but looks fine on paper, so you tell the shop 'swap this one for a brand-new identical one'.",
      "Removed: you give a bike to a cousin; you cross it off your register, but the bike itself keeps existing.",
      "Mapping back: these are three state operations — adopt, recreate, and forget — for resources Terraform manages.",
      "# What it is",
      "Import: adding an already-existing real resource (created by hand or another tool) into Terraform state, so Terraform manages it from now on without recreating it.",
      "`import` block (Terraform 1.5+): declares the import in code, so it is reviewed in a PR and runs during plan/apply. The older `terraform import ADDRESS ID` CLI command does the same immediately but is not reviewable.",
      "`terraform plan -generate-config-out=generated.tf`: when used with import blocks, Terraform writes draft resource code for you to clean up.",
      "Replace: `terraform apply -replace=aws_instance.web` forces Terraform to destroy and recreate a resource even if its code did not change. It replaced the deprecated `terraform taint` command.",
      "Removed: `removed` block (Terraform 1.7+) with `lifecycle { destroy = false }`, or `terraform state rm`, makes Terraform forget a resource without deleting it in the cloud.",
      "# How it works",
      "Import flow:",
      "  Write an `import { to = aws_s3_bucket.logs  id = \"acme-logs\" }` block.",
      "  Run `terraform plan -generate-config-out=generated.tf` to draft the matching resource block.",
      "  Tidy the generated code, run plan until it says 'X to import, 0 to add, 0 to change'.",
      "  Apply; the resource is now in state. Remove the import block afterwards (optional).",
      "Replace flow: plan with `-replace=ADDRESS` shows `-/+` for that resource; apply performs it.",
      "Removed flow: add a `removed` block pointing at the address, delete the resource block, apply — state entry gone, real resource untouched.",
      "# Example walkthrough",
      "The `import` block adopts an S3 bucket named `acme-logs` as `aws_s3_bucket.logs`.",
      "The plan prints `aws_s3_bucket.logs: Preparing import... [id=acme-logs]` and `Plan: 1 to import, 0 to add, 0 to change, 0 to destroy.`",
      "The `removed` block stops managing `aws_instance.legacy` while keeping the VM running.",
      "The shell line forces recreation of `aws_instance.web`; the plan shows `-/+ resource \"aws_instance\" \"web\"` 'will be replaced, as requested'.",
      "# Why it matters / when to use",
      "Adopting legacy 'ClickOps' infrastructure into IaC without downtime.",
      "Recreating a broken server or rotating something that only changes on creation.",
      "Handing a resource over to another team's Terraform configuration (remove here, import there).",
      "# Common mistakes",
      "Importing without writing matching code; the next plan then wants to change or destroy the resource.",
      "Using `state rm` and forgetting the resource exists, leaving orphaned costs.",
      "Running `-replace` on stateful resources like databases without a backup.",
      "# Say this in the interview",
      "To adopt existing resources I use import blocks, available since Terraform 1.5, or the terraform import command, and plan -generate-config-out drafts the code. To force recreation I run apply -replace with the resource address, which replaced the deprecated taint. To stop managing something without destroying it I use a removed block or terraform state rm.",
      "Follow-up: Why prefer import blocks over the CLI command?",
      "  They are code: reviewed in a PR, shown in the plan, and applied by the pipeline like any other change.",
    ],
    code: `# adopt.tf — bring an existing bucket under Terraform
import {
  to = aws_s3_bucket.logs
  id = "acme-logs"
}
resource "aws_s3_bucket" "logs" {
  bucket = "acme-logs"
}

# stop managing a VM without deleting it (Terraform 1.7+)
removed {
  from = aws_instance.legacy
  lifecycle { destroy = false }
}

# shell
#   terraform plan -generate-config-out=generated.tf   # drafts code for imports
#   terraform plan
#   → aws_s3_bucket.logs: Preparing import... [id=acme-logs]
#   → Plan: 1 to import, 0 to add, 0 to change, 0 to destroy.
#
#   terraform apply -replace=aws_instance.web
#   → -/+ resource "aws_instance" "web" ... will be replaced, as requested`,
  },

  // ───────────────────────── Cloud (AWS) ─────────────────────────
  {
    id: 'iam-users-roles-policies',
    group: 'Cloud (AWS)',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain AWS IAM users, groups, roles and policies.',
    a: [
      "# ELI5",
      "Think of a big office. A user is an employee with a permanent ID card. A group is a department; everyone in 'Finance' gets the same door access.",
      "A role is a visitor badge kept at reception. Anyone allowed (a contractor, a delivery robot) can borrow it for an hour, then it stops working.",
      "A policy is the written list on the badge saying which doors it opens.",
      "Mapping back: IAM decides who (user/role) can do what (actions) on which things (resources) in your AWS account, and roles give temporary access instead of permanent keys.",
      "# What it is",
      "IAM (Identity and Access Management): the AWS service that controls authentication (who are you?) and authorization (what are you allowed to do?) for every AWS API call.",
      "Principal: whoever makes a request — a user, a role session, or an AWS service.",
      "IAM user: a long-term identity for one person or app, with a console password and/or access keys (an access key id + secret pair used by the CLI/SDK). Long-term keys are risky if leaked.",
      "IAM group: a collection of users; policies attached to a group apply to all members. Groups cannot be 'assumed' and cannot contain roles.",
      "IAM role: an identity with permissions but no permanent credentials. Trusted principals 'assume' it and receive temporary credentials from STS (Security Token Service), valid for 15 minutes up to 12 hours.",
      "Trust policy: the part of a role that says who may assume it (e.g. the EC2 service, a Lambda function, another account, or GitHub via OIDC).",
      "Policy: a JSON document with statements made of `Effect` (Allow/Deny), `Action` (e.g. `s3:GetObject`), `Resource` (an ARN — Amazon Resource Name, a unique id like `arn:aws:s3:::my-bucket/*`) and optional `Condition`.",
      "Policy types: identity-based (attached to users/groups/roles), resource-based (attached to resources like S3 buckets or SQS queues), permission boundaries, and SCPs (Service Control Policies across an AWS Organization).",
      "# How it works",
      "Policy evaluation for each request:",
      "  Start with implicit deny: everything is denied by default.",
      "  If any applicable policy has an explicit `Deny` matching the request → denied. Explicit deny always wins.",
      "  Otherwise, if some policy `Allow`s it (and SCPs/boundaries permit it) → allowed.",
      "  Otherwise → denied.",
      "How roles are used in practice:",
      "  EC2 instance profile: the instance gets role credentials automatically via the metadata service; the SDK picks them up.",
      "  Lambda execution role, ECS task role, EKS pod identity / IRSA (IAM Roles for Service Accounts) give each workload its own role.",
      "  CI/CD: GitHub Actions uses OIDC to assume a deploy role, no stored keys.",
      "  Cross-account: a role in account B trusts account A; users in A assume it.",
      "Humans should log in via IAM Identity Center (AWS SSO) with MFA, receiving short-lived role sessions rather than IAM users.",
      "# Example walkthrough",
      "The trust policy allows the Lambda service (`lambda.amazonaws.com`) to assume the role via `sts:AssumeRole`.",
      "The permissions policy allows only `s3:GetObject` and `s3:PutObject` on objects in bucket `acme-uploads`, nothing else — least privilege.",
      "A second statement explicitly denies `s3:DeleteObject`; even if another policy allowed delete, this Deny wins.",
      "`aws sts get-caller-identity` from inside the function would show an ARN like `arn:aws:sts::123456789012:assumed-role/upload-fn-role/upload-fn` — a temporary role session, not a user.",
      "# Why it matters / when to use",
      "Almost every AWS security incident involves IAM: leaked access keys or overly broad policies like `\"Action\": \"*\"`.",
      "Backend services on AWS should always use roles; code should never contain access keys.",
      "Interviewers expect you to know 'explicit deny wins', 'default deny', and 'prefer roles over users'.",
      "# Common mistakes",
      "Creating IAM users with access keys for applications; use roles (instance profiles, task roles, IRSA).",
      "Using wildcards `Action: *` and `Resource: *` 'temporarily' and never tightening them; use IAM Access Analyzer to generate least-privilege policies.",
      "Using the root account (the email that created the account) for daily work; lock it with MFA and do not create root access keys.",
      "Forgetting both sides: for cross-account access the role's trust policy AND the caller's identity policy must allow it.",
      "# Say this in the interview",
      "Users are long-term identities with credentials and groups attach policies to many users. Roles are assumable identities that issue temporary credentials through STS, used by EC2, Lambda, EKS pods, CI via OIDC, and cross-account access. Policies are JSON documents of Effect, Action, Resource and Condition; the default is deny and an explicit deny always wins. Best practice is least privilege, roles over access keys, MFA, SSO via IAM Identity Center and never using root.",
      "Follow-up: How does an app on EC2 get AWS credentials without keys?",
      "  Attach a role via an instance profile; the SDK fetches temporary credentials from the instance metadata service and refreshes them automatically.",
      "Follow-up: Identity-based vs resource-based policy?",
      "  Identity-based is attached to the user/role and says what it can do; resource-based is attached to the resource (e.g. S3 bucket) and says who can access it, enabling cross-account access.",
    ],
    code: `// trust-policy.json — WHO may assume the role
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}

// permissions-policy.json — WHAT the role may do (the Deny always wins)
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::acme-uploads/*" },
    { "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::acme-uploads/*" }
  ]
}

// shell:
// aws iam create-role --role-name upload-fn-role --assume-role-policy-document file://trust-policy.json
// aws iam put-role-policy --role-name upload-fn-role --policy-name s3-rw --policy-document file://permissions-policy.json
// inside the Lambda: aws sts get-caller-identity
// → "Arn": "arn:aws:sts::123456789012:assumed-role/upload-fn-role/upload-fn"`,
  },
  {
    id: 'iaas-paas-saas',
    group: 'Cloud (AWS)',
    stars: 4,
    difficulty: 'Easy',
    q: 'IaaS vs PaaS vs SaaS (and serverless)?',
    a: [
      "# ELI5",
      "Pizza as a service. IaaS: you rent a kitchen with an oven; you buy ingredients, cook and clean yourself.",
      "PaaS: you go to a 'make your own pizza' place; they provide the dough, oven and staff, you just choose toppings and press go.",
      "SaaS: you order a ready pizza delivered to your door. You just eat it.",
      "Serverless: a pizza vending machine that bakes one slice only when someone presses the button, and you pay per slice.",
      "Mapping back: each level hands more of the work (servers, OS, runtime, scaling) to the cloud provider, and you manage less.",
      "# What it is",
      "These are service models describing how much of the technology stack the provider manages versus you.",
      "The stack, bottom to top: physical hardware → virtualization → operating system (OS) → runtime (Node.js, Java) → your application code → your data.",
      "IaaS (Infrastructure as a Service): you rent virtual machines, networks and disks. You manage the OS (patching), runtime, app and scaling setup. Examples: AWS EC2, Google Compute Engine, Azure VMs.",
      "PaaS (Platform as a Service): you deploy code or containers; the provider manages servers, OS and runtime, often scaling too. Examples: AWS Elastic Beanstalk, Heroku, Google App Engine, Azure App Service, Render, Railway.",
      "SaaS (Software as a Service): finished software used over the internet; you only manage your data and settings. Examples: Gmail, Slack, Salesforce, GitHub.",
      "Serverless / FaaS (Functions as a Service): run individual functions on demand, triggered by events (HTTP request, file upload, queue message). No servers to manage, auto-scales including to zero, pay per invocation and execution time. Examples: AWS Lambda, Google Cloud Functions, Azure Functions, Cloudflare Workers.",
      "'Serverless' also describes managed services billed by usage with no capacity planning, e.g. DynamoDB on-demand, Aurora Serverless, Fargate (serverless containers).",
      "Comparison, row by row:",
      "  You manage: IaaS = OS + runtime + app; PaaS = app (+ config); SaaS = only data/usage; FaaS = function code.",
      "  Control/flexibility: highest in IaaS, lowest in SaaS.",
      "  Operational effort: highest in IaaS, lowest in SaaS/serverless.",
      "  Cost model: IaaS pays per hour of running servers even when idle; serverless pays per request.",
      "Shared responsibility model: AWS is responsible for security 'of' the cloud (data centres, hardware, hypervisor); you are responsible for security 'in' the cloud (your data, IAM, config). The more managed the service, the more AWS covers.",
      "# How it works",
      "Deploying the same Node API in each model:",
      "  IaaS: launch EC2, install Node, configure nginx, systemd, patching, set up an auto-scaling group and load balancer.",
      "  PaaS: `git push` to Heroku or `eb deploy`; the platform builds and runs it behind a load balancer.",
      "  Serverless: write a handler function, deploy to Lambda behind API Gateway or a function URL; each request may run in a fresh or reused execution environment.",
      "Serverless details: a cold start happens when a new execution environment must be created (extra latency, often 100ms–1s); Lambda has a max of 15 minutes per invocation.",
      "# Example walkthrough",
      "The snippet is a complete Lambda handler in Node.js 22 (ES module syntax).",
      "AWS calls `handler(event)` with the HTTP request data; the function returns an object with `statusCode` and `body`.",
      "For a request to `/hello?name=Asha` the response body is `{\"message\":\"Hello, Asha\"}`.",
      "The `coldStart` variable shows that module-level code runs once per execution environment: first call logs `cold start: true`, later calls on the same instance log `false`.",
      "# Why it matters / when to use",
      "IaaS: full control, legacy apps, special OS needs, steady high load where reserved VMs are cheapest.",
      "PaaS: small teams who want to ship features, not manage servers.",
      "SaaS: buy instead of build for non-core needs (email, CRM, monitoring).",
      "Serverless: spiky or event-driven workloads (webhooks, image processing, cron tasks), and low-traffic APIs that would waste an idle server.",
      "# Common mistakes",
      "Thinking serverless means no servers; it means you do not manage them.",
      "Running long-running or very high constant traffic workloads on Lambda, where containers or VMs are cheaper and avoid the 15-minute limit.",
      "Opening a new database connection on every Lambda invocation; reuse connections outside the handler or use RDS Proxy.",
      "Forgetting that in IaaS, OS patching and security are your job.",
      "# Say this in the interview",
      "IaaS means renting raw compute, network and storage and managing the OS upward, like EC2. PaaS means the provider manages the runtime and OS and you just deploy code, like Elastic Beanstalk or Heroku. SaaS is complete software consumed over the web, like Gmail. Serverless or FaaS runs functions on demand, billed per invocation and scaling to zero, like Lambda. Under the shared responsibility model, the more managed the service, the less you are responsible for.",
      "Follow-up: What is a cold start and how do you reduce it?",
      "  The delay to create a new execution environment; reduce it with smaller bundles, fewer startup dependencies, provisioned concurrency or SnapStart where supported.",
      "Follow-up: Is a container on Fargate IaaS or PaaS?",
      "  Closer to serverless/PaaS: you provide the container, AWS manages the servers and OS underneath.",
    ],
    code: `// index.mjs — AWS Lambda (serverless/FaaS) handler, Node.js 22 runtime
let coldStart = true;                 // module scope runs once per execution environment

export const handler = async (event) => {
  console.log("cold start:", coldStart);   // → true on first call, then false
  coldStart = false;

  const name = event.queryStringParameters?.name ?? "world";
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: \`Hello, \${name}\` }),
  };
};

// Deployed behind a function URL / API Gateway:
//   curl "https://<id>.lambda-url.us-east-1.on.aws/hello?name=Asha"
//   → {"message":"Hello, Asha"}
// No servers to patch; billed per request + duration; scales to zero when idle.
// Same API on IaaS = EC2 + install Node + nginx + patching + autoscaling yourself.`,
  },
  {
    id: 'aws-vpc-subnets',
    group: 'Cloud (AWS)',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain a VPC, public vs private subnets, IGW and NAT gateway.',
    a: [
      "# ELI5",
      "A VPC is your own gated housing colony inside a huge city (AWS). Nobody gets in unless you build a gate.",
      "Some streets near the gate are public: shops on them can be visited from outside. Inner streets are private: houses there are not reachable from outside.",
      "The main gate is the Internet Gateway. The private houses can still send letters out through a guarded post office (NAT gateway), but strangers cannot use it to come in.",
      "Mapping back: public subnets hold things the internet must reach (load balancers); private subnets hold apps and databases that should only make outbound connections.",
      "# What it is",
      "VPC (Virtual Private Cloud): your logically isolated private network in one AWS region. You choose its IP range in CIDR notation, e.g. `10.0.0.0/16`.",
      "CIDR (Classless Inter-Domain Routing): a way to write an IP range. `/16` means the first 16 bits are fixed, giving 65,536 addresses; `/24` gives 256.",
      "Subnet: a smaller IP range inside the VPC that lives in exactly one Availability Zone (AZ, an isolated data centre group in the region). You create subnets in 2–3 AZs for high availability.",
      "Route table: rules attached to a subnet saying where traffic for each destination goes, e.g. `0.0.0.0/0` (all internet traffic) → some gateway.",
      "Internet Gateway (IGW): attached to the VPC, it lets resources with public IPs talk to and be reached from the internet.",
      "Public subnet: its route table sends `0.0.0.0/0` to the IGW. Used for load balancers, NAT gateways and bastion hosts.",
      "Private subnet: no route to the IGW. Resources there (app servers, databases) are not reachable from the internet.",
      "NAT gateway (Network Address Translation): sits in a public subnet; private resources send outbound traffic (e.g. to download packages or call Stripe) through it. Replies come back, but nobody can start a connection inward.",
      "VPC endpoints: private connections to AWS services without going via the internet/NAT. Gateway endpoints (free) for S3 and DynamoDB; interface endpoints (PrivateLink) for others like ECR, Secrets Manager.",
      "Connecting VPCs: VPC peering (one-to-one) or Transit Gateway (a hub for many VPCs and on-prem networks).",
      "# How it works",
      "A user calls your API:",
      "  DNS resolves to the Application Load Balancer, which has nodes in public subnets.",
      "  The request enters via the IGW to the ALB.",
      "  The ALB forwards to app servers or containers in private subnets using private IPs.",
      "  The app queries the database in another private subnet.",
      "The app calls an external API:",
      "  Private subnet route `0.0.0.0/0 → nat-gateway`.",
      "  The NAT gateway replaces the private source IP with its public Elastic IP and sends the request through the IGW.",
      "  The response returns through the NAT to the app.",
      "Best practice: one NAT gateway per AZ for resilience (or accept one shared for cost savings in non-prod).",
      "# Example walkthrough",
      "The Terraform creates a `10.0.0.0/16` VPC and an IGW.",
      "The public subnet `10.0.1.0/24` in `us-east-1a` has `map_public_ip_on_launch` and a route table sending `0.0.0.0/0` to the IGW.",
      "The private subnet `10.0.11.0/24` has a route table sending `0.0.0.0/0` to the NAT gateway, which lives in the public subnet with an Elastic IP.",
      "An EC2 instance in the private subnet can `curl https://example.com` (outbound via NAT) but has no public IP, so the internet cannot reach it.",
      "# Why it matters / when to use",
      "Every production AWS architecture starts with a VPC design; databases in private subnets is a basic security expectation.",
      "Interview system-design rounds often ask you to sketch: ALB in public subnets, app and DB in private subnets, across multiple AZs.",
      "Cost awareness: NAT gateways charge per hour and per GB processed; VPC endpoints for S3/ECR reduce that cost.",
      "# Common mistakes",
      "Putting databases in public subnets 'for easy access'; use a bastion, SSM Session Manager or VPN instead.",
      "Choosing a VPC CIDR that overlaps with other VPCs or the office network, making peering/VPN impossible later.",
      "Single NAT gateway in one AZ for production; if that AZ fails, private subnets in other AZs lose internet access.",
      "Thinking 'private subnet' means encrypted or secure by itself; you still need security groups and IAM.",
      "# Say this in the interview",
      "A VPC is my isolated virtual network in a region with a CIDR range, split into subnets that each live in one availability zone. A public subnet's route table has a route to an Internet Gateway, so resources like the ALB or a bastion can have public IPs. A private subnet has no direct internet route; apps and databases there reach out through a NAT gateway in a public subnet. VPC endpoints give private access to services like S3 and ECR without NAT, and peering or Transit Gateway connect VPCs.",
      "Follow-up: What makes a subnet public?",
      "  Only its route table: a route for `0.0.0.0/0` pointing to an Internet Gateway.",
      "Follow-up: How do you SSH into a private instance?",
      "  Prefer AWS Systems Manager Session Manager (no open ports); otherwise a bastion host in a public subnet or a VPN.",
    ],
    code: `# vpc.tf — one public + one private subnet (repeat per AZ in real setups)
resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }
resource "aws_internet_gateway" "igw" { vpc_id = aws_vpc.main.id }

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"         # 256 addresses
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_eip" "nat" { domain = "vpc" }
resource "aws_nat_gateway" "nat_a" {
  subnet_id     = aws_subnet.public_a.id          # NAT lives in the PUBLIC subnet
  allocation_id = aws_eip.nat.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"                       # all internet traffic
    gateway_id = aws_internet_gateway.igw.id       # → IGW  = PUBLIC subnet
  }
}
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_a.id      # → NAT  = PRIVATE subnet
  }
}
resource "aws_route_table_association" "pub" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "priv" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}
# private instance: curl https://example.com → works (outbound via NAT); inbound from internet → impossible`,
  },
  {
    id: 'security-group-vs-nacl',
    group: 'Cloud (AWS)',
    stars: 4,
    difficulty: 'Medium',
    q: 'Security Group vs Network ACL?',
    a: [
      "# ELI5",
      "A security group is a personal bodyguard standing next to each house. It remembers who you invited, so when your friend leaves, the guard lets them out without checking again.",
      "A network ACL is the security checkpoint at the entrance of the whole street. It checks everyone going in and everyone going out separately, with a numbered list of rules, and it has no memory.",
      "Mapping back: security groups protect individual resources and are stateful; NACLs protect a whole subnet and are stateless.",
      "# What it is",
      "Firewall: rules deciding which network traffic is allowed, based on source/destination IP, protocol (TCP/UDP) and port (e.g. 443 for HTTPS, 5432 for Postgres).",
      "Security Group (SG): a virtual firewall attached to a network interface (ENI — Elastic Network Interface) of an EC2 instance, RDS database, load balancer, Lambda in a VPC, etc.",
      "Network ACL (NACL — Network Access Control List): a firewall attached to a subnet, filtering all traffic entering or leaving that subnet.",
      "Stateful: the firewall tracks connections; if a request is allowed in, the response is automatically allowed out (and vice versa).",
      "Stateless: each packet is checked on its own; you must explicitly allow both the request direction and the response direction.",
      "Ephemeral ports: the temporary high port numbers (e.g. 1024–65535) a client uses for its side of a connection; responses go back to these ports, so stateless NACLs must allow them.",
      "Comparison, row by row:",
      "  Level: SG = instance/ENI; NACL = subnet.",
      "  State: SG = stateful; NACL = stateless.",
      "  Rule types: SG = allow only; NACL = allow and deny.",
      "  Evaluation: SG = all rules considered together (any allow matches); NACL = rules evaluated in number order, first match wins.",
      "  Default: new SG denies all inbound and allows all outbound; default NACL allows everything; a custom NACL denies everything until you add rules.",
      "  References: SG rules can reference other SGs (e.g. 'allow from the app SG'); NACL rules use only CIDR ranges.",
      "# How it works",
      "Inbound request from the internet to an app instance in a private subnet behind an ALB:",
      "  Packet reaches the ALB's subnet: the NACL inbound rules are checked in order.",
      "  The ALB's SG must allow inbound 443 from `0.0.0.0/0`.",
      "  ALB forwards to the app: the app subnet's NACL inbound, then the app SG which allows port 3000 only from the ALB's SG.",
      "  The response: the SG lets it out automatically (stateful), but the NACL outbound must allow the ephemeral port range back.",
      "Because SGs can reference each other, you can express 'only the app tier can reach the database' without listing IPs, even as instances scale.",
      "# Example walkthrough",
      "`alb_sg` allows HTTPS (443) from anywhere.",
      "`app_sg` allows port 3000 only from `alb_sg` — instances can come and go and the rule still works.",
      "`db_sg` allows 5432 only from `app_sg`; even another server in the same subnet cannot reach the database.",
      "The NACL example denies a known malicious IP range with rule 90, before rule 100 allows HTTPS — something SGs cannot do because they have no deny rules.",
      "# Why it matters / when to use",
      "Security groups do most of the work in typical architectures: tiered access (ALB → app → DB).",
      "NACLs are a coarse, extra layer: blocking specific IP ranges, or compliance needs for subnet-level controls.",
      "Debugging connectivity issues ('connection timed out') often comes down to an SG or NACL rule.",
      "# Common mistakes",
      "Opening SSH (22) or databases to `0.0.0.0/0`; restrict to specific SGs or use Session Manager.",
      "Writing NACL rules for inbound only and forgetting outbound ephemeral ports, which silently breaks responses.",
      "Trying to block an IP with a security group; SGs cannot deny — use a NACL or AWS WAF.",
      "Using IP addresses in SG rules for internal tiers instead of SG references, which break when instances change.",
      "# Say this in the interview",
      "A security group is a stateful firewall at the instance or ENI level with allow rules only, so return traffic is automatically allowed. A network ACL is a stateless firewall at the subnet level with both allow and deny rules evaluated in order, so you must explicitly allow return traffic on ephemeral ports. Security groups can reference other security groups, for example the database only allows the app's security group. In practice SGs do most of the work and NACLs are a coarse extra layer.",
      "Follow-up: How would you block one attacker IP?",
      "  Add a deny rule to the subnet's NACL with a lower number than the allow rules, or use AWS WAF on the load balancer.",
      "Follow-up: A connection times out but the SG looks right; what next?",
      "  Check the NACL in both directions (including ephemeral ports), route tables, and use VPC Reachability Analyzer or flow logs.",
    ],
    code: `# sg.tf — tiered access with security group references
resource "aws_security_group" "alb_sg" { vpc_id = aws_vpc.main.id }
resource "aws_security_group" "app_sg" { vpc_id = aws_vpc.main.id }
resource "aws_security_group" "db_sg"  { vpc_id = aws_vpc.main.id }

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"                   # HTTPS from anywhere
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}
resource "aws_vpc_security_group_ingress_rule" "app_from_alb" {
  security_group_id            = aws_security_group.app_sg.id
  referenced_security_group_id = aws_security_group.alb_sg.id   # only the ALB
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
}
resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db_sg.id
  referenced_security_group_id = aws_security_group.app_sg.id   # only the app tier
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}
# responses need no rule: security groups are STATEFUL

# nacl.tf — stateless, numbered, can DENY (rule 90 is checked before 100)
resource "aws_network_acl_rule" "block_bad" {
  network_acl_id = aws_network_acl.public.id
  rule_number    = 90
  egress         = false
  protocol       = "-1"                 # all protocols
  rule_action    = "deny"
  cidr_block     = "203.0.113.0/24"
}
# + inbound allow 443 (rule 100) AND outbound allow 1024-65535 for replies`,
  },
  {
    id: 'regions-azs-ha',
    group: 'Cloud (AWS)',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are regions and availability zones, and how do you design for HA on AWS?',
    a: [
      "# ELI5",
      "A pizza chain has branches in different cities (regions). Inside one city it has three kitchens in different neighbourhoods (availability zones), each with its own electricity and water.",
      "If one kitchen's power goes out, the other two keep making pizzas, and the phone line sends orders to them.",
      "If the whole city floods, the chain can still serve customers from another city, just a bit slower.",
      "Mapping back: spreading servers across AZs protects against a data-centre failure; using multiple regions protects against a whole-region failure.",
      "# What it is",
      "Region: a geographic area (e.g. `us-east-1` N. Virginia, `ap-south-1` Mumbai) containing multiple isolated Availability Zones. Regions are independent; data stays in a region unless you copy it.",
      "Availability Zone (AZ): one or more discrete data centres within a region, with independent power, cooling and networking, connected to other AZs by fast, low-latency links (single-digit milliseconds). Most regions have 3 or more.",
      "High availability (HA): designing a system to keep working when components fail, usually by redundancy (having more than one of everything) and automatic failover.",
      "Single point of failure (SPOF): one component whose failure takes the whole system down, e.g. a single EC2 instance or a database in one AZ.",
      "Disaster recovery (DR): recovering from bigger events such as a full region outage; usually involves multi-region setups.",
      "Edge locations: separate, many smaller sites used by CloudFront (CDN) and Route 53 to serve content close to users.",
      "# How it works",
      "Classic multi-AZ HA web architecture:",
      "  Application Load Balancer spans subnets in 2–3 AZs and only routes to healthy targets (health checks).",
      "  An Auto Scaling Group keeps app instances spread across those AZs and replaces failed ones.",
      "  The database uses RDS Multi-AZ (a synchronous standby in another AZ, automatic failover in about a minute or two) or Aurora.",
      "  State (sessions, files) lives in managed, multi-AZ services: ElastiCache with replicas, S3, DynamoDB — not on instance disks.",
      "  NAT gateways per AZ so one AZ failure does not cut off others.",
      "Multi-region for DR or global latency:",
      "  Route 53 routing policies: failover (primary/secondary with health checks), latency-based (send users to the fastest region), geolocation.",
      "  Data replication: S3 Cross-Region Replication, Aurora Global Database, DynamoDB Global Tables.",
      "Availability math: if one AZ is 99.9% available, two independent AZs both failing at once is far less likely, which is why redundancy increases overall availability.",
      "# Example walkthrough",
      "The Terraform ASG sets `min_size = 3` and lists subnets in three AZs, so AWS places one instance per AZ.",
      "`health_check_type = \"ELB\"` means the ASG trusts the load balancer's health checks and replaces instances that fail them.",
      "The RDS instance has `multi_az = true`, creating a standby in a different AZ.",
      "If `us-east-1a` fails, the ALB stops sending traffic there, the ASG launches a replacement in the remaining AZs, and RDS fails over to its standby; users see at most a brief blip.",
      "# Why it matters / when to use",
      "AZ outages do happen; production systems are expected to survive the loss of one AZ.",
      "Interviewers ask this to see if you avoid single points of failure in designs.",
      "Choosing regions also matters for latency to users and data residency laws (e.g. keeping data in India or the EU).",
      "# Common mistakes",
      "Running 'HA' with all instances in one AZ, or a single-AZ database.",
      "Storing user uploads or sessions on local instance disks, which vanish when the instance is replaced.",
      "Assuming multi-AZ protects against bad deploys or data corruption; it replicates the corruption too. That is what backups and DR are for.",
      "Ignoring cross-AZ data transfer costs in very chatty architectures.",
      "# Say this in the interview",
      "A region is a geographic area with multiple isolated availability zones, and an AZ is one or more data centres with independent power and networking. For high availability I spread instances across two or three AZs behind a load balancer with an auto scaling group, and use managed multi-AZ services like RDS Multi-AZ, S3 and DynamoDB. For disaster recovery or global latency I go multi-region with Route 53 failover or latency routing and cross-region replication.",
      "Follow-up: How many AZs should you use?",
      "  At least two, ideally three, so losing one still leaves capacity and quorum-based systems keep a majority.",
    ],
    code: `# ha.tf — survive the loss of one AZ
resource "aws_autoscaling_group" "api" {
  min_size            = 3
  max_size            = 9
  desired_capacity    = 3
  vpc_zone_identifier = [                 # one private subnet per AZ
    aws_subnet.private_a.id,              # us-east-1a
    aws_subnet.private_b.id,              # us-east-1b
    aws_subnet.private_c.id,              # us-east-1c
  ]
  target_group_arns = [aws_lb_target_group.api.arn]
  health_check_type = "ELB"               # replace instances the ALB marks unhealthy
  launch_template {
    id      = aws_launch_template.api.id
    version = "$Latest"
  }
}

resource "aws_db_instance" "main" {
  engine              = "postgres"
  instance_class      = "db.t4g.medium"
  allocated_storage   = 50
  multi_az            = true              # synchronous standby in another AZ
  username            = "app"
  manage_master_user_password = true      # password kept in Secrets Manager
}
# AZ "a" fails → ALB stops routing there, ASG replaces capacity in b/c,
# RDS fails over to the standby → service keeps running.`,
  },
  {
    id: 'ec2-autoscaling-alb',
    group: 'Cloud (AWS)',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do Auto Scaling Groups work with a load balancer?',
    a: [
      "# ELI5",
      "A supermarket has a manager at the entrance who sends each customer to a free checkout counter.",
      "When queues get long, the store calls in more cashiers; when it is quiet, some go home. If a cashier faints, the manager stops sending people to that counter and a replacement is called.",
      "Mapping back: the manager is the load balancer, cashiers are EC2 instances, and the 'call in more / send home' rules are the Auto Scaling Group.",
      "# What it is",
      "EC2 instance: a virtual machine (server) in AWS.",
      "Launch template: a saved recipe for new instances — AMI (Amazon Machine Image, the disk image with OS and maybe your app), instance type (CPU/RAM size), security groups, IAM role, startup script (user data).",
      "Auto Scaling Group (ASG): a group that keeps the number of running instances between `min_size` and `max_size`, aiming for `desired_capacity`, spread across AZs. It replaces unhealthy instances automatically.",
      "Application Load Balancer (ALB): a layer-7 (HTTP/HTTPS) load balancer that receives requests and spreads them across healthy targets; can route by path or host (e.g. `/api/*`).",
      "Target group: the list of backends the ALB sends traffic to, with a health check (e.g. `GET /health` must return 200).",
      "Scaling policies decide when to change desired capacity:",
      "  Target tracking: 'keep average CPU at 60%' or 'keep requests per target at 1000' — AWS adds/removes instances to stay near the target (most common).",
      "  Step scaling: add 2 instances if CPU > 70%, add 4 if > 90%, based on CloudWatch alarms.",
      "  Scheduled: scale to 10 at 9am on weekdays.",
      "  Predictive: uses machine learning on past traffic to scale before predictable peaks.",
      "# How it works",
      "Startup:",
      "  The ASG launches instances from the launch template in the listed subnets/AZs.",
      "  Each new instance is registered into the ALB target group automatically.",
      "  The ALB starts sending traffic only after the instance passes health checks; a health check grace period lets the app boot first.",
      "Scaling out: CPU rises → CloudWatch metric crosses the target → ASG increases desired capacity → new instances launch and register.",
      "Scaling in: load drops → ASG picks instances to terminate (balancing AZs), the ALB drains them first (deregistration delay lets in-flight requests finish).",
      "Healing: with `health_check_type = ELB`, if the ALB marks an instance unhealthy, the ASG terminates and replaces it.",
      "Deploying a new version: update the launch template (new AMI) and start an instance refresh, which replaces instances in batches while keeping a minimum healthy percentage.",
      "# Example walkthrough",
      "The ASG keeps between 2 and 10 instances in two subnets and attaches to target group `api`.",
      "The target-tracking policy keeps average CPU around 60%. If a traffic spike pushes CPU to 90%, AWS adds instances until the average falls near 60%.",
      "`health_check_grace_period = 120` waits 2 minutes after boot before health failures count.",
      "The CLI command starts an instance refresh with `MinHealthyPercentage: 90`, so at most 10% of capacity is being replaced at any moment.",
      "# Why it matters / when to use",
      "Handles traffic spikes (sales, marketing campaigns) without manual work and saves money at quiet times.",
      "Self-healing: crashed or broken instances are replaced without paging anyone.",
      "The same concepts apply to containers: ECS service autoscaling and Kubernetes HPA plus cluster autoscaler.",
      "# Common mistakes",
      "Health check endpoint that checks too much (e.g. a downstream database); one dependency blip marks every instance unhealthy and the ASG kills the fleet.",
      "Storing state (sessions, uploads) on instances; scale-in deletes them. Keep apps stateless.",
      "Setting the grace period too short, so slow-booting instances are killed in a loop.",
      "Scaling on CPU for a workload limited by something else (e.g. queue length or connections); pick a metric that reflects load.",
      "# Say this in the interview",
      "An Auto Scaling Group keeps a min, desired and max number of EC2 instances from a launch template across AZs and replaces unhealthy ones. Scaling policies such as target tracking on 60% CPU, step, scheduled or predictive scaling adjust the desired count. Instances register automatically in an ALB target group, and the ALB health checks drive both traffic routing and replacement. To roll out a new AMI, an instance refresh replaces instances gradually.",
      "Follow-up: What is connection draining?",
      "  The ALB's deregistration delay: it stops sending new requests to an instance being removed but lets in-flight requests finish.",
      "Follow-up: Why use ELB health checks instead of EC2 status checks?",
      "  EC2 checks only see if the VM is alive; ELB checks see if the app actually responds correctly.",
    ],
    code: `# asg.tf
resource "aws_autoscaling_group" "api" {
  min_size                  = 2
  max_size                  = 10
  vpc_zone_identifier       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  target_group_arns         = [aws_lb_target_group.api.arn]  # auto-register in ALB
  health_check_type         = "ELB"     # trust the ALB's /health check
  health_check_grace_period = 120       # seconds to boot before checks count
  launch_template {
    id      = aws_launch_template.api.id
    version = aws_launch_template.api.latest_version
  }
}

resource "aws_autoscaling_policy" "cpu60" {
  name                   = "keep-cpu-60"
  autoscaling_group_name = aws_autoscaling_group.api.name
  policy_type            = "TargetTrackingScaling"
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60                    # add/remove instances to stay near 60% CPU
  }
}

# roll out a new AMI gradually (shell):
# aws autoscaling start-instance-refresh --auto-scaling-group-name api \\
#   --preferences '{"MinHealthyPercentage": 90}'
# → { "InstanceRefreshId": "08b91cf7-..." }`,
  },
  {
    id: 'ecs-eks-lambda',
    group: 'Cloud (AWS)',
    stars: 3,
    difficulty: 'Medium',
    q: 'ECS vs EKS vs Lambda: how do you choose?',
    a: [
      "# ELI5",
      "Lambda is like a taxi: you call it only when you need a ride, pay per trip, but it might take a minute to arrive and you cannot drive across the country in it.",
      "ECS is like a company car service run by one firm: simple, reliable, works well in that firm's city.",
      "EKS is like owning a full transport fleet with a standard rulebook used worldwide: very powerful and portable, but you need staff who know how to run it.",
      "Mapping back: these are three AWS ways to run backend code, trading simplicity, control, portability and cost.",
      "# What it is",
      "Container: a packaged app with its dependencies (built from a Dockerfile) that runs the same everywhere. Orchestrator: a system that runs many containers across machines, restarts them, scales them and routes traffic.",
      "AWS Lambda: run functions in response to events (HTTP via API Gateway/function URL, S3 uploads, SQS messages, schedules). No servers or containers to manage, max 15 minutes per invocation, up to 10 GB memory, pay per request and execution time, scales to zero, may have cold starts.",
      "Amazon ECS (Elastic Container Service): AWS's own container orchestrator. You define a task definition (which image, CPU/memory, env vars) and a service (how many copies, which load balancer). Simple and deeply integrated with AWS.",
      "Amazon EKS (Elastic Kubernetes Service): managed Kubernetes. AWS runs the control plane; you run workloads with standard Kubernetes YAML, Helm, operators. Portable to other clouds, huge ecosystem, more complexity.",
      "Fargate: a 'serverless' compute engine for containers usable by both ECS and EKS — you do not manage EC2 instances; AWS runs each task/pod on isolated capacity. Alternatively, run on your own EC2 nodes for more control and lower cost at scale.",
      "Comparison, row by row:",
      "  Unit you deploy: Lambda = function (zip or container image); ECS = task/service; EKS = pods/deployments.",
      "  Ops effort: Lambda lowest; ECS low–medium; EKS highest (upgrades, add-ons, networking).",
      "  Limits: Lambda 15 min, stateless, cold starts; ECS/EKS run long-lived processes, websockets, background workers.",
      "  Portability: Lambda and ECS are AWS-specific; EKS uses Kubernetes, which runs anywhere.",
      "  Cost: Lambda cheapest for spiky/low traffic; containers cheaper for steady high traffic; EKS also charges a per-cluster control-plane fee.",
      "# How it works",
      "Decision process:",
      "  Event-driven, short tasks or low/spiky traffic (webhooks, image resize, cron jobs)? → Lambda.",
      "  Long-running services or steady traffic, small team, all-in on AWS? → ECS on Fargate.",
      "  Many services, need Kubernetes ecosystem (Helm, Argo CD, service mesh), multi-cloud or existing k8s skills? → EKS.",
      "Many companies mix them: EKS or ECS for core APIs, Lambda for glue and async jobs.",
      "# Example walkthrough",
      "The ECS task definition runs image `api:1.4.0` on Fargate with 0.5 vCPU and 1 GB memory, exposing port 3000 and logging to CloudWatch.",
      "An ECS service (not shown) would keep e.g. 3 copies running behind an ALB.",
      "The equivalent on EKS would be a Kubernetes Deployment + Service; on Lambda you would rewrite the app as a handler or use a web adapter.",
      "`aws ecs run-task` or creating the service prints the task ARN; tasks show status `RUNNING` in the console.",
      "# Why it matters / when to use",
      "Architecture interviews often ask you to justify the compute choice based on traffic shape, team skills and cost.",
      "Picking EKS for a 3-person team with two services usually adds more operational work than value; picking Lambda for a constant 5,000 req/s API can be expensive.",
      "# Common mistakes",
      "Choosing Kubernetes because it is popular, without people to operate it.",
      "Putting long-running jobs or websockets on Lambda and hitting the 15-minute limit or connection issues.",
      "Ignoring cold starts for latency-sensitive Lambda APIs; use provisioned concurrency if needed.",
      "Thinking Fargate is a separate orchestrator; it is the compute layer under ECS or EKS.",
      "# Say this in the interview",
      "Lambda is for event-driven functions with no servers, a 15-minute limit, possible cold starts and pay-per-request pricing. ECS is AWS-native container orchestration that is simpler to run, on EC2 or serverless Fargate. EKS is managed Kubernetes, portable with a huge ecosystem but more operational complexity. I choose based on workload shape, the team's Kubernetes skills, portability needs and cost at scale.",
      "Follow-up: When does Lambda become more expensive than containers?",
      "  At high, steady traffic where functions are busy most of the time; then always-on containers cost less per request.",
      "Follow-up: What is Fargate?",
      "  Serverless compute for ECS/EKS: you specify CPU and memory per task or pod and AWS manages the underlying servers.",
    ],
    code: `// ecs-taskdef.json — one API container on Fargate
{
  "family": "api",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [{
    "name": "api",
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/api:1.4.0",
    "portMappings": [{ "containerPort": 3000 }],
    "environment": [{ "name": "NODE_ENV", "value": "production" }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/api",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "api"
      }
    }
  }]
}
// aws ecs register-task-definition --cli-input-json file://ecs-taskdef.json
// → "taskDefinitionArn": "arn:aws:ecs:us-east-1:123456789012:task-definition/api:1"
// Same app on EKS = Deployment + Service YAML; on Lambda = rewrite as a handler.`,
  },
  {
    id: 's3-storage-classes',
    group: 'Cloud (AWS)',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are the key features of S3 and its storage classes?',
    a: [
      "# ELI5",
      "S3 is a giant, super-safe warehouse for boxes. Each box has a label (key) and lives on a named shelf (bucket).",
      "Boxes you use every day stay near the front door (expensive but quick). Old tax papers go to the basement (cheap but slow to fetch). Ancient records go to a far-away vault where fetching takes hours.",
      "Mapping back: S3 stores files as objects in buckets, and storage classes trade cost against how quickly and cheaply you can read them back.",
      "# What it is",
      "Amazon S3 (Simple Storage Service): object storage. An object is a file plus metadata, stored under a key (like `uploads/2026/photo.jpg`) inside a bucket (a globally uniquely named container in one region).",
      "Object storage vs block/file storage: you read and write whole objects over an HTTP API, not mount it like a disk. Great for files, backups, static websites, data lakes.",
      "Durability: designed for 99.999999999% ('11 nines') — data is stored redundantly across multiple AZs (except One Zone classes).",
      "Consistency: strong read-after-write consistency — right after a successful upload, every read sees the new object.",
      "Storage classes (cheaper storage usually means more expensive or slower retrieval):",
      "  S3 Standard: frequently accessed data; default.",
      "  S3 Intelligent-Tiering: automatically moves objects between tiers based on access; good when patterns are unknown.",
      "  Standard-IA (Infrequent Access): cheaper storage, per-GB retrieval fee, 30-day minimum; for backups accessed rarely.",
      "  One Zone-IA: like IA but stored in one AZ only; for re-creatable data.",
      "  Glacier Instant Retrieval: archive with millisecond access; Glacier Flexible Retrieval: minutes to hours; Glacier Deep Archive: cheapest, ~12+ hours to restore.",
      "Lifecycle rules: automatic transitions (e.g. to IA after 30 days, Glacier after 90) and expirations (delete after 365 days).",
      "Versioning keeps old versions when objects are overwritten or deleted; replication copies objects to another bucket/region.",
      "Security: Block Public Access (on by default for new buckets), bucket policies and IAM, encryption at rest (SSE-S3 by default, or SSE-KMS with your keys), and presigned URLs — time-limited links that allow a specific upload or download without making the bucket public.",
      "# How it works",
      "Upload flow for user files in a backend:",
      "  The client asks your API for an upload URL.",
      "  The API generates a presigned PUT URL valid for e.g. 5 minutes.",
      "  The browser uploads directly to S3, so large files never pass through your servers.",
      "  Your API stores the key in the database; downloads use presigned GET URLs or CloudFront.",
      "Lifecycle rules run daily in the background to move or delete objects.",
      "# Example walkthrough",
      "The Node.js code (AWS SDK v3) creates a presigned PUT URL for `uploads/user-42/avatar.png` that expires in 300 seconds.",
      "Running it prints a long `https://acme-uploads.s3.us-east-1.amazonaws.com/uploads/...X-Amz-Signature=...` URL.",
      "A client can `PUT` the file to that URL with `curl --upload-file`; after 5 minutes the URL returns 403 AccessDenied.",
      "The comment shows a lifecycle rule moving objects to Standard-IA after 30 days and Glacier after 90.",
      "# Why it matters / when to use",
      "User uploads, static assets, log archives, database backups, data for analytics (Athena), Terraform state.",
      "Choosing the right class and lifecycle can cut storage bills dramatically.",
      "# Common mistakes",
      "Making buckets public to serve files; use presigned URLs or CloudFront with Origin Access Control.",
      "Moving small or frequently read objects to IA/Glacier, where retrieval and minimum-duration fees cost more than you save.",
      "Streaming every upload through your Node server instead of presigned direct uploads, wasting bandwidth and memory.",
      "# Say this in the interview",
      "S3 is object storage with 11 nines of durability, organised as buckets and keys, with strong read-after-write consistency. Storage classes include Standard, Intelligent-Tiering, Standard-IA, One Zone-IA and the Glacier tiers, trading storage cost against retrieval cost and speed. Lifecycle rules move or expire objects, versioning and replication protect data, and security comes from Block Public Access, bucket policies, encryption and presigned URLs.",
      "Follow-up: What is a presigned URL?",
      "  A URL signed with your credentials that grants temporary access to one specific object operation, so clients can upload or download directly without public access.",
    ],
    code: `// presign.mjs — npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });   // credentials from IAM role/env

const url = await getSignedUrl(
  s3,
  new PutObjectCommand({
    Bucket: "acme-uploads",
    Key: "uploads/user-42/avatar.png",
    ContentType: "image/png",
  }),
  { expiresIn: 300 },                                 // valid for 5 minutes
);
console.log(url);
// → https://acme-uploads.s3.us-east-1.amazonaws.com/uploads/user-42/avatar.png?X-Amz-Algorithm=...&X-Amz-Signature=...

// client: curl -X PUT -H "Content-Type: image/png" --upload-file avatar.png "<url>"
// → 200 OK  (after 5 minutes → 403 AccessDenied: Request has expired)

// lifecycle rule idea (bucket config):
//   after 30 days  → STANDARD_IA
//   after 90 days  → GLACIER (Flexible Retrieval)
//   after 365 days → expire (delete)`,
  },
  {
    id: 'rds-multiaz-read-replica',
    group: 'Cloud (AWS)',
    stars: 2,
    difficulty: 'Medium',
    q: 'RDS Multi-AZ vs read replicas?',
    a: [
      "# ELI5",
      "Multi-AZ is having a backup goalkeeper standing right behind the main one, copying every move. If the main keeper gets hurt, the backup takes over immediately. But the backup never plays at the same time.",
      "Read replicas are like photocopies of the library's books placed in other rooms, so more people can read at once. The copies may be a few pages behind the original.",
      "Mapping back: Multi-AZ is for staying online when a server fails; read replicas are for handling more read traffic.",
      "# What it is",
      "Amazon RDS (Relational Database Service): managed databases (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle) where AWS handles backups, patching and failover.",
      "Primary (writer): the database instance that accepts writes (INSERT/UPDATE/DELETE).",
      "Synchronous replication: a write is confirmed only after it is saved on both the primary and the standby, so no committed data is lost on failover (slightly higher write latency).",
      "Asynchronous replication: the primary confirms the write immediately and sends it to the replica afterwards, so the replica may lag behind (replication lag).",
      "RDS Multi-AZ (classic, one standby): a synchronous standby in a different AZ. It does not serve reads. On failure, RDS automatically fails over by pointing the same DNS endpoint to the standby, typically within 1–2 minutes.",
      "Multi-AZ DB cluster (newer option for MySQL/PostgreSQL): one writer and two readable standbys in different AZs, with faster failover — so 'standby cannot be read' is true only for the classic mode.",
      "Read replica: an asynchronous copy with its own endpoint, used to offload reads (reports, search pages). Can be in another region. Can be promoted manually to a standalone primary.",
      "Comparison, row by row:",
      "  Purpose: Multi-AZ = high availability; read replica = read scaling (and DR if cross-region).",
      "  Replication: Multi-AZ synchronous; replicas asynchronous.",
      "  Serves reads: classic Multi-AZ no; replicas yes.",
      "  Failover: Multi-AZ automatic, same endpoint; replica promotion manual, new endpoint.",
      "  Location: Multi-AZ same region; replicas same or other region.",
      "Aurora (AWS's cloud-native engine) blends both: up to 15 replicas that also act as failover targets.",
      "# How it works",
      "Multi-AZ failover:",
      "  The primary's AZ has an outage (or you reboot with failover, or patching occurs).",
      "  RDS detects it and promotes the standby.",
      "  The DNS name (e.g. `mydb.xxxx.rds.amazonaws.com`) is updated to the new primary; apps reconnect.",
      "Read replica usage:",
      "  App sends writes to the primary endpoint and selected reads to the replica endpoint (or a reader endpoint in Aurora).",
      "  Reads that must see just-written data (e.g. 'show my new order') go to the primary, because the replica may lag.",
      "# Example walkthrough",
      "The Terraform creates a Postgres primary with `multi_az = true` — a hidden standby in another AZ.",
      "The second resource creates a read replica via `replicate_source_db`.",
      "In Node, `writer` points to the primary endpoint and `reader` to the replica: `INSERT` goes to the writer; the dashboard's heavy `SELECT COUNT(*)` goes to the reader.",
      "If the primary's AZ fails, the writer endpoint automatically points to the former standby and the app reconnects; the replica keeps serving reads.",
      "# Why it matters / when to use",
      "Production databases should almost always be Multi-AZ.",
      "Add read replicas when read traffic (dashboards, analytics, search) overloads the primary.",
      "Cross-region replicas serve as a disaster recovery option and lower-latency reads for distant users.",
      "# Common mistakes",
      "Thinking Multi-AZ improves read performance (classic mode does not).",
      "Reading your own writes from a lagging replica, causing 'my update disappeared' bugs.",
      "Hardcoding instance IPs instead of using DNS endpoints, so failover does not reach the app.",
      "Treating replicas as backups; a bad DELETE replicates too. Use automated backups and snapshots.",
      "# Say this in the interview",
      "Multi-AZ keeps a synchronous standby in another AZ for high availability and automatic failover behind the same endpoint; in classic mode the standby is not used for reads. Read replicas are asynchronous copies used to scale reads, can be cross-region, and can be promoted manually. So Multi-AZ is about availability and read replicas are about read scalability, and DR when cross-region.",
      "Follow-up: How do you handle replication lag?",
      "  Route read-after-write queries to the primary, monitor the `ReplicaLag` metric, and design screens to tolerate slightly stale data.",
    ],
    code: `# rds.tf
resource "aws_db_instance" "primary" {
  identifier                  = "orders-db"
  engine                      = "postgres"
  instance_class              = "db.m6g.large"
  allocated_storage           = 100
  username                    = "app"
  manage_master_user_password = true
  multi_az                    = true      # synchronous standby in another AZ (HA)
  backup_retention_period     = 7         # required for read replicas
}

resource "aws_db_instance" "replica" {
  identifier          = "orders-db-replica"
  replicate_source_db = aws_db_instance.primary.identifier   # async copy for reads
  instance_class      = "db.m6g.large"
}

// app.ts (Node, npm i pg)
// import pg from "pg";
// const writer = new pg.Pool({ host: process.env.DB_WRITER_HOST });  // primary endpoint
// const reader = new pg.Pool({ host: process.env.DB_READER_HOST });  // replica endpoint
// await writer.query("INSERT INTO orders(total) VALUES ($1)", [499]);  // writes → primary
// const { rows } = await reader.query("SELECT COUNT(*) FROM orders");  // heavy read → replica
// console.log(rows[0].count);  // → may lag a moment behind the primary`,
  },
  {
    id: 'aws-cost-optimization',
    group: 'Cloud (AWS)',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you optimise cloud costs?',
    a: [
      "# ELI5",
      "Saving money on electricity at home: turn off lights in empty rooms, buy the right-size fridge, use a cheaper night tariff for the washing machine, and check the bill to see what costs the most.",
      "If you know you will live in the house for three years, signing a longer contract gets a discount.",
      "Mapping back: switch off idle resources, right-size instances, use discounted pricing models, and track spending by team with tags.",
      "# What it is",
      "Cloud cost optimisation: paying only for what you need while keeping performance and reliability. The practice of managing it across engineering and finance is called FinOps.",
      "Right-sizing: matching instance size to real usage. A server averaging 5% CPU is probably too big.",
      "Pricing models for compute:",
      "  On-Demand: pay per second/hour, no commitment, most expensive.",
      "  Savings Plans / Reserved Instances: commit to 1 or 3 years of usage for large discounts (up to ~70%). Savings Plans are more flexible across instance types and services (EC2, Fargate, Lambda).",
      "  Spot Instances: spare AWS capacity at up to ~90% off, but AWS can reclaim it with a 2-minute warning. Good for fault-tolerant work: CI runners, batch jobs, stateless workers.",
      "Graviton: AWS's ARM-based processors (instance types ending in `g`, e.g. `m7g`), often with better price-performance than x86.",
      "Data transfer costs: traffic leaving AWS to the internet, between AZs, and through NAT gateways is charged per GB and often surprises teams.",
      "Tags: key-value labels (`team=payments`, `env=prod`) on resources; cost allocation tags let you split the bill by team or service.",
      "# How it works",
      "A practical cost-reduction process:",
      "  Visibility: enable Cost Explorer, cost allocation tags, and AWS Budgets with alerts; turn on Cost Anomaly Detection.",
      "  Quick wins: delete unattached EBS volumes, old snapshots, idle load balancers, unused Elastic IPs, forgotten dev environments.",
      "  Right-size using CloudWatch metrics and AWS Compute Optimizer recommendations.",
      "  Schedule non-prod: stop dev/staging at night and weekends (can save ~65% of their compute).",
      "  Commit: buy Savings Plans for the steady baseline; use On-Demand for peaks and Spot for interruptible work.",
      "  Storage: S3 lifecycle rules and Intelligent-Tiering, gp3 instead of gp2 EBS volumes, log retention limits in CloudWatch.",
      "  Network: VPC gateway endpoints for S3/DynamoDB to avoid NAT charges, keep chatty services in the same AZ where possible, use CloudFront for egress.",
      "  Architecture: autoscaling, serverless for spiky loads, caching to reduce database size.",
      "# Example walkthrough",
      "The first CLI command lists unattached EBS volumes (status `available`) with size — candidates for deletion after a final snapshot.",
      "The second command shows last month's cost grouped by the `team` tag, e.g. `payments: $4,210`, `search: $1,980`.",
      "The cron-style scheduler stops instances tagged `env=dev` at 8pm on weekdays.",
      "Together they show the loop: find waste, attribute cost to owners, automate savings.",
      "# Why it matters / when to use",
      "Cloud bills grow silently; cost is a real engineering metric at startups and large companies alike.",
      "Interviewers like candidates who think about cost when designing systems, not only performance.",
      "# Common mistakes",
      "Buying 3-year reservations before right-sizing, locking in waste.",
      "Running stateful or non-interruptible workloads on Spot without handling interruptions.",
      "No tags, so nobody knows who owns the expensive resources.",
      "Ignoring data transfer and NAT gateway charges, which can exceed compute costs.",
      "# Say this in the interview",
      "I start with visibility: tagging for cost allocation, budgets and anomaly alerts. Then I right-size instances from utilisation data and scale down non-production at night, use Savings Plans or Reserved Instances for steady load and Spot for fault-tolerant batch and CI workers. I also apply storage lifecycle policies, delete unattached volumes and old snapshots, and reduce NAT and cross-AZ data transfer with VPC endpoints and better placement.",
      "Follow-up: When would you use Spot instances?",
      "  For workloads that can be interrupted and retried: CI runners, batch processing, stateless workers in mixed-instance ASGs or Karpenter node pools.",
    ],
    code: `#!/usr/bin/env bash
# 1) Find unattached (wasted) EBS volumes
aws ec2 describe-volumes --filters Name=status,Values=available \\
  --query "Volumes[].{id:VolumeId,gb:Size,created:CreateTime}" --output table
# → | vol-0a1b2c3d | 500 | 2025-03-02 |   ← paying for a disk nobody uses

# 2) Last month's cost per team (needs the "team" cost allocation tag)
aws ce get-cost-and-usage \\
  --time-period Start=2026-10-01,End=2026-11-01 \\
  --granularity MONTHLY --metrics UnblendedCost \\
  --group-by Type=TAG,Key=team
# → team$payments  4210.55 USD
# → team$search    1980.12 USD

# 3) Stop dev instances every weekday at 20:00 (run from a scheduler / cron)
ids=$(aws ec2 describe-instances \\
  --filters Name=tag:env,Values=dev Name=instance-state-name,Values=running \\
  --query "Reservations[].Instances[].InstanceId" --output text)
[ -n "$ids" ] && aws ec2 stop-instances --instance-ids $ids
# → "CurrentState": { "Name": "stopping" } ...`,
  },

  // ───────────────────────── Monitoring/Logging & SRE ─────────────────────────
  {
    id: 'sla-slo-sli',
    group: 'Monitoring/Logging & SRE',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are SLI, SLO, SLA and error budgets?',
    a: [
      "# ELI5",
      "A pizza shop measures how many pizzas arrive within 30 minutes. That measurement is the SLI.",
      "The shop sets itself a goal: '99 out of 100 pizzas on time this month'. That internal goal is the SLO.",
      "It promises customers: 'if fewer than 95 out of 100 are on time, you get a free pizza'. That promise with a penalty is the SLA — set lower than the goal, so the shop has a safety margin.",
      "The 1 late pizza out of 100 the shop is allowed is the error budget. Once it is used up, they stop trying new recipes and focus on delivering on time.",
      "Mapping back: SLIs measure reliability, SLOs are targets, SLAs are contracts, and the error budget is how much unreliability you can 'spend' on releasing changes.",
      "# What it is",
      "SLI (Service Level Indicator): a carefully chosen measurement of how the service behaves for users, usually as a ratio of good events to total events. Examples: % of HTTP requests that succeed (non-5xx); % of requests served in under 300 ms.",
      "SLO (Service Level Objective): a target for an SLI over a time window, e.g. '99.9% of requests succeed over a rolling 30 days'. It is an internal engineering goal.",
      "SLA (Service Level Agreement): a contract with customers stating a level of service and the consequences (service credits, refunds) if it is missed. SLAs are set looser than SLOs so you get warned before you owe money.",
      "Error budget: 1 − SLO. With a 99.9% SLO, 0.1% of requests (or time) may fail — about 43 minutes of downtime in 30 days.",
      "The 'nines': 99% ≈ 7.2 hours/month of allowed failure, 99.9% ≈ 43 minutes, 99.99% ≈ 4.3 minutes. Each extra nine is roughly 10x harder and more expensive.",
      "Burn rate: how fast you are using the error budget relative to plan. Burn rate 1 = you will use exactly the whole budget by the end of the window; burn rate 10 = it will be gone in a tenth of the window.",
      "# How it works",
      "Setting up SLOs:",
      "  Pick user journeys that matter (login, checkout, search API).",
      "  Define SLIs from data you already have (load balancer logs, Prometheus metrics): good requests / valid requests.",
      "  Choose a realistic SLO based on what users need and historical performance (not 100% — nothing is).",
      "  Alert on burn rate rather than on every error: e.g. page if the budget would be gone in hours, open a ticket if it would be gone in days (multi-window, multi-burn-rate alerts).",
      "Using the error budget (error budget policy):",
      "  Budget remaining → ship features, take risks, run experiments.",
      "  Budget exhausted → freeze risky releases, prioritise reliability work until it recovers.",
      "This turns the dev-vs-ops argument ('ship faster' vs 'stay stable') into a data-driven agreement.",
      "# Example walkthrough",
      "The PromQL query computes the availability SLI: successful (non-5xx) requests divided by all requests over 30 days, e.g. `0.9993` = 99.93%.",
      "With an SLO of 99.9%, the error budget is 0.1%. Observed errors are 0.07%, so 70% of the budget is spent and 30% remains.",
      "The JS snippet does the same maths: 10,000,000 requests × 0.001 = 10,000 allowed failures; 7,000 failures used → 3,000 left.",
      "It also converts the budget into time: 30 days × 24 × 60 × 0.001 ≈ 43.2 minutes.",
      "# Why it matters / when to use",
      "SLOs define what 'reliable enough' means, so teams stop chasing 100% and stop ignoring real problems.",
      "Alerting on SLO burn reduces alert fatigue: you get paged for user-impacting problems, not for one CPU spike.",
      "SLAs matter for business contracts, especially B2B SaaS and cloud providers.",
      "# Common mistakes",
      "Mixing up SLO and SLA, or setting the SLA equal to the SLO (no safety margin).",
      "Choosing SLIs users do not feel, like CPU usage, instead of success rate and latency.",
      "Targeting 100% or too many nines; it blocks all change and is unachievable when dependencies have lower availability.",
      "Defining SLOs but never acting when the budget is exhausted.",
      "# Say this in the interview",
      "An SLI is a measured indicator, like the percentage of requests that succeed or complete under 300 milliseconds. An SLO is our internal target for that SLI, such as 99.9% success over 30 days, and an SLA is the contractual promise to customers with penalties, set looser than the SLO. The error budget is one minus the SLO, about 43 minutes a month for 99.9%; while budget remains we ship features, and if it is exhausted we freeze risky releases and focus on reliability.",
      "Follow-up: How would you alert on an SLO?",
      "  Use multi-window burn-rate alerts: page when a fast burn (e.g. 14x over 1 hour) would exhaust the budget quickly, ticket for slow burns.",
      "Follow-up: Why not aim for 100%?",
      "  It is impossible and extremely costly, users cannot tell the difference beyond a point, and it would stop all change.",
    ],
    code: `# PromQL — availability SLI over 30 days (good / total)
sum(rate(http_requests_total{job="api", code!~"5.."}[30d]))
  /
sum(rate(http_requests_total{job="api"}[30d]))
# → 0.9993   (99.93% of requests succeeded)

// error-budget.mjs — the same maths in plain Node (node error-budget.mjs)
const slo = 0.999;                        // 99.9% target
const totalRequests = 10_000_000;
const failedRequests = 7_000;

const allowed = totalRequests * (1 - slo);                 // error budget in requests
const remaining = allowed - failedRequests;
console.log("allowed failures:", Math.round(allowed));     // → 10000
console.log("budget used:", (failedRequests / allowed * 100).toFixed(0) + "%"); // → 70%
console.log("remaining:", Math.round(remaining));          // → 3000

const minutesIn30Days = 30 * 24 * 60;
console.log("downtime allowed:", (minutesIn30Days * (1 - slo)).toFixed(1), "min"); // → 43.2 min`,
  },
  {
    id: 'monitoring-vs-observability',
    group: 'Monitoring/Logging & SRE',
    stars: 5,
    difficulty: 'Medium',
    q: 'Monitoring vs observability, and what are the three pillars?',
    a: [
      "# ELI5",
      "Monitoring is your car's dashboard warning lights: they tell you 'engine too hot' — problems the car makers already thought of.",
      "Observability is a mechanic who can plug in, read every sensor, see the history of every trip, and figure out a weird new problem nobody predicted.",
      "The mechanic uses three tools: the gauges (numbers over time), the trip diary (what happened, when), and a GPS track showing exactly where the car went.",
      "Mapping back: the gauges are metrics, the diary is logs, and the GPS track is traces — the three pillars that make a system observable.",
      "# What it is",
      "Monitoring: collecting predefined metrics and alerting when known conditions occur — CPU > 90%, error rate > 1%, disk full. It answers 'is something broken?' for failure modes you anticipated.",
      "Observability: a property of a system — how well you can understand its internal state just from the data it emits, including problems you never predicted ('unknown unknowns'). It answers 'why is it broken, and for whom?'.",
      "Monitoring is something you do; observability is something the system has. Good observability makes monitoring and debugging possible.",
      "The three pillars (types of telemetry — data a system emits about itself):",
      "  Metrics: numeric measurements aggregated over time, cheap to store and fast to query (request rate, error count, p99 latency, memory). Great for dashboards and alerts.",
      "  Logs: timestamped records of discrete events, ideally structured JSON ('order 123 failed: card declined'). Rich detail, more expensive at volume.",
      "  Traces: the end-to-end path of a single request through many services, made of spans (timed operations like 'call payment service: 230 ms'). Show where time is spent and where errors originate.",
      "Correlation: linking the pillars via shared IDs — a trace ID in every log line lets you jump from a slow trace to its logs.",
      "Cardinality: the number of unique label combinations in metrics. High-cardinality data (user IDs, request IDs) belongs in logs/traces, not metric labels.",
      "OpenTelemetry (OTel): the vendor-neutral CNCF standard of APIs, SDKs and a Collector for producing and exporting metrics, logs and traces to any backend (Prometheus, Jaeger, Tempo, Datadog, Honeycomb, New Relic).",
      "Profiles (continuous profiling of CPU/memory per function) are often called an emerging fourth signal.",
      "# How it works",
      "A request flows through API gateway → orders service → payments service:",
      "  The first service creates a trace ID and passes it in the `traceparent` HTTP header (W3C Trace Context standard) to each downstream call.",
      "  Each service records spans with timings and attributes, increments metrics (requests, durations) and writes logs including the trace ID.",
      "  The OpenTelemetry Collector receives the data, processes it (sampling, adding metadata) and exports it to storage backends.",
      "Debugging flow: an SLO burn-rate alert fires (metrics) → you open the dashboard and see latency up for `/checkout` → open example traces and see the payments span taking 4 s → click through to that span's logs showing 'connection pool exhausted'.",
      "# Example walkthrough",
      "The Node.js file sets up the OpenTelemetry Node SDK with automatic instrumentation, which patches popular libraries (http, express, pg, etc.) to create spans automatically.",
      "It must load before the app, which is why it is run with `node --import ./otel.mjs app.mjs`.",
      "Traces are exported via OTLP (the OpenTelemetry protocol) to a collector at `localhost:4318`.",
      "After a request, your tracing UI shows a trace like `GET /checkout 412ms` with child spans for the database query and outbound HTTP call.",
      "# Why it matters / when to use",
      "Microservices fail in complex ways; without traces it is very hard to know which of 20 services caused a slow request.",
      "Faster incident resolution (lower MTTR — mean time to recovery).",
      "Interviewers expect you to distinguish the pillars and know OpenTelemetry.",
      "# Common mistakes",
      "Logging everything as unstructured text with no request or trace IDs, so logs cannot be correlated.",
      "Putting user IDs or URLs with IDs into metric labels, exploding cardinality and cost.",
      "Building dashboards for every metric but no alerts tied to user impact.",
      "Sampling 100% of traces at high traffic and paying huge bills; use head or tail sampling.",
      "# Say this in the interview",
      "Monitoring is watching known metrics and alerting on known failure modes, answering 'is it broken?'. Observability is the ability to understand any internal state from the system's outputs, including unknown unknowns, answering 'why is it broken?'. The three pillars are metrics as aggregated numbers, logs as discrete events, and traces showing a request's path across services. OpenTelemetry is the vendor-neutral standard for emitting all three, and we correlate them using trace IDs.",
      "Follow-up: When would you use a trace instead of logs?",
      "  When a request crosses multiple services and you need to see where latency or an error came from; logs show detail within one service.",
      "Follow-up: What is trace sampling?",
      "  Keeping only a subset of traces to control cost; head sampling decides at the start, tail sampling decides after seeing the whole trace (e.g. keep all errors).",
    ],
    code: `// otel.mjs — npm i @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
//                     @opentelemetry/exporter-trace-otlp-http
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  serviceName: "orders-api",
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",     // OpenTelemetry Collector
  }),
  instrumentations: [getNodeAutoInstrumentations()], // auto spans for http, express, pg...
});
sdk.start();

// run:  node --import ./otel.mjs app.mjs
// a request to GET /checkout produces one trace:
//   GET /checkout                 412 ms
//     ├─ pg.query SELECT ...       38 ms
//     └─ POST payments/charge     351 ms   ← the slow part
// logs written with the trace id let you jump from this trace to its log lines`,
  },
  {
    id: 'prometheus-grafana',
    group: 'Monitoring/Logging & SRE',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do Prometheus and Grafana work together?',
    a: [
      "# ELI5",
      "Prometheus is a nurse who visits every patient's room every 15 seconds and writes down their temperature and heart rate in a big notebook.",
      "If a number looks dangerous, the nurse rings an alarm bell, and a receptionist (Alertmanager) decides who to call and avoids calling ten doctors for the same problem.",
      "Grafana is the big TV screen in the doctors' room that draws nice charts from the nurse's notebook.",
      "Mapping back: Prometheus collects and stores metrics and evaluates alerts, Alertmanager routes notifications, and Grafana visualises the data.",
      "# What it is",
      "Prometheus: an open-source monitoring system and time-series database (a CNCF graduated project). A time series is a stream of timestamped numbers identified by a metric name and labels, e.g. `http_requests_total{method=\"GET\", code=\"200\"}`.",
      "Pull model (scraping): Prometheus periodically sends HTTP GET requests to each target's `/metrics` endpoint and stores what it reads. Apps do not push data to it (short-lived jobs can use a Pushgateway).",
      "Metric types:",
      "  Counter: only goes up (requests served, errors). Use `rate()` to get per-second speed.",
      "  Gauge: goes up and down (memory in use, queue length, temperature).",
      "  Histogram: counts observations into buckets (request durations), allowing percentiles via `histogram_quantile()`.",
      "  Summary: client-side percentiles; less flexible for aggregation.",
      "Exporter: a small program that exposes metrics for a system that does not speak Prometheus natively — node_exporter (Linux host CPU/disk), postgres_exporter, kube-state-metrics (Kubernetes object states), blackbox_exporter (probes URLs).",
      "Service discovery: Prometheus automatically finds targets — e.g. in Kubernetes it lists pods and services; the Prometheus Operator uses `ServiceMonitor`/`PodMonitor` objects.",
      "PromQL: Prometheus's query language for selecting and aggregating series.",
      "Alertmanager: receives alerts from Prometheus, groups related ones, deduplicates, supports silences and inhibition, and routes them to Slack, PagerDuty, email, etc.",
      "Grafana: a visualisation tool that queries data sources (Prometheus, Loki for logs, Tempo for traces, CloudWatch, SQL databases) and shows dashboards and can also manage alerts.",
      "# How it works",
      "End-to-end flow:",
      "  Your Node app uses `prom-client` to expose `/metrics` with counters and histograms.",
      "  Prometheus scrapes it every 15–30 s and stores samples on local disk (long-term storage via Thanos, Mimir or a managed service).",
      "  Recording rules precompute expensive queries; alerting rules evaluate expressions, e.g. error ratio > 5% for 10 minutes.",
      "  Firing alerts go to Alertmanager, which notifies the on-call engineer.",
      "  Grafana dashboards run PromQL queries against Prometheus to draw graphs.",
      "Cardinality matters: every unique combination of label values is a new series in memory. Labels like `user_id` can create millions of series and crash Prometheus.",
      "# Example walkthrough",
      "The Node code creates a counter `http_requests_total` with labels `route` and `code`, and exposes all metrics on `/metrics`.",
      "Calling `curl localhost:3000/hello` twice, then `curl localhost:3000/metrics`, shows `http_requests_total{route=\"/hello\",code=\"200\"} 2`.",
      "The PromQL in the comment computes the 5xx error ratio over 5 minutes: errors per second divided by all requests per second.",
      "The alert rule fires if that ratio stays above 5% for 10 minutes, labelled `severity: page`.",
      "# Why it matters / when to use",
      "Prometheus + Grafana is the default open-source monitoring stack, especially in Kubernetes (kube-prometheus-stack Helm chart).",
      "Managed versions exist: Amazon Managed Service for Prometheus, Grafana Cloud.",
      "Interviewers expect you to write simple PromQL like rate and error ratio, and explain pull vs push.",
      "# Common mistakes",
      "Using `rate()` on a gauge or forgetting `rate()` on a counter (raw counters only ever go up).",
      "High-cardinality labels (user IDs, full URLs with IDs, request IDs).",
      "Alerting on causes (CPU 80%) instead of symptoms users feel (errors, latency), creating noisy pages.",
      "Averaging latency instead of using histograms and percentiles.",
      "# Say this in the interview",
      "Prometheus pulls, or scrapes, metrics from /metrics endpoints and stores them as labelled time series. Exporters expose metrics for systems like Linux hosts or databases, and service discovery finds targets in Kubernetes. We query with PromQL; alerting rules fire to Alertmanager, which groups, silences and routes alerts to Slack or PagerDuty. Grafana visualises dashboards from Prometheus and other sources like Loki and Tempo, and we avoid high-cardinality labels.",
      "Follow-up: Counter vs gauge?",
      "  A counter only increases and is used with `rate()`; a gauge is a current value that can go up or down.",
      "Follow-up: How do you get p99 latency?",
      "  Record a histogram and use `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))`.",
    ],
    code: `// metrics.mjs — npm i express prom-client ; node metrics.mjs
import express from "express";
import client from "prom-client";

client.collectDefaultMetrics();                 // process CPU, memory, event loop lag...
const requests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["route", "code"],                // keep labels LOW cardinality
});

const app = express();
app.get("/hello", (req, res) => {
  requests.inc({ route: "/hello", code: "200" });
  res.send("hi");
});
app.get("/metrics", async (req, res) => {       // Prometheus scrapes this
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});
app.listen(3000);
// curl :3000/hello twice, then curl :3000/metrics
// → http_requests_total{route="/hello",code="200"} 2

# PromQL — 5xx error ratio over 5 minutes
#   sum(rate(http_requests_total{code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
# alert rule (rules.yml):
#   - alert: HighErrorRate
#     expr: <the ratio above> > 0.05
#     for: 10m
#     labels: { severity: page }`,
  },
  {
    id: 'golden-signals',
    group: 'Monitoring/Logging & SRE',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the four golden signals (and RED/USE)?',
    a: [
      "# ELI5",
      "A doctor checking a patient quickly looks at four things: how fast the heart beats, how much they are eating, whether anything hurts, and how tired they are.",
      "Those four tell the doctor most of what matters without running every test.",
      "Mapping back: for a service, the four quick checks are latency, traffic, errors and saturation — the golden signals.",
      "# What it is",
      "The four golden signals come from Google's SRE book as the minimum set of metrics to monitor for any user-facing system.",
      "Latency: how long requests take. Track successful and failed requests separately (fast errors can make latency look good).",
      "Traffic: how much demand the system receives, e.g. HTTP requests per second, messages consumed per second.",
      "Errors: the rate of failed requests — explicit (HTTP 5xx), implicit (200 with wrong content) or policy-based (slower than 1 s counts as failure).",
      "Saturation: how 'full' the service is — utilisation of the most constrained resource (CPU, memory, DB connections, queue depth), and often a leading indicator of future problems.",
      "RED method (Tom Wilkie), for request-driven services: Rate (requests/sec), Errors (failed requests/sec), Duration (latency distribution).",
      "USE method (Brendan Gregg), for resources like CPU, disks, network, connection pools: Utilisation (% busy), Saturation (queued work waiting), Errors (error events).",
      "Percentiles: p50 is the median, p95 means 95% of requests are faster than this value, p99 shows the slowest 1%. Averages hide the slow tail that real users experience.",
      "# How it works",
      "Instrument each service with RED metrics (often automatically via a framework, service mesh or OpenTelemetry).",
      "  Rate: `sum(rate(http_requests_total[5m]))`.",
      "  Errors: `sum(rate(http_requests_total{code=~\"5..\"}[5m]))`.",
      "  Duration: `histogram_quantile(0.99, sum by (le)(rate(http_request_duration_seconds_bucket[5m])))`.",
      "Instrument infrastructure with USE metrics: node_exporter for hosts, database exporters for connection pools.",
      "Build one dashboard per service with these on top; alert on errors and latency (symptoms), use saturation for capacity planning and early warnings.",
      "# Example walkthrough",
      "The Node snippet computes p50, p95, p99 and the average from a list of response times.",
      "Most requests take ~100 ms but two take 2,000+ ms. The average comes out at 494 ms — a number no real request actually took — while p50 is 100 ms and p95/p99 are 2,100 ms, exposing the slow tail.",
      "This is why dashboards show percentiles from histograms rather than averages.",
      "# Why it matters / when to use",
      "Gives every team a consistent starting point for dashboards and alerts.",
      "Quick triage during incidents: which signal moved first tells you where to look.",
      "Interview system-design answers sound much stronger when you name the signals you would monitor.",
      "# Common mistakes",
      "Monitoring only CPU and memory (USE) for an API, missing user-visible errors and latency.",
      "Using average latency instead of percentiles.",
      "Ignoring saturation of hidden resources like DB connection pools or thread pools, which often fail first.",
      "# Say this in the interview",
      "Google's four golden signals are latency, traffic, errors and saturation. For request-driven services I use RED: rate, errors and duration. For resources like CPU, disks or connection pools I use USE: utilisation, saturation and errors. I always track latency as percentiles like p95 and p99 rather than averages, because averages hide the slow tail.",
      "Follow-up: Why is saturation useful?",
      "  It warns before failure: a connection pool at 95% or a growing queue predicts errors and latency spikes soon.",
    ],
    code: `// percentiles.mjs — why averages lie (node percentiles.mjs)
const latenciesMs = [95, 98, 100, 101, 99, 102, 97, 100, 2050, 2100];

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;  // nearest-rank method
  return sorted[Math.max(0, idx)];
}

const avg = latenciesMs.reduce((s, v) => s + v, 0) / latenciesMs.length;
console.log("avg", Math.round(avg));          // → 494   (nobody actually saw ~494ms)
console.log("p50", percentile(latenciesMs, 50)); // → 100  (typical user)
console.log("p95", percentile(latenciesMs, 95)); // → 2100 (slow tail)
console.log("p99", percentile(latenciesMs, 99)); // → 2100

# RED in PromQL:
#   Rate:     sum(rate(http_requests_total[5m]))
#   Errors:   sum(rate(http_requests_total{code=~"5.."}[5m]))
#   Duration: histogram_quantile(0.99, sum by (le)(rate(http_request_duration_seconds_bucket[5m])))`,
  },
  {
    id: 'centralized-logging',
    group: 'Monitoring/Logging & SRE',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you set up centralised logging?',
    a: [
      "# ELI5",
      "Imagine 50 shops each keeping a diary in a drawer. When something goes wrong, you would have to run to every shop and read every diary.",
      "Instead, a courier collects each shop's diary pages every few seconds and files them in one big library with a search desk.",
      "Every page has a ticket number, so you can find all pages about the same customer across every shop.",
      "Mapping back: services write logs, an agent ships them to a central store, and a search UI plus correlation IDs let you follow one request everywhere.",
      "# What it is",
      "Centralised logging: collecting logs from all servers, containers and services into one searchable system, with retention and access control.",
      "Why needed: containers are short-lived (their logs disappear when deleted), and with many replicas you cannot SSH into each one.",
      "Structured logging: writing each log entry as JSON with fields (`level`, `msg`, `service`, `traceId`, `userId`) instead of free text, so it can be filtered and aggregated.",
      "Twelve-Factor rule: apps should write logs to stdout/stderr as an event stream and let the platform handle routing, not manage log files themselves.",
      "Log shipper/agent: a program on each node that reads logs and forwards them — Fluent Bit, Vector, OpenTelemetry Collector, Grafana Alloy (successor to Promtail), Filebeat.",
      "Storage and search backends:",
      "  ELK/EFK: Elasticsearch or OpenSearch (search engine) + Logstash or Fluentd/Fluent Bit + Kibana/OpenSearch Dashboards (UI). Powerful full-text search, heavier to run.",
      "  Grafana Loki: indexes only labels, not full text, so it is much cheaper; queried with LogQL in Grafana.",
      "  Managed: CloudWatch Logs, Google Cloud Logging, Datadog, Splunk, Elastic Cloud.",
      "Correlation/trace ID: a unique ID per request propagated across services and written into every log line.",
      "# How it works",
      "Kubernetes example, step by step:",
      "  The app logs JSON to stdout using a fast logger such as pino.",
      "  The container runtime writes stdout to files under `/var/log/containers/` on the node.",
      "  A Fluent Bit DaemonSet (one per node) tails those files, parses JSON and adds Kubernetes metadata (namespace, pod, labels).",
      "  It forwards to Loki/OpenSearch/CloudWatch, with buffering and retries if the backend is slow.",
      "  Engineers search in Grafana/Kibana; alerts can trigger on log patterns.",
      "Retention and cost control: keep hot searchable logs for e.g. 7–30 days, archive to S3 for compliance, sample or drop noisy debug logs, use log levels.",
      "Security: redact secrets and personal data (PII — personally identifiable information like emails, phone numbers) before logs leave the app.",
      "# Example walkthrough",
      "The Node code uses pino, creating a JSON logger with `service: \"orders\"` on every line and a `redact` list hiding `password` and `authorization` fields.",
      "A child logger per request adds `traceId`, so every line from that request carries the same id.",
      "Running it prints lines like `{\"level\":30,\"time\":...,\"service\":\"orders\",\"traceId\":\"abc123\",\"orderId\":42,\"msg\":\"order created\"}` and `\"password\":\"[Redacted]\"`.",
      "In Loki you could then search `{app=\"orders\"} | json | traceId=\"abc123\"` to see the whole request.",
      "# Why it matters / when to use",
      "Debugging production issues across many services and replicas.",
      "Security auditing and compliance (who did what, when).",
      "Deriving metrics or alerts from log events where no metric exists.",
      "# Common mistakes",
      "Logging secrets, tokens, passwords or full card numbers.",
      "Unstructured `console.log` strings that cannot be filtered.",
      "Logging every debug line in production and paying huge ingestion bills; set levels and sampling.",
      "Writing to log files inside containers instead of stdout, so agents cannot collect them and disks fill up.",
      "# Say this in the interview",
      "Apps log structured JSON to stdout, and an agent such as Fluent Bit, Vector or the OpenTelemetry Collector, usually running as a DaemonSet, ships the logs to a central store. Common stacks are ELK or EFK with Elasticsearch or OpenSearch and Kibana, Grafana Loki, CloudWatch or Datadog. Every line includes correlation or trace IDs, the level and service name, and never secrets or PII, and we set retention and sampling to control cost.",
      "Follow-up: Loki vs Elasticsearch?",
      "  Loki indexes only labels and is cheaper to run but slower for full-text search; Elasticsearch indexes content for powerful search at higher cost.",
    ],
    code: `// logger.mjs — npm i pino ; node logger.mjs
import pino from "pino";

const log = pino({
  base: { service: "orders" },                       // added to every line
  redact: ["password", "req.headers.authorization"], // never ship secrets
});

function handleRequest(traceId) {
  const reqLog = log.child({ traceId });             // correlation id on every line
  reqLog.info({ orderId: 42 }, "order created");
  reqLog.warn({ password: "hunter2" }, "suspicious login");
  reqLog.error({ err: new Error("card declined") }, "payment failed");
}
handleRequest("abc123");
// → {"level":30,"time":...,"service":"orders","traceId":"abc123","orderId":42,"msg":"order created"}
// → {"level":40,...,"traceId":"abc123","password":"[Redacted]","msg":"suspicious login"}
// → {"level":50,...,"traceId":"abc123","err":{"type":"Error","message":"card declined",...},"msg":"payment failed"}

# stdout → Fluent Bit DaemonSet → Loki / OpenSearch / CloudWatch
# Loki query (LogQL):  {app="orders"} | json | traceId="abc123"`,
  },
  {
    id: 'incident-postmortem',
    group: 'Monitoring/Logging & SRE',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you handle a production incident and the postmortem?',
    a: [
      "# ELI5",
      "A fire breaks out in a school kitchen. The alarm rings, one teacher takes charge, another calls the parents, and everyone focuses on putting the fire out first.",
      "Nobody stops to ask 'who left the stove on?' while the fire is burning.",
      "The next day, everyone sits together, calmly writes down what happened, and decides on fixes like a stove timer — without punishing anyone.",
      "Mapping back: alert, take command, communicate, mitigate first, then a blameless postmortem with action items.",
      "# What it is",
      "Incident: an unplanned event that disrupts or degrades a service for users (outage, high error rate, data issue, security breach).",
      "Severity levels (SEV1, SEV2, SEV3...): a scale for how bad an incident is, which decides who gets paged and how fast. SEV1 = major outage for many users.",
      "On-call: an engineer responsible for responding to alerts during a shift, usually paged via PagerDuty or Opsgenie.",
      "Incident commander (IC): the person who coordinates the response — assigns tasks, makes decisions, keeps everyone focused. They usually do not debug themselves.",
      "Communications lead: updates stakeholders and the public status page so engineers are not interrupted.",
      "Mitigation: an action that stops user impact quickly (rollback, failover, scaling up, turning off a feature flag), even before the root cause is known.",
      "Root cause analysis (RCA): finding why it happened, usually several contributing factors rather than one.",
      "Postmortem (incident review): a written document after the incident covering timeline, impact, causes, what went well/badly and action items.",
      "Blameless: focusing on systems and processes, not individual fault, so people share information honestly.",
      "MTTD (mean time to detect) and MTTR (mean time to recover/restore): key metrics for how quickly incidents are noticed and resolved.",
      "Runbook: a step-by-step guide for handling a known type of alert or task.",
      "# How it works",
      "During the incident:",
      "  Detect: an alert fires (ideally SLO-based) or a customer reports a problem.",
      "  Triage: confirm impact and declare severity; page the right people.",
      "  Assign roles: incident commander, communications lead, subject-matter experts.",
      "  Open a dedicated channel (e.g. `#inc-2026-11-10-checkout`) and post status page updates.",
      "  Mitigate first: 'what changed recently?' — roll back the last deploy, fail over, scale, disable a flag.",
      "  Monitor until metrics return to normal; declare resolved.",
      "After the incident (within a few days):",
      "  Write the postmortem: summary, impact (users, duration, revenue), detailed timeline, root and contributing causes, detection gaps, what went well, what went badly, where we got lucky.",
      "  Create action items with owners and due dates (add alerts, tests, runbooks, fix architecture).",
      "  Review the document in a meeting and share it widely; track action items to completion.",
      "# Example walkthrough",
      "The snippet is a compact postmortem template filled in for a checkout outage.",
      "Timeline shows detection at 14:05 by an SLO burn alert, a rollback at 14:18, and recovery at 14:22 — MTTR 17 minutes.",
      "Root cause: a new release exhausted the database connection pool; contributing factor: load tests did not cover the new query.",
      "Action items each have an owner and date, e.g. add a connection-pool saturation alert and a canary stage.",
      "# Why it matters / when to use",
      "Every production team has incidents; how calmly and quickly you handle them matters more than never failing.",
      "Postmortems turn incidents into lasting improvements and prevent repeats.",
      "Behavioural interviews often ask 'tell me about an incident you handled'; structure your answer with these steps.",
      "# Common mistakes",
      "Debugging the root cause for an hour while users are down, instead of rolling back first.",
      "Everyone jumping into the call with no commander, causing duplicated or conflicting actions.",
      "Blaming a person ('Ravi pushed bad code'), which teaches people to hide mistakes.",
      "Writing action items that never get done; track them like normal work.",
      "# Say this in the interview",
      "First we detect through alerts, triage the severity, assign an incident commander and open a communication channel and status page. We mitigate first with rollback, failover, scaling or turning a feature flag off, and find the root cause later. Afterwards we write a blameless postmortem with a timeline, impact, root causes, what went well and badly, and action items with owners. We track MTTD and MTTR and feed the learnings into runbooks, alerts and tests.",
      "Follow-up: What makes a postmortem blameless?",
      "  It assumes people acted reasonably with the information they had and asks how the system allowed the failure, not who to punish.",
      "Follow-up: When do you write a postmortem?",
      "  For any significant incident (e.g. SEV1/SEV2, SLO budget burn, data loss) or near-miss worth learning from.",
    ],
    code: `# Postmortem: Checkout errors — 2026-11-10 (SEV2)
## Summary
New release v2.31 exhausted the DB connection pool; 38% of checkouts failed for 17 min.

## Impact
~4,200 failed checkouts, ~17 minutes, all regions. SLO budget used: 35%.

## Timeline (IST)
14:01  v2.31 deployed (rolling)
14:05  SLO burn-rate alert pages on-call         ← MTTD 4 min
14:08  Incident declared, IC = Priya, #inc-checkout opened, status page updated
14:15  Errors correlate with deploy; decision: roll back
14:18  kubectl rollout undo deployment/checkout
14:22  Error rate back to baseline; resolved     ← MTTR 17 min

## Root cause & contributing factors
- New query held connections ~10x longer → pool (max 20) exhausted
- Load tests did not cover the new query; no pool-saturation alert

## What went well / badly / lucky
+ Fast rollback   - Detection relied on symptoms only   ~ Happened off-peak

## Action items
| Action                                  | Owner | Due        |
| Alert on pool usage > 80%               | Arjun | 2026-11-17 |
| Add canary stage with auto-abort        | Meera | 2026-11-30 |
| Add the query to the load-test suite    | Ravi  | 2026-11-20 |`,
  },
  {
    id: 'toil',
    group: 'Monitoring/Logging & SRE',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is toil in SRE?',
    a: [
      "# ELI5",
      "Imagine having to water 100 plants by hand every morning. It is boring, it never ends, and when you buy more plants it takes even longer.",
      "Installing a sprinkler system takes effort once, but then the watering happens on its own and you can spend your time growing new plants.",
      "Mapping back: the hand-watering is toil; building the sprinkler is engineering work that removes it.",
      "# What it is",
      "SRE (Site Reliability Engineering): Google's approach to operations, treating ops problems as software problems.",
      "Toil is operational work that is:",
      "  Manual: a human has to do it (running a script by hand counts).",
      "  Repetitive: done again and again.",
      "  Automatable: a machine could do it.",
      "  Tactical/reactive: interrupt-driven rather than planned.",
      "  Without lasting value: the service is no better afterwards.",
      "  Scales linearly (O(n)) with service growth: twice the users means twice the work.",
      "Examples: manually restarting a stuck service, hand-resizing disks, copying data for every new customer, approving routine access requests, acknowledging the same noisy alert daily.",
      "Not toil: overhead like meetings, or engineering work like designing systems — even if boring.",
      "Google's SRE book suggests keeping toil below about 50% of an SRE's time, so the rest goes to engineering that reduces future toil.",
      "# How it works",
      "Reducing toil:",
      "  Measure: track time spent on interrupts, tickets and manual tasks for a few weeks.",
      "  Prioritise by frequency × time × risk.",
      "  Automate: scripts, then self-healing (Kubernetes restarts, autoscaling), then self-service tools (developers create environments via a portal or PR).",
      "  Eliminate at the source: fix the bug behind the recurring alert instead of restarting forever.",
      "  Remove noisy, non-actionable alerts.",
      "# Example walkthrough",
      "The script automates a common toil task: deleting temp files older than 7 days and restarting a worker only if it is unhealthy.",
      "Run from a Kubernetes CronJob or systemd timer, it replaces a daily manual SSH session.",
      "Output example: `cleaned 1532 files` and `worker healthy, no restart`.",
      "Better still is fixing why temp files accumulate — elimination beats automation.",
      "# Why it matters / when to use",
      "Too much toil burns out engineers and stops reliability improvements.",
      "Toil reduction is a common SRE/DevOps interview theme: 'tell me about something you automated'.",
      "# Common mistakes",
      "Automating a bad process instead of removing it.",
      "Writing fragile one-off scripts with no tests or monitoring, creating new toil.",
      "Calling all ops work toil; incident response and design are valuable work.",
      "# Say this in the interview",
      "Toil is manual, repetitive, automatable and reactive operational work with no lasting value that scales linearly with service size. Google SRE aims to keep toil under about 50% of an engineer's time so the rest goes to engineering. We reduce it through automation, self-service tooling and fixing recurring alerts at the source.",
      "Follow-up: Give an example of toil you removed.",
      "  e.g. replacing manual certificate renewals with cert-manager, or hand-run database user creation with a self-service Terraform module.",
    ],
    code: `#!/usr/bin/env bash
# cleanup.sh — replaces a daily manual SSH chore (run via CronJob/systemd timer)
set -euo pipefail

# 1) delete temp files older than 7 days
count=$(find /var/app/tmp -type f -mtime +7 | wc -l)
find /var/app/tmp -type f -mtime +7 -delete
echo "cleaned $count files"                    # → cleaned 1532 files

# 2) restart the worker ONLY if its health check fails
if curl -fsS --max-time 3 http://localhost:8080/health > /dev/null; then
  echo "worker healthy, no restart"            # → worker healthy, no restart
else
  echo "worker unhealthy, restarting"
  systemctl restart worker
fi

# Even better: fix why temp files pile up / why the worker hangs (eliminate the toil)`,
  },

  // ───────────────────────── Security & Reliability ─────────────────────────
  {
    id: 'secrets-management',
    group: 'Security & Reliability',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you manage secrets securely across environments?',
    a: [
      "# ELI5",
      "Keeping your house key under the doormat is easy, but anyone who looks can take it.",
      "A smarter family keeps keys in a safe with a log of who opened it, gives the babysitter a key that only works tonight, and changes the locks if a key goes missing.",
      "Mapping back: the doormat is hardcoding passwords in code; the safe is a secret manager; tonight-only keys are short-lived dynamic credentials; changing locks is rotation.",
      "# What it is",
      "Secret: any value that grants access — database passwords, API keys, OAuth client secrets, TLS private keys, encryption keys, tokens.",
      "Secret management: storing, distributing, rotating and auditing secrets so only the right workloads and people can use them, for the minimum time.",
      "Hardcoding: writing a secret directly in source code, config files in Git or Docker images. Anyone with repo or image access can read it, and Git history keeps it forever.",
      "Central secret stores:",
      "  HashiCorp Vault (or its open fork OpenBao): very flexible, supports dynamic secrets and encryption as a service.",
      "  AWS Secrets Manager (with automatic rotation) and SSM Parameter Store (SecureString).",
      "  Azure Key Vault, Google Secret Manager.",
      "Static secret: a fixed value valid until changed. Dynamic secret: generated on request for one client with a short TTL (time to live), e.g. Vault creating a unique DB user valid for 1 hour.",
      "Workload identity: instead of giving an app a password to fetch secrets, the platform proves the app's identity (IAM role, Kubernetes ServiceAccount, OIDC token), and the secret store trusts that.",
      "Rotation: regularly replacing secrets so old values stop working; automated rotation avoids human error.",
      "Kubernetes Secrets are only base64-encoded by default (not encrypted); enable encryption at rest (e.g. KMS provider) and restrict RBAC.",
      "# How it works",
      "A good end-to-end setup:",
      "  Developers never see production secrets; they use local `.env` files (git-ignored) for dev values only.",
      "  Secret scanning blocks leaks: pre-commit hooks (gitleaks) and GitHub push protection; leaked secrets are revoked immediately.",
      "  Secrets live in the secret manager, encrypted with KMS keys, with fine-grained IAM policies per service and environment.",
      "  The app authenticates with its workload identity (e.g. IRSA/EKS Pod Identity on AWS) and fetches secrets at startup, or the platform injects them.",
      "  In Kubernetes: External Secrets Operator syncs from the secret manager into Kubernetes Secrets, or the Secrets Store CSI driver mounts them as files.",
      "  For GitOps (where everything is in Git), secrets are encrypted before committing with SOPS or Sealed Secrets.",
      "  Rotation runs automatically; apps reload new values without downtime (re-read on schedule or on failure).",
      "  Every access is logged (CloudTrail, Vault audit log) for audits and incident investigations.",
      "# Example walkthrough",
      "The ExternalSecret tells the External Secrets Operator to read `prod/orders/db` from AWS Secrets Manager every hour.",
      "It creates a normal Kubernetes Secret named `orders-db` with key `DATABASE_URL`.",
      "The Deployment uses `envFrom` / `secretKeyRef` so the app reads `process.env.DATABASE_URL` without knowing where it came from.",
      "Rotating the value in Secrets Manager updates the Kubernetes Secret within the refresh interval; a rolling restart picks it up.",
      "`kubectl get externalsecret orders-db` shows `STATUS: SecretSynced`.",
      "# Why it matters / when to use",
      "Leaked credentials are one of the most common causes of breaches; bots scan public GitHub for keys within minutes.",
      "Compliance standards (SOC 2, PCI DSS, ISO 27001) require controlled access, encryption and rotation.",
      "Different environments (dev, staging, prod) must have separate secrets so a dev leak cannot reach production.",
      "# Common mistakes",
      "Committing `.env` files, or deleting a leaked secret from code without rotating it (it is still in Git history).",
      "Putting secrets in Docker images via `ENV` or `COPY`, or passing them as build args that end up in image layers.",
      "Logging full config objects at startup, printing every secret to the logs.",
      "Sharing one secret across all services and environments, so one leak exposes everything.",
      "# Say this in the interview",
      "Never hardcode or commit secrets; we scan repos with gitleaks and GitHub push protection and rotate anything leaked. Secrets live in a central store like HashiCorp Vault, AWS Secrets Manager or Azure Key Vault, and I prefer dynamic short-lived credentials like Vault database creds, IAM roles or OIDC over static keys. Everything is encrypted at rest and in transit, with least-privilege access, audit logs and automated rotation. In Kubernetes I use External Secrets Operator or the CSI driver, or Sealed Secrets or SOPS for GitOps.",
      "Follow-up: Are Kubernetes Secrets secure?",
      "  Only base64-encoded by default; you need etcd encryption at rest, tight RBAC, and ideally an external secret manager as the source of truth.",
      "Follow-up: How do you rotate a database password without downtime?",
      "  Use two valid credentials during the switch (or dynamic per-app users), update the secret, roll the app to pick it up, then revoke the old one.",
    ],
    code: `# external-secret.yaml — sync from AWS Secrets Manager into Kubernetes
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata: { name: orders-db, namespace: prod }
spec:
  refreshInterval: 1h                      # pick up rotations
  secretStoreRef: { name: aws-secrets-manager, kind: ClusterSecretStore }
  target: { name: orders-db }              # creates this k8s Secret
  data:
    - secretKey: DATABASE_URL
      remoteRef: { key: prod/orders/db, property: url }
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: orders, namespace: prod }
spec:
  selector: { matchLabels: { app: orders } }
  template:
    metadata: { labels: { app: orders } }
    spec:
      serviceAccountName: orders           # workload identity (IRSA / Pod Identity)
      containers:
        - name: orders
          image: ghcr.io/acme/orders:1.8.0
          env:
            - name: DATABASE_URL
              valueFrom: { secretKeyRef: { name: orders-db, key: DATABASE_URL } }
# kubectl get externalsecret orders-db -n prod  → STATUS: SecretSynced
# app code just reads process.env.DATABASE_URL — never a hardcoded password`,
  },
  {
    id: 'devsecops',
    group: 'Security & Reliability',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is DevSecOps and what security checks go into a pipeline?',
    a: [
      "# ELI5",
      "Building a house: you could invite a safety inspector only after the house is finished, and then tear down walls to fix bad wiring.",
      "Or the inspector checks the plans, the bricks as they arrive, the wiring before walls close, and the finished house — catching problems when they are cheap to fix.",
      "Mapping back: DevSecOps puts automatic security checks at every pipeline stage instead of one big audit at the end.",
      "# What it is",
      "DevSecOps: integrating security into every stage of the DevOps lifecycle — plan, code, build, test, deploy, run — as a shared responsibility of developers, ops and security teams.",
      "Shift left: moving checks earlier ('left' on a timeline) in development, when fixes are cheapest — in the IDE or on the pull request rather than after release.",
      "CVE (Common Vulnerabilities and Exposures): a public ID for a known security flaw, e.g. `CVE-2021-44228` (Log4Shell). Scanners match your dependencies against CVE databases.",
      "Checks typically added to a pipeline:",
      "  Secret scanning: find committed keys/passwords (gitleaks, GitHub secret scanning/push protection, TruffleHog).",
      "  SAST (Static Application Security Testing): analyse source code for insecure patterns like SQL injection without running it (Semgrep, CodeQL, SonarQube).",
      "  SCA (Software Composition Analysis): check third-party dependencies for known CVEs and license issues (npm audit, Dependabot, Renovate, Snyk, OSV-Scanner).",
      "  Container image scanning: find vulnerable OS packages/libraries in images (Trivy, Grype, registry scanning like ECR).",
      "  IaC scanning: catch misconfigurations in Terraform/Kubernetes/Dockerfiles, e.g. public S3 buckets, privileged pods (Checkov, Trivy config, KICS; tfsec is now part of Trivy).",
      "  DAST (Dynamic Application Security Testing): attack the running app in staging from the outside (OWASP ZAP, Burp).",
      "  Policy as code gates: OPA/Gatekeeper, Kyverno or Conftest enforce rules ('no root containers', 'images must be signed').",
      "  Supply chain: SBOMs, signed images (cosign) and provenance attestations.",
      "  Runtime security: detect suspicious behaviour in production (Falco, GuardDuty, cloud security posture tools).",
      "# How it works",
      "Pipeline layout, fastest checks first:",
      "  Pre-commit / IDE: secret scanning and linters on the developer's machine.",
      "  Pull request: SAST, SCA, IaC scanning — results shown as PR annotations; block merge on high/critical findings.",
      "  Build: image scanning; generate an SBOM; sign the image.",
      "  Staging: DAST and integration security tests.",
      "  Deploy: admission policies verify signatures and configuration.",
      "  Runtime: monitoring, alerts and periodic re-scans (new CVEs appear for old images).",
      "Triage: tune rules to cut false positives, set severity thresholds, and give developers clear fix guidance or automated PRs (Dependabot).",
      "# Example walkthrough",
      "The workflow runs on pull requests.",
      "gitleaks scans the git history for secrets and fails if it finds one.",
      "Semgrep runs SAST rules; `npm audit --audit-level=high` fails on high/critical dependency CVEs.",
      "Trivy scans the Terraform/Kubernetes files (`config`) and then the built image, failing with `exit-code 1` on HIGH or CRITICAL findings.",
      "A failing step blocks the merge, so vulnerable code never reaches main.",
      "# Why it matters / when to use",
      "Fixing a vulnerability on a PR costs minutes; fixing it after a breach costs millions and reputation.",
      "Modern breaches often come through dependencies and CI systems (supply chain), not just app code.",
      "Regulators and enterprise customers increasingly require secure SDLC (software development life cycle) evidence.",
      "# Common mistakes",
      "Adding every scanner with default settings, flooding developers with false positives until they ignore everything.",
      "Running scans but not failing the build, so findings pile up unread.",
      "Scanning images only at build time; new CVEs are published daily, so re-scan what is running.",
      "Treating security as the security team's job only.",
      "# Say this in the interview",
      "DevSecOps means integrating security into every stage of the pipeline as a shared responsibility, shifting security left. In CI we run SAST with Semgrep or CodeQL, SCA for dependency CVEs with Dependabot or Snyk, and secret scanning; we scan container images with Trivy or Grype and IaC with Checkov or Trivy, and run DAST like OWASP ZAP against staging. On top we add policy-as-code gates with OPA or Kyverno, signed artifacts, and runtime security monitoring with Falco.",
      "Follow-up: SAST vs DAST?",
      "  SAST reads source code without running it and finds issues early; DAST tests the running app from outside and finds runtime/config issues, but later.",
      "Follow-up: How do you avoid alert fatigue from scanners?",
      "  Fail only on high/critical, tune or suppress verified false positives with justification, and auto-generate fix PRs.",
    ],
    code: `# .github/workflows/security.yml
name: security
on: [pull_request]
permissions: { contents: read }
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }                  # full history for secret scan
      - name: Secret scanning
        uses: gitleaks/gitleaks-action@v2
        env: { GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }} }
      - name: SAST
        run: pipx run semgrep scan --config auto --error
      - name: SCA (dependency CVEs)
        run: npm ci && npm audit --audit-level=high   # fails on high/critical
      - name: IaC scan (Terraform / k8s YAML / Dockerfile)
        uses: aquasecurity/trivy-action@0.28.0
        with: { scan-type: config, scan-ref: ., exit-code: "1", severity: "HIGH,CRITICAL" }
      - name: Build image
        run: docker build -t app:\${{ github.sha }} .
      - name: Image scan
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: app:\${{ github.sha }}
          exit-code: "1"
          severity: "HIGH,CRITICAL"
# any failing step → red check → merge blocked`,
  },
  {
    id: 'ha-dr-rto-rpo',
    group: 'Security & Reliability',
    stars: 4,
    difficulty: 'Medium',
    q: 'High availability vs disaster recovery? What are RTO and RPO?',
    a: [
      "# ELI5",
      "High availability is having a spare tyre in the car: if one tyre bursts, you swap it and keep driving within minutes.",
      "Disaster recovery is what you do if the whole car is stolen or burns: you have insurance and a backup car parked at a friend's house in another city.",
      "RTO is how long you can afford to be without a car. RPO is how much of your shopping you can afford to lose — everything since your last trip to the friend's house.",
      "Mapping back: HA handles everyday component failures automatically; DR handles big disasters; RTO is max downtime and RPO is max data loss.",
      "# What it is",
      "High availability (HA): designing a system so that individual component failures (a server, a disk, an AZ) do not cause downtime, through redundancy, health checks and automatic failover.",
      "Disaster recovery (DR): the plans and infrastructure to restore service after a large-scale event — a whole region outage, accidental deletion of a database, data corruption, ransomware.",
      "Key difference: HA prevents downtime from small, common failures, usually automatically; DR recovers from rare, big failures, often with a planned procedure.",
      "RTO (Recovery Time Objective): the maximum acceptable time the service can be down after a disaster. 'We must be back within 1 hour.'",
      "RPO (Recovery Point Objective): the maximum acceptable data loss, measured in time. 'We can lose at most 5 minutes of data' — so backups or replication must happen at least every 5 minutes.",
      "Lower RTO and RPO cost more money and complexity, so they are set per system based on business impact.",
      "DR strategies, from cheapest/slowest to most expensive/fastest:",
      "  Backup & restore: regular backups copied to another region; rebuild everything from IaC and restore data. RTO hours, RPO hours.",
      "  Pilot light: core data replicated live to the DR region, minimal infrastructure off or tiny; scale up on disaster. RTO tens of minutes.",
      "  Warm standby: a scaled-down but running copy of the full system in the DR region; scale up and switch traffic. RTO minutes.",
      "  Multi-site active-active: full capacity running in multiple regions serving traffic simultaneously. RTO near zero, RPO near zero, highest cost and complexity.",
      "# How it works",
      "Achieving HA:",
      "  Multiple instances across AZs behind load balancers; auto-healing; multi-AZ databases; no single points of failure.",
      "Achieving DR:",
      "  Automated, encrypted backups (e.g. AWS Backup, RDS snapshots, point-in-time recovery) copied to another region and another account (protects against account compromise or ransomware).",
      "  Immutable or locked backups (S3 Object Lock) so attackers cannot delete them.",
      "  Infrastructure as Code so the environment can be recreated quickly.",
      "  DNS failover (Route 53 health checks) to switch users to the DR region.",
      "  Runbooks with exact steps and owners.",
      "  Regular DR tests (game days): actually restore backups and fail over, measuring the real RTO and RPO.",
      "# Example walkthrough",
      "The table in the snippet shows four systems with different targets: payments needs RTO 15 min / RPO ~0, so it uses warm standby with cross-region database replication.",
      "Internal reporting tolerates RTO 24 h / RPO 24 h, so nightly backup & restore is enough.",
      "The shell commands show a restore drill: list recovery points and start a point-in-time restore of the RDS instance to 5 minutes ago, then time how long it takes.",
      "If the drill takes 3 hours but the RTO is 1 hour, the plan must change.",
      "# Why it matters / when to use",
      "Regions do have outages; human error (dropping a production table) is even more common.",
      "Ransomware attacks specifically target backups; isolated copies are essential.",
      "Business continuity requirements and audits ask for documented RTO/RPO and test evidence.",
      "# Common mistakes",
      "Assuming HA replication is a backup: deletes and corruption replicate instantly to the standby.",
      "Never testing restores; many teams discover broken or incomplete backups during the real disaster.",
      "Keeping backups in the same account and region as production.",
      "Setting RTO/RPO without asking the business what downtime and data loss actually cost.",
      "# Say this in the interview",
      "High availability avoids downtime from component failures through redundancy like multi-AZ deployments, load balancers, replicas and auto-healing. Disaster recovery is about recovering from large-scale disasters like a region outage, data corruption or ransomware. RTO is the maximum acceptable downtime and RPO is the maximum acceptable data loss measured in time. DR strategies by increasing cost are backup and restore, pilot light, warm standby and multi-site active-active, and we test DR regularly because an untested backup is not a backup.",
      "Follow-up: Your RPO is 5 minutes; what does that imply?",
      "  Data must be replicated or backed up at least every 5 minutes, e.g. continuous replication or point-in-time recovery with transaction logs.",
      "Follow-up: Why keep backups in another account?",
      "  If the main account is compromised or hit by ransomware, the attacker cannot delete backups stored in an isolated account.",
    ],
    code: `# DR targets per system (decided with the business)
# | System            | RTO     | RPO     | Strategy                            |
# |-------------------|---------|---------|-------------------------------------|
# | Payments API      | 15 min  | ~0      | Warm standby + cross-region replica |
# | Customer API      | 1 h     | 5 min   | Pilot light + PITR backups          |
# | Internal reports  | 24 h    | 24 h    | Nightly backup & restore            |
# | Marketing site    | 4 h     | 24 h    | Rebuild from IaC + S3 copy          |

# Restore drill — measure the REAL recovery time (shell)
start=$(date +%s)
aws rds restore-db-instance-to-point-in-time \\
  --source-db-instance-identifier orders-db \\
  --target-db-instance-identifier orders-db-drill \\
  --restore-time "$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ)"
aws rds wait db-instance-available --db-instance-identifier orders-db-drill
echo "restore took $(( ($(date +%s) - start) / 60 )) minutes"
# → restore took 23 minutes   (must be below the RTO, or change the plan)
# then: run smoke tests against orders-db-drill, record results, delete it`,
  },
  {
    id: 'container-image-security',
    group: 'Security & Reliability',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you secure containers and images?',
    a: [
      "# ELI5",
      "Packing a lunchbox for a school trip: you only pack what you need (fewer things to go bad), check the food is not expired, and seal the box so nobody can swap the sandwich.",
      "On the trip, the child carrying it is not given the teacher's keys to every room — just what they need.",
      "Mapping back: small base images, vulnerability scanning, signing images, and running containers with minimal privileges.",
      "# What it is",
      "Container image: a packaged filesystem (OS libraries + runtime + your app) built from a Dockerfile, stored in a registry. Container: a running instance of an image, isolated using Linux kernel features (namespaces, cgroups) but sharing the host kernel.",
      "Because containers share the kernel, a compromised container running as root with extra privileges can sometimes escape to the host. Defence in depth means many layers of protection.",
      "Image hardening:",
      "  Minimal base images: `distroless` (no shell or package manager), `alpine`, `-slim` variants or Chainguard/wolfi images. Fewer packages = fewer CVEs and less for attackers to use.",
      "  Multi-stage builds: compile in a 'builder' stage, copy only the output into a small runtime stage, leaving compilers and dev dependencies behind.",
      "  Pin base images by digest (`node:22-slim@sha256:...`) for reproducibility, and rebuild regularly to pick up security patches.",
      "  Never put secrets in images (`ENV`, `COPY .env`, build args all end up readable in layers).",
      "Scanning: Trivy, Grype, Docker Scout or registry scanning (ECR, GHCR) list known CVEs; fail CI on critical ones and re-scan running images as new CVEs appear.",
      "Runtime hardening:",
      "  Run as a non-root user (`USER node` / `runAsNonRoot: true`).",
      "  Read-only root filesystem; write only to mounted volumes or tmpfs.",
      "  Drop Linux capabilities (fine-grained root powers like `NET_ADMIN`) with `drop: [ALL]`; disallow privilege escalation.",
      "  Never run `privileged: true` or mount the Docker socket into app containers.",
      "  Seccomp profile `RuntimeDefault` to block dangerous system calls; set CPU/memory limits.",
      "Kubernetes controls: Pod Security Admission with the `restricted` profile on namespaces, NetworkPolicies (pod firewall rules) to limit who can talk to whom, image signature verification on admission (Sigstore cosign + Kyverno/policy-controller).",
      "# How it works",
      "Secure lifecycle of an image:",
      "  Build: multi-stage Dockerfile, minimal base, non-root user, `npm ci --omit=dev`.",
      "  Scan in CI: block HIGH/CRITICAL; generate an SBOM.",
      "  Sign: `cosign sign` the image digest in CI using keyless OIDC signing.",
      "  Push to a private registry with immutable tags.",
      "  Admit: the cluster verifies the signature and pod security settings before running.",
      "  Run: restricted securityContext, NetworkPolicies, runtime detection (Falco).",
      "  Maintain: rebuild weekly or on base image updates; re-scan running images.",
      "# Example walkthrough",
      "The Dockerfile's first stage installs all dependencies and builds; the second stage copies only `dist` and production `node_modules` onto a distroless Node 22 image.",
      "Distroless images run as the built-in non-root user when you use the `:nonroot` tag; there is no shell, so an attacker cannot simply `sh` into it.",
      "The Kubernetes securityContext enforces non-root, read-only root filesystem, no privilege escalation, all capabilities dropped and the default seccomp profile.",
      "`trivy image` on the result typically reports far fewer vulnerabilities than a full `node:22` image.",
      "# Why it matters / when to use",
      "Containers are the deployment unit for most backends; insecure images are a common attack path.",
      "Security reviews and Kubernetes `restricted` policies will reject pods that run as root or privileged.",
      "Smaller images also pull faster, speeding up deploys and autoscaling.",
      "# Common mistakes",
      "Running as root because it is the default in many base images.",
      "Using `latest` tags and never rebuilding, so images silently age with unpatched CVEs.",
      "Installing debugging tools (curl, bash) in production images; use ephemeral debug containers (`kubectl debug`) instead.",
      "Copying the whole build context (`COPY . .`) without a `.dockerignore`, leaking `.git`, `.env` and test data into the image.",
      "# Say this in the interview",
      "I use minimal base images like distroless or alpine with multi-stage builds, pin by digest and rebuild regularly to pick up patches. Images are scanned in CI and in the registry, failing builds on critical CVEs. At runtime containers run as non-root with a read-only root filesystem, dropped Linux capabilities and no privileged mode. In Kubernetes I add Pod Security Admission with the restricted profile, NetworkPolicies, and sign images with cosign and verify them on admission.",
      "Follow-up: Why is running as root in a container risky if it is isolated?",
      "  Containers share the host kernel; a kernel or runtime bug, or a misconfiguration like a mounted socket, can let root in the container become root on the host.",
    ],
    code: `# Dockerfile — multi-stage, minimal, non-root
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev        # keep only prod deps

FROM gcr.io/distroless/nodejs22-debian12:nonroot  # no shell, non-root user
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["dist/server.js"]                           # entrypoint is already "node"

# pod securityContext (Kubernetes)
#   securityContext:
#     runAsNonRoot: true
#     readOnlyRootFilesystem: true
#     allowPrivilegeEscalation: false
#     capabilities: { drop: ["ALL"] }
#     seccompProfile: { type: RuntimeDefault }

# CI
#   trivy image --exit-code 1 --severity HIGH,CRITICAL ghcr.io/acme/api:1.2.0
#   cosign sign --yes ghcr.io/acme/api@sha256:<digest>      # keyless signing via OIDC
# → Total: 0 (HIGH: 0, CRITICAL: 0)`,
  },
  {
    id: 'least-privilege',
    group: 'Security & Reliability',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the principle of least privilege and how do you apply it?',
    a: [
      "# ELI5",
      "A hotel gives a guest a key card that opens only their room, only during their stay. It does not open the kitchen, the safe, or other rooms.",
      "If the guest loses the card, the damage is small: one room, for a few days.",
      "Mapping back: every person and program should get only the access they need, for only as long as they need it, so a stolen credential causes minimal harm.",
      "# What it is",
      "Principle of least privilege (PoLP): every user, service and process gets the minimum permissions required to do its job, for the minimum time needed.",
      "Privilege: a permission to perform an action, e.g. read an S3 bucket, delete a database, deploy to production, `sudo` on a server.",
      "Blast radius: how much damage can be done if a given identity is compromised. Least privilege shrinks it.",
      "Applies everywhere:",
      "  Cloud IAM: policies listing specific actions on specific resources, not `*`.",
      "  Kubernetes: Roles scoped to a namespace and a few verbs; separate ServiceAccounts per app.",
      "  Databases: the app user can `SELECT/INSERT/UPDATE` on its tables but not `DROP` or create users; migrations use a separate user.",
      "  CI/CD: pipeline tokens limited to one repo/environment; `GITHUB_TOKEN` permissions set to read by default.",
      "  OS/containers: run as non-root, drop capabilities.",
      "Just-in-time (JIT) access: elevated permissions granted on request, with approval, for a limited period (e.g. 1 hour of production DB access during an incident), then automatically removed.",
      "Zero trust: a security model where nothing is trusted just because it is inside the network; every request is authenticated and authorised. Least privilege is a core part of it.",
      "# How it works",
      "Applying it in practice:",
      "  Start with no permissions (default deny) and add only what is needed.",
      "  Create one role/ServiceAccount per service, not a shared 'app' identity.",
      "  Scope by resource (specific bucket/table ARNs) and by conditions (source VPC, tags, MFA).",
      "  Use tools to find unused permissions: AWS IAM Access Analyzer (can generate policies from CloudTrail activity), GCP IAM Recommender.",
      "  Review access periodically and remove leavers and unused roles.",
      "  Use guardrails: AWS SCPs or permission boundaries cap the maximum permissions anyone can grant.",
      "  Break-glass accounts for emergencies, heavily monitored.",
      "# Example walkthrough",
      "The 'bad' policy allows `s3:*` on `*` — the app could delete every bucket in the account.",
      "The 'good' policy allows only `GetObject` and `PutObject` on `acme-invoices/*`.",
      "The SQL creates an app user that can read and write the `orders` table but cannot drop it or touch other schemas.",
      "If the app is hacked, the attacker can only read/write invoices and orders, not wipe the account or database.",
      "# Why it matters / when to use",
      "Most breaches escalate by abusing over-broad permissions after an initial foothold.",
      "Limits the damage of human mistakes too (an engineer cannot accidentally delete production with a dev role).",
      "Required by most compliance frameworks.",
      "# Common mistakes",
      "Granting admin 'to get things working' and never revisiting it.",
      "Sharing one powerful credential between many services or people, losing accountability.",
      "Permanent standing admin access for engineers instead of just-in-time elevation.",
      "Forgetting non-human identities (CI tokens, service accounts), which often have the most power.",
      "# Say this in the interview",
      "Least privilege means every user, service and process gets only the minimum permissions it needs, for the minimum time. I apply it with scoped IAM policies, a separate role or ServiceAccount per service and no shared admin accounts, plus just-in-time elevated access with approval. I regularly review and prune unused permissions with tools like IAM Access Analyzer. It limits the blast radius when credentials are compromised and pairs naturally with zero-trust networking.",
      "Follow-up: How do you find the right minimal permissions?",
      "  Start narrow, use Access Analyzer policy generation from real CloudTrail activity, and tighten iteratively with tests.",
    ],
    code: `// BAD — app can do anything to every bucket in the account
{ "Effect": "Allow", "Action": "s3:*", "Resource": "*" }

// GOOD — only what the invoice service needs
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::acme-invoices/*"
  }]
}

-- Database: app user can use its table, but not drop it or create users
CREATE ROLE orders_app LOGIN PASSWORD :'app_password';   -- psql variable, not hardcoded
GRANT CONNECT ON DATABASE shop TO orders_app;
GRANT USAGE ON SCHEMA public TO orders_app;
GRANT SELECT, INSERT, UPDATE ON orders TO orders_app;
-- as orders_app:  DROP TABLE orders;
-- → ERROR: must be owner of table orders`,
  },
  {
    id: 'https-tls',
    group: 'Security & Reliability',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does HTTPS/TLS work and how are certificates managed?',
    a: [
      "# ELI5",
      "You want to send secret notes to a friend across the classroom, but other kids pass them along and could read them.",
      "First, the friend shows an ID card signed by the head teacher (who everyone trusts), proving they are really your friend.",
      "Then the two of you use a clever trick to agree on a secret code word without ever writing it on a note that others can read. After that, every note is scrambled with that code.",
      "Mapping back: the ID card is the server's certificate signed by a Certificate Authority, the trick is the TLS key exchange, and the code word is the session key used to encrypt traffic.",
      "# What it is",
      "HTTPS is HTTP sent inside a TLS (Transport Layer Security) connection. TLS provides encryption (nobody can read traffic), integrity (nobody can modify it unnoticed) and authentication (you are talking to the real server).",
      "SSL is the old, insecure predecessor name; modern systems use TLS 1.2 or TLS 1.3.",
      "Symmetric encryption: one shared key both encrypts and decrypts (e.g. AES-GCM, ChaCha20). Very fast, used for the actual data.",
      "Asymmetric (public-key) cryptography: a key pair — a public key anyone can see and a private key kept secret. Used to prove identity (digital signatures) and to agree on keys.",
      "Certificate: a file containing the server's public key and domain name (e.g. `api.acme.com`), digitally signed by a Certificate Authority (CA).",
      "CA (Certificate Authority): a trusted organisation (e.g. Let's Encrypt, DigiCert) whose root certificates are pre-installed in browsers and operating systems. A chain of trust links your certificate to a trusted root via intermediate certificates.",
      "Key exchange: ECDHE (Elliptic-Curve Diffie-Hellman Ephemeral) lets both sides compute the same secret without sending it. 'Ephemeral' gives forward secrecy: stealing the server's private key later does not decrypt past recorded traffic.",
      "SNI (Server Name Indication): the client says which hostname it wants, so one IP can serve many certificates.",
      "# How it works",
      "TLS 1.3 handshake (one round trip):",
      "  ClientHello: client sends supported cipher suites, SNI, and its key-share (ECDHE public value).",
      "  ServerHello: server picks parameters and sends its key-share; both sides now compute the shared session keys.",
      "  The server sends its certificate chain and a signature proving it owns the private key (all encrypted already).",
      "  The client verifies: certificate chain to a trusted root, hostname matches, not expired, not revoked.",
      "  Both send 'Finished' messages; application data (the HTTP request) flows encrypted with fast symmetric keys.",
      "TLS 1.2 needed two round trips; TLS 1.3 also supports 0-RTT resumption for returning clients (with replay caveats).",
      "Certificate management:",
      "  ACME protocol: automated issuance and renewal — Let's Encrypt certificates last 90 days (and are moving to shorter lifetimes), so automation is mandatory.",
      "  Kubernetes: cert-manager watches Ingress/Certificate objects and renews automatically.",
      "  AWS: ACM (Certificate Manager) issues free certificates for load balancers and CloudFront and renews them automatically.",
      "  Monitor expiry dates; expired certificates are a classic cause of outages.",
      "TLS termination: decrypting HTTPS at the load balancer or ingress, then forwarding to backends (optionally re-encrypting).",
      "mTLS (mutual TLS): both client and server present certificates, authenticating both sides. Common between microservices through a service mesh (Istio, Linkerd), which issues and rotates certificates automatically.",
      "# Example walkthrough",
      "The `openssl s_client` command connects to a site and prints the protocol (`TLSv1.3`), cipher (e.g. `TLS_AES_256_GCM_SHA384`) and the certificate chain.",
      "The `-checkend 2592000` check tells you whether the certificate expires within 30 days — useful for monitoring.",
      "The cert-manager `Certificate` asks Let's Encrypt (via a `ClusterIssuer`) for a certificate for `api.acme.com` and stores it in Secret `api-tls`; renewal happens automatically before expiry.",
      "The Ingress then references `api-tls` to serve HTTPS.",
      "# Why it matters / when to use",
      "All public traffic should be HTTPS; browsers flag HTTP as insecure, and many APIs (and HTTP/2 in browsers) require TLS.",
      "Protects passwords, tokens and personal data from interception, especially on public Wi-Fi.",
      "Internal traffic increasingly uses mTLS as part of zero trust.",
      "# Common mistakes",
      "Letting certificates expire because renewal was manual.",
      "Disabling certificate verification in code (`rejectUnauthorized: false`, `curl -k`) to 'fix' errors, which enables man-in-the-middle attacks.",
      "Serving an incomplete chain (missing intermediate), which works in some browsers but fails in others and in API clients.",
      "Still allowing TLS 1.0/1.1 or weak ciphers.",
      "# Say this in the interview",
      "TLS uses asymmetric cryptography during the handshake to authenticate the server, via a certificate signed by a trusted CA, and to agree on session keys with ephemeral Diffie-Hellman. Data then flows encrypted with fast symmetric ciphers, and TLS 1.3 needs only one round trip. I automate certificates with Let's Encrypt and ACME, cert-manager in Kubernetes or AWS ACM on load balancers, and monitor expiry. mTLS authenticates both sides and is common between microservices via a service mesh.",
      "Follow-up: What is forward secrecy?",
      "  Using ephemeral key exchange so each session has unique keys; even if the server's private key leaks later, past traffic cannot be decrypted.",
      "Follow-up: Where do you terminate TLS?",
      "  Usually at the load balancer or ingress; for sensitive internal traffic, re-encrypt to the backend or use mTLS end to end.",
    ],
    code: `# Inspect a live TLS connection (shell)
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\
  | grep -E "Protocol|Cipher|subject=|issuer="
# → Protocol  : TLSv1.3
# → Cipher    : TLS_AES_256_GCM_SHA384
# → subject=CN=example.com    issuer=C=US, O=DigiCert Inc, CN=...

# Does the certificate expire in the next 30 days?
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -checkend 2592000
# → Certificate will not expire

# cert-manager — automatic Let's Encrypt certificate in Kubernetes
apiVersion: cert-manager.io/v1
kind: Certificate
metadata: { name: api-cert, namespace: prod }
spec:
  secretName: api-tls                 # Ingress uses this Secret for HTTPS
  dnsNames: [api.acme.com]
  issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer }
# kubectl get certificate -n prod → api-cert   READY: True   (renewed automatically)`,
  },
  {
    id: 'chaos-engineering',
    group: 'Security & Reliability',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is chaos engineering?',
    a: [
      "# ELI5",
      "A school holds fire drills. Nobody sets the school on fire; they pretend there is a fire to check everyone knows where to go and the doors actually open.",
      "If they find a locked exit during the drill, they fix it before a real fire happens.",
      "Mapping back: chaos engineering deliberately causes small, controlled failures in a system to prove it survives them, and fixes weaknesses before real outages find them.",
      "# What it is",
      "Chaos engineering: the discipline of running controlled experiments that inject failures into a system to build confidence that it can withstand turbulent real-world conditions.",
      "Popularised by Netflix's Chaos Monkey, which randomly terminated production instances to force engineers to build resilient services.",
      "Steady state: measurable normal behaviour, e.g. 'checkout success rate ≥ 99.5% and p99 latency < 500 ms'.",
      "Hypothesis: a prediction like 'if one of three API pods is killed, steady state is maintained'.",
      "Blast radius: how much of the system and how many users the experiment can affect — start tiny.",
      "Typical faults injected: kill pods/instances, add network latency or packet loss, block a dependency, fill disks, burn CPU, simulate an AZ or region failure, expire certificates, throttle a database.",
      "Game day: a scheduled team exercise where failures are injected while people watch, practising both the system and the incident response.",
      "Tools: Chaos Monkey (Spinnaker), LitmusChaos and Chaos Mesh (Kubernetes, CNCF projects), AWS Fault Injection Service (FIS), Azure Chaos Studio, Gremlin, Toxiproxy for network faults in tests.",
      "# How it works",
      "The experiment loop:",
      "  Define steady state with metrics you already monitor.",
      "  Form a hypothesis about what should happen under a specific failure.",
      "  Plan the smallest blast radius: staging first, then a small slice of production; define abort conditions (stop if error rate > 1%).",
      "  Run the experiment, with someone watching dashboards and ready to stop it.",
      "  Analyse: did steady state hold? If not, you found a weakness (missing retry, bad timeout, single point of failure, broken alert).",
      "  Fix, then automate the experiment to run regularly so regressions are caught.",
      "Prerequisites: good observability and SLOs; without them you cannot tell whether the system is coping.",
      "# Example walkthrough",
      "The Chaos Mesh `PodChaos` experiment kills one pod (`mode: one`) labelled `app: checkout` in namespace `prod`.",
      "Hypothesis: the Deployment has 3 replicas and a readiness probe, so the Service routes around the dead pod and Kubernetes replaces it within seconds.",
      "The `NetworkChaos` experiment adds 200 ms latency to calls into `payments` for 5 minutes, testing that checkout timeouts and retries behave.",
      "If the checkout error rate rises above the SLO during the run, the hypothesis failed and you investigate (e.g. timeouts set too low, no circuit breaker).",
      "# Why it matters / when to use",
      "Distributed systems fail in surprising ways; tests in CI rarely reproduce real network and infrastructure failures.",
      "Validates HA and DR claims ('we survive an AZ loss') with evidence.",
      "Trains on-call engineers and validates runbooks and alerts.",
      "# Common mistakes",
      "Starting in production with a large blast radius and no abort plan.",
      "Running chaos without observability, so you cannot tell what happened.",
      "Treating it as random breaking instead of hypothesis-driven experiments.",
      "Finding weaknesses but never fixing them.",
      "# Say this in the interview",
      "Chaos engineering is deliberately injecting failures, like killing pods or instances, adding latency or dropping an AZ, to verify the system tolerates them. The process is to define steady state, form a hypothesis, run a controlled experiment with a small blast radius and abort conditions, learn and fix. Tools include Chaos Monkey, LitmusChaos, Chaos Mesh and AWS Fault Injection Service, and teams often run them as game days.",
      "Follow-up: Is it safe to run chaos in production?",
      "  Yes, once it passes in staging and you have SLO monitoring, a small blast radius, automatic abort conditions and people watching.",
    ],
    code: `# pod-kill.yaml — Chaos Mesh: kill one checkout pod
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata: { name: kill-one-checkout, namespace: prod }
spec:
  action: pod-kill
  mode: one                              # smallest blast radius: a single pod
  selector:
    namespaces: [prod]
    labelSelectors: { app: checkout }
# Hypothesis: 3 replicas + readiness probes → no user-visible errors
# kubectl get pods -l app=checkout -w   → one pod Terminating, replacement Running in ~10s
---
# latency.yaml — 200ms extra latency on calls to payments for 5 minutes
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata: { name: slow-payments, namespace: prod }
spec:
  action: delay
  mode: all
  selector:
    namespaces: [prod]
    labelSelectors: { app: payments }
  delay: { latency: "200ms" }
  duration: "5m"
# Watch: checkout success rate and p99 — abort (kubectl delete -f latency.yaml) if SLO breaks`,
  },
  {
    id: 'software-supply-chain-sbom',
    group: 'Security & Reliability',
    stars: 1,
    difficulty: 'Hard',
    q: 'What is software supply chain security (SBOM, SLSA, signing)?',
    a: [
      "# ELI5",
      "When you buy packaged food, the label lists every ingredient (so you can check for allergies), the factory it came from, and a sealed lid shows nobody tampered with it.",
      "If there is a recall on one ingredient, you can quickly check which products contain it.",
      "Mapping back: an SBOM is the ingredient list for software, provenance says where and how it was built, and signatures are the tamper-proof seal.",
      "# What it is",
      "Software supply chain: everything that goes into producing and delivering your software — source code, open-source dependencies, base images, build tools, CI systems, registries and deployment pipelines.",
      "Supply chain attack: compromising any link in that chain instead of your app directly. Famous examples: SolarWinds (build system compromised), the xz-utils backdoor (malicious maintainer), malicious npm packages and typosquatting (packages with names like popular ones).",
      "SBOM (Software Bill of Materials): a machine-readable inventory of every component and version in an artifact. Standard formats: SPDX and CycloneDX. Generated by tools like Syft, Trivy or `docker buildx` attestations.",
      "Why SBOMs help: when a new CVE like Log4Shell is announced, you can search all your SBOMs and know within minutes which services are affected (tools like Grype scan SBOMs directly).",
      "SLSA (Supply-chain Levels for Software Artifacts, pronounced 'salsa'): an OpenSSF framework defining increasing levels of build integrity — e.g. builds scripted and run on a hosted platform, with signed, non-forgeable provenance, on hardened isolated builders.",
      "Provenance: a signed statement describing how an artifact was built — which source repo and commit, which build system, which workflow.",
      "Attestation: a signed claim about an artifact (provenance, SBOM, test results), stored alongside it in the registry.",
      "Sigstore: an open-source project for signing and verifying software. `cosign` signs container images; keyless signing uses the CI's OIDC identity and records signatures in a public transparency log (Rekor).",
      "# How it works",
      "A hardened pipeline:",
      "  Pin dependencies with lockfiles and pin GitHub Actions to commit SHAs; review dependency updates (Dependabot/Renovate).",
      "  Build on an ephemeral, hosted CI runner from a reviewed commit.",
      "  Generate an SBOM for the image and attach it as an attestation.",
      "  Generate SLSA provenance (e.g. GitHub artifact attestations or the SLSA GitHub generator).",
      "  Sign the image digest with cosign (keyless via OIDC).",
      "  At deploy time, an admission controller (Kyverno, Sigstore policy-controller) verifies the signature and provenance — only images built by your CI from your repo may run.",
      "  Continuously scan stored SBOMs for newly published CVEs.",
      "# Example walkthrough",
      "`syft` generates a CycloneDX SBOM listing every package in the image, e.g. `express 4.21.x`, `openssl 3.x`.",
      "`grype sbom:sbom.json` checks that SBOM against vulnerability databases without re-pulling the image.",
      "`cosign sign` signs the image digest; in GitHub Actions keyless mode it uses the workflow's OIDC identity.",
      "`cosign verify` with the expected identity and issuer succeeds only for images signed by your repo's workflow, printing 'The cosign claims were validated'.",
      "# Why it matters / when to use",
      "Most code in a typical Node service comes from open-source dependencies, which is a large attack surface.",
      "Governments and large customers increasingly require SBOMs and secure build practices from software vendors.",
      "Signature verification stops attackers from deploying images pushed with stolen registry credentials.",
      "# Common mistakes",
      "Generating SBOMs but never using them for vulnerability response.",
      "Signing images but not enforcing verification at deploy time, so signatures protect nothing.",
      "Running builds on long-lived, shared machines where one compromised job can poison others.",
      "Installing dependencies without a lockfile or with `npm install` in CI instead of `npm ci`.",
      "# Say this in the interview",
      "Software supply chain security is about protecting everything that goes into a build: dependencies, build systems and artifacts. An SBOM is an inventory of components in an artifact, in SPDX or CycloneDX format and generated by tools like Syft, which enables fast CVE impact analysis. SLSA is a framework of levels for build provenance and tamper resistance. We sign artifacts and attestations with Sigstore cosign and verify signatures before deploy.",
      "Follow-up: What is keyless signing?",
      "  Cosign uses a short-lived certificate tied to the CI's OIDC identity instead of a long-lived private key, and records the signature in a transparency log.",
    ],
    code: `# 1) SBOM: list every component in the image (CycloneDX format)
syft ghcr.io/acme/api:1.2.0 -o cyclonedx-json > sbom.json
# → sbom.json lists e.g. express 4.21.2, zod 3.23.8, openssl 3.0.15 ...

# 2) Vulnerability check straight from the SBOM
grype sbom:sbom.json --fail-on high
# → No vulnerabilities found   (or a table of CVEs; exit 1 on high+)

# 3) Sign the image digest (keyless in CI via OIDC) and attach the SBOM
DIGEST=ghcr.io/acme/api@sha256:9b1e4c...
cosign sign --yes "$DIGEST"
cosign attest --yes --type cyclonedx --predicate sbom.json "$DIGEST"

# 4) Verify before deploy: only images signed by OUR workflow are accepted
cosign verify "$DIGEST" \\
  --certificate-identity-regexp "^https://github.com/acme/api/" \\
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
# → Verification for ghcr.io/acme/api@sha256:9b1e4c... --
# → The cosign claims were validated
# (in Kubernetes, Kyverno / policy-controller run this check on every pod)`,
  },
];
