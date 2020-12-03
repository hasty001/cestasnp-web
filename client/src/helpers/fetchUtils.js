const fetchJson = (url) =>
  fetch(url).then(res => res.json())
  .then(res => { 
    if (res && res.error) {
      throw res.error;
    }
    return res;
  }).catch(error => Promise.reject(error));

const fetchPostJson = (url, data) => 
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(res => res.json())
  .then(res => { 
    if (res && res.error) {
      throw res.error;
    }
    return res;
  }).catch(error => Promise.reject(error));

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
      }).catch(error => Promise.reject(error));

export { fetchJson, fetchPostJson, fetchPostJsonWithToken };