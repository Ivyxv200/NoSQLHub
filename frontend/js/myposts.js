const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

let currentPage = 1;
const limit = 10;

loadMyPosts(currentPage);

// 加载我的帖子
async function loadMyPosts(page = 1) {

    currentPage = page;

    try {

        const response = await fetch(
            `http://localhost:3000/post/user/myposts?page=${currentPage}&limit=${limit}`,
            {
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();

        const posts = data.posts || [];

        const postList = document.getElementById("postList");

        postList.innerHTML = "";

        if (posts.length === 0) {

            postList.innerHTML = `
                <div class="empty-text">
                    暂无帖子
                </div>
            `;

            renderPagination(1, 1);

            return;
        }

        posts.forEach(post => {

            postList.innerHTML += `

                <div class="mypost-card">

                    <div
                        class="post-content"
                        onclick="location.href='detail.html?id=${post._id}'"
                    >

                        <h2>
                            ${post.title}
                        </h2>

                        <p>
                            ${post.content}
                        </p>

                        ${
                            post.images &&
                            post.images.length > 0
                                ? `
                                    <div class="mypost-images">

                                        ${post.images.map(image => `

                                            <img
                                                class="mypost-image"
                                                src="http://localhost:3000${image}"
                                            >

                                        `).join("")}

                                    </div>
                                `
                                : ""
                        }

                        <div class="post-info">

                            <span>
                                浏览量：${post.views}
                            </span>

                            <span>
                                点赞：${post.likes}
                            </span>

                            <span>
                                发布时间：
                                ${new Date(post.createdAt).toLocaleString()}
                            </span>

                        </div>

                    </div>

                    <div class="post-actions">

                        <button
                            class="edit-btn"
                            onclick="
                                event.stopPropagation();
                                location.href='editPost.html?id=${post._id}'
                            "
                        >
                            编辑
                        </button>

                        <button
                            class="delete-btn"
                            onclick="
                                event.stopPropagation();
                                deletePost('${post._id}')
                            "
                        >
                            删除
                        </button>

                    </div>

                </div>

            `;

        });

        renderPagination(data.page, data.totalPages);

    } catch(error) {

        console.error(error);

    }

}


// 删除帖子
async function deletePost(id) {

    if (!confirm("确定删除该帖子？")) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/post/${id}`,
            {
                method: "DELETE",
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();

        alert(data.message);

        loadMyPosts(currentPage);

    } catch(error) {

        console.error(error);

    }

}


// 分页
function renderPagination(page, totalPages) {

    const pagination =
        document.getElementById("mypostsPagination");

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === 1 ? "disabled" : ""}
            onclick="loadMyPosts(${page - 1})"
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
                onclick="loadMyPosts(${i})"
            >
                ${i}
            </button>
        `;

    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === totalPages ? "disabled" : ""}
            onclick="loadMyPosts(${page + 1})"
        >
            下一页
        </button>
    `;

}