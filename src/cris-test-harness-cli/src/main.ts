import cli from './cli';

export const start = async () => {
  const yargsArgs = cli();
};

try {
  start();
} catch (error) {
  console.error(error);
}