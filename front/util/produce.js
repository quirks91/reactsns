import produce, { enableES5 } from 'immer';

export default (...args) => {
  enableES5();
  return produce(...args);
};

//인터넷 익스플로러 지원