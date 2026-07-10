// 获取URL参数
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

console.log("当前URL：", window.location.href);
console.log("postId：", postId);

// 页面元素
const postTitle = document.getElementById("postTitle");
const authorName = document.getElementById("authorName");
const viewCount = document.getElementById("viewCount");
const likeCount = document.getElementById("likeCount");
const tagList = document.getElementById("tagList");
const postContent = document.getElementById("postContent");

const likeBtn = document.getElementById("likeBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const reportBtn = document.getElementById("reportBtn");

const commentText = document.getElementById("commentText");
const commentCounter = document.getElementById("commentCounter");
const commentBtn = document.getElementById("commentBtn");

// 状态
let isLiked = false;
let isFavorited = false;

// 初始化
init();

async function init() {
    await addView();
    await addHistory();
    await loadPost();
    await loadFavoriteStatus();
    await loadComments();
}

// 浏览量+1
async function addView() {
    try {
        await fetch(
            `http://localhost:3000/post/view/${postId}`,
            {
                method: "PUT"
            }
        );
    } catch (error) {
        console.error(error);
    }
}

// 增加浏览记录
async function addHistory() {
    const token = localStorage.getItem("token");
    if (!token) {
        return;
    }

    try {
        await fetch(
            `http://localhost:3000/post/history/${postId}`,
            {
                method:"PUT",
                headers:{
                    authorization: token
                }
            }
        );
    } catch(error){
        console.error(error);
    }
}

// 加载帖子
async function loadPost() {
    try {
        const response = await fetch(`http://localhost:3000/post/${postId}`);
        const post = await response.json();
        console.log("帖子数据:", post);
        console.log("authorId:", post.authorId);
        postTitle.textContent = post.title;
        authorName.innerHTML = `
            作者：
            <a
                href="author.html?id=${post.authorId}"
                class="author-link"
            >
                ${post.author}
            </a>
        `;

        viewCount.textContent = "浏览量：" + post.views;
        likeCount.textContent = "点赞：" + post.likes;
        postContent.textContent = post.content;

        // 图片显示
        const imageArea = document.getElementById("imageArea");

        imageArea.innerHTML = "";

        if (post.images && post.images.length > 0) {
            post.images.forEach(
                image => {
                    imageArea.innerHTML += `
                        <img
                            src="http://localhost:3000${image}"
                            class="detail-image"
                        >
                    `;
                }
            );
        }

        // 标签
        tagList.innerHTML = "";
        post.tags.forEach(
            tag => {
                tagList.innerHTML += `
                    <span
                        class="tag"
                        onclick="
                            location.href=
                            'search.html?keyword=${encodeURIComponent(tag)}'
                        "
                    >
                        ${tag}
                    </span>
                `;
            }
        );
        await checkLikeStatus();
    } catch(error) {
        console.error(error);
        alert("帖子加载失败");
    }
}

async function checkLikeStatus() {
    try {
        const response = await fetch(
            "http://localhost:3000/post/user/likes",
            {
                headers: {
                    authorization: localStorage.getItem("token")
                }
            }
        );

        const likes = await response.json();
        const liked = likes.some(post => post._id === postId);
        if (liked) {
            isLiked = true;
            likeBtn.classList.add("liked");
            likeBtn.textContent = "已点赞";
        }
    } catch(error) {
        console.error(error);
    }
}

// 加载收藏状态
async function loadFavoriteStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/post/user/favorites",
            {
                headers: {
                    authorization: token
                }
            }
        );
        const favorites = await response.json();
        isFavorited = favorites.some(post => post._id === postId);
        updateFavoriteButton();
    } catch(error) {
        console.error(error);
    }
}

// 更新收藏按钮样式
function updateFavoriteButton() {
    if (isFavorited) {
        favoriteBtn.classList.add("favorited");
        favoriteBtn.textContent = "已收藏";
    }
    else {
        favoriteBtn.classList.remove("favorited");
        favoriteBtn.textContent = "收藏";
    }
}

// 收藏/取消收藏
favoriteBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("请先登录");
        return;
    }

    try {
        let url = "";
        if (!isFavorited) {
            url = `http://localhost:3000/post/favorite/${postId}`;
        }
        else {
            url = `http://localhost:3000/post/unfavorite/${postId}`;
        }
        const response = await fetch(
            url,
            {
                method: "PUT",
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();
        if (response.ok) {
            isFavorited = !isFavorited;
            updateFavoriteButton();
        }
        else {
            alert(data.message);
        }
    } catch(error) {
        console.error(error);
        alert("收藏操作失败");
    }
});

// 举报帖子
reportBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("请先登录");
        return;
    }
    const reason = prompt("请输入举报原因：\n广告\n辱骂\n违法");
    if (!reason) {
        return;
    }
    if (!["广告", "辱骂", "违法"].includes(reason)) {
        alert("举报原因只能是：广告、辱骂、违法");
        return;
    }
    try {
        const response = await fetch(
            `http://localhost:3000/post/${postId}/report`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: token
                },
                body: JSON.stringify({
                    reason
                })
            }
        );
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error(error);
        alert("举报失败");
    }
});

