let imageUrls = [];

// JWT检查
const token = localStorage.getItem("token");
if (!token) {
    alert("您还没有登录，不能发帖，请先登录");
    window.location.href = "login.html";
}

// 图片上传预览
const imageInput = document.getElementById("imageInput");
const selectImageBtn = document.getElementById("selectImageBtn");
const imagePreview = document.getElementById("imagePreview");

selectImageBtn.addEventListener(
    "click",
    () => {
        imageInput.click();
    }
);

imageInput.addEventListener(
    "change",
    () => {
        imagePreview.innerHTML = "";
        const files = imageInput.files;
        if (files.length > 5) {
            alert("最多上传5张图片");
            imageInput.value = "";
            return;
        }

        for (let file of files) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.className = "preview-image";
            imagePreview.appendChild(img);
        }
    }
);

// 标签点击
const tagOptions = document.querySelectorAll(".tag-option");

tagOptions.forEach(tag => {

    tag.addEventListener(
        "click",
        () => {
            const selectedTags = document.querySelectorAll(".tag-option.selected");
            if (!tag.classList.contains("selected") && selectedTags.length >= 3) {
                alert("最多只能选择3个标签");
                return;
            }
            tag.classList.toggle("selected");
        }
    );
});

// 发布按钮
const publishBtn = document.getElementById("publishBtn");

publishBtn.addEventListener(
    "click",
    async () => {
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const tags = Array.from(document.querySelectorAll(".tag-option.selected")).map(tag => tag.textContent.trim());

        // 校验
        if (title.trim() === "" || content.trim() === "") {
            alert("标题和内容不能为空");
            return;
        }
        if (tags.length === 0) {
            alert("请至少选择一个标签");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("tags", JSON.stringify(tags));

            // 上传图片
            const files = imageInput.files;
            for (
                let file
                of files
            ) {
                formData.append("images", file);
            }

            const response = await fetch(
                "http://localhost:3000/post",
                {
                    method: "POST",
                    headers: {
                        authorization: token
                    },
                    body: formData
                }
            );

            const data = await response.json();
            if (response.ok) {
                alert("发帖成功");
                window.location.href = "homepage.html";
            }
            else {
                alert(data.message);
            }
        } catch(error) {
            console.error(error);
            alert("服务器连接失败");
        }
    }
);