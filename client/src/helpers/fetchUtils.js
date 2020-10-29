const fetchJson = (url) =>
  fetch(url).then(res => res.json());

export { fetchJson };