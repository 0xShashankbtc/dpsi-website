import re

with open('overleaf/main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

begins = re.findall(r'\\begin\{([a-zA-Z*]+)\}', content)
ends = re.findall(r'\\end\{([a-zA-Z*]+)\}', content)

print(f'Total \\begin: {len(begins)}, Total \\end: {len(ends)}')
has_mismatch = False
for b in sorted(set(begins)):
    bc = begins.count(b)
    ec = ends.count(b)
    if bc != ec:
        print(f'MISMATCH for environment {b}: {bc} begins vs {ec} ends')
        has_mismatch = True
    else:
        print(f'  Environment {b:20}: {bc} balanced')

if not has_mismatch:
    print('SUCCESS: All LaTeX environments are perfectly balanced!')
