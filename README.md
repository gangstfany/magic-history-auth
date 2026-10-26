# Magic History · 账号

只在本仓库修改登录、注册、Google 登录、找回密码、账号界面与认证回调。首页框架在 `gangstfany/magic-history-site`，课程内容在各自课程仓库。账号提交只发布本仓库；不会更新首页固定使用的账号版本。

## 本地运行与验证

```sh
node --test tests/*.test.mjs
python3 scripts/build.py
python3 -m http.server 8032 --directory _site
```

打开 `http://127.0.0.1:8032/`。无需 npm 安装；Node 22+、Python 3 即可。演示页使用既有真实认证服务，提交表单会执行相应账号操作。测试使用受控服务替身，不创建真实账号、不发送邮件。

GitHub Pages 使用 `.github/workflows/pages.yml`；仓库设置中的 Pages Source 应为 GitHub Actions。工作流仅由本仓库 main 提交或手动执行触发。

## 首页集成：固定提交的静态发布依赖

`auth-manifest.json` 的 `consumerFiles` 是唯一发布接口。首页构建检出明确的本仓库 commit SHA，验证该 SHA 后，将清单文件按原相对路径复制到首页发布目录。账号资产运行于首页的来源，不以跨来源 iframe 共享登录状态。不要从 main 浮动下载，也不要只加载账号域名下的脚本却遗漏回调与 SDK。

首页添加：

```html
<link rel="stylesheet" href="assets/auth/account.css">
<button type="button" class="account-trigger" data-account-trigger aria-haspopup="dialog">登录 / 注册</button>
<script type="module" src="assets/auth/account-bootstrap.mjs"></script>
```

清单同时包含 `auth-callback.html`、本地 Supabase SDK 与其 MIT 许可证。回调页面已移除不属于账号的 `assets/map-ui.css` 依赖，其余回调捕获与清除 URL、PKCE、返回 URL 校验保持原语义。回调基于实际承载页面的目录生成，因此首页发布地址应加入 Supabase Redirect URLs，而非假定账号仓库的 Pages 地址可代替首页地址。

预期页面地址（启用 Pages 后）：

- 账号演示：`https://gangstfany.github.io/magic-history-auth/`
- 演示回调：`https://gangstfany.github.io/magic-history-auth/auth-callback.html`
- 首页回调：`https://gangstfany.github.io/magic-history-site/auth-callback.html`

这些地址必须在现有 Supabase 项目的 Auth URL Configuration → Redirect URLs 中获准；若使用自定义域名或不同本地端口，也需要加入其完整回调地址。此迁移不改变项目、身份提供方配置、用户数据或数据库权限。未用真实凭证验证邮件/Google 的完整外部跳转，控制台白名单需管理员确认。

## 来源与配置边界

来源为原公开仓库 `https://github.com/gangstfany/magic-history`，世界史基线提交 `cd4401845ad5e688a0b33d930c61b8f3bcabb432` 中的 `assets/auth/`、`assets/vendor/`、`auth-callback.html` 与账号测试。本次保留原账号功能与公开浏览器配置，仅拆分发布边界、去除回调的首页样式依赖并增加独立演示/构建/清单。

`assets/auth/auth-config.mjs` 内为原项目 URL 和公开 publishable key，不是管理员密钥。不要提交 `.env`、服务端密钥、service_role key 或用户资料。Supabase SDK 为固定版本 2.118.0，其校验值、来源与 MIT 许可证见 `assets/vendor/README.md`。构建只复制明确列出的公开文件。
