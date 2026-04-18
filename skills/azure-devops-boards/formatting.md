# ADO Description Formatting Reference

Work item descriptions default to HTML. Can be switched to markdown via UI toggle (one-way, cannot switch back).

Pull request descriptions use markdown.

## Check format

Query the work item and look for `multilineFieldsFormat`:
- Missing or no `"System.Description": "markdown"` → use HTML
- `"System.Description": "markdown"` present → use markdown

## HTML format

ADO uses specific HTML patterns. The trailing spaces before closing tags are intentional.

### Paragraphs

```html
<div><span>First paragraph.</span> </div>
<div><br> </div>
<div><span>Second paragraph.</span> </div>
```

### Inline formatting

- Bold: `<span><b>text</b></span>`
- Italics: `<span><i>text</i></span>`
- Underline: `<span><u>text</u></span>`
- Strikethrough: `<strike>text</strike>`
- Font colour: `<span style="color:rgb(200, 38, 19) !important;">text</span>`
- Highlight: `<span style="background-color:rgb(255, 255, 0) !important;">text</span>`

Use `!important` on colour styles, otherwise ADO dark mode overrides them.

### Lists

Bullet lists use `<span>` inside `<li>`. Numbered lists do not.

```html
<ul>
  <li><span>First item</span> </li>
  <li><span>Second item</span> </li>
</ul>
<ol>
  <li>First item </li>
  <li>Second item </li>
</ol>
```

### Indentation

```html
<blockquote style="margin:0 0 0 40px;border:none;">
  <div><span>Indented once</span> </div>
</blockquote>
```

### Code blocks

```html
<pre><code><div>line1</div><div>line2</div><div>line3</div></code></pre>
```

### Mentions

- User: `<a href="#" data-vss-mention="version:2.0,{user-id}">@Name</a>`
- Work item: `<a href="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}/" data-vss-mention="version:1.0">#{id}</a>`
- PR: `<a href="/{org}/{project}/_git/{repo}/pullrequest/{id}" data-vss-mention="version:1.0" data-pr-title="{title}">PR {id}: {title}</a>`

### Images

```html
<div><img src="{attachment-url}" alt="{filename}"><br> </div>
```

### Links

```html
<a href="https://example.com" target=_blank rel="noopener noreferrer">https://example.com</a>
```

## Rich Links

Plain `#123` does not render as a clickable link in ADO descriptions. Use the rich link format.

Prefixes: `#1234` for work items, `!1234` for pull requests.

### Work item rich links

```html
<a href="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}/" data-vss-mention="version:1.0">#{id}</a>
```

### Pull request rich links

```html
<a href="/{org}/{project}/_git/{repo}/pullrequest/{id}" data-vss-mention="version:1.0" data-pr-title="{title}">!{id}</a>
```
