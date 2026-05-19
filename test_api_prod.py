#!/usr/bin/env python3
import urllib.request
import json

url = 'https://painel-projetos-ppi.vercel.app/api/favorites'

try:
    print(f"Testing: GET {url}")
    resp = urllib.request.urlopen(url, timeout=20)
    print(f"Status: {resp.getcode()}")
    data = json.loads(resp.read().decode('utf-8'))
    print(f"Response: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
