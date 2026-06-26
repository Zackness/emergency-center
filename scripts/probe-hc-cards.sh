#!/usr/bin/env bash
curl -sL "https://www.huellascan.com/terremoto" -o /tmp/huellascan.html
grep -oE 'Motolito|Botitas|report[^"<>]{0,40}|pet_name|selectedReportId|earthquake/' /tmp/huellascan.html | sort -u | head -30
# sample card block
grep -n "Motolito" /tmp/huellascan.html | head -3
