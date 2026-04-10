$uri = "https://bwddfoqaqgrbendjgchr.supabase.co/functions/v1/chat"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZGRmb3FhcWdyYmVuZGpnY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjY4NzQsImV4cCI6MjA4MzkwMjg3NH0.oQLjkXCHpOIrd4ZKOcOX3MEbWmtWosOOqGRTsNTjHsk"
$headers = @{
    "Authorization" = "Bearer $anonKey"
    "apikey" = $anonKey
    "Content-Type" = "application/json"
}
$body = '{"message":"hello","region":"all","history":[]}'
Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
