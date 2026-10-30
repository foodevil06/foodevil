# Poly Haven / any .gltf + .bin -> one small .glb without textures, for the flat toon look (colours are set in code).
#   python scripts/gltf_flat.py <in.gltf> <out.glb>
import json, os, struct, sys

src, dst = sys.argv[1:3]
g = json.load(open(src))
binp = os.path.join(os.path.dirname(src), g['buffers'][0]['uri'])
data = open(binp, 'rb').read()
for k in ('images', 'textures', 'samplers'): g.pop(k, None)
for m in g.get('materials', []):
    pbr = m.get('pbrMetallicRoughness', {})
    for k in ('baseColorTexture', 'metallicRoughnessTexture'): pbr.pop(k, None)
    for k in ('normalTexture', 'occlusionTexture', 'emissiveTexture'): m.pop(k, None)
g['buffers'] = [{'byteLength': len(data)}]
js = json.dumps(g, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4); data += b'\0' * (-len(data) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(data)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(data), 0x004E4942) + data
open(dst, 'wb').write(out)
print('ok', dst, len(out) // 1024, 'KB', [m.get('name') for m in g.get('materials', [])])
