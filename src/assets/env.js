(function (window) {
  window.__env = window.__env || {};
  // window.__env.apiUrl = `https://${window.location.hostname}:7218/api/`;
  window.__env.apiUrl = "http://localhost:5144/api/";
  window.__env.imgUrl = "http://localhost:5144/";

  // window.__env.apiUrl = `http://localhost:5079/api/`;

  http: window.__env.enableDebug = true;
  window.__env.uiVersion = "0.0.1.7";
})(this);
