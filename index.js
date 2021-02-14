// var types = require('@babel/types');

function isCreateElement(node) {
  return (
    node.callee.object &&
    node.callee.object.name === 'Elemental' &&
    node.callee.property.name === 'createElement'
  );
}

function isCreateComponent(tag) {
  return tag && tag.type === 'Identifier' && tag.loc;
}

function createFunction(t, name, args, blocks) {
  return t.functionDeclaration(
    name && t.identifier(name),
    (args && [...args]) || [],
    t.blockStatement([...blocks]),
  );
}

module.exports = function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        let [tag, props, ...children] = path.node.arguments;

        /**
         * Convert children to function
         */
        if (isCreateElement(path.node)) {
          if (children || children.length > 0)
            for (let i = 2; i < path.node.arguments.length; i++) {
              if (!t.isStatement(path.node.arguments[i])) {
                path.node.arguments[i] = createFunction(t, null, null, [
                  t.returnStatement(path.node.arguments[i]),
                ]);
              }
            }
        }

        /**
         * Convert Props to functions
         */
        if (isCreateComponent(tag)) {
          if (props && props.properties && props.properties.length > 0)
            for (let i = 0; i < props.properties.length; i++) {
              if (!t.isFunctionDeclaration(props.properties[i].value))
                props.properties[i].value = createFunction(t, null, null, [
                  t.returnStatement(props.properties[i].value),
                ]);
            }
        }
      },
    },
  };
};
