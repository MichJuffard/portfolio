import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateShell, parseShell, flattenShell } from '../src/lib/minishell-demo.ts';
const last = result => result.steps.at(-1);

test('AND and OR have equal precedence and associate left to right', () => {
  const tree = parseShell('true || false && echo suite');
  assert.equal(tree.type, '&&'); assert.equal(tree.left.type, '||');
  assert.equal(last(simulateShell('true || false && echo suite')).stdout, 'suite\n');
});

test('a failed AND skips its right subtree and the OR takes the fallback', () => {
  const result = simulateShell('return 1 && echo ignore || echo secours');
  assert.equal(result.code, 0); assert.equal(last(result).stdout, 'secours\n');
  const ignored = flattenShell(result.tree).find(n => n.words?.some(w => w.raw === 'ignore'));
  assert.equal(last(result).states[ignored.id], 'skipped');
  assert.equal(last(result).codes[ignored.id], undefined);
});

test('a successful OR skips the entire right subtree including writes', () => {
  const result = simulateShell('true || (echo non > absent && echo non)');
  assert.equal(last(result).stdout, '');
  assert.equal(last(result).files['/portfolio/absent'], undefined);
});

test('pipelines feed stdout rightward and return the right command status', () => {
  const result = simulateShell('cat projets.txt | grep miniRT | wc -l');
  assert.equal(last(result).stdout, '1\n'); assert.equal(result.code, 0);
  assert.equal(simulateShell('false | true').code, 0);
  assert.equal(simulateShell('true | false').code, 1);
});

test('output, append and input redirections use only virtual files', () => {
  const result = simulateShell('echo salut > msg && echo suite >> msg && cat < msg');
  assert.equal(last(result).stdout, 'salut\nsuite\n');
  assert.equal(last(result).files['/portfolio/msg'], 'salut\nsuite\n');
  const multiple = last(simulateShell('echo salut > a > b'));
  assert.equal(multiple.files['/portfolio/a'], '');
  assert.equal(multiple.files['/portfolio/b'], 'salut\n');
});

test('input errors skip the command and select an OR fallback', () => {
  const result = simulateShell('cat < absent || echo secours');
  assert.equal(result.code, 0); assert.equal(last(result).stdout, 'secours\n');
  assert.match(last(result).stderr, /introuvable/);
});

test('quotes preserve operators and expansion boundaries', () => {
  assert.equal(last(simulateShell('echo "a && b | c"')).stdout, 'a && b | c\n');
  assert.equal(last(simulateShell('echo "$HOME"x')).stdout, '/portfoliox\n');
  assert.equal(last(simulateShell("echo '$HOME'")).stdout, '$HOME\n');
  assert.equal(last(simulateShell('return 7 || echo $?')).stdout, '7\n');
  assert.equal(last(simulateShell('echo \\$HOME')).stdout, '$HOME\n');
});

test('parentheses isolate cd and pipelines isolate their working directories', () => {
  assert.equal(last(simulateShell('(cd /) && pwd')).stdout, '/portfolio\n');
  assert.equal(last(simulateShell('cd / | pwd')).stdout, '/portfolio\n');
  assert.equal(last(simulateShell('cd projets && pwd')).stdout, '/portfolio/projets\n');
});

test('unknown commands return 127 and preserve conditional semantics', () => {
  const result = simulateShell('inconnue || echo secours');
  assert.equal(result.code, 0); assert.match(last(result).stderr, /non prise en charge/);
  assert.equal(last(result).stdout, 'secours\n');
});

test('invalid syntax and unsupported substitutions produce readable errors', () => {
  for (const input of ['', 'echo "ouvert', 'true &&', 'echo >', '(true', 'echo $(pwd)', 'echo "$(pwd)"', 'cat << EOF', 'true ; false']) {
    assert.throws(() => simulateShell(input), Error, input);
  }
  assert.throws(() => simulateShell('true && '.repeat(40) + 'true'), /31|éléments|512/);
});

test('trace snapshots stay immutable as execution proceeds', () => {
  const result = simulateShell('echo salut > msg && cat msg');
  assert.equal(result.steps[0].files['/portfolio/msg'], undefined);
  assert.deepEqual(result.steps[0].states, {});
  assert.equal(last(result).files['/portfolio/msg'], 'salut\n');
});
