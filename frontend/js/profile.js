const token = localStorage.getItem("token");
const profileText = document.getElementById("profileText");
const profileInput = document.getElementById("profileInput");
const editProfileBtn = document.getElementById("editProfileBtn");
let editing = false;
if (!token) {
    alert("请先登录");
    window.location.href = "login.html";
}

loadUserInfo();     // 加载个人资料
loadProfileData();  // 加载页面数据

async function loadUserInfo() {
    try {
        const response = await fetch(
            "http://localhost:3000/user/profile",
            {
                headers: {
                    authorization: token
                }
            }
        );

        const user = await response.json();
        document.getElementById("usernameText").textContent = user.username;
        const avatarBox = document.getElementById("userAvatar");
        if (user.avatar) {
            avatarBox.innerHTML = `
                <img
                    src="http://localhost:3000${user.avatar}"
                    class="avatar-image"
                >
            `;
        } else {
            avatarBox.textContent = user.username.charAt(0).toUpperCase();
        }
        profileText.textContent = user.profile || "这个人很懒，还没有填写个人简介。";
        document.getElementById("followingCount").textContent = user.followingCount;
        document.getElementById("followersCount").textContent = user.followersCount;
        const exp = user.exp || 0;
        const level = user.level || 1;
        const currentLevelExp = exp % 100;
        const progressPercent = currentLevelExp;
        document.getElementById("levelText").textContent = `Lv${level}`;
        document.getElementById("expText").textContent = `经验值：${currentLevelExp} / 100`;
        document.getElementById("expProgressBar").style.width = `${progressPercent}%`;
    } catch(error) {
        console.error(error);
    }
}

async function loadProfileData() {
    try {
        const postsResponse = await fetch(
            "http://localhost:3000/post/user/myposts",
            {
                headers: {
                    authorization: token
                }
            }
        );
        const posts = await postsResponse.json();

        const commentsResponse = await fetch(
            "http://localhost:3000/comment/user/mycomments",
            {
                headers: {
                    authorization: token
                }
            }
        );
        const comments = await commentsResponse.json();

        const likesResponse = await fetch(
            "http://localhost:3000/post/user/likes",
            {
                headers: {
                    authorization: token
                }
            }
        );
        const likes = await likesResponse.json(); 

        const favoritesResponse = await fetch(
            "http://localhost:3000/post/user/favorites",
            {
                headers: {
                    authorization: token
                }
            }
        );
        const favorites = await favoritesResponse.json();

        renderPosts(posts);
        renderComments(comments);
        document.getElementById("likesCount").textContent = Array.isArray(likes) ? likes.length : 0;
        document.getElementById("favoritesCount").textContent = Array.isArray(favorites) ? favorites.length : 0;
    } catch(error) {
        console.error(error);
    }
}

function renderPosts(posts) {

    const recentPosts =
        document.getElementById("recentPosts");

    recentPosts.innerHTML = "";

    if (posts.length === 0) {

        recentPosts.innerHTML = `
            <div class="post-item">
                暂无帖子
            </div>
        `;

        return;
    }

    posts.slice(0, 3).forEach(post => {
        recentPosts.innerHTML += `
            <div class="post-item">
                <h3>
                    ${post.title}
                </h3>

                <span>
                    浏览量：${post.views}
                </span>
            </div>
        `;
    });
}

function renderComments(comments) {

    const recentComments =
        document.getElementById("recentComments");

    recentComments.innerHTML = "";

    if (comments.length === 0) {

        recentComments.innerHTML = `
            <div class="comment-item">
                暂无评论
            </div>
        `;

        return;
    }

    comments.slice(0, 3).forEach(comment => {
        recentComments.innerHTML += `
            <div class="comment-item">
                ${comment.content}
            </div>
        `;
    });
}

// 退出登录按钮
const logoutBtn = document.getElementById("logoutBtn");

// 点击退出
logoutBtn.addEventListener(
    "click",
    () => {
        // 删除登录信息
        localStorage.removeItem("token");
        localStorage.removeItem("isLogin");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        alert("退出登录成功");
        window.location.href = "homepage.html";
    }
);

// 我的帖子
const mypostsCard = document.getElementById("mypostsCard");

// 点击跳转
mypostsCard.addEventListener(
    "click",
    () => {
        window.location.href = "myposts.html";
    }
);

// 我的评论
const mycommentsCard = document.getElementById( "mycommentsCard");

// 点击跳转
mycommentsCard.addEventListener(
    "click",
    () => {
        window.location.href = "mycomments.html";
    }
);

document.getElementById("followingStat").addEventListener(
    "click",
    () => {
        window.location.href = "following.html";
    }
);

document.getElementById("followersStat").addEventListener(
    "click",
    () => {
        window.location.href = "followers.html";
    }
);

document.getElementById("likesStat").addEventListener(
    "click",
    () => {
        window.location.href = "mylikes.html";
    }
);

document.getElementById("favoritesStat").addEventListener(
    "click",
    () => {
        window.location.href = "myfavorites.html";
    }
);

editProfileBtn.addEventListener(
    "click",
    async () => {
        if (!editing) {
            profileInput.value = profileText.textContent;
            profileText.style.display = "none";
            profileInput.style.display = "block";
            editProfileBtn.textContent = "保存简介";
            editing = true;
            return;
        }

        try {
            const response =
                await fetch(
                    "http://localhost:3000/user/profile",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: token
                        },
                        body: JSON.stringify({
                            profile: profileInput.value
                        })
                    }
                );

            const data = await response.json();
            if (!response.ok) {
                alert(data.message);
                return;
            }
            profileText.textContent = profileInput.value || "这个人很懒，还没有填写个人简介。";
            profileText.style.display = "block";
            profileInput.style.display = "none";
            editProfileBtn.textContent = "编辑简介";
            editing = false;
            alert("简介修改成功");
        } catch(error) {
            console.error(error);
            alert("简介修改失败");
        }
    }
);

const avatarInput = document.getElementById("avatarInput");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");

changeAvatarBtn.addEventListener(
    "click",
    () => {
        avatarInput.click();
    }
);

avatarInput.addEventListener(
    "change",
    uploadAvatar
);

async function uploadAvatar() {
    const file = avatarInput.files[0];
    if (!file) {
        return;
    }
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await fetch(
            "http://localhost:3000/user/avatar",
            {
                method: "PUT",
                headers: {
                    authorization: token
                },
                body: formData
            }
        );

        const data = await response.json();
        if (!response.ok) {
            alert(data.message);
            return;
        }
        const avatarBox = document.getElementById("userAvatar");
        avatarBox.innerHTML = `
            <img
                src="http://localhost:3000${data.avatar}"
                class="avatar-image"
            >
        `;
        alert("头像上传成功");
    } catch(error) {
        console.error(error);
        alert("头像上传失败");
    }
}