/* In-place copy editing for the local editing server. Never copied into dist/.
   Edited regions are serialized to the same vocabulary content/*.sexp uses,
   so the server validates browser input exactly as it validates a file. */

const INLINE = {
  STRONG: 'strong', B: 'b', EM: 'em', I: 'i',
  CODE: 'code', KBD: 'kbd', SPAN: 'span', A: 'a', BR: 'br'
};
const ATTRIBUTES = ['href', 'class', 'aria-hidden'];

/* ------------------------------------------------------------ serializing */

function literal(text){
  return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function attributes(element){
  const pairs = [];
  for (const name of ATTRIBUTES){
    const value = element.getAttribute(name);
    if (value) pairs.push(':' + name + ' ' + literal(value));
  }
  return pairs.length ? '(' + pairs.join(' ') + ')' : 'nil';
}

/* Unknown elements contribute their children, so pasted markup degrades to
   text rather than reaching the server as something it must reject. */
function serialize(parent){
  const out = [];
  for (const node of parent.childNodes){
    if (node.nodeType === Node.TEXT_NODE){
      const text = node.textContent.replace(/\s+/g, ' ');
      if (text) out.push(literal(text));
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const tag = INLINE[node.tagName];
    if (!tag){
      out.push(...serialize(node));
      continue;
    }
    const children = tag === 'br' ? [] : serialize(node);
    out.push('(:' + tag + ' ' + attributes(node) +
             (children.length ? ' ' + children.join(' ') : '') + ')');
  }
  return out;
}

function valueOf(field){
  if (field.dataset.editForm === 'sexp') return field.value;
  if (field.dataset.editForm === 'text') return '(' + literal(field.value) + ')';
  return '(' + serialize(field).join(' ') + ')';
}

/* ---------------------------------------------------------------- saving  */

const status = document.createElement('p');
status.className = 'edit-status';
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');
document.body.append(status);

let statusTimer;
function report(message, failed){
  status.textContent = message;
  status.classList.toggle('is-error', Boolean(failed));
  status.classList.add('is-shown');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove('is-shown'), failed ? 8000 : 2200);
}

const saved = new WeakMap();
const pending = new WeakMap();

/* Blur and Ctrl-S can both ask for the same field, so each field keeps one
   chain of requests rather than letting two writes race on one file. */
function save(field){
  const chain = (pending.get(field) || Promise.resolve()).then(() => send(field));
  pending.set(field, chain.catch(() => {}));
  return chain;
}

async function send(field){
  const value = valueOf(field);
  if (saved.get(field) === value) return;
  const body = new URLSearchParams({ copy: field.dataset.edit, value });
  let response;
  try {
    response = await fetch('/copy', { method: 'POST', body });
  } catch (error){
    report(`${field.dataset.edit}: ${error.message}`, true);
    return;
  }
  const text = (await response.text()).trim();
  if (response.ok){
    saved.set(field, value);
    field.classList.remove('is-dirty');
  }
  report(text, !response.ok);
}

function markDirty(field){
  field.classList.toggle('is-dirty', saved.get(field) !== valueOf(field));
}

function saveAll(){
  for (const field of document.querySelectorAll('[data-edit]')) save(field);
}

/* --------------------------------------------------------------- editing  */

function ancestorTag(node, tag){
  for (let current = node; current; current = current.parentNode){
    if (current.classList && current.classList.contains('edit-field')) return null;
    if (current.tagName === tag) return current;
  }
  return null;
}

function unwrap(element){
  const parent = element.parentNode;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  parent.removeChild(element);
  parent.normalize();
}

function selectContents(element){
  const selection = getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

/* Toggles TAG around the selection. surroundContents refuses a range that
   crosses an element boundary, so partial selections are rebuilt by hand. */
function toggleWrap(tag, href){
  const selection = getSelection();
  if (!selection.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  const existing = ancestorTag(range.commonAncestorContainer, tag.toUpperCase());
  if (existing && !href){
    unwrap(existing);
    return;
  }
  const element = document.createElement(tag);
  if (href) element.setAttribute('href', href);
  try {
    range.surroundContents(element);
  } catch {
    element.append(range.extractContents());
    range.insertNode(element);
  }
  element.normalize();
  selectContents(element);
}

function clearFormatting(){
  const selection = getSelection();
  if (!selection.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  const text = document.createTextNode(range.toString());
  range.deleteContents();
  range.insertNode(text);
  selection.removeAllRanges();
  const plain = document.createRange();
  plain.selectNode(text);
  selection.addRange(plain);
}

function insertAtCaret(node){
  const selection = getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function promptForLink(){
  const href = prompt('Link target, an https:// URL or a #anchor');
  if (href === null) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('#')) return trimmed;
  report('A link must start with https:// or #.', true);
  return null;
}

function onFieldKeydown(event){
  const field = event.currentTarget;
  if (event.key === 'Escape'){
    field.blur();
    return;
  }
  if (event.key === 'Enter'){
    event.preventDefault();
    insertAtCaret(document.createElement('br'));
    markDirty(field);
    return;
  }
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'b') toggleWrap('strong');
  else if (key === 'i') toggleWrap('em');
  else if (key === 'k'){
    const href = promptForLink();
    if (href) toggleWrap('a', href);
  }
  else if (key === '\\') clearFormatting();
  else return;
  event.preventDefault();
  markDirty(field);
}

function onFieldPaste(event){
  event.preventDefault();
  const text = event.clipboardData.getData('text/plain').replace(/\s+/g, ' ');
  insertAtCaret(document.createTextNode(text));
  markDirty(event.currentTarget);
}

/* Brand and navigation copy sits inside anchors, so a click to place the
   caret would otherwise navigate away from the page being edited. */
function onFieldClick(event){
  const anchor = event.currentTarget.closest('a');
  if (anchor) event.preventDefault();
}

function setupField(field){
  saved.set(field, valueOf(field));
  if (field.dataset.editForm){
    field.addEventListener('input', () => markDirty(field));
    field.addEventListener('blur', () => save(field));
    return;
  }
  field.contentEditable = 'true';
  field.spellcheck = true;
  field.addEventListener('keydown', onFieldKeydown);
  field.addEventListener('paste', onFieldPaste);
  field.addEventListener('click', onFieldClick);
  field.addEventListener('input', () => markDirty(field));
  field.addEventListener('blur', () => save(field));
}

for (const field of document.querySelectorAll('[data-edit]')) setupField(field);

addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'){
    event.preventDefault();
    saveAll();
  }
});

addEventListener('beforeunload', event => {
  if (!document.querySelector('[data-edit].is-dirty')) return;
  event.preventDefault();
  event.returnValue = '';
});

report(`Editing ${document.querySelectorAll('[data-edit]').length} copy fragments.`);
