const STORE_NAME = 'FigmaToReactStore';
const STORE_WIDTH = 500;
const STORE_HEIGHT = 140;
const SPACE = 40;

const TEXT_STORE_NAME = 'JsonStore';

figma.showUI(__html__, { width: 310, height: 580 });

const onSelectionChange = () => {
  const {
    currentPage: { selection },
  } = figma;
  const node = selection && selection.length > 0 ? selection[0] : null;

  let settings = null;
  if (node) {
    const { id, name } = node;

    const text = figma.currentPage.getPluginData(TEXT_STORE_NAME);
    const json = text ? JSON.parse(text) : {};

    settings = {
      id,
      name,
      ...json[id],
    };
  }

  figma.ui.postMessage({ type: 'selectionChange', settings });
};

const getStoreNode = () => {
  const {
    currentPage: { children },
  } = figma;

  let store = children.find(({ name }) => name === STORE_NAME);
  if (!store) {
    const zeroPosition =
      children.length > 0
        ? {
            x: children[0].x,
            y: children[0].y,
          }
        : { x: 0, y: 0 };

    const leftTop = children.reduce(
      (res, child) => ({
        x: Math.min(res.x, child.x),
        y: Math.min(res.y, child.y),
      }),
      zeroPosition,
    );

    store = figma.createFrame();
    store.name = STORE_NAME;
    store.resize(STORE_WIDTH, STORE_HEIGHT);
    store.x = leftTop.x;
    store.y = leftTop.y - STORE_HEIGHT - SPACE;
    store.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    const note = figma.createText();
    note.name = 'Frame description';
    figma.loadFontAsync({ family: 'Roboto', style: 'Regular' }).then(() => {
      note.fontSize = 40;
      note.characters =
        'Do NOT delete this frame!!!\nfigma-to-react-plugin uses it\nto store configs';
    });

    store.appendChild(note);

    store.locked = true;
    figma.currentPage.insertChild(0, store);
  }

  return store;
};

const getStoreTextNode = async () => {
  const store: FrameNode = getStoreNode() as FrameNode;

  let textNode = store.children.find(
    ({ name, type }) => name === TEXT_STORE_NAME && type === 'TEXT',
  );

  if (!textNode) {
    textNode = figma.createText();
    textNode.name = TEXT_STORE_NAME;
    textNode.visible = false;
    textNode.locked = false;

    store.appendChild(textNode);
  }

  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });

  return textNode as TextNode;
};

onSelectionChange();
figma.on('selectionchange', onSelectionChange);

figma.ui.onmessage = async ({ type, state }) => {
  if (type === 'set-state') {
    const text = figma.currentPage.getPluginData(TEXT_STORE_NAME);
    const json = text ? JSON.parse(text) : {};

    const {
      id,
      dontExport,
      skipChildren,
      fullWidth,
      fullHeight,
      componentName,
      componentPath,
      exportAs,
      extendMode,
      extendImport,
      extendComponent,
      hocImport,
      hocCode,
    } = state;

    if (!id) {
      return;
    }

    json[id] = {
      dontExport,
      skipChildren,
      fullWidth,
      fullHeight,
      componentName,
      componentPath,
      exportAs: exportAs !== 'class' ? exportAs : undefined,
      extend:
        extendMode !== 'none'
          ? {
              mode: extendMode,
              import: extendImport,
              component: extendComponent,
            }
          : undefined,
      hoc: hocCode
        ? {
            import: hocImport,
            code: hocCode,
          }
        : undefined,
    };

    const jsonText = JSON.stringify(json);
    figma.currentPage.setPluginData(TEXT_STORE_NAME, jsonText);

    const textNode: TextNode = await getStoreTextNode();
    textNode.characters = jsonText;
  }
};
