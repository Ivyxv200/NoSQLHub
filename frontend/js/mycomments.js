const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    window.location.href = "login.html";
}

let currentPage = 1;
const limit = 10;

loadMyComments(currentPage);

async function loadMyComments(page = 1) {
    try {
        currentPage = page;

        const response = await fetch(
            `http://localhost:3000/comment/user/mycomments?page=${currentPage}&limit=${limit}`,
            {
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();
        const comments = data.comments || [];

        const commentList = document.getElementById("commentList");
        const pagination = document.getElementById("mycommentsPagination");

        commentList.innerHTML = "";

        if (comments.length === 0) {
            commentList.innerHTML = `
                <div class="empty-text">
                    暂无评论
                </div>
            `;

            if (pagination) {
                pagination.innerHTML = "";
            }

            return;
        }

        comments.forEach(comment => {
            const postId = comment.postId ? comment.postId._id : "";

            commentList.innerHTML += `
                <div class="comment-wrapper">

                    <button
                        class="delete-btn"
                        onclick="
                            event.stopPropagation();
                            deleteComment('${comment._id}');
                        "
                    >
                        删除
                    </button>

                    <div
                        class="comment-card"
                        onclick="${
                            postId
                                ? `location.href='detail.html?id=${postId}'`
                                : `alert('原帖子已删除')`
                        }"
                    >

                        <div class="comment-content">

                            <h2>
                                ${
                                    comment.postId
                                        ? comment.postId.title
                                        : "帖子已删除"
                                }
                            </h2>

                            <p>
                                ${comment.content}
                            </p>

                            <div class="comment-info">
                                <span>
                                    所属帖子：
                                    ${
                                        comment.postId
                                            ? comment.postId.title
                                            : "帖子已删除"
                                    }
                                </span>
                            </div>

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

async function deleteComment(id) {
    if (!confirm("确定删除这条评论？")) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/comment/${id}`,
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

        alert(data.message || "删除成功");

        loadMyComments(currentPage);

    } catch(error) {
        console.error(error);
        alert("删除失败");
    }
}

function renderPagination(page, totalPages) {
    const pagination = document.getElementById("mycommentsPagination");

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
            onclick="loadMyComments(${page - 1})"
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
                onclick="loadMyComments(${i})"
            >
                ${i}
            </button>
        `;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page >= totalPages ? "disabled" : ""}
            onclick="loadMyComments(${page + 1})"
        >
            下一页
        </button>
    `;
}