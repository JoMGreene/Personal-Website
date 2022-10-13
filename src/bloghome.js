import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, query, getDoc, getDocs, orderBy, QueryDocumentSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBS5GpAyEE6LlJZwZeePGKUwfsrY4UJgJo",
  authDomain: "jgreenedev-web.firebaseapp.com",
  databaseURL: "https://jgreenedev-web-default-rtdb.firebaseio.com",
  projectId: "jgreenedev-web",
  storageBucket: "jgreenedev-web.appspot.com",
  messagingSenderId: "501758675327",
  appId: "1:501758675327:web:5153f273809790ebb5724a",
  measurementId: "G-DFRFZP9JR1"
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function displayCard(blogData) {
  let articleCard = document.createElement('div');
  articleCard.id = blogData['PageName'];
  articleCard.classList.add('single-article');
  articleCard.classList.add('article-zoom');
  articleCard.classList.add('fade-in');
  articleCard.innerHTML = `
  <a class="article-layout" href="blogpages/${blogData['PageName']}.html">
    <img class="card-image" src="./blogpages/blogimgs/${blogData['ImageName']}">
    <h1> ${blogData['Post Title']} </h1>
    <p> ${blogData['Summary']} </p>
    <p class="date-tag"> ${blogData['Date']} </p>
  </a>
  `;

  let blogSection = document.getElementById('blog-card');
  blogSection.appendChild(articleCard);
};

function removeFadeIn() {
  let fadeIns = document.getElementsByClassName('fade-in');
  for(let i = 0; i < fadeIns.length + 1; i++) {
    fadeIns[i].classList.remove('fade-in');
  };
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const blogPosts = query(collection(db, "blogposts"), orderBy("Date", "desc"));

var querySnapshot = await getDocs(blogPosts);
querySnapshot.forEach((doc)  => {
    displayCard(doc.data());
    setTimeout(function() {removeFadeIn()}, 1000);
});

let resizeTimer;
window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});

async function sortArticles(sortType) {
  if (sortType == "new") {
    let blogPostsTemp = query(collection(db, "blogposts"), orderBy("Date", "desc"));
    let querySnapshotTemp = await getDocs(blogPostsTemp);
    var currentArticles = document.getElementsByClassName('single-article');
    for (let x = 0; x < currentArticles.length; x++) {
      currentArticles[x].classList.add('fade-out');
    };
    await sleep(900);
    while(currentArticles[0]) {   
      currentArticles[0].remove();
    };
    querySnapshotTemp.forEach((doc)  => {
      displayCard(doc.data());
      setTimeout(function() {removeFadeIn()}, 1000);
    });
  };
  if (sortType == "old") {
    let blogPostsTemp = query(collection(db, "blogposts"), orderBy("Date", "asc"));
    let querySnapshotTemp = await getDocs(blogPostsTemp);
    var currentArticles = document.getElementsByClassName('single-article');
    for (let x = 0; x < currentArticles.length; x++) {
      currentArticles[x].classList.add('fade-out');
    };
    await sleep(900);
    while(currentArticles[0]) {
      currentArticles[0].remove();
    }
    querySnapshotTemp.forEach((doc)  => {
      displayCard(doc.data());
      setTimeout(function() {removeFadeIn()}, 1000);
    });
  };
};

window.sortArticles = sortArticles;
