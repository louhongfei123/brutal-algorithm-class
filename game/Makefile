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

test:
	$$(npm bin)/mocha -r ts-node/register src/**/*_test.ts --timeout 20 --slow 10 --check-leaks
