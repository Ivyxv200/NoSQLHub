const token = localStorage.getItem("token");
const userId = new URLSearchParams(location.search).get("id");
const myUsername = localStorage.getItem("username");
let isFollowing = false;

if (!token) {
    alert("请先登录");
    window.location.href = "login.html";
}

loadUserInfo();
loadPosts();
checkFollowStatus();

async function loadUserInfo() {
    try {
        const response =  await fetch(
            `http://localhost:3000/user/${userId}`,
            {
                headers: {
                    authorization: token
                }
            }
        );

        const user = await response.json();
        document.getElementById("usernameText").textContent = user.username;
        document.getElementById("profileText").textContent = user.profile || "这个人很懒，还没有简介";
        document.getElementById("userAvatar").textContent = user.username.charAt(0).toUpperCase();
        document.getElementById("followingCount").textContent = user.followingCount;
        document.getElementById("followersCount").textContent = user.followersCount;
        const followBtn = document.getElementById("followBtn");
        if (user.username === myUsername) {
            followBtn.style.display = "none";
        }
    } catch(error) {
        console.error(error);
    }
}

async function loadPosts() {
    try {
        const response = await fetch(
            `http://localhost:3000/post/user/${userId}`,
            {
                headers: {
                    authorization: token
                }
            }
        );

        const posts = await response.json();
        const postsList = document.getElementById("postsList");
        postsList.innerHTML = "";

        posts.forEach(post => {
            postsList.innerHTML += `
                <div
                    class="post-item"
                    onclick="location.href='detail.html?id=${post._id}'"
                >

                    <h3>
                        ${post.title}
                    </h3>

                    <span>
                        浏览量：${post.views}
                    </span>
                </div>
            `;
        });
    } catch(error) {
        console.error(error);
    }
}

async function checkFollowStatus() {
    try {
        const response = await fetch(
            "http://localhost:3000/user/following",
            {
                headers: {
                    authorization: token
                }
            }
        );

        const following = await response.json();
        isFollowing = following.some(user => user._id === userId);

        const followBtn = document.getElementById("followBtn");
        if (isFollowing) {
            followBtn.textContent = "已关注";
            followBtn.classList.add("following");
        }
    } catch(error) {
        console.error(error);
    }
}

const followBtn = document.getElementById("followBtn");
followBtn.addEventListener(
    "click",
    toggleFollow
);

async function toggleFollow() {
    try {
        const url = isFollowing
            ? `http://localhost:3000/user/unfollow/${userId}`
            : `http://localhost:3000/user/follow/${userId}`;

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
        if (!response.ok) {
            alert(data.message);
            return;
        }

        isFollowing = !isFollowing;
        if (isFollowing) {
            followBtn.textContent = "已关注";
            followBtn.classList.add("following");
        }
        else {
            followBtn.textContent = "关注";
            followBtn.classList.remove("following");
        }
        loadUserInfo();
    } catch(error) {
        console.error(error);
    }
}