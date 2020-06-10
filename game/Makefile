clean:
	rm -rf dist

fmt:
	deno fmt src/

watch:
	$$(npm bin)/tsc -w

build: clean fmt
	mkdir dist
	deno bundle -c tsconfig.json src/entry/html.ts > dist/html.js
	cp src/entry/index.html dist/index.html
	make rename-ts-to-js

rename-ts-to-js:
	find ./dist -name '*.js' -exec sed -i "s/\.ts/\.js/g" {} +

serve:
	$$(npm bin)/http-server

game: fg
	deno run game/game.ts

lc:
	find ./src -name '*.ts' | xargs wc -l | sort -nr
