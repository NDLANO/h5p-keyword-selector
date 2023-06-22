# H5P Keyword

Active Reader is an H5P-component, giving users a central knowledge base which utilizes the [H5P Framework](https://github.com/h5p)

This allows users to select keywords from the content

## Getting started

Grab all the modules:

```bash
npm install
```

Development and watch:

```bash
npm run watch
```

Build project:

```bash
npm run build
```

## Additional information

If you have reviewed closesly at the `semantics.json` file I have added additional key which is not mentioned in the H5P official documentation. The key looks like this

```bash
"addButton": "generateKeywords"
```

and

```bash
"addButton": "addKeywords"
```

The pourpose of this additional key-value pair helps [h5p-editor-keyword-extractor](https://github.com/NDLANO/h5p-editor-keyword-extractor) to locate where to put button to generate keywords or add custom keyword.

`"addButton": "generateKeywords"` - This key-pair adds "Generate Keyword" button in editor which will automatically extract keywords from the text block and add to the list

`"addButton": "addKeywords"` - This key-pair adds "Add Keyword" button in editor which will allow users to add custom keyword into the list
