const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    window.location.href = "login.html";
}

let currentPage = 1;
const limit = 10;

loadHistory(currentPage);

async function loadHistory(page = 1) {
    try {
        currentPage = page;

        const response = await fetch(
            `http://localhost:3000/post/user/history?page=${currentPage}&limit=${limit}`,
            {
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();
        const posts = data.posts || [];

        const historyList = document.getElementById("historyList");
        const pagination = document.getElementById("historyPagination");

        historyList.innerHTML = "";

        if (posts.length === 0) {
            historyList.innerHTML = `
                <div class="empty-text">
                    暂无浏览历史
                </div>
            `;

            if (pagination) {
                pagination.innerHTML = "";
            }

            return;
        }

        posts.forEach(post => {
            historyList.innerHTML += `
                <div class="history-wrapper">

                    <button
                        class="delete-btn"
                        onclick="
                            event.stopPropagation();
                            deleteHistory('${post._id}');
                        "
                    >
                        删除
                    </button>

                    <div
                        class="history-card"
                        onclick="location.href='detail.html?id=${post._id}'"
                    >
                        <h2>
                            ${post.title}
                        </h2>

                        <p>
                            ${post.content}
                        </p>

                        <div class="history-info">
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

                </div>
            `;
        });

        renderPagination(data.page, data.totalPages);

    } catch(error) {
        console.error(error);
    }
}

async function deleteHistory(postId) {
    try {
        const response = await fetch(
            `http://localhost:3000/post/history/${postId}`,
            {
                method: "DELETE",
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "删除失败");
            return;
        }

        loadHistory(currentPage);

    } catch(error) {
        console.error(error);
        alert("删除失败");
    }
}

function renderPagination(page, totalPages) {
    const pagination = document.getElementById("historyPagination");

    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    if (!totalPages || totalPages <= 1) {
        return;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page <= 1 ? "disabled" : ""}
            onclick="loadHistory(${page - 1})"
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
                onclick="loadHistory(${i})"
            >
                ${i}
            </button>
        `;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page >= totalPages ? "disabled" : ""}
            onclick="loadHistory(${page + 1})"
        >
            下一页
        </button>
    `;
}