// 加载评论
async function loadComments() {
    try {
        const response = await fetch(
            `http://localhost:3000/comment/${postId}`,
            {
                headers: {
                    authorization: localStorage.getItem("token") || ""
                }
            }
        );

        const comments = await response.json();
        const commentList = document.getElementById("commentList");
        commentList.innerHTML = "";

        // 递归渲染评论树
        function renderComments(parentId = null, level = 0) {
            return comments.filter(comment => {
                if (parentId === null) {
                    return (comment.parentComment === null);
                }
                return (String(comment.parentComment) === String(parentId));
            }).map(comment => {
                return `
                    <div
                        class="comment-card"
                        id="comment-${comment._id}"
                        style="margin-left:${level * 50}px"
                    >

                        <div class="comment-header">
                            <div class="comment-avatar">
                                ${comment.author.charAt(0).toUpperCase()}
                            </div>

                            <div class="comment-username">
                                ${comment.author}
                            </div>

                        </div>

                        <div class="comment-content">
                            ${comment.content}
                        </div>

                        <div class="comment-actions">

                            <button
                                class="${comment.isLiked ? "liked" : ""}"
                                onclick="toggleCommentLike('${comment._id}', ${comment.isLiked})"
                            >
                                👍 ${comment.likes}
                            </button>

                            <button onclick="showReplyBox('${comment._id}')">
                                回复
                            </button>

                        </div>

                        <div id="reply-${comment._id}">
                        </div>

                        ${renderComments(comment._id, level+1)}

                    </div>
                `;
            }).join("");
        }
        commentList.innerHTML = renderComments();
        scrollToTargetComment();
    } catch(error) {
        console.error(error);
    }
}

// 跳转到指定评论并高亮
function scrollToTargetComment() {
    const targetCommentId = new URLSearchParams(window.location.search).get("comment");
    if (!targetCommentId) {
        return;
    }

    setTimeout(() => {
        const target = document.getElementById(`comment-${targetCommentId}`);
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            target.classList.add("comment-highlight");
            setTimeout(() => {target.classList.remove("comment-highlight");}, 2000);
        }
    }, 300);
}

// 点赞帖子
likeBtn.addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("token");

        if (!isLiked) {
            const response = await fetch(
                `http://localhost:3000/post/like/${postId}`,
                {
                    method: "PUT",
                    headers: {
                        authorization: token
                    }
                }
            );

            const data = await response.json();
            likeCount.textContent = "点赞：" + data.likes;
            likeBtn.classList.add("liked");
            likeBtn.textContent = "已点赞";
            isLiked = true;
        }
        else {
            const response = await fetch(
                `http://localhost:3000/post/dislike/${postId}`,
                {
                    method: "PUT",
                    headers: {
                        authorization: token
                    }
                }
            );

            const data = await response.json();
            likeCount.textContent = "点赞：" + data.likes;
            likeBtn.classList.remove("liked");
            likeBtn.textContent = "点赞";
            isLiked = false;
        }
    } catch(error) {
        console.error(error);
    }

});

// 输入框字数限制
commentText.addEventListener("input", () => {
    const length = commentText.value.length;
    commentCounter.textContent = `${length}/300`;
    if (length >= 300) {
        commentCounter.style.color = "#ef4444";
    }
    else {
        commentCounter.style.color = "#94a3b8";
    }
});

// 发布评论
commentBtn.addEventListener("click", async () => {
    const content = document.getElementById("commentText").value;
    if (content.trim() === "") {
        alert("评论不能为空");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/comment",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({postId, content})
            }
        );

        const data = await response.json();
        if (response.ok) {
            document.getElementById("commentText").value = "";
            commentCounter.textContent = "0/300";
            await loadComments();
        }
        else {
            alert(data.message);
        }
    } catch(error) {
            console.error(error);
        }
    }
);

// 评论点赞/取消点赞
async function toggleCommentLike(commentId, isLiked) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("请先登录");
            return;
        }
        if (!isLiked) {
            await fetch(
                `http://localhost:3000/comment/like/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        authorization: token
                    }
                }
            );
        }
        else {
            await fetch(
                `http://localhost:3000/comment/dislike/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        authorization: token
                    }
                }
            );
        }
        await loadComments();
    } catch(error) {
        console.error(error);
    }
}

// 显示回复框
function showReplyBox(commentId) {
    const container = document.getElementById(`reply-${commentId}`);
    container.innerHTML = `
        <div class="reply-box">
            <textarea
                id="replyContent-${commentId}"
                placeholder="回复内容..."
            ></textarea>

            <button onclick="submitReply('${commentId}')">
                回复
            </button>
        </div>
    `;
}

// 提交回复
async function submitReply(commentId) {
    const content = document.getElementById(`replyContent-${commentId}`).value;
    if (content.trim() === "") {
        alert("回复不能为空");
        return;
    }

    try {
        await fetch(
            "http://localhost:3000/comment/reply",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({postId, parentComment: commentId, content})
            }
        );
        await loadComments();
    } catch(error) {
        console.error(error);
    }
}