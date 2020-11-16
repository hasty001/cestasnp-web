const fetchJson = (url) =>
  fetch(url).then(res => res.json())
  .then(res => { 
    if (res && res.error) {
      throw res.error;
    }
    return res;
  });

const fetchPostJsonWithToken = (user, url, data) => 
  user.getIdToken()
    .then(token => 
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        })
      })
      .then(res => res.json()))
      .then(res => { 
        if (res && res.error) {
          throw res.error;
        }
        return res;
      });

export { fetchJson, fetchPostJsonWithToken };