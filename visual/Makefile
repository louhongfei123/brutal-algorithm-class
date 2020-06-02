clean:
	rm -rf dist

fmt:
	deno fmt src/*.ts

watch:
	$$(npm bin)/tsc -w

build: clean fmt
	$$(npm bin)/tsc
	find ./dist -name '*.js' -exec sed -i "s/\.ts/\.js/g" {} +

serve:
	$$(npm bin)/http-server
