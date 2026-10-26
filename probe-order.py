import json, os, re, sys

root = sys.argv[1] if len(sys.argv) > 1 else ".next"
slug = sys.argv[2] if len(sys.argv) > 2 else "metallic-premium-white-board"
needle = "plusmark/products/" + slug
order = []
first = {}

def walk(d):
    for dirpath, _, files in os.walk(d):
        if "cache" in dirpath.split(os.sep):
            continue
        for f in files:
            if f.endswith((".js", ".html", ".rsc", ".txt")):
                yield os.path.join(dirpath, f)

for path in walk(root):
    try:
        s = open(path, encoding="utf-8", errors="ignore").read()
    except Exception:
        continue
    for m in re.finditer(re.escape(needle), s):
        after = s[m.end():m.end() + 4]
        g = re.match(r"/(\d+)", after)
        key = g.group(1) if g else "bare"
        if key not in first:
            first[key] = (path, m.start())
        if "[needle," not in s:
            pass
    # capture the gallery array literal order
    i = s.find('"' + needle + '/2"')
    if i != -1 and "array" not in order:
        seg = s[max(0, i - 400): i + 400]
        if seg.count(needle) >= 3:
            order.append((path, [ (re.search(r"/(\d+)?\"?$", x) or [None,'?'])[0] for x in [] ]))
            idxs = re.findall(re.escape(needle) + r'(/(\d+))?(?=[\"])', seg)
            order[-1] = (path, [ (n or "bare") for _, n in idxs ])

print("first occurrence per photo index:")
for k, v in sorted(first.items(), key=lambda kv: kv[1][1]):
    print("  %-5s @ %d  %s" % (k, v[1], v[0]))
print()
for path, seq in order[:3]:
    print("array order in", path)
    print("  ->", seq)
