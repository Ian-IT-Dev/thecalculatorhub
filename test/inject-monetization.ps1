# Inject monetization infra into existing HTML pages
# Adds: integrations.js script, footer legal link block, ad slots, affiliate disclosure hook
$ErrorActionPreference = 'Stop'
$dir = "C:\Users\ian31\OneDrive\Desktop\New folder (2)"
$files = Get-ChildItem -Path $dir -Filter *.html | Where-Object {
  $_.Name -ne '404.html' -and $_.Name -ne 'privacy.html' -and $_.Name -ne 'terms.html' -and $_.Name -ne 'affiliate-disclosure.html' -and $_.Name -ne 'about.html' -and $_.Name -ne 'contact.html' -and $_.Name -ne 'content-template.html'
}

$footerLinks = @"
    <div class="footer-links">
      <a href="privacy.html">Privacy</a>
      <a href="terms.html">Terms</a>
      <a href="affiliate-disclosure.html">Affiliate Disclosure</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </div>
"@

foreach ($f in $files) {
  $c = Get-Content $f.FullName -Raw
  $orig = $c

  # 1. Add integrations.js script tag if missing (before </body>)
  if ($c -notmatch 'integrations\.js') {
    $c = $c -replace '</body>', "<script src=`"js/integrations.js`"></script>`n</body>"
  }

  # 2. Insert footer-links block right after opening <footer class="site-footer"> <div class="container">
  if ($c -notmatch 'footer-links') {
    $c = $c -replace '(<footer class="site-footer">\s*<div class="container">)', "`$1`n$footerLinks"
  }

  # 3. Calculator pages: add ad slots before the result div
  if ($f.Name -ne 'index.html') {
    if ($c -notmatch 'ad-slot') {
      $adHtml = '<div class="ad-slot" data-ad></div>'
      $c = $c -replace '<div id="result" class="result" data-result>', ($adHtml + "`n      <div id=`"result`" class=`"result`" data-result>")
    }
  }

  if ($c -ne $orig) {
    Set-Content -Path $f.FullName -Value $c -NoNewline
    Write-Output ("updated: " + $f.Name)
  }
}
Write-Output "done"