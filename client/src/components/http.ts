import axios from 'axios';
import { message } from 'antd';

let loading:any=[];
function startLoading(){
    loading.push(message.loading('Action in progress',0))
}
function endLoading(){
    loading.pop()();
}

// 请求拦截
axios.interceptors.request.use(config=>{
    //加载动画
    startLoading();
    // if(localStorage.eleToken){
    //     //设置统一的请求header
    //     config.headers.Authorization="www";
    // }
    return config;
},error=>{
    return Promise.reject(error);
});

//响应拦截
axios.interceptors.response.use(response=>{
    //结束加载动画
    endLoading();
    return response;
},error=>{
    endLoading();
    message.error(error.response.data);

    //获取状态码
    // const { status }=error.response;
    // if(status==401){
    //     Message.error('token失效，请重新登录！');
    //     //清除token
    //     localStorage.removeItem('eleToken');
    //     //跳转到登录页面
    //     router.push('/login');
    // }

    return Promise.reject(error);
})

export default axios;
