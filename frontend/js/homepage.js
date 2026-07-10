const postsContainer = document.getElementById("postsContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let nextCursor = null;
let hasMore = true;

loadHotPosts();
loadPosts();
loadSearchRank();

async function loadHotPosts() {
    try {
        const response = await fetch("http://localhost:3000/post/hot");
        const posts = await response.json();
        const hotList = document.querySelector(".hot-list");
        hotList.innerHTML = "";

        if (posts.length === 0) {
            hotList.innerHTML = `
                <div class="hot-card">
                    暂无热门帖子
                </div>
            `;
            return;
        }

        posts.forEach((post, index) => {
            let rankIcon = "④";
            if (index === 0) {
                rankIcon = "🥇";
            }
            if (index === 1) {
                rankIcon = "🥈";
            }
            if (index === 2) {
                rankIcon = "🥉";
            }
            hotList.innerHTML += `
                <div
                    class="hot-card"
                    onclick="location.href='detail.html?id=${post._id}'"
                >

                    <div class="hot-rank">
                        ${rankIcon}
                    </div>

                    <div class="hot-content">
                        <div class="hot-title">
                            ${post.title}
                        </div>

                        <div class="hot-view">
                            浏览量 ${post.views}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch(error) {
        console.error(
            "热门帖子加载失败",
            error
        );
    }
}

async function loadPosts() {
    try {
        let url = "http://localhost:3000/post?limit=10";
        if (nextCursor) {
            url += `&cursor=${nextCursor}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        const posts = data.posts;
        console.log("首页帖子数据：", posts);

        posts.forEach(post => {
            const tagsHtml = post.tags.map(tag => `<span class="tag home-tag">${tag}</span>`).join("");
            const imagesHtml =
                post.images &&
                post.images.length > 0
                    ? `
                        <div class="post-preview-images">
                            ${post.images.slice(0, 2).map(image => `
                                <img
                                    src="http://localhost:3000${image}"
                                    class="post-preview-image"
                                >
                            `).join("")}
                        </div>
                    `
                    : "";

            postsContainer.innerHTML += `
                <div
                    class="post-card"
                    onclick="window.location.href='detail.html?id=${post._id}'"
                >
                    <h3>${post.title}</h3>

                    <div class="post-tags">
                        ${tagsHtml}
                    </div>

                    <p>
                        ${post.content}
                    </p>

                    ${imagesHtml}

                    <div class="post-info">
                        <span>
                            作者：${post.author}
                        </span>

                        <span>
                            浏览量：${post.views}
                        </span>
                    </div>
                </div>
            `;
        });

        nextCursor = data.nextCursor;
        hasMore = data.hasMore;
        if (!hasMore) {
            loadMoreBtn.style.display = "none";
        }
    } catch(error) {
        console.error(error);
        postsContainer.innerHTML = "<p>帖子加载失败</p>";
    }
}

async function loadSearchRank() {
    try {
        const response = await fetch("http://localhost:3000/post/search-rank");
        const data = await response.json();
        const container = document.getElementById("searchRankList");
        container.innerHTML = "";
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="rank-item empty-rank">
                    暂无搜索记录
                </div>
            `;
            return;
        }

        data.slice(0, 3).forEach((item, index) => {
            let rankIcon = index + 1;
            if (index === 0) {
                rankIcon = "🥇";
            }
            if (index === 1) {
                rankIcon = "🥈";
            }
            if (index === 2) {
                rankIcon = "🥉";
            }

            container.innerHTML += `
                <div
                    class="rank-item"
                    onclick="location.href='search.html?keyword=${encodeURIComponent(item.keyword)}'"
                >
                    <span class="rank-keyword">
                        ${rankIcon} ${item.keyword}
                    </span>

                    <span class="rank-count">
                        搜索量：${item.count}
                    </span>
                </div>
            `;
        });
    } catch(error) {
        console.error("热门搜索加载失败", error);
    }
}

// 首页标签搜索
document.addEventListener(
    "click",
    (e) => {
        if (e.target.classList.contains("home-tag")) {
            e.stopPropagation();
            const keyword = e.target.textContent.trim();
            window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
        }
    }
);

loadMoreBtn.addEventListener(
    "click",
    () => {
        if (hasMore) {
            loadPosts();
        }
    }
);