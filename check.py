import urllib.request, re
html = urllib.request.urlopen('https://vaultview-deception.vercel.app/').read().decode('utf-8')
js_file = re.search(r'src="(/assets/index-.*?\.js)"', html).group(1)
js_content = urllib.request.urlopen('https://vaultview-deception.vercel.app' + js_file).read().decode('utf-8')
print('API URL in bundle:', 'adaptive-deception-system.onrender.com' in js_content)
