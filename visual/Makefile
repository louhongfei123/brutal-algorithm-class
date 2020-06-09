clean:
	rm -rf dist

fmt:
	deno fmt src/

watch:
	$$(npm bin)/tsc -w

build: clean fmt
	mkdir dist
	deno bundle -c src/tsconfig.json src/main.ts > dist/bundle.js
	find ./dist -name '*.js' -exec sed -i "s/\.ts/\.js/g" {} +

serve:
	$$(npm bin)/http-server

fg:
	deno fmt game/

game: fg
	deno run game/game.ts

in = ./game
lc:
	find $(in) -name '*.*' | xargs wc -l | sort -nr
