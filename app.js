// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = '0d80318b5a2a479aaf6f668b8275a998';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(category = 'general', cb) {
      http.get(`${apiUrl}/top-headlines?country=us&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

//Elements
const form = document.forms['newsControls'],
  categorySelect = form.elements['category'],
  searchInput = form.elements['search'];

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
  searchInput.value = '';
});

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

//Load News Function
function loadNews() {
  showLoader();
  const category = categorySelect.value,
    searchText = searchInput.value;
  if (!searchText) {
    newsService.topHeadlines(category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

//Function on get response on server
function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }
  if (!res.articles.length) {
    showAlert('Sorry, no news available', 'error-msg');
    return;
  }
  renderNews(res.articles);
}

//Function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });
  newsContainer.insertAdjacentHTML('afterbegin', fragment);

  const imgList = document.querySelectorAll('.card-image img');
  imgList.forEach(img => {
    img.onerror = () => img.setAttribute('src', 'https://www.andromo.com/blog/wp-content/uploads/2020/12/news-1.jpg');
  });
}

//Function clear container
function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//News item template function
function newsTemplate({ urlToImage, title, url, description }) {
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage === null ? 'https://www.andromo.com/blog/wp-content/uploads/2020/12/news-1.jpg' : urlToImage}">
        <span class="card-title">${title || ''}</span>
      </div>
      <div class="card-content">
        <p>${description || ''}</p>
      </div>
      <div class="card-action">
      <a href="${url}">Read more</a>
      </div>
    </div>
  </div>
`;
}

function showAlert(msg, type = '') {
  M.toast({ html: msg, classes: type });
}

//Show loader function
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin',
    `
  <div class="progress">
  <div class="indeterminate"></div>
</div>
`);
}

//Remove loader function
function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}