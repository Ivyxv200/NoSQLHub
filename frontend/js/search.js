const params = new URLSearchParams(window.location.search);
const keyword = params.get("keyword") || "";

let currentPage = Number(params.get("page")) || 1;
const limit = 10;

const searchTitle = document.getElementById("searchTitle");
const userResultList = document.getElementById("userResultList");
const searchResultList = document.getElementById("searchResultList");
const pagination = document.getElementById("pagination");

if (searchTitle) {
    searchTitle.textContent = `搜索结果：${keyword}`;
}

loadSearchResults(currentPage);

async function loadSearchResults(page) {
    try {
        currentPage = page;

        const response = await fetch(
            `http://localhost:3000/post/search?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&limit=${limit}`
        );

        const data = await response.json();

        // 搜索用户
        const userResponse = await fetch(
            `http://localhost:3000/user/search?keyword=${encodeURIComponent(keyword)}`
        );

        const users = await userResponse.json();

        renderUserResults(users);
        renderSearchResults(data.posts || []);
        renderPagination(data.page, data.totalPages);

    } catch(error) {
        console.error(error);
    }
}

function renderSearchResults(posts) {
    searchResultList.innerHTML = "";

    if (!posts || posts.length === 0) {
        searchResultList.innerHTML = `
            <div class="empty-result">
                没有找到相关帖子
            </div>
        `;
        return;
    }

    posts.forEach(post => {
        searchResultList.innerHTML += `
            <div
                class="result-card"
                onclick="location.href='detail.html?id=${post._id}'"
            >
                <h2>
                    ${post.title}
                </h2>

                <p>
                    ${post.content}
                </p>

                ${
                    post.images && post.images.length > 0
                        ? `
                            <div class="result-images">
                                ${post.images.map(image => `
                                    <img
                                        class="result-image"
                                        src="http://localhost:3000${image}"
                                    >
                                `).join("")}
                            </div>
                        `
                        : ""
                }

                <div class="result-info">
                    <span>
                        作者：${post.author}
                    </span>

                    <span>
                        浏览量：${post.views}
                    </span>

                    <span>
                        点赞：${post.likes}
                    </span>
                </div>
            </div>
        `;
    });
}

function renderPagination(page, totalPages) {
    pagination.innerHTML = "";

    if (!totalPages || totalPages <= 1) {
        return;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page <= 1 ? "disabled" : ""}
            onclick="goToPage(${page - 1})"
        >
            上一页
        </button>
    `;

    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (page <= 3) {
        endPage = Math.min(5, totalPages);
    }

    if (page >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `
            <button
                class="page-btn ${i === page ? "active" : ""}"
                onclick="goToPage(${i})"
            >
                ${i}
            </button>
        `;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page >= totalPages ? "disabled" : ""}
            onclick="goToPage(${page + 1})"
        >
            下一页
        </button>
    `;
}

function goToPage(page) {
    currentPage = page;

    const newUrl =
        `search.html?keyword=${encodeURIComponent(keyword)}&page=${currentPage}`;

    history.pushState(null, "", newUrl);

    loadSearchResults(currentPage);
}

function renderUserResults(users) {

    userResultList.innerHTML = "";

    if (!users || users.length === 0) {
        userResultList.innerHTML = `
            <div class="empty-result">
                没有找到相关用户
            </div>
        `;
        return;
    }

    users.forEach(user => {
        userResultList.innerHTML += `
            <div
                class="user-result-card"
                onclick="location.href='author.html?id=${user._id}'"
            >

                <div class="user-avatar-small">
                    ${
                        user.avatar ? `<img src="http://localhost:3000${user.avatar}">` : user.username.charAt(0).toUpperCase()
                    }
                </div>

                <div class="user-info">

                    <h3>
                        ${user.username}
                    </h3>

                    <p>
                        ${user.profile || "这个人很懒，还没有填写简介。"}
                    </p>

                    <div class="user-stats-line">
                        粉丝：${user.followersCount}
                        &nbsp;&nbsp;
                        帖子：${user.postsCount}
                    </div>

                </div>
            </div>
        `;
    });
}