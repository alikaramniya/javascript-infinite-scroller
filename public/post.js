"use strict";

let content = document.getElementById("content");
let search = document.getElementById("search");
let [oldSearch, timer] = [null, null];
let path;
let lastPageUrl;
let pageNumber = 1;
let havePages = true;
let stateSendRequest = true;
let requestIsRunning = false;
let showLoading = true;

search.addEventListener("input", function () {
    let searchValue = this.value.trim();

    if (timer) {
        clearTimeout(timer);
    }

    timer = setTimeout(() => {
        if (searchValue !== oldSearch) {
            oldSearch = searchValue;

            sendRequest(searchValue);
        }
    }, 500);
});

async function sendRequest(search) {
    pageNumber = 1;

    content.innerHTML = ``;

    content.innerHTML += `
        <div class="text-center">
            <div class="spinner-border" role="status">
            </div>
        </div>
    `;

    if (requestIsRunning) {
        return;
    }

    requestIsRunning = true;

    let response = await fetch(
        `http://localhost:8000/post/list?search=${search}`
    );

    if (response.ok) {
        content.innerHTML = "";

        let res = await response.json();

        if (res.data.length) {
            stateSendRequest = true;

            havePages = true;

            requestIsRunning = false;

            path = res.path;

            lastPageUrl = res.last_page_url;

            renderListPosts(res.data);
        } else if (!res.data.length && search) {
            requestIsRunning = false;
            removeLoading();

            content.innerHTML += `
                <div class="card text-bg-dark mb-3">
                    <div class="card-body">
                        <h5 class="card-title">موردی برای جستجوی شما یافت نشد</h5>
                    </div>
                </div>
            `;
        } else {
            requestIsRunning = false;
            removeLoading();
        }
    } else {
        console.log(response.status);
    }
}

function renderListPosts(data) {
    removeLoading();

    data.forEach((post) => {
        content.innerHTML += `
            <div class="card text-bg-dark mb-3">
                <div class="card-body">
                    <h5 class="card-title">${post.title}</h5>
                    <p class="card-text">${post.body}</p>
                </div>
            </div>
        `;
    });

    if (pageNumber > 1) {
        document.documentElement.scrollBy({
            top: 150,
            behavior: "smooth",
        });
    }

    showLoading = true;
}

function showNextPage() {
    showLoading = false;
    if (requestIsRunning) {
        return;
    }

    // چک کردن وجود در اخرین صفحه
    let currentPageUrl = `${path}?page=${pageNumber}`;

    if (stateSendRequest) {
        if (lastPageUrl === currentPageUrl) {
            havePages = false;
            stateSendRequest = false;
        }

        if (havePages) {
            ++pageNumber;

            getNextPage(currentPageUrl);
        } else {
            removeLoading();

            stateSendRequest = false;
            content.innerHTML += `
                <div class="card text-bg-dark mb-3">
                    <div class="card-body">
                        <h5 class="card-title">اتمام</h5>
                    </div>
                </div>
            `;

            document.documentElement.scrollBy({
                top: 100,
                behavior: "smooth",
            });
        }
    }
}

async function getNextPage(url) {
    if (requestIsRunning) {
        return;
    }

    requestIsRunning = true;
    let response = await fetch(url);

    if (response.ok) {
        renderListPosts((await response.json()).data);
    } else {
        console.log(response.status);
    }

    requestIsRunning = false;
}

window.addEventListener("scroll", function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 250) {
        if (showLoading) {
            content.innerHTML += `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                    </div>
                </div>
            `;
        }
        showNextPage();
    }
});

function removeLoading() {
    let loading = content.querySelector(".text-center");
    if (loading) {
        content.removeChild(loading);
    }
}
