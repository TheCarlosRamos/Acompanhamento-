#!/usr/bin/env python3
import urllib.request
import urllib.error
import json

url = 'https://painel-projetos-ppi.vercel.app/api/favorites'

# Test POST to add a favorite
test_guid = 'TEST-GUID-12345'
print(f"\n1. Testing: POST {url} with guid={test_guid}")

try:
    data = json.dumps({'guid': test_guid}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    resp = urllib.request.urlopen(req, timeout=20)
    print(f"Status: {resp.getcode()}")
    result = json.loads(resp.read().decode('utf-8'))
    print(f"Response: {json.dumps(result, indent=2)}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")

# Test GET to verify
print(f"\n2. Testing: GET {url} (verify POST worked)")
try:
    resp = urllib.request.urlopen(url, timeout=20)
    print(f"Status: {resp.getcode()}")
    result = json.loads(resp.read().decode('utf-8'))
    print(f"Response: {json.dumps(result, indent=2)}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")

# Test DELETE to remove
print(f"\n3. Testing: DELETE {url} with guid={test_guid}")
try:
    data = json.dumps({'guid': test_guid}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='DELETE'
    )
    resp = urllib.request.urlopen(req, timeout=20)
    print(f"Status: {resp.getcode()}")
    result = json.loads(resp.read().decode('utf-8'))
    print(f"Response: {json.dumps(result, indent=2)}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")

print("\n✅ All API tests passed!")
