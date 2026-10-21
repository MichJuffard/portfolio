/** Educational interpreter: never invokes a shell, eval, network or host filesystem. */
export interface Word { raw: string; parts: { text: string; expand: boolean }[] }
type Operator = '&&' | '||' | '|' | '<' | '>' | '>>';
export interface ShellNode { id: number; type: 'cmd' | Operator; words?: Word[]; file?: Word; left?: ShellNode; right?: ShellNode; grouped?: boolean }
type Token = { op: string } | { word: Word };
export type NodeState = 'active' | 'done' | 'skipped';
export interface ShellStep { node: number; message: string; states: Record<number, NodeState>; codes: Record<number, number>; stdout: string; stderr: string; files: Record<string, string> }
export interface ShellDemo { tree: ShellNode; steps: ShellStep[]; code: number }
const OPERATORS = ['&&', '||', '>>', '<<', '|', '<', '>', '(', ')'];
function tokenize(source: string): Token[] {
  if (!source.trim()) throw new Error('Saisissez une commande.');
  if (source.length > 512) throw new Error('Limitez la commande à 512 caractères pour garder l’arbre lisible.');
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    if (/\s/.test(source[i])) { i++; continue; }
    const op = OPERATORS.find(op => source.startsWith(op, i));
    if (op) { if (op === '<<') throw new Error('Les heredocs ne sont pas simulés. Essayez une redirection < ou un pipe.'); tokens.push({ op }); i += op.length; continue; }
    const start = i, parts: Word['parts'] = [];
    while (i < source.length && !/\s/.test(source[i]) && !OPERATORS.some(op => source.startsWith(op, i))) {
      const char = source[i];
      if (char === ';' || char === '&' || char === '`') throw new Error('Cette démo accepte &&, ||, |, les parenthèses et les redirections. Les substitutions et tâches en arrière-plan ne sont pas simulées.');
      if (char === '$' && source[i + 1] === '(') throw new Error('La substitution $(...) n’est pas simulée.');
      if (char === "'" || char === '"') {
        const quote = source[i++]; let text = '';
        parts.push({ text: '', expand: false });
        while (i < source.length && source[i] !== quote) {
          if (quote === '"' && (source[i] === '`' || source.startsWith('$(', i))) throw new Error('Les substitutions de commandes ne sont pas simulées.');
          if (quote === '"' && source[i] === '\\' && ['$', '"', '\\'].includes(source[i + 1])) {
            if (text) { parts.push({ text, expand: true }); text = ''; }
            parts.push({ text: source[++i], expand: false }); i++;
          } else text += source[i++];
        }
        if (i === source.length) throw new Error('Un guillemet est ouvert : terminez la chaîne avant de lancer la commande.');
        i++; parts.push({ text, expand: quote === '"' });
        parts.push({ text: '', expand: false });
      } else if (char === '\\') {
        if (++i >= source.length) throw new Error('Ajoutez un caractère après le caractère d’échappement.');
        parts.push({ text: source[i++], expand: false });
      } else { parts.push({ text: source[i++], expand: true }); }
    }
    // Merge adjacent expansion fragments so $HOME and $? are read as complete expressions.
    const merged: Word['parts'] = [];
    for (const part of parts) {
      const previous = merged.at(-1);
      if (previous && previous.expand === part.expand) previous.text += part.text;
      else merged.push({ ...part });
    }
    tokens.push({ word: { raw: source.slice(start, i), parts: merged } });
    if (tokens.length > 96) throw new Error('La commande contient trop d’éléments pour cet explorateur.');
  }
  return tokens;
}
export function parseShell(source: string): ShellNode {
  const tokens = tokenize(source);
  let cursor = 0, id = 0;
  const make = (node: Omit<ShellNode, 'id'>): ShellNode => {
    if (++id > 31) throw new Error('Limitez l’arbre à 31 nœuds pour garder un affichage lisible.');
    return { id, ...node };
  };
  const op = () => { const token = tokens[cursor]; return token && 'op' in token ? token.op : undefined; };
  function unit(): ShellNode {
    let node: ShellNode | undefined;
    const words: Word[] = [], redirects: { type: '<' | '>' | '>>'; file: Word }[] = [];
    if (op() === '(') {
      cursor++; node = logical();
      if (op() !== ')') throw new Error('Il manque une parenthèse fermante.');
      cursor++; node.grouped = true;
    }
    while (cursor < tokens.length) {
      const token = tokens[cursor];
      if ('word' in token && !node) { words.push(token.word); cursor++; }
      else if (['<', '>', '>>'].includes(op() ?? '')) {
        const type = op() as '<' | '>' | '>>'; cursor++;
        const file = tokens[cursor++];
        if (!file || !('word' in file)) throw new Error('Une redirection doit être suivie d’un nom de fichier.');
        redirects.push({ type, file: file.word });
      } else break;
    }
    if (!node && !words.length) throw new Error('Une commande est attendue à cet endroit.');
    node ??= make({ type: 'cmd', words });
    // First redirection stays outermost, preserving left-to-right file opening order.
    for (const redir of redirects.reverse()) node = make({ type: redir.type, file: redir.file, left: node });
    return node;
  }
  function pipeline(): ShellNode {
    let left = unit();
    while (op() === '|') { cursor++; left = make({ type: '|', left, right: unit() }); }
    return left;
  }
  function logical(): ShellNode {
    let left = pipeline();
    while (op() === '&&' || op() === '||') {
      const type = op() as '&&' | '||'; cursor++; left = make({ type, left, right: pipeline() });
    }
    return left;
  }
  const tree = logical();
  if (cursor !== tokens.length) throw new Error('Syntaxe inattendue. Vérifiez les opérateurs et les parenthèses.');
  return tree;
}
export const nodeLabel = (node: ShellNode) => node.type === 'cmd' ? node.words!.map(w => w.raw).join(' ') : node.file ? `${node.type} ${node.file.raw}` : node.type;
export function flattenShell(node: ShellNode): ShellNode[] {
  return [node, ...(node.left ? flattenShell(node.left) : []), ...(node.right ? flattenShell(node.right) : [])];
}
interface Context { cwd: string; last: number; files: Record<string, string> }
function pathOf(path: string, cwd: string): string {
  const parts: string[] = [];
  for (const part of (path.startsWith('/') ? path : `${cwd}/${path}`).split('/')) {
    if (part === '..') parts.pop(); else if (part && part !== '.') parts.push(part);
  }
  return '/' + parts.join('/');
}
function expand(word: Word, context: Context): string {
  return word.parts.map(part => part.expand ? part.text.replace(/\$\?|\$[A-Za-z_][A-Za-z0-9_]*/g, name => {
    if (name === '$?') return String(context.last);
    return ({ HOME: '/portfolio', PWD: context.cwd, USER: 'visiteur' } as Record<string, string>)[name.slice(1)] ?? '';
  }) : part.text).join('');
}
interface Result { code: number; out: string; error: string }
function command(words: Word[], input: string, ctx: Context): Result {
  const [name, ...args] = words.map(word => expand(word, ctx));
  const result = (code = 0, out = '', error = ''): Result => ({ code, out, error });
  const read = (paths: string[]) => paths.length ? paths.map(path => {
    const key = pathOf(path, ctx.cwd);
    if (!(key in ctx.files)) throw new Error(`${path} : fichier virtuel introuvable`);
    return ctx.files[key];
  }).join('') : input;
  try {
    switch (name) {
      case 'echo': return result(0, (args[0] === '-n' ? args.slice(1).join(' ') : args.join(' ') + '\n'));
      case 'true': return result();
      case 'false': return result(1);
      case 'return': {
        if (args[0] && !/^-?\d+$/.test(args[0])) return result(2, '', 'return : un entier est attendu\n');
        return result(Number(((BigInt(args[0] ?? '0') % 256n) + 256n) % 256n));
      }
      case 'pwd': return result(0, ctx.cwd + '\n');
      case 'cd': {
        const destination = pathOf(args[0] ?? '/portfolio', ctx.cwd);
        if (!['/', '/portfolio', '/portfolio/projets'].includes(destination)) return result(1, '', `cd : ${args[0]} : dossier virtuel introuvable\n`);
        ctx.cwd = destination; return result();
      }
      case 'ls': {
        if (args.length > 1 || args[0]?.startsWith('-')) return result(2, '', 'ls : utilisez ls [dossier], sans options dans cette démo\n');
        const directory = pathOf(args[0] ?? '.', ctx.cwd);
        if (!['/', '/portfolio', '/portfolio/projets'].includes(directory)) return result(1, '', `ls : ${directory} : dossier virtuel introuvable\n`);
        const prefix = directory === '/' ? '/' : directory + '/';
        const names = [...new Set([...Object.keys(ctx.files), '/portfolio/projets'].filter(path => path.startsWith(prefix) && path !== directory).map(path => path.slice(prefix.length).split('/')[0]))];
        return result(0, names.length ? names.join('\n') + '\n' : '');
      }
      case 'cat': return result(0, read(args));
      case 'grep': {
        if (!args.length || args[0].startsWith('-')) return result(2, '', 'grep : utilisez grep "texte littéral" [fichier]\n');
        const content = read(args.slice(1));
        const matches = content.split('\n').filter((line, i, all) => (i < all.length - 1 || line !== '') && line.includes(args[0]));
        return result(matches.length ? 0 : 1, matches.length ? matches.join('\n') + '\n' : '');
      }
      case 'wc': {
        if (!['-l', '-w', '-c'].includes(args[0])) return result(2, '', 'wc : utilisez -l, -w ou -c\n');
        const content = read(args.slice(1));
        const count = args[0] === '-l' ? (content.match(/\n/g) ?? []).length : args[0] === '-w' ? content.trim().split(/\s+/).filter(Boolean).length : new TextEncoder().encode(content).length;
        return result(0, `${count}\n`);
      }
      case 'tr': {
        if (args.join(' ') === 'a-z A-Z') return result(0, input.replace(/[a-z]/g, c => c.toUpperCase()));
        if (args.join(' ') === 'A-Z a-z') return result(0, input.replace(/[A-Z]/g, c => c.toLowerCase()));
        return result(2, '', 'tr : conversions a-z A-Z ou A-Z a-z disponibles\n');
      }
      default: return result(127, '', `${name} : commande non prise en charge dans la démo\n`);
    }
  } catch (error) { return result(1, '', `${name} : ${(error as Error).message}\n`); }
}
export function simulateShell(source: string): ShellDemo {
  const tree = parseShell(source);
  const context: Context = { cwd: '/portfolio', last: 0, files: {
    '/portfolio/README.md': 'Bienvenue dans Minishell\n',
    '/portfolio/projets.txt': 'Minishell\nWebserv\nminiRT\n',
  } };
  const states: Record<number, NodeState> = {}, codes: Record<number, number> = {};
  const steps: ShellStep[] = [];
  let stdout = '', stderr = '';
  const event = (node: ShellNode, message: string) => steps.push({ node: node.id, message,
    states: { ...states }, codes: { ...codes }, stdout, stderr, files: { ...context.files } });
  const skip = (node: ShellNode, message: string) => {
    for (const child of flattenShell(node)) states[child.id] = 'skipped';
    event(node, message);
  };
  function run(node: ShellNode, input = '', visible = true, ctx = context, isolated = false): Result {
    if (node.grouped && !isolated) {
      const result = run(node, input, visible, { ...ctx, files: ctx.files }, true);
      ctx.last = result.code;
      return result;
    }
    states[node.id] = 'active'; event(node, `Visite du nœud ${nodeLabel(node)}.`);
    let res: Result;
    if (node.type === 'cmd') {
      res = command(node.words!, input, ctx);
      if (visible) stdout += res.out;
      stderr += res.error;
    } else if (node.type === '&&' || node.type === '||') {
      const left = run(node.left!, input, visible, ctx);
      const executeRight = node.type === '&&' ? left.code === 0 : left.code !== 0;
      event(node, `La branche gauche renvoie ${left.code} : ${executeRight ? 'on visite' : 'on ignore'} la branche droite de ${node.type}.`);
      if (executeRight) {
        const right = run(node.right!, input, visible, ctx);
        res = { code: right.code, out: left.out + right.out, error: '' };
      } else {
        skip(node.right!, `Court-circuit : ${nodeLabel(node.right!)} n’est pas exécuté.`);
        res = left;
      }
    } else if (node.type === '|') {
      event(node, 'Pipe : la sortie gauche devient l’entrée droite. Le parcours est illustré séquentiellement ; le programme C utilise des processus distincts.');
      const left = run(node.left!, input, false, { ...ctx, files: ctx.files });
      event(node, `Transmission de ${new TextEncoder().encode(left.out).length} octets vers la branche droite.`);
      res = run(node.right!, left.out, visible, { ...ctx, files: ctx.files });
    } else {
      const file = pathOf(expand(node.file!, ctx), ctx.cwd);
      if (node.type === '<') {
        if (!(file in ctx.files)) {
          stderr += `${file} : fichier virtuel introuvable\n`;
          skip(node.left!, 'La redirection d’entrée échoue : la commande n’est pas exécutée.');
          res = { code: 1, out: '', error: '' };
        } else {
          event(node, `Le fichier virtuel ${file} devient l’entrée standard.`);
          res = run(node.left!, ctx.files[file], visible, ctx);
        }
      } else {
        if (node.type === '>') ctx.files[file] = ''; else ctx.files[file] ??= '';
        event(node, `Ouverture de ${file} ${node.type === '>>' ? 'en ajout' : 'en écriture (contenu remplacé)'}.`);
        const child = run(node.left!, input, false, ctx);
        ctx.files[file] += child.out;
        res = { code: child.code, out: '', error: '' };
      }
    }
    ctx.last = res.code; codes[node.id] = res.code; states[node.id] = 'done';
    event(node, `Retour du nœud ${nodeLabel(node)} avec le statut ${res.code}.`);
    return res;
  }
  event(tree, 'Arbre construit. L’exécution commence à la racine.');
  const result = run(tree);
  return { tree, steps, code: result.code };
}
