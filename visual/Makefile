clean:
	rm -rf dist

fmt:
	deno fmt src/

watch:
	$$(npm bin)/tsc -w

build: clean fmt
	mkdir dist
	deno bundle -c tsconfig.json src/main.ts > dist/bundle.js
	find ./dist -name '*.js' -exec sed -i "s/\.ts/\.js/g" {} +

serve:
	$$(npm bin)/http-server

game: fmt
	deno run src/game.ts
