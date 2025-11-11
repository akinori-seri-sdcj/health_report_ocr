### 確認方法（Vercelダッシュボード）
- **デプロイ詳細で確認**  
  1) プロジェクト → Deployments → 対象デプロイをクリック  
  2) 画面上部または「Source」欄にコミットが表示（例: `b1773cd`）  
  3) コミットのリンクをクリックするとGitHubでフルSHAを確認可能  
  4) 表示が短縮（7桁）でも、リンク先で40桁のフルSHAを照合できます

- **一覧からの素早い確認**  
  Deployments一覧にコミットメッセージと短縮ハッシュが併記されるので、対象デプロイを開かずに目視で確認→詳細で最終照合。

### 確認方法（GitHub）
- **リポジトリのコミット一覧**  
  1) GitHub → 対象リポジトリ → Commits  
  2) `b1773cd`のコミットを探し、コミットページでフルSHAをコピー  
  3) Vercelに表示される短縮ハッシュと一致することを確認

### 確認方法（ローカル／PowerShell）
- **現在のHEADが`b1773cd`か確認**
```powershell
git rev-parse --short HEAD
git log -1 --oneline
```

- **リモート(main)側に`b1773cd`があるか確認**
```powershell
git fetch origin
git log --oneline origin/main -n 50
```
上記に`b1773cd`が含まれていればOK。

短い要点
- Vercelのデプロイ詳細「Source」欄で短縮ハッシュを確認し、リンク先GitHubでフルSHAを照合。  
- ローカルは`git rev-parse --short HEAD`、リモートは`git log --oneline origin/main`で確認。