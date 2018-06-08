exports.catch = async (func) => {
  try {
    await func();
  } catch(e) {
    return e;
  }
};

