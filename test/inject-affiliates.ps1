# Insert one finance affiliate placeholder per finance calculator page
$ErrorActionPreference = 'Stop'
$dir = "C:\Users\ian31\OneDrive\Desktop\New folder (2)"

$plan = @{
  'compound-interest-calculator.html' = @{
    anchor = 'compound interest calculator'
    placeholder = '<p class="affil-link-line">If you&rsquo;re starting to invest, <a href="#" data-affil="finance" data-affil-id="brokerage">compare brokerage sign-up bonuses here</a> &mdash; opening an account in minutes is what turns the calculator above into a real plan.</p>'
  }
  'savings-goal-calculator.html' = @{
    anchor = 'compound interest calculator'
    placeholder = '<p class="affil-link-line">Many readers use a <a href="#" data-affil="finance" data-affil-id="hysa">high-yield savings account</a> to earn a competitive return while saving toward their goal.</p>'
  }
  'retirement-calculator.html' = @{
    anchor = 'compound interest calculator'
    placeholder = '<p class="affil-link-line">Ready to start? <a href="#" data-affil="finance" data-affil-id="ira">Compare IRA providers and bonus offers here</a> before opening an account.</p>'
  }
  'roi-calculator.html' = @{
    anchor = 'compound interest calculator'
    placeholder = '<p class="affil-link-line">For investing the funds behind your ROI calculation, <a href="#" data-affil="finance" data-affil-id="brokerage">these brokerages offer low-fee accounts</a>.</p>'
  }
  'loan-payoff-calculator.html' = @{
    anchor = 'mortgage calculator'
    placeholder = '<p class="affil-link-line">Looking to consolidate a loan at a lower rate? <a href="#" data-affil="finance" data-affil-id="refinance">Compare personal loan refinance offers here</a>.</p>'
  }
  'mortgage-calculator.html' = @{
    anchor = 'loan payoff calculator'
    placeholder = '<p class="affil-link-line">Shopping for a mortgage? <a href="#" data-affil="finance" data-affil-id="lender">Compare mortgage lenders and lock in today&rsquo;s rate here</a>.</p>'
  }
  'credit-card-payoff-calculator.html' = @{
    anchor = 'avalanche'
    placeholder = '<p class="affil-link-line">If you carry a balance, a balance-transfer card can pause interest for up to ~18 months. <a href="#" data-affil="finance" data-affil-id="card">Compare balance-transfer cards here</a>.</p>'
  }
  'hourly-to-salary.html' = @{
    anchor = 'take-home'
    placeholder = '<p class="affil-link-line">Park your paycheck in a <a href="#" data-affil="finance" data-affil-id="hysa">high-yield checking or savings account</a> so idle cash earns interest.</p>'
  }
  'sales-tax-calculator.html' = @{ anchor = ''; placeholder = '' }
  'tip-calculator.html' = @{ anchor = ''; placeholder = '' }
  'percentage-calculator.html' = @{ anchor = ''; placeholder = '' }
  'unit-converter.html' = @{ anchor = ''; placeholder = '' }
  'bmi-calculator.html' = @{
    anchor = 'BMI doesn'
    placeholder = '<p class="affil-link-line">If your BMI number is higher than expected and you want a structured plan, the book <a href="https://www.amazon.com" data-affil="amazon">Bigger Leaner Stronger</a> is a popular, evidence-based starting point.</p>'
  }
  'calorie-calculator.html' = @{
    anchor = 'BMI calculator'
    placeholder = '<p class="affil-link-line">For tracking calories against your TDEE, <a href="https://www.amazon.com" data-affil="amazon">a kitchen food scale</a> removes the guesswork from portion sizes.</p>'
  }
}

foreach ($name in $plan.Keys) {
  $entry = $plan[$name]
  if (-not $entry.placeholder) { continue }
  $path = Join-Path $dir $name
  if (-not (Test-Path $path)) { Write-Output "skip (missing): $name"; continue }
  $c = Get-Content $path -Raw
  if ($c -match 'data-affil=') { Write-Output "skip (already has): $name"; continue }

  # Insert the placeholder right after the </p> that contains the anchor string
  if ($entry.anchor) {
    $needle = '</section>'
    $insertAt = $c.LastIndexOf($needle)
    if ($insertAt -lt 0) { Write-Output "no </section> in $name"; continue }
    $new = $c.Substring(0, $insertAt) + "`n      " + $entry.placeholder + "`n    " + $c.Substring($insertAt)
    Set-Content -Path $path -Value $new -NoNewline
    Write-Output ("inserted: " + $name)
  } else {
    Write-Output ("no anchor: " + $name)
  }
}
Write-Output "done"