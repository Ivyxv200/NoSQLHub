// 获取帖子ID
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

// 页面元素
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const tagOptions = document.querySelectorAll(".tag-option");

// 标签点击
tagOptions.forEach(tag => {
    tag.addEventListener("click", () => {
        const selectedTags = document.querySelectorAll(".tag-option.selected");
        if (!tag.classList.contains("selected") && selectedTags.length >= 3) {
            alert("最多只能选择3个标签");
            return;
        }
        tag.classList.toggle("selected");
    });
});

// 初始化
loadPost();

// 加载原帖子
async function loadPost() {
    try {
        const response = await fetch(`http://localhost:3000/post/${postId}`);
        const post = await response.json();
        titleInput.value = post.title;
        contentInput.value = post.content;

        // 自动选中原来的标签
        tagOptions.forEach(tag => {
            const tagName = tag.textContent.trim();
            if (post.tags.includes(tagName)) {
                tag.classList.add("selected");
            }
        });
    } catch(error) {
        console.error(error);
        alert("帖子加载失败");
    }
}

// 保存修改
saveBtn.addEventListener("click", async () => {
    const title = titleInput.value;
    const content = contentInput.value;
    const tags = Array.from(document.querySelectorAll(".tag-option.selected")).map(tag => tag.textContent.trim());
    if (title.trim() === "" || content.trim() === "") {
        alert("标题和内容不能为空");
         return;
    }
    if (tags.length === 0) {
        alert("请至少选择一个标签");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/post/${postId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags
                })
            }
        );
        const data = await response.json();
        if (response.ok) {
            alert("修改成功");
            window.location.href = "myposts.html";
        }
        else {
            alert(data.message);
        }

    } catch(error) {
        console.error(error);
        alert("修改失败");
    }
});

// 取消修改

cancelBtn.addEventListener("click", () => {
    const confirmCancel = confirm("确定放弃本次修改吗？");
    if (confirmCancel) {
         window.location.href = "myposts.html";
    }
});