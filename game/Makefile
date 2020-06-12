clean:
	rm -rf dist

fmt:
	deno fmt src/

watch:
	$$(npm bin)/tsc -w

rename-ts-to-js:
	find ./dist -name '*.js' -exec sed -i "s/\.ts/\.js/g" {} +

serve:
	$$(npm bin)/http-server

lc:
	find ./src -name '*.ts' | xargs wc -l | sort -nr
