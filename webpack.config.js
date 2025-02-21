const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons']
    }
  }, argv);

  // Add this to fix MIME type issues
  config.devServer = {
    ...config.devServer,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/javascript'
    }
  };

  return config;
};
