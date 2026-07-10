// 登录按钮
const loginBtn = document.getElementById("loginBtn");

// 登录事件
loginBtn.addEventListener("click", async () => {

    // 获取输入
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 校验
    if ( username.trim() === "" || password.trim() === "" ) {
        alert("用户名和密码不能为空");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/user/login", 
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            }
        );
        const data = await response.json();

        if (response.ok) {
            // JWT Token
            localStorage.setItem("token", data.token);
            localStorage.setItem("isLogin", "true");    // 登录状态
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("email", data.user.email);
            alert("登录成功");

            window.location.href = "homepage.html";
        }
        // 登录失败
        else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("服务器连接失败");
    }

});