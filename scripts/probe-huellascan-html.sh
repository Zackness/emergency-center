#!/usr/bin/env bash
curl -sL "https://www.huellascan.com/terremoto" -o /tmp/huellascan.html
echo "size=$(wc -c < /tmp/huellascan.html)"
echo "media urls=$(grep -o 'https://media.huellascan.com/uploads/earthquake/[^"]*' /tmp/huellascan.html | wc -l)"
echo "Perdido count=$(grep -c 'Perdido' /tmp/huellascan.html)"
echo "Encontrado count=$(grep -c 'Encontrado' /tmp/huellascan.html)"
grep -o 'wire:snapshot="[^"]*"' /tmp/huellascan.html | head -c 500
echo ""
grep -o 'wire:id="[^"]*"' /tmp/huellascan.html | head -5
