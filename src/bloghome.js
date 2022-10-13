import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, query, getDoc, getDocs, orderBy } from "firebase/firestore";

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


function displayCard(blogData) {
  let articleCard = document.createElement('div');
  articleCard.classList.add('single-article');
  articleCard.classList.add('article-zoom');
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const blogPosts = query(collection(db, "blogposts"), orderBy("Date", "desc"));

const querySnapshot = await getDocs(blogPosts);
querySnapshot.forEach((doc)  => {
    displayCard(doc.data());
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
    while(currentArticles[0]) {
      currentArticles[0].remove();
    }
    querySnapshotTemp.forEach((doc)  => {
      displayCard(doc.data());
    });
  };
  if (sortType == "old") {
    let blogPostsTemp = query(collection(db, "blogposts"), orderBy("Date", "asc"));
    let querySnapshotTemp = await getDocs(blogPostsTemp);
    var currentArticles = document.getElementsByClassName('single-article');
    while(currentArticles[0]) {
      currentArticles[0].remove();
    }
    querySnapshotTemp.forEach((doc)  => {
      displayCard(doc.data());
    });
  };
};

window.sortArticles = sortArticles;
