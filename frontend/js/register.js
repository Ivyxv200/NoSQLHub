// 注册按钮
const registerBtn = document.getElementById("registerBtn");

// 注册事件
registerBtn.addEventListener("click", async () => {

    // 获取输入
    const username =  document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById( "confirmPassword" ).value;

    // 判空校验
    if ( username.trim() === "" || email.trim() === "" || password.trim() === "" ) {
        alert("请填写完整信息");
        return;
    }

    // 密码一致校验
    if (password !== confirmPassword) {
        alert("两次输入密码不一致");
        return;
    }

    try {

        // 向后端发送注册请求
        const response = await fetch(
            "http://localhost:3000/user/register",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, email, password })
            }
        );

        // 获取后端返回结果
        const data = await response.json();

        // 注册成功
        if (response.ok) {
            alert(data.message);
            // 跳转登录页
            window.location.href = "login.html";    
        }
        // 注册失败
        else {
            alert(data.message);
        }

    } catch (error) {
        console.log(error);
        alert("服务器错误");
    }

});