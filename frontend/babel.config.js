module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      // Add a custom plugin to provide PlatformConstants
      function() {
        return {
          visitor: {
            MemberExpression(path) {
              if (
                path.node.object.name === 'TurboModuleRegistry' &&
                path.node.property.name === 'getEnforcing' &&
                path.parent.arguments &&
                path.parent.arguments[0] &&
                path.parent.arguments[0].value === 'PlatformConstants'
              ) {
                const t = require('@babel/types');
                path.parentPath.replaceWith(
                  t.memberExpression(
                    t.identifier('global'),
                    t.identifier('PlatformConstants')
                  )
                );
              }
            },
          },
        };
      },
      'react-native-reanimated/plugin',
    ],
  };
}; 