import axios from "axios";
import router from "@/router";
import Element from "element-ui"

axios.defaults.baseURL = "http://localhost:8090"

const request = axios.create({
	timeout: 5000,
	headers: {
		'Content-Type': "application/json; charset=utf-8"
	}
})
// 进行request请求拦截处理
request.interceptors.request.use(config => {
	console.log("发送的请求",config)
	// 将所有请求头里面进行jwt设置，方便权限访问
	config.headers['Authorization'] = 'Bearer ' + localStorage.getItem("token");
	return config
})
// 进行response后端数据返回拦截
request.interceptors.response.use(
	response => {
		console.log("AllResponse ->", response);
		// 缩短一点
		let res = response.data;
		console.log("我是每次请求后端的数据", res);
		// 判断后端响应是否正确
		if (res.success) {
			return response;
		} else if (res instanceof ArrayBuffer) {
			console.log("判断数据是否为文件类型", res instanceof ArrayBuffer);
			return response;
		} else {
			if (res.errorCode === 700) {
				Element.Message.error(res.message + ",将在3秒后返回登陆页面");
				var time = setInterval(function () {
					router.push("/login");
					localStorage.clear();
					if(window.location.pathname === "/login"){
						clearInterval(time);
					}
					// location.reload()
				}, 1500)
	
			} else {
				Element.Message.error(res.message);
			}
			return Promise.reject(response.data.message);
		}
	},
	// 异常情况判断
	error => {
		console.log("请求异常了嗷~~", error);
		if (error.response.data) {
			error.massage = error.response.data.message;
			// 如果是因为token的异常就将localStorage中清空
			// if (error.massage == "token令牌异常" || "token令牌已过期") {
			// 	localStorage.clear();
			// }
			// 无权限
			if (error.response.status === 401) {
				router.push("/in401");
			} else if (error.response.status === 403) {
				router.push("/in401");
			}
			// 404notfound
			else if (error.response.status === 404) {
				router.push("/in404");
			}

		}

		Element.Message.error(error.massage, {
			showClose: true,
			duration: 1500
		})

		return Promise.reject(error)
	}
)

export default request