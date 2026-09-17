/* Girish Burade portfolio — vanilla JS, no dependencies. */
(function () {
   'use strict';

   var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   var $ = function (sel, root) { return (root || document).querySelector(sel); };
   var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
   var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

   /* ---------------------------------------------------------------------
      Footer year + experience auto-calculated from the timeline dates
      --------------------------------------------------------------------- */
   $('#year').textContent = new Date().getFullYear();

   var months = 0, now = new Date();
   $$('.job[data-start]').forEach(function (job) {
      var s = job.dataset.start.split('-'), e = job.dataset.end;
      var start = new Date(+s[0], +s[1] - 1, 1);
      var end = e === 'present' ? now : new Date(+e.split('-')[0], +e.split('-')[1], 0);
      months += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
   });
   var expYears = Math.floor(months / 12), expMonths = months % 12;
   var expExact = expYears + ' year' + (expYears === 1 ? '' : 's') + (expMonths ? ' ' + expMonths + ' month' + (expMonths === 1 ? '' : 's') : '');
   if (months > 0) {
      $$('.js-exp-years').forEach(function (n) { n.textContent = expYears + '+ years'; });
      $$('.js-exp-exact').forEach(function (n) { n.textContent = expExact; });
   }

   /* ---------------------------------------------------------------------
      Hide resume buttons if the PDF is missing (avoids a broken download)
      --------------------------------------------------------------------- */
   var resumeLink = $('.js-resume-link');
   var resumeHref = resumeLink ? resumeLink.getAttribute('href') : null;
   if (resumeLink && window.fetch && location.protocol !== 'file:') {
      fetch(resumeHref, { method: 'HEAD' }).then(function (res) {
         if (!res.ok) $$('.js-resume-item').forEach(function (n) { n.hidden = true; n.style.display = 'none'; });
      }).catch(function () {});
   }

   /* ---------------------------------------------------------------------
      Navigation: mobile toggle + active section highlighting
      --------------------------------------------------------------------- */
   var toggle = $('.nav-toggle'), menu = $('#nav-menu');
   function setMenu(open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
   }
   toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
   menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
   document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
   document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
   });

   var navLinks = $$('.nav-menu > a[href^="#"]');
   if ('IntersectionObserver' in window) {
      var sectionObserver = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id); });
         });
      }, { rootMargin: '-45% 0px -50% 0px' });
      navLinks.forEach(function (a) {
         var target = $(a.getAttribute('href'));
         if (target) sectionObserver.observe(target);
      });
   }

   /* ---------------------------------------------------------------------
      Scroll reveal
      --------------------------------------------------------------------- */
   function observeOnce(elements, cb, threshold) {
      if (!('IntersectionObserver' in window) || reduceMotion) { elements.forEach(cb); return; }
      var io = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (entry.isIntersecting) { cb(entry.target); io.unobserve(entry.target); }
         });
      }, { threshold: threshold || 0.12 });
      elements.forEach(function (el) { io.observe(el); });
   }
   observeOnce($$('.reveal'), function (el) { el.classList.add('in'); });

   /* ---------------------------------------------------------------------
      Architecture flow renderer
      A flow is a list of rows; each row is a list of nodes. Connectors are
      drawn between rows so 1→2, 2→1, 3→3 etc. all line up with the grid.
      --------------------------------------------------------------------- */
   var FLOWS = {
      reference: {
         rows: [
            [{ t: 'Source control', s: 'GitHub · GitLab', icon: 'git', kind: 'source', tech: 'GitHub · GitLab', d: 'Every change starts as a commit. Pushing to the main branch triggers the pipeline.' }],
            [{ t: 'CI/CD pipeline', s: 'CodePipeline · CodeBuild · GitLab CI', icon: 'pipeline', tech: 'AWS CodePipeline · CodeBuild · GitHub Actions · GitLab CI/CD', d: 'Builds, tests and packages every release automatically, with a standardized build → test → release flow.' }],
            [{ t: 'Docker → ECR', s: 'versioned images', icon: 'registry', tech: 'Docker · Amazon ECR', d: 'Each service is packaged as a container image and pushed to a private Amazon ECR registry.' }],
            [{ t: 'Load balancer', s: 'ALB · SSL/TLS', icon: 'balancer', tech: 'Application Load Balancer · Nginx · SSL/TLS', d: 'HTTPS entry point with SSL/TLS termination and domain-based routing to healthy targets.' }],
            [
               { t: 'EC2 / ASG', s: 'AZ-a', icon: 'server', kind: 'az', tech: 'Amazon EC2 · Auto Scaling · Launch Templates', d: 'Compute across availability zones, deployed with CodeDeploy or ECS and scaled with Auto Scaling groups.' },
               { t: 'EC2 / ASG', s: 'AZ-b', icon: 'server', kind: 'az', tech: 'Amazon EC2 · Auto Scaling · Launch Templates', d: 'A second availability zone keeps the service up if one zone has problems.' }
            ],
            [{ t: 'Application', s: 'containers · Secrets Manager', icon: 'app', tech: 'Docker · Docker Compose · AWS Secrets Manager', d: 'Frontend, backend and worker services run isolated; credentials are injected from Secrets Manager at startup — nothing hard-coded.' }],
            [{ t: 'CloudWatch / Logs', s: 'metrics · alarms · SNS', icon: 'monitor', kind: 'watch', tech: 'Amazon CloudWatch · SNS · Uptime Kuma', d: 'Metrics, logs, dashboards and alarms, with SNS and Microsoft Teams notifications before users notice.' }]
         ]
      },
      quralyst: {
         title: 'Quralyst AI Platform',
         rows: [
            [{ t: 'Users', s: 'HTTPS · custom domains', icon: 'cloud', kind: 'source', d: 'Traffic arrives over HTTPS on the platform domains.' }],
            [{ t: 'Nginx on EC2', s: 'reverse proxy · SSL/TLS', icon: 'balancer', d: 'Domain-based HTTP/HTTPS routing and SSL/TLS termination in front of every service.' }],
            [
               { t: 'Frontend', s: 'container', icon: 'app', d: 'Frontend service running as an isolated Docker container.' },
               { t: 'Backend', s: 'container', icon: 'server', d: 'Backend API service running as an isolated Docker container.' },
               { t: 'Scraper', s: 'Playwright worker', icon: 'container', kind: 'az', d: 'Browser-based workloads isolated into a dedicated worker to protect platform stability.' }
            ],
            [
               { t: 'Redis', s: 'container', icon: 'db', d: 'Redis runs as its own Docker Compose service.' },
               { t: 'Secrets Manager', s: 'injected at startup', icon: 'key', d: 'Credentials and configuration are injected into containers at startup.' }
            ],
            [{ t: 'CloudWatch → SNS', s: 'alarms · EC2 network alerts', icon: 'monitor', kind: 'watch', d: 'Alarms on EC2 CPU, memory, disk and network traffic notify the team via SNS.' }]
         ],
         release: ['CodeBuild', 'Amazon ECR', 'CodeDeploy', 'EC2 (Docker Compose)'],
         note: 'Workloads: frontend, backend, scraper and Redis as isolated Docker / Docker Compose services on EC2.'
      },
      ecs: {
         title: 'Scalable Web Application on AWS ECS + EC2',
         rows: [
            [{ t: 'Users', s: 'HTTPS', icon: 'cloud', kind: 'source', d: 'Client traffic to the Flask application.' }],
            [{ t: 'Application Load Balancer', s: 'health checks', icon: 'balancer', d: 'Routes traffic to the active (blue or green) ECS service.' }],
            [
               { t: 'ECS service · blue', s: 'EC2 launch type', icon: 'container', kind: 'az', d: 'Current version of the Flask app.' },
               { t: 'ECS service · green', s: 'EC2 launch type', icon: 'container', kind: 'az', d: 'New version — traffic shifts here for zero-downtime releases.' }
            ],
            [
               { t: 'Auto Scaling', s: 'Multi-AZ capacity', icon: 'server', d: 'EC2 capacity scales automatically across availability zones.' },
               { t: 'RDS PostgreSQL', s: 'private subnets', icon: 'db', d: 'Managed PostgreSQL database isolated in private VPC subnets.' }
            ],
            [{ t: 'CloudWatch', s: 'monitoring · alerts', icon: 'monitor', kind: 'watch', d: 'Metrics and alerts for the service and database.' }]
         ],
         release: ['Terraform', 'Docker image', 'ECS blue → green'],
         note: 'Secured with IAM, private VPC subnets and AWS Secrets Manager.'
      },
      kuma: {
         title: 'Real-Time Monitoring & Alerting',
         rows: [
            [{ t: 'Uptime Kuma', s: 'service checks', icon: 'heart', d: 'Continuously checks critical services.' }],
            [
               { t: 'Dev', s: 'environment', icon: 'server', d: 'Development services.' },
               { t: 'Staging', s: 'environment', icon: 'server', d: 'Staging services.' },
               { t: 'Production', s: 'environment', icon: 'server', kind: 'az', d: 'Production services.' }
            ],
            [{ t: 'Alert', s: 'on failure', icon: 'alert', kind: 'source', d: 'A failed check raises an alert immediately.' }],
            [
               { t: 'Microsoft Teams', s: 'instant alert', icon: 'mail', kind: 'watch', d: 'Instant notification in the team channel.' },
               { t: 'Mobile call', s: 'notification', icon: 'phone', kind: 'watch', d: 'Call notifications for fast incident response.' }
            ]
         ],
         note: 'Covers critical services across Dev, Staging and Production.'
      }
   };

   function center(i, n) {
      // centre of column i in an n-column grid with gap var(--gap)
      return 'calc((100% - ' + (n - 1) + ' * var(--gap)) * ' + ((2 * i + 1) / (2 * n)) + ' + ' + i + ' * var(--gap))';
   }

   function connectorHTML(n, m, idx) {
      var parts = [], i;
      if (n === m) {
         for (i = 0; i < n; i++) parts.push('<i class="v" style="left:' + center(i, n) + ';top:0;bottom:0"></i>');
      } else {
         for (i = 0; i < n; i++) parts.push('<i class="v" style="left:' + center(i, n) + ';top:0;height:50%"></i>');
         for (i = 0; i < m; i++) parts.push('<i class="v" style="left:' + center(i, m) + ';top:50%;bottom:0"></i>');
         var edge = center(0, Math.max(n, m));
         parts.push('<i class="h" style="left:' + edge + ';right:' + edge + '"></i>');
      }
      return '<div class="conn" style="--i:' + idx + '" aria-hidden="true">' + parts.join('') + '</div>';
   }

   function renderFlow(el, flow, onSelect) {
      var html = '<div class="flow">', idx = 0, nodes = [];
      flow.rows.forEach(function (row, r) {
         if (r > 0) html += connectorHTML(flow.rows[r - 1].length, row.length, idx++);
         html += '<div class="flow-row" data-count="' + row.length + '" style="grid-template-columns:repeat(' + row.length + ',minmax(0,1fr))">';
         row.forEach(function (node) {
            html += '<button type="button" class="node" style="--i:' + (idx++) + '" data-n="' + nodes.length + '"' +
               (node.kind ? ' data-kind="' + node.kind + '"' : '') + ' aria-label="' + esc(node.t + ' — ' + node.d) + '">' +
               '<svg class="ic" aria-hidden="true"><use href="#i-' + node.icon + '"/></svg>' +
               '<span class="node-text"><span class="node-title">' + esc(node.t) + '</span><span class="node-sub">' + esc(node.s) + '</span></span></button>';
            nodes.push(node);
         });
         html += '</div>';
      });
      el.innerHTML = html + '</div>';

      var buttons = $$('.node', el);
      function select(i, fromUser) {
         buttons.forEach(function (b, j) { b.classList.toggle('is-active', j === i); });
         if (onSelect) onSelect(nodes[i], fromUser);
      }
      buttons.forEach(function (b, i) {
         b.addEventListener('mouseenter', function () { select(i, true); });
         b.addEventListener('focus', function () { select(i, true); });
         b.addEventListener('click', function () { select(i, true); });
      });
      return { flowEl: $('.flow', el), count: nodes.length, select: select };
   }

   /* Main infrastructure diagram with node inspector + gentle auto-tour */
   var infraEl = $('#infra-diagram');
   if (infraEl) {
      var inspTitle = $('#inspector-title'), inspTech = $('#inspector-tech'), inspDesc = $('#inspector-desc'), inspIcon = $('#inspector-icon use');
      var pausedUntil = 0, current = 0;
      var infra = renderFlow(infraEl, FLOWS.reference, function (node, fromUser) {
         inspTitle.textContent = node.t + (node.s && node.kind === 'az' ? ' · ' + node.s : '');
         inspTech.textContent = node.tech || node.s;
         inspDesc.textContent = node.d;
         inspIcon.setAttribute('href', '#i-' + node.icon);
         if (fromUser) pausedUntil = Date.now() + 8000;
      });
      $$('.node', infraEl).forEach(function (b, i) {
         b.addEventListener('mouseenter', function () { current = i; });
         b.addEventListener('focus', function () { current = i; });
      });
      infra.select(0, false);
      observeOnce([infra.flowEl], function (el) {
         el.classList.add('in');
         if (reduceMotion) return;
         setInterval(function () {
            if (Date.now() < pausedUntil || document.hidden) return;
            current = (current + 1) % infra.count;
            infra.select(current, false);
         }, 2600);
      }, 0.2);
   }

   /* ---------------------------------------------------------------------
      Architecture modal
      --------------------------------------------------------------------- */
   var modal = $('#arch-modal');
   if (modal) {
      var modalDiagram = $('#arch-diagram'), modalTitle = $('#arch-title'), modalNote = $('#arch-note');
      var lastTrigger = null;
      var closeModal = function () {
         if (modal.close) modal.close(); else modal.removeAttribute('open');
         if (lastTrigger) lastTrigger.focus();
      };
      $$('[data-arch]').forEach(function (btn) {
         btn.addEventListener('click', function () {
            var flow = FLOWS[btn.dataset.arch];
            if (!flow) return;
            lastTrigger = btn;
            modalTitle.textContent = flow.title;
            var old = $('.release', modal);
            if (old) old.remove();
            var r = renderFlow(modalDiagram, flow, function (node) { modalNote.textContent = node.t + ' — ' + node.d; });
            modalNote.textContent = flow.note || '';
            if (flow.release) {
               var rel = document.createElement('div');
               rel.className = 'release';
               rel.innerHTML = '<span>release path</span>' + flow.release.map(function (s) { return '<b>' + esc(s) + '</b>'; }).join('<i>→</i>');
               modalDiagram.insertAdjacentElement('afterend', rel);
            }
            if (modal.showModal) modal.showModal(); else modal.setAttribute('open', '');
            requestAnimationFrame(function () { r.flowEl.classList.add('in'); });
         });
      });
      $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      modal.addEventListener('close', function () { if (lastTrigger) lastTrigger.focus(); });
   }

   /* ---------------------------------------------------------------------
      CI/CD pipeline — stages light up in sequence; hover/focus to inspect
      --------------------------------------------------------------------- */
   var pipeline = $('.pipeline');
   if (pipeline) {
      var stages = $$('.stage', pipeline);
      var pTitle = $('#stage-title'), pTech = $('#stage-tech'), pText = $('#stage-text');
      var runNo = $('#run-no'), status = $('#pipeline-status');
      var step = 0, hovering = false, timer = null, visible = false;

      var showStage = function (i) {
         var st = stages[i], desc = $('.stage-desc', st);
         pTitle.textContent = $('.stage-name', st).textContent;
         pTech.textContent = st.dataset.tech;
         pText.textContent = desc.textContent.replace($('b', desc).textContent, '').trim();
      };
      var paint = function (i) {
         stages.forEach(function (s, j) {
            s.classList.toggle('done', j < i);
            s.classList.toggle('running', j === i);
         });
      };
      var setStatus = function (text) {
         status.lastChild.textContent = ' run #' + runNo.textContent + ' · ' + text;
      };
      var tick = function () {
         timer = null;
         if (!visible || hovering || document.hidden) return;
         if (step < stages.length) {
            paint(step);
            showStage(step);
            setStatus('running');
            step++;
            timer = setTimeout(tick, 1300);
         } else {
            paint(stages.length);
            setStatus('passing');
            step = 0;
            timer = setTimeout(function () {
               runNo.textContent = String(+runNo.textContent + 1);
               tick();
            }, 2600);
         }
      };
      var resume = function () { if (!timer && visible && !hovering && !reduceMotion) tick(); };

      // restructure status pill so the run number stays in its own span
      status.innerHTML = '<span class="status-dot"></span><span id="run-no" hidden>' + runNo.textContent + '</span><span> run #' + runNo.textContent + ' · passing</span>';
      runNo = $('#run-no');

      stages.forEach(function (s, i) {
         var enter = function () { hovering = true; clearTimeout(timer); timer = null; showStage(i); stages.forEach(function (x, j) { x.classList.toggle('running', j === i); }); };
         var leave = function () { hovering = false; resume(); };
         s.addEventListener('mouseenter', enter);
         s.addEventListener('focus', enter);
         s.addEventListener('mouseleave', leave);
         s.addEventListener('blur', leave);
      });

      if (reduceMotion) {
         paint(stages.length);
      } else if ('IntersectionObserver' in window) {
         new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible) resume();
         }, { threshold: 0.3 }).observe(pipeline);
         document.addEventListener('visibilitychange', resume);
      }
   }

   /* ---------------------------------------------------------------------
      Terminal — typed intro, then a few real commands
      --------------------------------------------------------------------- */
   var term = $('#terminal'), form = $('#terminal-form'), input = $('#terminal-cmd');
   if (term) {
      var PROMPT = '<span class="t-prompt">$</span>';
      var intro = [
         ['whoami', 'girish-burade <span class="dim">·</span> <b>senior devops / cloud engineer</b>'],
         ['cloud --provider', '<b>AWS</b> <span class="dim">· Certified Solutions Architect – Associate</span>'],
         ['infrastructure --as-code', '<b>Terraform</b> <span class="dim">· dev / staging / prod</span>'],
         ['container --runtime', '<b>Docker</b> · Docker Compose · Amazon ECS'],
         ['monitoring --stack', 'CloudWatch · SNS · Uptime Kuma'],
         ['pipeline --status', '<span class="t-ok">✓ build  ✓ test  ✓ deploy</span> — production ready']
      ];
      var COMMANDS = {
         help: function () {
            return 'available: <b>whoami</b> · <b>experience</b> · <b>skills</b> · <b>projects</b> · <b>contact</b> · <b>resume</b> · <b>clear</b>';
         },
         whoami: function () { return intro[0][1]; },
         experience: function () {
            return '<b>' + esc(expExact) + '</b> in cloud &amp; devops<br>' +
               '<span class="t-ok">●</span> Quralyst AI <span class="dim">(Oct 2025 – present)</span><br>' +
               '○ Thinkbiz Technology <span class="dim">(Feb 2022 – Jul 2025)</span><br>' +
               '○ Genericure <span class="dim">(Jan 2020 – Nov 2020)</span>';
         },
         skills: function () {
            return 'aws  terraform  docker  ecs  ecr  codebuild  codedeploy  gitlab-ci  github-actions  cloudwatch  linux  bash  python';
         },
         projects: function () {
            setTimeout(function () { location.hash = '#projects'; }, 600);
            return 'quralyst-platform/  ecs-web-app/  uptime-kuma-monitoring/<br><span class="dim">→ opening #projects</span>';
         },
         contact: function () {
            return '<a href="mailto:girishburade@gmail.com">girishburade@gmail.com</a> · <a href="https://www.linkedin.com/in/girish-burade-895a75230/" target="_blank" rel="noopener">linkedin</a> · <a href="https://github.com/Girish7010" target="_blank" rel="noopener">github</a>';
         },
         resume: function () {
            var link = $('.js-resume-link');
            if (!link || link.closest('[hidden]') || link.hidden) return '<span class="t-warn">resume not available right now</span>';
            link.click();
            return '<span class="t-ok">✓</span> downloading resume.pdf';
         }
      };
      COMMANDS.ls = COMMANDS.projects;

      var addLine = function (html, cls) {
         var d = document.createElement('div');
         d.className = cls;
         d.innerHTML = html;
         term.appendChild(d);
         term.scrollTop = term.scrollHeight;
         return d;
      };
      var typeCommand = function (cmd, done) {
         var line = addLine(PROMPT, 't-line'), k = 0;
         var text = document.createTextNode('');
         var caret = document.createElement('span');
         caret.className = 'cursor';
         line.appendChild(text);
         line.appendChild(caret);
         (function next() {
            if (k <= cmd.length) {
               text.nodeValue = cmd.slice(0, k++);
               setTimeout(next, 38 + Math.random() * 45);
            } else {
               caret.remove();
               setTimeout(done, 220);
            }
         })();
      };
      var finishIntro = function () {
         addLine('<span class="dim">type <b>help</b> to explore</span>', 't-out');
         form.hidden = false;
      };

      if (reduceMotion) {
         intro.forEach(function (row) {
            addLine(PROMPT + esc(row[0]), 't-line');
            addLine(row[1], 't-out');
         });
         finishIntro();
      } else {
         var n = 0;
         (function run() {
            if (n >= intro.length) return finishIntro();
            var row = intro[n++];
            typeCommand(row[0], function () {
               addLine(row[1], 't-out');
               setTimeout(run, 260);
            });
         })();
      }

      form.addEventListener('submit', function (e) {
         e.preventDefault();
         var raw = input.value.trim();
         input.value = '';
         if (!raw) return;
         var cmd = raw.toLowerCase().split(/\s+/)[0];
         if (cmd === 'clear') { term.innerHTML = ''; return; }
         addLine(PROMPT + esc(raw), 't-line');
         var fn = COMMANDS[cmd];
         addLine(fn ? fn() : 'command not found: ' + esc(cmd) + ' <span class="dim">— try <b>help</b></span>', 't-out');
      });
   }
})();
