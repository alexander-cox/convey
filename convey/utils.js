exports.setQueryObject = (req) => {
  const queryString = req.url.split('?')[1];
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach((pair) => {
      const [key, value] = pair.split('=');
      req.query[key] = value;
    });
  }
};
